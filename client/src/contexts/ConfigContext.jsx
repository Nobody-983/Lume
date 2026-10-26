import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getStatus } from '../services/api.js';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading((current) => current || !status);
      setRefreshing(Boolean(status));
      try {
        const next = await getStatus();
        if (!active) return;
        setStatus(next);
        setError('');
      } catch (requestError) {
        if (!active) return;
        setError(requestError.message);
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
    // status is intentionally not a dependency to avoid refetch loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const refresh = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  const value = useMemo(() => {
    const configured = Boolean(status?.integrations?.youcam?.configured);
    return {
      status,
      loading,
      refreshing,
      error,
      refresh,
      configured,
      liveAvailable: configured,
      demoAvailable: Boolean(status?.demo?.available),
      skinFeatures: status?.features?.skinAnalysis || null,
      tryOnFeatures: status?.features?.virtualTryOn || null,
      limits: status?.limits || null,
      privacy: status?.privacy || null,
      docs: status?.docs || null,
      serverReachable: Boolean(status) && !error,
    };
  }, [error, loading, refresh, refreshing, status]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig must be used inside ConfigProvider');
  return context;
}
