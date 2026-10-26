import { useCallback, useEffect, useRef, useState } from 'react';
import { createPreview, releasePreview, resizeImageToMinShortSide, validateImageFile } from '../services/images.js';

export function useImageFile(options = {}) {
  const {
    maxMb = 10,
    minShortSide = 480,
    minLongSide = 0,
    maxLongSide = 0,
    label = 'image',
    allowUpscale = false,
  } = options;

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const previewRef = useRef(null);

  const clear = useCallback(() => {
    releasePreview(previewRef.current);
    previewRef.current = null;
    setFile(null);
    setPreview(null);
    setMeta(null);
    setError('');
    setChecking(false);
  }, []);

  const select = useCallback(
    async (nextFile) => {
      if (!nextFile) return;
      setChecking(true);
      setError('');
      try {
        let workingFile = nextFile;
        if (allowUpscale && minShortSide > 0) {
          try {
            workingFile = await resizeImageToMinShortSide(workingFile, minShortSide, label);
          } catch (resizeError) {
            // Fall back to validation below which will surface a clear error
          }
        }
        const dimensions = await validateImageFile(workingFile, {
          maxMb,
          minShortSide,
          minLongSide,
          maxLongSide,
          label,
        });
        releasePreview(previewRef.current);
        const url = createPreview(workingFile);
        previewRef.current = url;
        setFile(workingFile);
        setPreview(url);
        setMeta(dimensions);
      } catch (validationError) {
        setError(validationError.message);
      } finally {
        setChecking(false);
      }
    },
    [allowUpscale, label, maxLongSide, maxMb, minLongSide, minShortSide],
  );

  useEffect(
    () => () => {
      releasePreview(previewRef.current);
    },
    [],
  );

  return {
    file,
    preview,
    meta,
    error,
    checking,
    select,
    clear,
    setError,
  };
}
