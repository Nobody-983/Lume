import { Router } from 'express';
import config from '../config.js';
import { requireYouCam } from '../middleware/requireYouCam.js';
import { uploadSkinImage, verifySkinImage, maxBytes } from '../middleware/uploads.js';
import { paidActionGuard } from '../middleware/paidActionGuard.js';
import { getSkinAnalysis, startSkinAnalysis } from '../services/youcam.js';
import { SKIN_DEPTHS } from '../services/skin.js';
import { ApiError } from '../services/errors.js';
import { ensureMinDimensions } from '../services/imageResize.js';

const router = Router();

router.get('/options', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    depths: Object.values(SKIN_DEPTHS).map(({ id, label, estimatedUnits, actions }) => ({
      id,
      label,
      estimatedUnits,
      actions,
    })),
    maxUploadMb: maxBytes / (1024 * 1024),
    acceptedTypes: ['image/jpeg', 'image/png'],
  });
});

router.post(
  '/analyze',
  requireYouCam,
  uploadSkinImage,
  verifySkinImage,
  paidActionGuard,
  async (req, res) => {
    await ensureMinDimensions(req.file, 1080);
    const depth = SKIN_DEPTHS[req.body.depth] ? req.body.depth : 'complete';
    const task = await startSkinAnalysis({
      file: req.file,
      depth,
    });

    res.status(202).json({
      taskId: task.taskId,
      status: 'running',
      source: 'youcam',
      depth: task.depth,
      estimatedUnits: task.estimatedUnits,
      actions: task.actions,
      pollAfterMs: config.skinPollIntervalMs,
    });
  },
);

router.get('/tasks/:taskId', requireYouCam, async (req, res) => {
  const result = await getSkinAnalysis(req.params.taskId);

  if (result.status === 'running') {
    res.json({
      status: 'running',
      pollAfterMs: config.skinPollIntervalMs,
    });
    return;
  }

  if (result.status === 'error') {
    res.json({
      status: 'error',
      code: result.code,
      message: result.message,
    });
    return;
  }

  if (!result.report || result.report.source !== 'youcam') {
    throw new ApiError(502, 'INVALID_RESULT', 'Skin AI returned a result Lumé could not verify.');
  }

  res.setHeader('Cache-Control', 'no-store');
  res.json({
    status: 'success',
    source: 'youcam',
    report: result.report,
  });
});

export default router;
