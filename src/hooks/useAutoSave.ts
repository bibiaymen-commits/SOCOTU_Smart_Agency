import { useEffect, useRef, useState, useCallback } from 'react';
import { OfficialPdaModel, ArrivalDeclarationModel, BerthingRequestModel } from '../types/pda';
import { saveCurrentStatesToLocalStorage, AutoSaveMetadata } from '../utils/autoSaveStorage';

const DEBOUNCE_DELAY_MS = 350; // Save promptly after any user modification
const AUTOSAVE_INTERVAL_MS = 15000; // Periodic safety sync every 15s

export interface UseAutoSaveReturn {
  lastSavedAt: Date | null;
  isSaving: boolean;
  saveNow: () => void;
  metadata: AutoSaveMetadata | null;
}

export function useAutoSave(
  pda: OfficialPdaModel,
  declaration: ArrivalDeclarationModel,
  berthing?: BerthingRequestModel,
  onAutoSaved?: (meta: AutoSaveMetadata) => void
): UseAutoSaveReturn {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(() => new Date());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<AutoSaveMetadata | null>(null);

  const isFirstMount = useRef(true);
  const pdaRef = useRef(pda);
  const declarationRef = useRef(declaration);
  const berthingRef = useRef(berthing);

  useEffect(() => {
    pdaRef.current = pda;
  }, [pda]);

  useEffect(() => {
    declarationRef.current = declaration;
  }, [declaration]);

  useEffect(() => {
    berthingRef.current = berthing;
  }, [berthing]);

  const executeSave = useCallback(() => {
    try {
      setIsSaving(true);
      const meta = saveCurrentStatesToLocalStorage(
        pdaRef.current,
        declarationRef.current,
        berthingRef.current
      );
      setMetadata(meta);
      setLastSavedAt(new Date(meta.lastSavedAt));
      if (onAutoSaved) {
        onAutoSaved(meta);
      }
    } catch (e) {
      console.error('AutoSave failed:', e);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  }, [onAutoSaved]);

  // INSTANT AUTO-SAVE ON ANY CHANGE (debounced 350ms)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    setIsSaving(true);
    const timer = setTimeout(() => {
      executeSave();
    }, DEBOUNCE_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [pda, declaration, berthing, executeSave]);

  // Periodic background check every 15 seconds
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
