import React from 'react';

interface AutoSaveIndicatorProps {
  lastSavedAt: Date | null;
  isSaving: boolean;
  onSaveNow?: () => void;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  lastSavedAt,
  isSaving,
  onSaveNow
}) => {
  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div
      onClick={onSaveNow}
      title={
        lastSavedAt
          ? `Auto-save every 30s • Last saved at ${formatTime(lastSavedAt)}. Click to save now.`
          : 'Auto-save active every 30s. Click to save now.'
      }
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-medium border shadow-xs transition-all cursor-pointer select-none ${
        isSaving
          ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
      }`}
    >
      {/* Status indicator dot */}
      <span className="relative flex h-2 w-2">
        {isSaving ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </>
        ) : (
          <>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </>
        )}
      </span>

      {/* Text label */}
      <span className="font-semibold tracking-tight">
        {isSaving ? (
          <span className="flex items-center gap-1">
            <span>Saving...</span>
          </span>
        ) : lastSavedAt ? (
          <span className="flex items-center gap-1">
            <span className="text-slate-500 hidden sm:inline">Auto-saved</span>
            <span className="font-mono text-[10px] text-emerald-700">{formatTime(lastSavedAt)}</span>
          </span>
        ) : (
          <span className="text-emerald-700">Auto-save 30s active</span>
        )}
      </span>
    </div>
  );
};
