import multer from 'multer';
import config from '../config.js';
import { ApiError } from '../services/errors.js';

export function notFoundHandler(_req, _res, next) {
  next(new ApiError(404, 'NOT_FOUND', 'That API route does not exist.'));
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? `Each image must be smaller than ${config.maxUploadMb} MB.`
        : 'The upload could not be accepted. Check the files and try again.';
    res.status(400).json({
      error: { code: error.code, message },
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
    return;
  }

  if (error?.name === 'YouCamError') {
    res.status(error.status || 502).json({
      error: {
        code: error.code || 'YOUCAM_ERROR',
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
    return;
  }

  if (!config.isProduction) {
    console.error(`[lume-server] ${error?.name || 'Error'}: ${error?.message || 'Unknown error'}`);
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong in Lumé’s local service. Please try again.',
    },
  });
}
