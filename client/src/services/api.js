export class ApiClientError extends Error {
  constructor(message, { code = 'REQUEST_FAILED', status = 0, details = null } = {}) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, options);
  } catch {
    throw new ApiClientError(
      'Lumé’s local service is not reachable. Make sure both the API and web servers are running.',
      { code: 'NETWORK_ERROR' },
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiClientError(
      payload?.error?.message || 'Lumé could not complete that request. Please try again.',
      {
        code: payload?.error?.code || `HTTP_${response.status}`,
        status: response.status,
        details: payload?.error?.details || null,
      },
    );
  }

  return payload;
}

export function getStatus() {
  return request('/api/status');
}

export function startSkinAnalysis(file, depth) {
  const form = new FormData();
  form.append('image', file);
  form.append('depth', depth);
  return request('/api/skin/analyze', {
    method: 'POST',
    body: form,
  });
}

export function getSkinTask(taskId) {
  return request(`/api/skin/tasks/${encodeURIComponent(taskId)}`);
}

export function startTryOn(person, garment, category) {
  const form = new FormData();
  form.append('person', person);
  form.append('garment', garment);
  form.append('category', category);
  return request('/api/tryon', {
    method: 'POST',
    body: form,
  });
}

export function getTryOnTask(taskId) {
  return request(`/api/tryon/tasks/${encodeURIComponent(taskId)}`);
}
