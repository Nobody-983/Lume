import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useConfig } from './ConfigContext.jsx';
import { useToast } from './ToastContext.jsx';
import { useImageFile } from '../hooks/useImageFile.js';
import { getSkinTask, startSkinAnalysis, ApiClientError } from '../services/api.js';
import { readSession, removeSession, writeSession } from '../services/storage.js';

const REPORT_KEY = 'lume.report.v1';
const ScanContext = createContext(null);

function readStoredReport() {
  const stored = readSession(REPORT_KEY, null);
  if (!stored || stored.source !== 'youcam' || !Array.isArray(stored.measurements)) return null;
  return stored;
}

export function ScanProvider({ children }) {
  const { limits } = useConfig();
  const { showToast } = useToast();
  const image = useImageFile({ label: 'portrait', minShortSide: 1080, allowUpscale: true });
  const selectImage = image.select;
  const clearImage = image.clear;
  const [depth, setDepth] = useState('complete');
  const [status, setStatus] = useState(() => (readStoredReport() ? 'success' : 'idle'));
  const [error, setError] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [report, setReport] = useState(readStoredReport);
  const [submittedDepth, setSubmittedDepth] = useState(null);
  const busyRef = useRef(false);

  const busy = status === 'uploading' || status === 'processing';

  const chooseFile = useCallback(
    async (file) => {
      if (busyRef.current) return;
      setError('');
      if (status === 'success' || status === 'error') setStatus('idle');
      await selectImage(file);
    },
    [selectImage, status],
  );

  const startAnalysis = useCallback(async () => {
    if (busyRef.current) return { ok: false, reason: 'busy' };
    if (!image.file) {
      setError('Choose a portrait before starting your skin study.');
      return { ok: false, reason: 'no-file' };
    }

    const requiredShortSide = 1080;
    if (image.meta && Math.min(image.meta.width, image.meta.height) < requiredShortSide) {
      const message = `This portrait is ${image.meta.width}×${image.meta.height}. Skin AI (HD) requires a portrait at least ${requiredShortSide}px on the short side. Choose a larger image. Upscaling is attempted on upload but may not be sufficient for very small images.`;
      setError(message);
      setStatus('error');
      return { ok: false, reason: 'dimensions', message };
    }

    busyRef.current = true;
    setError('');
    setReport(null);
    removeSession(REPORT_KEY);
    setStatus('uploading');
    setSubmittedDepth(depth);

    try {
      const task = await startSkinAnalysis(image.file, depth);
      if (!task?.taskId) throw new Error('Lumé did not receive a skin analysis reference.');
      setTaskId(task.taskId);
      setStatus('processing');
      return { ok: true, taskId: task.taskId };
    } catch (requestError) {
      setError(requestError.message);
      setStatus('error');
      busyRef.current = false;
      return { ok: false, reason: 'request', message: requestError.message };
    }
  }, [depth, image.file, image.meta]);

  useEffect(() => {
    if (!taskId || status !== 'processing') return undefined;

    let cancelled = false;
    let timer = null;
    let consecutiveFailures = 0;
    const startedAt = Date.now();
    const maxWait = Math.min(limits?.skinTaskMaxWaitMs || 300000, 600000);

    async function poll() {
      if (cancelled) return;

      if (Date.now() - startedAt > maxWait) {
        setError(
          'Skin AI is taking longer than expected. Your task may still be processing — do not start another paid scan until you have checked your YouCam usage.',
        );
        setStatus('error');
        setTaskId(null);
        busyRef.current = false;
        return;
      }

      try {
        const result = await getSkinTask(taskId);
        if (cancelled) return;
        consecutiveFailures = 0;

        if (result.status === 'running') {
          timer = setTimeout(poll, Math.max(3000, Number(result.pollAfterMs) || 5000));
          return;
        }

        if (result.status === 'error') {
          setError(result.message);
          setStatus('error');
          setTaskId(null);
          busyRef.current = false;
          return;
        }

        if (result.status === 'success') {
          if (!result.report || result.report.source !== 'youcam') {
            setError('Skin AI returned a result Lumé could not verify. It was not saved as a report.');
            setStatus('error');
            setTaskId(null);
            busyRef.current = false;
            return;
          }
          setReport(result.report);
          writeSession(REPORT_KEY, result.report);
          setStatus('success');
          setTaskId(null);
          busyRef.current = false;
          showToast('Your skin study is ready.');
          return;
        }

        throw new Error('Unexpected skin analysis response.');
      } catch (pollError) {
        if (cancelled) return;
        consecutiveFailures += 1;
        const retryable =
          !(pollError instanceof ApiClientError) ||
          (!['AUTH_FAILED', 'NOT_CONFIGURED', 'TOO_SOON', 'INSUFFICIENT_UNITS'].includes(
            pollError.code,
          ) && consecutiveFailures < 3);

        if (retryable) {
          timer = setTimeout(poll, 5000);
          return;
        }

        setError(pollError.message);
        setStatus('error');
        setTaskId(null);
        busyRef.current = false;
      }
    }

    timer = setTimeout(poll, 2200);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [limits?.skinTaskMaxWaitMs, showToast, status, taskId]);

  const prepareNewScan = useCallback(() => {
    if (busyRef.current) return;
    setError('');
    setStatus('idle');
    setSubmittedDepth(null);
    clearImage();
  }, [clearImage]);

  const resetScan = useCallback(() => {
    if (busyRef.current) return;
    setTaskId(null);
    setError('');
    setStatus('idle');
    setSubmittedDepth(null);
    setReport(null);
    removeSession(REPORT_KEY);
    clearImage();
  }, [clearImage]);

  const clearReport = useCallback(() => {
    removeSession(REPORT_KEY);
    setReport(null);
    setTaskId(null);
    setStatus('idle');
    setError('');
    busyRef.current = false;
  }, []);

  const dismissError = useCallback(() => {
    setError('');
    if (status === 'error') setStatus('idle');
  }, [status]);

  const value = useMemo(
    () => ({
      file: image.file,
      preview: image.preview,
      meta: image.meta,
      checking: image.checking,
      imageError: image.error,
      error: error || image.error,
      status,
      busy,
      depth,
      submittedDepth,
      report,
      chooseFile,
      startAnalysis,
      setDepth,
      resetScan,
      prepareNewScan,
      clearReport,
      dismissError,
    }),
    [
      chooseFile,
      clearReport,
      depth,
      dismissError,
      error,
      image.checking,
      image.error,
      image.file,
      image.meta,
      image.preview,
      report,
      resetScan,
      prepareNewScan,
      startAnalysis,
      status,
      submittedDepth,
      busy,
    ],
  );

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) throw new Error('useScan must be used inside ScanProvider');
  return context;
}
