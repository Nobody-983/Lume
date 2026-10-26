import config from '../config.js';
import { YouCamError } from './errors.js';
import { parseTask, SKIN_DEPTHS } from './skin.js';

const REQUEST_TIMEOUT_MS = 45000;
const UPLOAD_TIMEOUT_MS = 90000;

function ensureConfigured() {
  if (!config.youcam.configured) {
    throw new YouCamError(
      'NOT_CONFIGURED',
      'YouCam is not configured. Add a server-side API key to enable live features.',
      503,
    );
  }
}

function normalizeContentType(mimetype) {
  if (!mimetype) return 'image/jpeg';
  if (mimetype === 'image/jpeg') return 'image/jpg';
  return mimetype;
}

function safeFileName(kind, mimetype) {
  const extension = mimetype === 'image/png' ? 'png' : 'jpg';
  const random = Math.random().toString(36).slice(2, 8);
  return `lume-${kind}-${Date.now()}-${random}.${extension}`;
}

function extractApiError(payload, status) {
  if (payload && typeof payload === 'object') {
    return {
      code: payload.error_code || payload.error || `HTTP_${status}`,
      message: payload.error || payload.message || 'The YouCam request was not accepted.',
    };
  }
  return { code: `HTTP_${status}`, message: 'The YouCam request was not accepted.' };
}

export function mapYouCamApiError(payload, status) {
  const apiError = extractApiError(payload, status);
  const normalizedCode = String(apiError.code || '').toLowerCase();

  if (
    ['creditinsufficiency', 'credit_insufficiency', 'insufficient_units'].includes(normalizedCode)
  ) {
    return new YouCamError(
      'INSUFFICIENT_UNITS',
      'Your YouCam account does not have enough units for this request. Add units in the Perfect Corp API console and try again.',
      402,
      { youcamCode: apiError.code, httpStatus: status },
    );
  }

  return new YouCamError(
    'YOUCAM_REJECTED',
    apiError.message || 'YouCam could not accept this request.',
    502,
    { youcamCode: apiError.code, httpStatus: status },
  );
}

async function youcamRequest(path, options = {}) {
  ensureConfigured();

  let response;
  try {
    response = await fetch(`${config.youcam.apiHost}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${config.youcam.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new YouCamError(
      'NETWORK_ERROR',
      'Lumé could not reach the YouCam service. Check your connection and try again.',
      502,
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 401 || response.status === 403) {
    throw new YouCamError(
      'AUTH_FAILED',
      'YouCam rejected the server API key. Check the key in your .env file.',
      502,
    );
  }

  if (response.status === 429) {
    throw new YouCamError(
      'RATE_LIMITED',
      'YouCam is receiving too many requests. Wait a moment before trying again.',
      429,
    );
  }

  if (!response.ok) {
    throw mapYouCamApiError(payload, response.status);
  }

  return payload;
}

async function uploadImage(file, kind) {
  ensureConfigured();

  const contentType = normalizeContentType(file.mimetype);
  const fileName = safeFileName(kind, contentType);

  const metadata = await youcamRequest('/s2s/v2.0/file', {
    method: 'POST',
    body: JSON.stringify({
      files: [
        {
          content_type: contentType,
          file_name: fileName,
          file_size: file.size,
        },
      ],
    }),
  });

  const uploadedFile = metadata?.data?.files?.[0];
  const request = uploadedFile?.requests?.[0];
  if (!uploadedFile?.file_id || !request?.url) {
    throw new YouCamError(
      'UPLOAD_SETUP_FAILED',
      'YouCam did not provide a valid upload destination. Please try again.',
    );
  }

  let uploadResponse;
  try {
    uploadResponse = await fetch(request.url, {
      method: request.method || 'PUT',
      headers: request.headers || {
        'Content-Type': contentType,
        'Content-Length': String(file.size),
      },
      body: file.buffer,
      signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
    });
  } catch {
    throw new YouCamError(
      'UPLOAD_FAILED',
      'The photo could not be uploaded to YouCam. Check your connection and try again.',
    );
  }

  if (!uploadResponse.ok) {
    throw new YouCamError(
      'UPLOAD_FAILED',
      'YouCam did not accept the photo upload. Please try again.',
    );
  }

  return uploadedFile.file_id;
}

function validateTaskId(taskId) {
  if (!/^[A-Za-z0-9_-]{10,220}$/.test(taskId)) {
    throw new YouCamError('INVALID_TASK_ID', 'That analysis reference is not valid.', 400);
  }
}

export async function startSkinAnalysis({ file, depth = 'complete' }) {
  ensureConfigured();
  const preset = SKIN_DEPTHS[depth];
  if (!preset) {
    throw new YouCamError('INVALID_DEPTH', 'Choose a supported skin analysis depth.', 400);
  }

  const fileId = await uploadImage(file, 'skin');

  const payload = await youcamRequest('/s2s/v2.1/task/skin-analysis', {
    method: 'POST',
    body: JSON.stringify({
      src_file_id: fileId,
      dst_actions: preset.actions,
      format: 'json',
      miniserver_args: {
        enable_mask_overlay: true,
      },
    }),
  });

  const taskId = payload?.data?.task_id;
  if (!taskId) {
    throw new YouCamError(
      'TASK_CREATE_FAILED',
      'Skin AI did not return a task reference. Please try again.',
    );
  }

  return {
    taskId,
    depth: preset.id,
    estimatedUnits: preset.estimatedUnits,
    actions: preset.actions,
  };
}

export async function getSkinAnalysis(taskId) {
  validateTaskId(taskId);
  const payload = await youcamRequest(`/s2s/v2.1/task/skin-analysis/${encodeURIComponent(taskId)}`, {
    method: 'GET',
  });
  try {
    return parseTask(payload, { taskId });
  } catch (error) {
    if (error instanceof YouCamError) throw error;
    throw new YouCamError(
      'INVALID_RESULT',
      'Skin AI returned a result Lumé could not read. No further units will be spent by this page.',
    );
  }
}

export async function startClothTryOn({ person, garment, category = 'auto' }) {
  ensureConfigured();

  const supportedCategories = new Set(['full_body', 'upper_body', 'lower_body', 'outer', 'shoes', 'auto']);
  if (!supportedCategories.has(category)) {
    throw new YouCamError('INVALID_CATEGORY', 'Choose a supported garment category.', 400);
  }

  const [personFileId, garmentFileId] = await Promise.all([
    uploadImage(person, 'person'),
    uploadImage(garment, 'garment'),
  ]);

  const payload = await youcamRequest('/s2s/v2.0/task/cloth-v4', {
    method: 'POST',
    body: JSON.stringify({
      src_file_id: personFileId,
      ref_file_id: garmentFileId,
      garment_category: category,
      filter_multi_person: 'normal',
    }),
  });

  const taskId = payload?.data?.task_id;
  if (!taskId) {
    throw new YouCamError(
      'TASK_CREATE_FAILED',
      'AI Clothes did not return a task reference. Please try again.',
    );
  }

  return { taskId, category };
}

const TRYON_ERRORS = {
  error_pose: 'AI Clothes could not detect a clear standing pose in the person photo.',
  error_invalid_ref: 'The garment photo is not clear enough. Use a front-facing garment image with the full item visible.',
  error_apply_region_mismatch: 'The garment does not match the chosen category or the visible body area.',
  error_invalid_src: 'The person photo needs to show the upper or full body, not only the lower body.',
  error_multi_person: 'Use a photo with one person and a garment photo with one clear item.',
  error_nsfw_content_detected: 'The generated image was blocked by the provider’s content safety check.',
  error_editing_failed: 'AI Clothes could not create a distinct result from these images. Try a different garment photo.',
  exceed_max_filesize: 'One of the images is too large for AI Clothes.',
  error_below_min_image_size: 'One of the images is below the minimum dimensions required by AI Clothes. Use images at least 480px on the short side.',
  error_download_image: 'AI Clothes could not retrieve one of the images. Please upload again.',
};

export async function getClothTryOn(taskId) {
  validateTaskId(taskId);
  const payload = await youcamRequest(`/s2s/v2.0/task/cloth-v4/${encodeURIComponent(taskId)}`, {
    method: 'GET',
  });

  const data = payload?.data;
  if (!data) {
    throw new YouCamError('INVALID_RESPONSE', 'AI Clothes returned an unexpected response.');
  }

  if (data.task_status === 'running') return { status: 'running' };
  if (data.task_status === 'error') {
    return {
      status: 'error',
      code: data.error || 'TASK_FAILED',
      message:
        TRYON_ERRORS[data.error] ||
        'AI Clothes could not complete this try-on. Try a clearer person photo and a single garment image.',
    };
  }
  if (data.task_status !== 'success') {
    throw new YouCamError('INVALID_RESPONSE', 'AI Clothes returned an unknown task status.');
  }

  const url = data.results?.url ?? data.url;
  if (!url || typeof url !== 'string') {
    throw new YouCamError('INVALID_RESPONSE', 'AI Clothes did not return a result image.');
  }

  return { status: 'success', resultUrl: url, expiresIn: 2 * 60 * 60 };
}
