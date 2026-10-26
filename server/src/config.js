import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnv = path.resolve(__dirname, '../../.env');
const serverEnv = path.resolve(__dirname, '../.env');

dotenv.config({ path: rootEnv, quiet: true });
dotenv.config({ path: serverEnv, quiet: true });

function parseBoolean(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeHost(value) {
  try {
    const url = new URL(value || 'https://yce-api-01.makeupar.com');
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

const nodeEnv = process.env.NODE_ENV || 'development';
const youcamApiHost = normalizeHost(process.env.YOUCAM_API_HOST);
const youcamApiKey = String(process.env.YOUCAM_API_KEY || '').trim();
const youcamConfigured = Boolean(youcamApiKey && youcamApiHost);

const config = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: parseNumber(process.env.PORT, 3001),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  youcam: {
    apiKey: youcamApiKey,
    apiHost: youcamApiHost || 'https://yce-api-01.makeupar.com',
    configured: youcamConfigured,
    hostValid: Boolean(youcamApiHost),
  },
  devFixtures: parseBoolean(process.env.DEV_FIXTURES, nodeEnv !== 'production'),
  maxUploadMb: Math.min(parseNumber(process.env.MAX_UPLOAD_MB, 10), 10),
  skinPollIntervalMs: parseNumber(process.env.SKIN_POLL_INTERVAL_MS, 5000),
  skinTaskMaxWaitMs: parseNumber(process.env.SKIN_TASK_MAX_WAIT_MS, 300000),
  tryonTaskMaxWaitMs: parseNumber(process.env.TRYON_TASK_MAX_WAIT_MS, 300000),
  paidActionCooldownMs: 10000,
};

export default config;
