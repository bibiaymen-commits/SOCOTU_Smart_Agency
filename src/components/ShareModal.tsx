import React, { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  pdfFile: File | null;
  pdfUrl: string | null;
  isGenerating?: boolean;
  onShowToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  pdfFile,
  pdfUrl,
  isGenerating = false,
  onShowToast
}) => {
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const fileName = pdfFile?.name || `${documentTitle.replace(/\s+/g, '_')}.pdf`;

  // 1. Ouvrir directement dans l'application Lecteur PDF (Adobe, Navigateur, etc.)
  const handleOpenPdfReader = () => {
    if (!pdfUrl) {
      onShowToast('Génération du document PDF en cours...');
      return;
    }
    window.open(pdfUrl, '_blank');
    onShowToast('✓ Document ouvert dans le lecteur PDF');
  };

  // 2. Partager le fichier PDF via le sélecteur natif (WhatsApp, Mail, AirDrop, etc.)
  const handleSharePdfFile = async () => {
    if (!pdfFile) {
      onShowToast('Fichier PDF non disponible');
      return;
    }

    setIsSharing(true);
    try {
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: documentTitle,
          text: `Document officiel : ${documentTitle}`,
          files: [pdfFile]
        });
        onShowToast('✓ PDF partagé avec succès');
      } else if (navigator.share) {
        await navigator.share({
          title: documentTitle,
          text: `Document officiel : ${documentTitle}`,
          url: window.location.href
        });
        onShowToast('✓ Lien partagé');
      } else {
        // Fallback: download the file
        handleDownloadPdf();
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        onShowToast('Partage annulé ou non supporté');
      }
    } finally {
      setIsSharing(false);
    }
  };

  // 3. Télécharger le fichier PDF sur l'appareil
  const handleDownloadPdf = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast(`✓ PDF enregistré : ${fileName}`);
  };

  // 4. E-mail avec objet officiel
  const handleEmail = () => {
    const subject = encodeURIComponent(documentTitle);
    const body = encodeURIComponent(
      `Veuillez trouver ci-joint le document officiel (${fileName}).\n\nSOCIETE COMMERCIALE TUNISIENNE (SOCOTU)`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fade-in print:hidden">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#0f2c59] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <div>
              <div className="font-extrabold text-sm uppercase tracking-wide">
                Share Document (PDF)
              </div>
              <div className="text-[10px] text-blue-200">
                Application PDF Reader & Partage
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white text-lg font-bold px-2 py-0.5 rounded cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Card du fichier PDF imprimable généré */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center text-red-600 text-2xl shrink-0">
              {isGenerating ? '⏳' : 'PDF'}
            </div>
            <div className="overflow-hidden grow">
              <div className="text-xs font-black text-slate-800 truncate" title={fileName}>
                {fileName}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded text-[9px]">
                  Version A4 Prête
                </span>
                <span>Sans détails superflus</span>
              </div>
            </div>
          </div>

          {/* Boutons d'action principaux : Toujours actifs et réactifs */}
          <div className="space-y-2.5">
            {/* Bouton 1 : Ouvrir dans le lecteur PDF */}
            <button
              type="button"
              onClick={handleOpenPdfReader}
              className="w-full bg-[#0f2c59] hover:bg-[#1d4ed8] text-white font-bold py-3 px-4 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition active:scale-98 cursor-pointer"
            >
              <span className="text-lg">{isGenerating && !pdfUrl ? '⏳' : '📖'}</span>
              <span>
                {isGenerating && !pdfUrl ? 'Ouverture dans PDF Reader (en cours...)' : "Ouvrir dans l'application PDF Reader"}
              </span>
            </button>

            {/* Bouton 2 : Partager le fichier PDF */}
            <button
              type="button"
              onClick={handleSharePdfFile}
              className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold py-3 px-4 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition active:scale-98 cursor-pointer"
            >
              <span className="text-lg">📲</span>
              <span>Partager le fichier PDF (WhatsApp, AirDrop, etc.)</span>
            </button>

            {/* Bouton 3 : Télécharger / Enregistrer le PDF */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
              >
                <span>⬇️</span>
                <span>Télécharger PDF</span>
              </button>

              <button
                type="button"
                onClick={handleEmail}
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
              >
                <span>✉️</span>
                <span>Envoyer par E-mail</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 px-4 py-1.5 rounded cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
