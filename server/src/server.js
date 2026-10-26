import app from './app.js';
import config from './config.js';

const server = app.listen(config.port, () => {
  const mode = config.youcam.configured ? 'live YouCam' : 'configuration-required';
  console.log(`[lume-server] listening on http://localhost:${config.port} (${mode})`);
  if (config.devFixtures && !config.youcam.configured) {
    console.log('[lume-server] sample report preview is enabled; live AI is not connected');
  }
});

function shutdown(signal) {
  console.log(`[lume-server] ${signal} received, closing`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
