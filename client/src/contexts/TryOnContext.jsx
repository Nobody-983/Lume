import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useConfig } from './ConfigContext.jsx';
import { useToast } from './ToastContext.jsx';
import { useImageFile } from '../hooks/useImageFile.js';
import {
  ApiClientError,
  getTryOnTask,
  startTryOn as requestTryOn,
} from '../services/api.js';

const TryOnContext = createContext(null);

export function TryOnProvider({ children }) {
  const { limits } = useConfig();
  const { showToast } = useToast();
  const person = useImageFile({ label: 'person photo', minShortSide: 480 });
  const garment = useImageFile({ label: 'garment photo', minShortSide: 300 });
  const selectPerson = person.select;
  const selectGarment = garment.select;
  const clearPerson = person.clear;
  const clearGarment = garment.clear;
  const [category, setCategory] = useState('auto');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [result, setResult] = useState(null);
  const [submittedCategory, setSubmittedCategory] = useState(null);
  const busyRef = useRef(false);

  const busy = status === 'uploading' || status === 'processing';

  const choosePerson = useCallback(
    async (file) => {
      if (busyRef.current) return;
      setError('');
      if (status === 'error') setStatus('idle');
      await selectPerson(file);
    },
    [selectPerson, status],
  );

  const chooseGarment = useCallback(
    async (file) => {
      if (busyRef.current) return;
      setError('');
      if (status === 'error') setStatus('idle');
      await selectGarment(file);
    },
    [selectGarment, status],
  );

  const start = useCallback(async () => {
    if (busyRef.current) return { ok: false, reason: 'busy' };
    if (!person.file || !garment.file) {
      const message = 'Add both a person photo and a garment photo before generating a try-on.';
      setError(message);
      setStatus('error');
      return { ok: false, reason: 'missing', message };
    }

    busyRef.current = true;
    setError('');
    setResult(null);
    setStatus('uploading');
    setSubmittedCategory(category);

    try {
      const task = await requestTryOn(person.file, garment.file, category);
      if (!task?.taskId) throw new Error('Lumé did not receive a try-on reference.');
      setTaskId(task.taskId);
      setStatus('processing');
      return { ok: true, taskId: task.taskId };
    } catch (requestError) {
      setError(requestError.message);
      setStatus('error');
      busyRef.current = false;
      return { ok: false, reason: 'request', message: requestError.message };
    }
  }, [category, garment.file, person.file]);

  useEffect(() => {
    if (!taskId || status !== 'processing') return undefined;

    let cancelled = false;
    let timer = null;
    let consecutiveFailures = 0;
    const startedAt = Date.now();
    const maxWait = Math.min(limits?.tryonTaskMaxWaitMs || 300000, 600000);

    async function poll() {
      if (cancelled) return;

      if (Date.now() - startedAt > maxWait) {
        setError(
          'AI Clothes is taking longer than expected. Your task may still be processing — do not start another paid try-on until you have checked your YouCam usage.',
        );
        setStatus('error');
        setTaskId(null);
        busyRef.current = false;
        return;
      }

      try {
        const taskResult = await getTryOnTask(taskId);
        if (cancelled) return;
        consecutiveFailures = 0;

        if (taskResult.status === 'running') {
          timer = setTimeout(poll, Math.max(3000, Number(taskResult.pollAfterMs) || 5000));
          return;
        }

        if (taskResult.status === 'error') {
          setError(taskResult.message);
          setStatus('error');
          setTaskId(null);
          busyRef.current = false;
          return;
        }

        if (taskResult.status === 'success') {
          if (!taskResult.resultUrl || taskResult.source !== 'youcam') {
            setError('AI Clothes returned a result Lumé could not verify. It was not displayed.');
            setStatus('error');
            setTaskId(null);
            busyRef.current = false;
            return;
          }
          setResult({
            url: taskResult.resultUrl,
            expiresIn: taskResult.expiresIn || null,
            category: submittedCategory,
            engine: taskResult.engine || 'Perfect Corp AI Clothes v4',
          });
          setStatus('success');
          setTaskId(null);
          busyRef.current = false;
          showToast('Your virtual try-on is ready.');
          return;
        }

        throw new Error('Unexpected try-on response.');
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

    timer = setTimeout(poll, 2500);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [limits?.tryonTaskMaxWaitMs, showToast, status, submittedCategory, taskId]);

  const reset = useCallback(() => {
    if (busyRef.current) return;
    setTaskId(null);
    setError('');
    setStatus('idle');
    setSubmittedCategory(null);
    setResult(null);
    clearPerson();
    clearGarment();
  }, [clearGarment, clearPerson]);

  const removePerson = useCallback(() => {
    if (busyRef.current) return;
    clearPerson();
    setError('');
    if (status === 'error') setStatus('idle');
  }, [clearPerson, status]);

  const removeGarment = useCallback(() => {
    if (busyRef.current) return;
    clearGarment();
    setError('');
    if (status === 'error') setStatus('idle');
  }, [clearGarment, status]);

  const dismissError = useCallback(() => {
    setError('');
    if (status === 'error') setStatus('idle');
  }, [status]);

  const value = useMemo(
    () => ({
      personFile: person.file,
      personPreview: person.preview,
      personMeta: person.meta,
      personChecking: person.checking,
      personError: person.error,
      garmentFile: garment.file,
      garmentPreview: garment.preview,
      garmentMeta: garment.meta,
      garmentChecking: garment.checking,
      garmentError: garment.error,
      category,
      submittedCategory,
      setCategory,
      status,
      busy,
      error: error || person.error || garment.error,
      result,
      choosePerson,
      chooseGarment,
      removePerson,
      removeGarment,
      start,
      reset,
      dismissError,
    }),
    [
      busy,
      category,
      chooseGarment,
      choosePerson,
      dismissError,
      error,
      garment.checking,
      garment.error,
      garment.file,
      garment.meta,
      garment.preview,
      person.checking,
      person.error,
      person.file,
      person.meta,
      person.preview,
      removePerson,
      removeGarment,
      reset,
      result,
      start,
      status,
      submittedCategory,
    ],
  );

  return <TryOnContext.Provider value={value}>{children}</TryOnContext.Provider>;
}

export function useTryOn() {
  const context = useContext(TryOnContext);
  if (!context) throw new Error('useTryOn must be used inside TryOnProvider');
  return context;
}
