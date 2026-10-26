import config from '../config.js';
import { ApiError } from '../services/errors.js';

export function requireYouCam(_req, _res, next) {
  if (!config.youcam.configured) {
    next(
      new ApiError(
        503,
        'NOT_CONFIGURED',
        'YouCam is not configured. Add a server-side API key to enable live features.',
      ),
    );
    return;
  }
  next();
}
