import { Router } from 'express';
import config from '../config.js';
import { SKIN_DEPTHS } from '../services/skin.js';

const router = Router();

router.get('/', (_req, res) => {
  const configured = config.youcam.configured;

  res.setHeader('Cache-Control', 'no-store');
  res.json({
    status: 'ok',
    service: 'lume-api',
    version: '1.0.0',
    time: new Date().toISOString(),
    integrations: {
      youcam: {
        configured,
        hostValid: config.youcam.hostValid,
        label: configured ? 'YouCam API connected' : 'YouCam API not configured',
        message: configured
          ? 'Live Skin AI and AI Clothes requests are available.'
          : 'Add YOUCAM_API_KEY to the server .env file to unlock live Skin AI and AI Clothes.',
      },
    },
    features: {
      skinAnalysis: {
        available: configured,
        mode: configured ? 'live' : 'configuration-required',
        engine: 'Perfect Corp YouCam Skin AI v2.1',
        endpoint: '/s2s/v2.1/task/skin-analysis',
        depths: Object.values(SKIN_DEPTHS).map(({ id, label, estimatedUnits, actions }) => ({
          id,
          label,
          estimatedUnits,
          actions,
        })),
      },
      virtualTryOn: {
        available: configured,
        mode: configured ? 'live' : 'configuration-required',
        engine: 'Perfect Corp AI Clothes v4',
        endpoint: '/s2s/v2.0/task/cloth-v4',
      },
    },
    demo: {
      available: config.devFixtures,
      label: 'Clearly labelled sample report',
      notice:
        'Sample data is available for interface preview only. It is never presented as a real scan or try-on result.',
    },
    limits: {
      maxUploadMb: config.maxUploadMb,
      acceptedTypes: ['image/jpeg', 'image/png'],
      skinPollIntervalMs: config.skinPollIntervalMs,
      skinTaskMaxWaitMs: config.skinTaskMaxWaitMs,
      tryonTaskMaxWaitMs: config.tryonTaskMaxWaitMs,
    },
    privacy: {
      lumeStoresPhotos: false,
      providerRetention:
        'YouCam processes uploads for the AI task. Perfect Corp documents processed results as retaining for 24 hours; Lumé does not persist photos.',
    },
    docs: {
      skinAnalysis: 'https://docs.perfectcorp.com/reference/ai_skin_analysis/v2.1',
      aiClothes: 'https://docs.perfectcorp.com/reference/ai_clothes',
      apiKeys: 'https://yce.makeupar.com/api-console/en/api-keys/',
    },
  });
});

export default router;
