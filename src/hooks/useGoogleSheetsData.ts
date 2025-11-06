
import { useState, useEffect, useCallback } from 'react';
import { fetchConfig, fetchProgress } from '../services/googleSheetsService';
import { ProjectConfig, ProgressRecord } from '../types';

export function useConfig() {
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchConfig();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return { config, loading, error, reloadConfig: loadConfig };
}

export function useProgress() {
    const [progress, setProgress] = useState<ProgressRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const loadProgress = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchProgress();
            setProgress(data as ProgressRecord[]);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Error desconocido al cargar el progreso'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProgress();
    }, [loadProgress]);

    return { progress, loading, error, reloadProgress: loadProgress };
}