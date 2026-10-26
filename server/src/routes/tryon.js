import { Router } from 'express';
import { requireYouCam } from '../middleware/requireYouCam.js';
import { uploadTryOnImages, verifyTryOnImages, maxBytes } from '../middleware/uploads.js';
import { paidActionGuard } from '../middleware/paidActionGuard.js';
import { getClothTryOn, startClothTryOn } from '../services/youcam.js';

const router = Router();

router.get('/options', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    categories: [
      { id: 'auto', label: 'Auto detect' },
      { id: 'full_body', label: 'Full body' },
      { id: 'upper_body', label: 'Upper body' },
      { id: 'lower_body', label: 'Lower body (worn outfit only)' },
      { id: 'outer', label: 'Outerwear' },
      { id: 'shoes', label: 'Shoes' },
    ],
    maxUploadMb: maxBytes / (1024 * 1024),
    acceptedTypes: ['image/jpeg', 'image/png'],
    documentation:
      'Perfect Corp AI Clothes v4 supports a person image plus a garment reference. Person and garment photos must each be under 10 MB, JPG or PNG.',
  });
});

router.post(
  '/',
  requireYouCam,
  uploadTryOnImages,
  verifyTryOnImages,
  paidActionGuard,
  async (req, res) => {
    const category = String(req.body.category || 'auto');
    const person = req.files.person[0];
    const garment = req.files.garment[0];

    const task = await startClothTryOn({ person, garment, category });

    res.status(202).json({
      taskId: task.taskId,
      status: 'running',
      source: 'youcam',
      category: task.category,
      pollAfterMs: 5000,
    });
  },
);

router.get('/tasks/:taskId', requireYouCam, async (req, res) => {
  const result = await getClothTryOn(req.params.taskId);

  res.setHeader('Cache-Control', 'no-store');
  if (result.status === 'running') {
    res.json({ status: 'running', pollAfterMs: 5000 });
    return;
  }

  if (result.status === 'error') {
    res.json({ status: 'error', code: result.code, message: result.message });
    return;
  }

  res.json({
    status: 'success',
    source: 'youcam',
    resultUrl: result.resultUrl,
    expiresIn: result.expiresIn,
    engine: 'Perfect Corp AI Clothes v4',
  });
});

export default router;
