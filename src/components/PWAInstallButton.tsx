import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenGuide: () => void;
  variant?: 'header' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onOpenGuide, variant = 'header' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // If already running in standalone installed mode, we can show a small subtle badge or hide
  if (isInstalled && variant !== 'header') {
    return null;
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        onOpenGuide();
      }
    } else {
      onOpenGuide();
    }
  };

  if (variant === 'floating') {
    if (isInstalled) return null;
    return (
      <div className="fixed bottom-4 right-4 z-40 print:hidden animate-bounce-subtle">
        <button
          onClick={handleInstallClick}
          className="bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-full shadow-2xl border-2 border-white flex items-center gap-2 text-xs cursor-pointer transition transform active:scale-95"
          title="Mettre sur l'écran de votre téléphone"
        >
          <span className="text-base">📲</span>
          <span>Installer sur mon téléphone</span>
        </button>
      </div>
    );
  }

  // Header button style
  return (
    <button
      onClick={handleInstallClick}
      className={`border-0 rounded px-2.5 sm:px-3 py-1.5 text-xs font-bold cursor-pointer transition shadow-sm flex items-center gap-1.5 ${
        isInstallable
          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black animate-pulse'
          : 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold'
      }`}
      title="Mettre l'application sur l'écran d'accueil de votre smartphone (Android / iPhone)"
    >
      <span className="text-sm">📲</span>
      <span className="hidden sm:inline">Mettre sur mon téléphone</span>
      <span className="sm:hidden">Installer</span>
    </button>
  );
};
