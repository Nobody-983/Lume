export function readJSON(storage, key, fallback = null) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(storage, key) {
  try {
    storage.removeItem(key);
  } catch {
    // Storage can be unavailable in restricted browsing modes.
  }
}

export function readLocal(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;
  return readJSON(window.localStorage, key, fallback);
}

export function writeLocal(key, value) {
  if (typeof window === 'undefined') return false;
  return writeJSON(window.localStorage, key, value);
}

export function readSession(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;
  return readJSON(window.sessionStorage, key, fallback);
}

export function writeSession(key, value) {
  if (typeof window === 'undefined') return false;
  return writeJSON(window.sessionStorage, key, value);
}

export function removeSession(key) {
  if (typeof window === 'undefined') return;
  removeKey(window.sessionStorage, key);
}

export function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
