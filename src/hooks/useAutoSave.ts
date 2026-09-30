import { useEffect, useRef, useState, useCallback } from 'react';
import { OfficialPdaModel, ArrivalDeclarationModel } from '../types/pda';
import { saveCurrentStatesToLocalStorage, AutoSaveMetadata } from '../utils/autoSaveStorage';

const AUTOSAVE_INTERVAL_MS = 30000; // 30 seconds

export interface UseAutoSaveReturn {
  lastSavedAt: Date | null;
  isSaving: boolean;
  saveNow: () => void;
  metadata: AutoSaveMetadata | null;
}

export function useAutoSave(
  pda: OfficialPdaModel,
  declaration: ArrivalDeclarationModel
): UseAutoSaveReturn {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<AutoSaveMetadata | null>(null);

  // Keep references to latest states to avoid stale closures in interval
  const pdaRef = useRef(pda);
  const declarationRef = useRef(declaration);

  useEffect(() => {
    pdaRef.current = pda;
  }, [pda]);

  useEffect(() => {
    declarationRef.current = declaration;
  }, [declaration]);

  const executeSave = useCallback(() => {
    try {
      setIsSaving(true);
      const meta = saveCurrentStatesToLocalStorage(pdaRef.current, declarationRef.current);
      setMetadata(meta);
      setLastSavedAt(new Date(meta.lastSavedAt));
    } catch (e) {
      console.error('AutoSave failed:', e);
    } finally {
      // Keep saving indicator brief and smooth
      setTimeout(() => {
        setIsSaving(false);
      }, 800);
    }
  }, []);

  // Interval timer every 30 seconds
  useEffect(() => {
    const timerId = setInterval(() => {
      executeSave();
    }, AUTOSAVE_INTERVAL_MS);

    return () => {
      clearInterval(timerId);
    };
  }, [executeSave]);

  // Also auto-save on page hide / tab blur / unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        executeSave();
      }
    };

    const handleBeforeUnload = () => {
      executeSave();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [executeSave]);

  return {
    lastSavedAt,
    isSaving,
    saveNow: executeSave,
    metadata
  };
}
