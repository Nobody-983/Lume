import config from '../config.js';
import { ApiError } from '../services/errors.js';

const lastStartByClient = new Map();

function getClientKey(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

export function paidActionGuard(req, _res, next) {
  if (!config.youcam.configured) {
    next();
    return;
  }

  const key = getClientKey(req);
  const now = Date.now();
  const lastStart = lastStartByClient.get(key);

  if (lastStart && now - lastStart < config.paidActionCooldownMs) {
    const waitSeconds = Math.ceil((config.paidActionCooldownMs - (now - lastStart)) / 1000);
    next(
      new ApiError(
        429,
        'TOO_SOON',
        `A paid AI task was just started. Please wait ${waitSeconds}s before starting another.`,
      ),
    );
    return;
  }

  lastStartByClient.set(key, now);

  if (lastStartByClient.size > 500) {
    for (const [client, startedAt] of lastStartByClient) {
      if (now - startedAt > config.paidActionCooldownMs) lastStartByClient.delete(client);
    }
  }

  next();
}
