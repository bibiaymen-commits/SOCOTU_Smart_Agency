import React, { useState, useMemo } from 'react';
import { VesselRecord, searchVessels, getAllVessels, saveVesselToLocalDb } from '../data/vesselDatabase';

interface VesselSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVessel: (vessel: VesselRecord) => void;
  currentVessel?: {
    name?: string;
    imo?: string;
    flag?: string;
    callSign?: string;
    loa?: number;
    beam?: number;
    draft?: number;
    grt?: number;
    nrt?: number;
  };
}

export const VesselSearchModal: React.FC<VesselSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectVessel,
  currentVessel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New vessel form state
  const [newImo, setNewImo] = useState(currentVessel?.imo || '');
  const [newName, setNewName] = useState(currentVessel?.name || '');
  const [newFlag, setNewFlag] = useState(currentVessel?.flag || '');
  const [newCallSign, setNewCallSign] = useState(currentVessel?.callSign || '');
  const [newLoa, setNewLoa] = useState(currentVessel?.loa?.toString() || '');
  const [newBeam, setNewBeam] = useState(currentVessel?.beam?.toString() || '');
  const [newDraft, setNewDraft] = useState(currentVessel?.draft?.toString() || '');
  const [newGrt, setNewGrt] = useState(currentVessel?.grt?.toString() || '');
  const [newNrt, setNewNrt] = useState(currentVessel?.nrt?.toString() || '');
  const [newType, setNewType] = useState('General Cargo / Bulk');

  const filteredVessels = useMemo(() => {
    return searchVessels(searchTerm);
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleSaveAndApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImo.trim() || !newName.trim()) return;

    const record: VesselRecord = {
      imo: newImo.trim(),
      name: newName.trim().toUpperCase(),
      flag: newFlag.trim(),
      callSign: newCallSign.trim().toUpperCase(),
      vesselType: newType,
      loa: parseFloat(newLoa.replace(',', '.')) || 0,
      beam: parseFloat(newBeam.replace(',', '.')) || 0,
      draft: parseFloat(newDraft.replace(',', '.')) || 0,
      grt: parseFloat(newGrt) || 0,
      nrt: parseFloat(newNrt) || 0
    };

    saveVesselToLocalDb(record);
    onSelectVessel(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fade-in print:hidden">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#0f2c59] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚢</span>
            <div>
              <div className="font-extrabold text-sm uppercase tracking-wide">
                Base de Données Navires — Recherche par N° IMO
              </div>
              <div className="text-[10px] text-blue-200">
                Remplissage automatique immédiat (Dimensions, Jauge, Pavillon)
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

        {/* Search Bar & Tabs */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          {!isAddingNew ? (
            <div className="relative w-full">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                autoFocus
                placeholder="Entrez le N° IMO (ex: 9198642) ou le Nom du navire..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f2c59] bg-white shadow-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs font-bold text-[#0f2c59]">
              ➕ Ajouter un nouveau navire dans la base locale
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap bg-white hover:bg-slate-100 text-[#0f2c59] border-slate-300 shadow-xs"
          >
            {isAddingNew ? '⬅️ Retour à la recherche' : '➕ Nouveau navire'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto grow">
          {!isAddingNew ? (
            <div className="space-y-2">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex justify-between items-center">
                <span>Résultats ({filteredVessels.length} navires disponibles)</span>
                <span>Cliquez pour auto-remplir</span>
              </div>

              {filteredVessels.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300 p-4">
                  <div className="text-2xl mb-1">🔍</div>
                  <div className="text-xs font-bold text-slate-700">Aucun navire trouvé pour "{searchTerm}"</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Vous pouvez l'enregistrer directement en cliquant sur "Nouveau navire".
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewImo(/^\d+$/.test(searchTerm) ? searchTerm : '');
                      setNewName(!/^\d+$/.test(searchTerm) ? searchTerm : '');
                      setIsAddingNew(true);
                    }}
                    className="mt-3 bg-[#0f2c59] text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-blue-900 cursor-pointer shadow-xs"
                  >
                    Ajouter ce navire à la base
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredVessels.map(v => (
                    <div
                      key={v.imo}
                      onClick={() => {
                        onSelectVessel(v);
                        onClose();
                      }}
                      className="border border-slate-200 hover:border-[#0f2c59] hover:bg-blue-50/50 rounded-lg p-3 transition cursor-pointer bg-white shadow-xs group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base group-hover:scale-110 transition">🚢</span>
                          <div>
                            <span className="font-extrabold text-xs sm:text-sm text-[#0f2c59] tracking-wide uppercase">
                              {v.name}
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono ml-2 border border-slate-200">
                              IMO: {v.imo}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="bg-[#0f2c59] group-hover:bg-[#1d4ed8] text-white text-[11px] font-bold px-3 py-1 rounded shadow-xs transition"
                        >
                          Auto-Fill ↵
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Pavillon:</span>
                          <span className="font-semibold text-slate-800">{v.flag || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">LOA × Largeur:</span>
                          <span className="font-mono font-bold text-slate-900">{v.loa}m × {v.beam}m</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Tirant d'eau:</span>
                          <span className="font-mono font-bold text-slate-900">{v.draft} m</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">GRT / NRT:</span>
                          <span className="font-mono text-slate-800">{v.grt} / {v.nrt}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-slate-400 block text-[9px] uppercase">Type:</span>
                          <span className="text-slate-700 truncate block" title={v.vesselType}>{v.vesselType}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveAndApply} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    N° IMO *
                  </label>
                  <input
                    type="text"
                    required
                    value={newImo}
                    onChange={e => setNewImo(e.target.value)}
                    placeholder="ex: 9198642"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold focus:ring-1 focus:ring-[#0f2c59] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    Nom du Navire *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value.toUpperCase())}
                    placeholder="ex: JOY X"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold uppercase focus:ring-1 focus:ring-[#0f2c59] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    Pavillon (Flag)
                  </label>
                  <input
                    type="text"
                    value={newFlag}
                    onChange={e => setNewFlag(e.target.value)}
                    placeholder="ex: Panama, Malta..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#0f2c59] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    Indicatif Radio (Call Sign)
                  </label>
                  <input
                    type="text"
                    value={newCallSign}
                    onChange={e => setNewCallSign(e.target.value.toUpperCase())}
                    placeholder="ex: 3FFE8"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono uppercase focus:ring-1 focus:ring-[#0f2c59] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    Longueur Hors-Tout (LOA en m)
                  </label>
                  <input
                    type="text"
                    value={newLoa}
                    onChange={e => setNewLoa(e.target.value)}
                    placeholder="ex: 108.2"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold focus:ring-1 focus:ring-[#0f2c59] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    Largeur (Beam en m)
                  </label>
                  <input
                    type="text"
                    value={newBeam}
                    onChange={e => setNewBeam(e.target.value)}
                    placeholder="ex: 18.2"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold focus:ring-1 focus:ring-[#0f2c59] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    Tirant d'eau d'été (Draft en m)
                  </label>
                  <input
                    type="text"
                    value={newDraft}
                    onChange={e => setNewDraft(e.target.value)}
                    placeholder="ex: 7.20"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold focus:ring-1 focus:ring-[#0f2c59] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    Jauge Brute (GRT)
                  </label>
                  <input
                    type="text"
                    value={newGrt}
                    onChange={e => setNewGrt(e.target.value)}
                    placeholder="ex: 4990"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-[#0f2c59] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    Jauge Nette (NRT)
                  </label>
                  <input
                    type="text"
                    value={newNrt}
                    onChange={e => setNewNrt(e.target.value)}
                    placeholder="ex: 2650"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-[#0f2c59] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    Type de Navire
                  </label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold focus:ring-1 focus:ring-[#0f2c59] bg-white"
                  >
                    <option value="General Cargo / Bulk">General Cargo / Bulk</option>
                    <option value="Bulk Carrier">Bulk Carrier</option>
                    <option value="Container Ship">Container Ship</option>
                    <option value="Chemical / Oil Tanker">Chemical / Oil Tanker</option>
                    <option value="Ro-Ro / Ferry">Ro-Ro / Ferry</option>
                    <option value="Tug / Supply Vessel">Tug / Supply Vessel</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>💾</span>
                  <span>Enregistrer et Auto-remplir</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>🚢 Base officielle SOCOTU — Sousse, Sfax, Radès, Bizerte, Gabès</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1 rounded cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
