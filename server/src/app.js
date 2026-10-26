import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import config from './config.js';
import statusRouter from './routes/status.js';
import skinRouter from './routes/skin.js';
import tryonRouter from './routes/tryon.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist');

const app = express();
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: config.isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            fontSrc: ["'self'", 'data:'],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
            objectSrc: ["'none'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", 'https:'],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin && origin === config.clientOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    status: 'ok',
    service: 'lume-api',
    integrations: {
      youcam: {
        configured: config.youcam.configured,
        hostValid: config.youcam.hostValid,
      },
    },
  });
});

app.use('/api/status', statusRouter);
app.use('/api/skin', skinRouter);
app.use('/api/tryon', tryonRouter);
app.use('/api', notFoundHandler);

if (config.isProduction) {
  app.use(
    express.static(clientDist, {
      index: false,
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-store');
        }
      },
    }),
  );

  app.use((req, res, next) => {
    if (['GET', 'HEAD'].includes(req.method) && req.accepts('html')) {
      res.sendFile(path.join(clientDist, 'index.html'));
      return;
    }
    next();
  });
}

app.use(errorHandler);

export default app;
