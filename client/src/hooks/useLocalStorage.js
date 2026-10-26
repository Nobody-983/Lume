import { useEffect, useState } from 'react';
import { readLocal, writeLocal } from '../services/storage.js';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = readLocal(key, null);
    if (stored !== null) return stored;
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    writeLocal(key, value);
  }, [key, value]);

  return [value, setValue];
}
