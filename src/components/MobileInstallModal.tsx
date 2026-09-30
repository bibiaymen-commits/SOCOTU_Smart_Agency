import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileInstallModal: React.FC<MobileInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(() => (isIOS ? 'ios' : 'android'));
  const [copied, setCopied] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  // Prefer the production/preview URL if in AI Studio or fallback to window.location.href
  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-2jbuy47tnvtrlnsux3xuco-60098597645.europe-west2.run.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}&margin=6`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await install();
      if (success) {
        onClose();
      }
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 print:hidden animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-5 sm:p-6 border border-slate-300 text-slate-900 text-xs space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#0f2c59] rounded-xl flex items-center justify-center text-white text-2xl shadow-sm border border-amber-400/30">
              📲
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-[#0f2c59] m-0">
                Mettre l'application sur l'écran de votre téléphone
              </h3>
              <p className="text-[11px] text-slate-500 m-0">
                Accédez à SOCOTU PDA d'un simple toucher comme une véritable application mobile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl font-bold cursor-pointer leading-none p-1 transition"
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>

        {/* Status: If already installed */}
        {isInstalled && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center gap-2.5 text-emerald-800 text-[11px] font-medium">
            <span className="text-base">✅</span>
            <span>Cette application est déjà installée sur l'écran d'accueil de cet appareil !</span>
          </div>
        )}

        {/* 1-Click Native Install Prompt if supported & triggered */}
        {isInstallable && !isInstalled && (
          <div className="bg-linear-to-r from-blue-700 to-indigo-800 text-white rounded-xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="font-extrabold text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <span>⚡</span>
                <span>Installation directe disponible !</span>
              </div>
              <p className="text-[11px] text-blue-100">
                Votre navigateur permet d'ajouter l'icône sur votre écran en 1 clic.
              </p>
            </div>
            <button
              onClick={handleDirectInstall}
              disabled={isInstalling}
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-lg text-xs shadow-lg cursor-pointer transition flex items-center justify-center gap-2 shrink-0 active:scale-95"
            >
              <span>📲</span>
              <span>{isInstalling ? 'Installation...' : 'Ajouter à mon écran maintenant'}</span>
            </button>
          </div>
        )}

        {/* Tabs: Android vs iPhone */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold text-center cursor-pointer border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'android'
                ? 'border-[#0f2c59] text-[#0f2c59] bg-slate-50/80 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🤖</span>
            <span>Téléphone Android (Samsung, Xiaomi, etc.)</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold text-center cursor-pointer border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'ios'
                ? 'border-[#0f2c59] text-[#0f2c59] bg-slate-50/80 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🍎</span>
            <span>iPhone / iPad (Apple iOS)</span>
          </button>
        </div>

        {/* Tab 1: Android Tutorial */}
        {activeTab === 'android' && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              <div className="font-extrabold text-xs text-[#0f2c59] flex items-center gap-2">
                <span className="bg-emerald-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                  ✓
                </span>
                <span>Procédure simple sur Android (Google Chrome ou Samsung Internet) :</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-start gap-2.5">
                  <div className="bg-blue-100 text-blue-800 font-extrabold rounded-lg w-6 h-6 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-[11.5px] font-bold">Ouvrir le menu du navigateur</strong>
                    <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                      Sur votre téléphone, appuyez sur les <strong>3 petits points verticaux (⋮)</strong> situés en haut à droite de l'écran.
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-start gap-2.5">
                  <div className="bg-blue-100 text-blue-800 font-extrabold rounded-lg w-6 h-6 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-[11.5px] font-bold">Choisir l'option d'installation</strong>
                    <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                      Touchez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-start gap-2.5">
                  <div className="bg-blue-100 text-blue-800 font-extrabold rounded-lg w-6 h-6 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-[11.5px] font-bold">Confirmer l'ajout</strong>
                    <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                      Appuyez sur <strong>« Installer »</strong> ou <strong>« Ajouter »</strong> dans la fenêtre de confirmation.
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-start gap-2.5">
                  <div className="bg-emerald-100 text-emerald-800 font-extrabold rounded-lg w-6 h-6 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-[11.5px] font-bold">C'est terminé !</strong>
                    <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                      L'icône officielle <strong>SOCOTU PDA</strong> est sur votre écran d'accueil et s'ouvre en plein écran.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: iPhone / iOS Safari Tutorial */}
        {activeTab === 'ios' && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              <div className="font-extrabold text-xs text-[#0f2c59] flex items-center gap-2">
                <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                  ✓
                </span>
                <span>Procédure sur iPhone & iPad (avec le navigateur Safari) :</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-start gap-2.5">
                  <div className="bg-indigo-100 text-indigo-800 font-extrabold rounded-lg w-6 h-6 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-[11.5px] font-bold">Bouton Partager</strong>
                    <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                      Dans Safari, touchez le bouton <strong>Partager ⎋</strong> (le carré avec la flèche orientée vers le haut au centre de la barre du bas).
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-start gap-2.5">
                  <div className="bg-indigo-100 text-indigo-800 font-extrabold rounded-lg w-6 h-6 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-[11.5px] font-bold">Sur l'écran d'accueil</strong>
                    <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                      Faites défiler le menu vers le bas et touchez <strong>« Sur l'écran d'accueil »</strong> (avec le symbole ➕).
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-start gap-2.5">
                  <div className="bg-indigo-100 text-indigo-800 font-extrabold rounded-lg w-6 h-6 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-[11.5px] font-bold">Valider</strong>
                    <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                      En haut à droite de l'écran, touchez <strong>« Ajouter »</strong>.
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-start gap-2.5">
                  <div className="bg-emerald-100 text-emerald-800 font-extrabold rounded-lg w-6 h-6 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-[11.5px] font-bold">Prêt à l'emploi</strong>
                    <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                      L'icône SOCOTU s'affiche directement sur votre bureau iOS, sans barre d'adresse ni boutons de navigation.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code and Quick Link Box for scanning from another device */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-white p-2 rounded-xl shadow-xs border border-blue-200 shrink-0 text-center">
            <img
              src={qrCodeUrl}
              alt="QR Code d'accès mobile"
              className="w-24 h-24 sm:w-28 sm:h-28 mx-auto"
              loading="lazy"
            />
            <span className="text-[9.5px] text-slate-500 font-semibold mt-1 block">
              Scannez avec l'appareil photo
            </span>
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div>
              <strong className="text-blue-950 text-xs font-bold block">
                Vous consultez actuellement sur un ordinateur ?
              </strong>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Pointez simplement l'appareil photo de votre téléphone sur le <strong>QR Code</strong> pour ouvrir l'application immédiatement sur votre mobile, puis suivez les étapes ci-dessus !
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
              <button
                onClick={handleCopyUrl}
                className="bg-[#0f2c59] hover:bg-blue-900 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition shadow-xs flex items-center gap-1.5"
              >
                <span>{copied ? '✓ Lien copié !' : '📋 Copier le lien mobile'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Offline & Performance Advantage */}
        <div className="text-[10.5px] text-slate-600 bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
          <span className="text-base shrink-0">⚓</span>
          <span>
            <strong>Avantage maritime :</strong> Une fois ajoutée à l'écran, l'application fonctionne même en cas de réseau faible ou absent sur les quais portuaires grâce à la mise en cache hors-ligne.
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg font-bold text-xs cursor-pointer transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
