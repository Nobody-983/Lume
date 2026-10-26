import multer from 'multer';
import config from '../config.js';
import { ApiError } from '../services/errors.js';

const maxBytes = config.maxUploadMb * 1024 * 1024;
const allowedMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png']);

const storage = multer.memoryStorage();

function fileFilter(_req, file, callback) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(new ApiError(400, 'UNSUPPORTED_TYPE', 'Upload a JPG or PNG image.'));
    return;
  }
  callback(null, true);
}

const baseUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxBytes,
    files: 2,
    fields: 10,
    parts: 12,
  },
});

export const uploadSkinImage = baseUpload.single('image');
export const uploadTryOnImages = baseUpload.fields([
  { name: 'person', maxCount: 1 },
  { name: 'garment', maxCount: 1 },
]);

function hasValidSignature(buffer, mimetype) {
  if (!buffer || buffer.length < 8) return false;
  if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimetype === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }
  return false;
}

export function verifySkinImage(req, _res, next) {
  if (!req.file) {
    next(new ApiError(400, 'MISSING_IMAGE', 'Choose a photo before starting a skin analysis.'));
    return;
  }
  if (!hasValidSignature(req.file.buffer, req.file.mimetype)) {
    next(new ApiError(400, 'INVALID_IMAGE', 'That file is not a valid JPG or PNG image.'));
    return;
  }
  next();
}

export function verifyTryOnImages(req, _res, next) {
  const person = req.files?.person?.[0];
  const garment = req.files?.garment?.[0];
  if (!person || !garment) {
    next(
      new ApiError(
        400,
        'MISSING_IMAGES',
        'Add both a person photo and a garment photo before generating a try-on.',
      ),
    );
    return;
  }
  if (
    !hasValidSignature(person.buffer, person.mimetype) ||
    !hasValidSignature(garment.buffer, garment.mimetype)
  ) {
    next(new ApiError(400, 'INVALID_IMAGE', 'Both files must be valid JPG or PNG images.'));
    return;
  }
  next();
}

export { maxBytes };
