import React, { useState, useEffect, useId } from 'react';
import { SocotuOfficialHeader } from './SocotuOfficialHeader';
import { SmartNumericInput } from './SmartNumericInput';
import { BerthingRequestModel, OfficialPdaModel, PortId } from '../types/pda';
import { SOCOTU_BRANCHES, PORT_BERTHS } from '../data/tunisianPorts';

interface BerthingRequestProps {
  pda: OfficialPdaModel;
  berthing: BerthingRequestModel;
  onUpdateBerthing: (updated: BerthingRequestModel) => void;
  onBackToPda: () => void;
  onGoToArrival?: () => void;
}

const TUNISIAN_PORTS: PortId[] = ['Sousse', 'Sfax', 'Rades', 'Bizerte', 'Gabes'];

const STANDARD_HOURS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
  '00:00'
];

/** Convert DD/MM/YYYY to YYYY-MM-DD for native <input type="date"> */
function toIsoDate(val: string): string {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const match = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return '';
}

/** Convert YYYY-MM-DD to DD/MM/YYYY for display and printing */
function toFrenchDate(iso: string): string {
  if (!iso) return '';
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, y, m, d] = match;
    return `${d}/${m}/${y}`;
  }
  return iso;
}

export const BerthingRequest: React.FC<BerthingRequestProps> = ({
  pda,
  berthing,
  onUpdateBerthing,
  onBackToPda,
  onGoToArrival
}) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const datePickerId = useId();
  const timePickerId = useId();

  const currentBranch = SOCOTU_BRANCHES[berthing.port] || SOCOTU_BRANCHES.Sousse;
  const portBerthsList = PORT_BERTHS[berthing.port] || PORT_BERTHS.Sousse;

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleChange = <K extends keyof BerthingRequestModel>(
    field: K,
    value: BerthingRequestModel[K]
  ) => {
    onUpdateBerthing({
      ...berthing,
      [field]: value
    });
  };

  // Change port dynamically with its berths, recipient and city
  const handlePortChange = (newPort: PortId) => {
    const cityName = newPort.toUpperCase();
    const defaultBerths = PORT_BERTHS[newPort] || PORT_BERTHS.Sousse;
    onUpdateBerthing({
      ...berthing,
      port: newPort,
      city: cityName,
      recipient: `Monsieur le Commandant Du Port De ${newPort}`,
      agencySignOff: `SOCOTU ${cityName}`,
      desiredBerth: defaultBerths[0] || 'DISPONIBILITE DE POSTE A QUAI'
    });
    showNotification(`✓ Port changé pour ${newPort} (quais mis à jour)`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Reset to exact user prompt example: M/V joy x, 14/02/2025, 7500 MTS sable EN VRAC
  const handleLoadUserExample = () => {
    onUpdateBerthing({
      port: 'Sousse',
      city: 'SOUSSE',
      date: '14/02/2025',
      recipient: 'Monsieur le Commandant Du Port De Sousse',
      object: "OBJET : DEMANDE D'ACCOSTAGE",
      introText: 'Nous vous prions de bien vouloir faire accoster le navire :',
      vesselName: 'M/V « joy x   »',
      desiredBerth: 'DISPONIBILITE DE POSTE A QUAI',
      berthingDate: 'DISPONIBILITE DE POSTE A QUAI',
      berthingTime: 'DISPONIBILITE DE POSTE A QUAI',
      accostagePour: 'EMBARQUEMENT 7500 MTS sable  EN VRAC',
      loa: 116.23,
      beam: 18.00,
      maxDraft: 7.60,
      closingText: 'Avec nos remerciements anticipés.',
      agencySignOff: 'SOCOTU SOUSSE',
      agentName: "L'Agent Maritime SOCOTU",
      stampNote: 'Cachet & Signature'
    });
    showNotification('✓ Exemple M/V joy x (14/02/2025) chargé avec succès');
  };

  // Populate from active PDA
  const handleSyncFromPda = () => {
    const portName = pda.port || 'Sousse';
    const cityName = portName.toUpperCase();
    
    let dateStr = berthing.date;
    if (pda.date && /^\d{4}-\d{2}-\d{2}$/.test(pda.date)) {
      const parts = pda.date.split('-');
      dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    let vesselStr = berthing.vesselName;
    if (pda.vessel?.name) {
      const raw = pda.vessel.name.trim();
      vesselStr = raw.toUpperCase().startsWith('M/V') || raw.toUpperCase().startsWith('MV')
        ? raw
        : `M/V « ${raw} »`;
    }

    let accostageStr = berthing.accostagePour;
    if (pda.vessel?.cargo || pda.vessel?.weightCargo) {
      const op = pda.vessel.cargoOperation === 'Loading' ? 'EMBARQUEMENT' : 'DEBARQUEMENT';
      const qty = pda.vessel.weightCargo ? `${pda.vessel.weightCargo} MTS` : '7500 MTS';
      const cargo = pda.vessel.cargo || 'sable';
      accostageStr = `${op} ${qty} ${cargo}  EN VRAC`;
    }

    onUpdateBerthing({
      ...berthing,
      port: portName,
      city: cityName,
      date: dateStr,
      recipient: `Monsieur le Commandant Du Port De ${portName}`,
      vesselName: vesselStr,
      accostagePour: accostageStr,
      loa: pda.vessel?.loa || berthing.loa,
      beam: pda.vessel?.beam || berthing.beam,
      maxDraft: pda.vessel?.draft || pda.vessel?.actualDraft || berthing.maxDraft,
      agencySignOff: `SOCOTU ${cityName}`
    });
    showNotification(`✓ Données synchronisées avec la Proforma (${pda.vessel?.name || portName})`);
  };

  // Set today's date formatted DD/MM/YYYY for letter date
  const handleSetLetterDateToday = () => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    handleChange('date', `${d}/${m}/${y}`);
  };

  // Helper for Berthing Date: Today / Tomorrow
  const handleSetBerthingDateOffset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    handleChange('berthingDate', `${day}/${month}/${year}`);
  };

  // Auto-synchronize cargaison et poids depuis la Proforma
  useEffect(() => {
    if (pda?.vessel) {
      const op = pda.vessel.cargoOperation === 'Loading' ? 'EMBARQUEMENT' : 'DEBARQUEMENT';
      const weight = pda.vessel.weightCargo ? pda.vessel.weightCargo.replace(/\s*MTS/i, '').trim() : '';
      const cargo = pda.vessel.cargo || '';
      const expectedAccostage = (cargo || weight) ? `${op} ${weight ? weight + ' MTS ' : ''}${cargo}`.trim() : '';

      // Synchroniser si la valeur actuelle est par défaut ou vide
      if (
        !berthing.accostagePour ||
        berthing.accostagePour.includes('7500') ||
        berthing.accostagePour.includes('sable') ||
        (expectedAccostage && berthing.accostagePour !== expectedAccostage)
      ) {
        onUpdateBerthing({
          ...berthing,
          accostagePour: expectedAccostage,
          loa: pda.vessel.loa || berthing.loa,
          beam: pda.vessel.beam || berthing.beam,
          maxDraft: pda.vessel.draft || pda.vessel.actualDraft || berthing.maxDraft
        });
      }
    }
  }, [pda?.vessel?.cargo, pda?.vessel?.weightCargo, pda?.vessel?.cargoOperation]);

  const isBerthDateAvailability = berthing.berthingDate.trim().toUpperCase().includes('DISPONIBILITE');
  const isBerthTimeAvailability = berthing.berthingTime.trim().toUpperCase().includes('DISPONIBILITE');

  return (
    <div className="max-w-[950px] mx-auto animate-fade-in space-y-3">
      {/* Toast notification */}
      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-md print:hidden animate-fade-in flex items-center justify-between shadow-xs">
          <span>{toastMsg}</span>
          <span className="text-[10px] text-emerald-600 font-mono">Demande d'accostage</span>
        </div>
      )}

      {/* 
        DOCUMENT FEUILLE OFFICIELLE DEMANDE D'ACCOSTAGE
        Haut épuré (détails superflus annulés) et optimisé pour tenir STRICTEMENT sur une SEULE page A4 
      */}
      <div
        id="berthing-request-print-area"
        className="bg-white p-5 sm:p-8 rounded-md shadow-md text-[#111] font-sans border border-slate-300 print:shadow-none print:border-none print:p-4 print:m-0 print:text-[10.5px] print:h-auto print:max-h-[275mm] print:overflow-hidden"
      >
        {/* Corporate Header with Logo on the Left, Title in the Middle & Afaq Logo on the Right */}
        <SocotuOfficialHeader port={berthing.port || 'Sousse'} />

        {/* Sélecteur discret de port à l'écran */}
        <div className="print:hidden flex justify-end mb-2">
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Port:</span>
            <select
              value={berthing.port}
              onChange={e => handlePortChange(e.target.value as PortId)}
              className="text-xs font-bold text-[#0f2c59] bg-transparent focus:outline-none cursor-pointer"
            >
              {TUNISIAN_PORTS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date et Lieu (ex: SOUSSE LE : 14/02/2025) */}
        <div className="flex justify-end my-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <input
              type="text"
              value={berthing.city}
              onChange={e => handleChange('city', e.target.value.toUpperCase())}
              className="w-20 text-right uppercase font-extrabold text-xs border-b border-dashed border-slate-400 focus:border-[#0f2c59] focus:outline-none bg-transparent"
              title="Ville"
            />
            <span className="font-extrabold text-[#0f2c59]">LE :</span>
            <input
              type="text"
              value={berthing.date}
              onChange={e => handleChange('date', e.target.value)}
              className="w-24 text-left font-extrabold text-xs border-b border-dashed border-slate-400 focus:border-[#0f2c59] focus:outline-none bg-transparent"
              title="Date de la lettre (JJ/MM/AAAA)"
            />
            <button
              type="button"
              onClick={handleSetLetterDateToday}
              className="print:hidden text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded cursor-pointer border border-slate-300"
              title="Date du jour"
            >
              Aujourd'hui
            </button>
          </div>
        </div>

        {/* Destinataire : Monsieur le Commandant Du Port De Sousse */}
        <div className="flex justify-end my-3 sm:my-4">
          <div className="w-full sm:w-[360px] bg-slate-50/70 p-2 rounded border border-slate-200 print:bg-transparent print:border-none print:p-0">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 print:hidden">
              À l'attention de :
            </div>
            <input
              type="text"
              value={berthing.recipient}
              onChange={e => handleChange('recipient', e.target.value)}
              className="w-full text-xs sm:text-sm font-extrabold text-[#0f2c59] border-b border-dashed border-slate-400 focus:border-[#0f2c59] focus:outline-none bg-transparent py-0.5 leading-snug"
              title="Destinataire (ex: Monsieur le Commandant Du Port De Sousse)"
            />
            <div className="text-[9.5px] text-slate-500 mt-0.5 italic">
              OMMP — Capitainerie du Port
            </div>
          </div>
        </div>

        {/* OBJET : DEMANDE D'ACCOSTAGE */}
        <div className="my-3 sm:my-4">
          <div className="inline-block border-2 border-[#0f2c59] bg-[#f8fafc] px-3.5 py-1.5 print:border-2 print:bg-white print:py-1">
            <span className="text-xs sm:text-sm font-black text-[#0f2c59] tracking-wider uppercase">
              {berthing.object}
            </span>
          </div>
        </div>

        {/* Formule de demande */}
        <div className="my-2.5 text-xs sm:text-sm font-semibold text-slate-800">
          <input
            type="text"
            value={berthing.introText}
            onChange={e => handleChange('introText', e.target.value)}
            className="w-full text-xs sm:text-sm font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-[#0f2c59] focus:outline-none bg-transparent"
          />
        </div>

        {/* Corps des détails de la demande */}
        <div className="my-3 space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
          {/* 1. NOM DU NAVIRE : */}
          <div className="p-2 bg-slate-50/80 rounded border border-slate-200 print:bg-transparent print:border-b print:border-slate-300 print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:p-1">
            <div className="font-extrabold text-[#0f2c59] text-[10.5px] uppercase tracking-wide mb-0.5">
              NOM DU NAVIRE :
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={berthing.vesselName}
                onChange={e => handleChange('vesselName', e.target.value)}
                placeholder="M/V « NOM DU NAVIRE »"
                className="w-full text-xs sm:text-sm font-extrabold text-[#0f2c59] focus:outline-none bg-transparent border-b border-slate-400 focus:border-[#0f2c59] py-0.5 tracking-wide"
              />
              <button
                type="button"
                onClick={() => {
                  const current = berthing.vesselName.replace(/[«»"]/g, '').trim();
                  handleChange('vesselName', `M/V « ${current.replace(/^M\/V\s*/i, '')} »`);
                }}
                className="print:hidden text-[9px] text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded cursor-pointer shrink-0"
                title="Mettre entre guillemets « ... »"
              >
                « ... »
              </button>
            </div>
          </div>

          {/* 
            2. QUAI SOUHAITE : 
            Scroll / déroulant selon les quais du port sélectionné (poste 01, poste 02... poste 07/02)
          */}
          <div className="p-2 bg-slate-50/80 rounded border border-slate-200 print:bg-transparent print:border-b print:border-slate-300 print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:p-1">
            <div className="font-extrabold text-[#0f2c59] text-[10.5px] uppercase tracking-wide mb-1 flex items-center justify-between flex-wrap gap-1">
              <span>QUAI SOUHAITE :</span>
              
              {/* Scroll list / selector of berths for the port */}
              <div className="print:hidden flex items-center gap-1.5 flex-wrap">
                <span className="text-[9.5px] font-semibold text-slate-500">
                  Choisir quai :
                </span>
                <select
                  value={
                    portBerthsList.some(b => b.toLowerCase() === berthing.desiredBerth.trim().toLowerCase())
                      ? portBerthsList.find(b => b.toLowerCase() === berthing.desiredBerth.trim().toLowerCase())
                      : 'CUSTOM'
                  }
                  onChange={e => {
                    if (e.target.value !== 'CUSTOM') {
                      handleChange('desiredBerth', e.target.value);
                    }
                  }}
                  className="text-[11px] font-bold text-[#0f2c59] bg-white border border-slate-300 rounded px-2 py-0.5 shadow-xs cursor-pointer focus:ring-1 focus:ring-[#0f2c59]"
                >
                  <optgroup label={`Liste des quais — Port de ${berthing.port}`}>
                    {portBerthsList.map(berthOption => (
                      <option key={berthOption} value={berthOption}>
                        {berthOption}
                      </option>
                    ))}
                  </optgroup>
                  <option value="CUSTOM">✏️ Saisie personnalisée / Autre quai...</option>
                </select>
              </div>
            </div>

            {/* Quick click pills for all official berths (poste 01..poste 07/02) */}
            <div className="print:hidden flex items-center gap-1 my-1 flex-wrap">
              {portBerthsList.map(b => {
                const isSelected = berthing.desiredBerth.trim().toLowerCase() === b.toLowerCase();
                const shortLabel = b === 'DISPONIBILITE DE POSTE A QUAI' ? 'Poste disponible' : b;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleChange('desiredBerth', b)}
                    className={`text-[9.5px] font-bold px-2 py-0.5 rounded cursor-pointer transition border ${
                      isSelected
                        ? 'bg-[#0f2c59] text-white border-[#0f2c59] shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {shortLabel}
                  </button>
                );
              })}
            </div>

            {/* Editable field & printed output */}
            <input
              type="text"
              value={berthing.desiredBerth}
              onChange={e => handleChange('desiredBerth', e.target.value)}
              className="w-full text-xs sm:text-sm font-bold text-slate-900 focus:outline-none bg-transparent border-b border-slate-400 focus:border-[#0f2c59] py-0.5 uppercase tracking-wide"
            />
          </div>

          {/* 
            3. DATE D’ACCOSTAGE :
            Scroll calendrier pour choisir date OU Dès disponibilité de poste à quai
          */}
          <div className="p-2 bg-slate-50/80 rounded border border-slate-200 print:bg-transparent print:border-b print:border-slate-300 print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:p-1">
            <div className="font-extrabold text-[#0f2c59] text-[10.5px] uppercase tracking-wide mb-1 flex items-center justify-between flex-wrap gap-1">
              <span>DATE D’ACCOSTAGE :</span>

              {/* Action tools: Dès disponibilité OU Calendrier scroll */}
              <div className="print:hidden flex items-center gap-1.5 flex-wrap">
                {/* Bouton Dès disponibilité */}
                <button
                  type="button"
                  onClick={() => handleChange('berthingDate', 'DISPONIBILITE DE POSTE A QUAI')}
                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded cursor-pointer transition border ${
                    isBerthDateAvailability
                      ? 'bg-[#0f2c59] text-white border-[#0f2c59]'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                  title="Dès disponibilité de poste à quai"
                >
                  Poste disponible
                </button>

                {/* Sélecteur de date calendrier scrollable */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-1.5 py-0.5 shadow-xs">
                  <label htmlFor={datePickerId} className="text-[9.5px] text-slate-600 font-semibold cursor-pointer flex items-center gap-1">
                    <span>📅</span>
                    <span>Calendrier :</span>
                  </label>
                  <input
                    id={datePickerId}
                    type="date"
                    value={toIsoDate(berthing.berthingDate)}
                    onChange={e => {
                      if (e.target.value) {
                        handleChange('berthingDate', toFrenchDate(e.target.value));
                      }
                    }}
                    className="text-[11px] font-bold text-[#0f2c59] bg-transparent cursor-pointer focus:outline-none"
                  />
                </div>

                {/* Raccourcis date */}
                <button
                  type="button"
                  onClick={() => handleSetBerthingDateOffset(0)}
                  className="text-[9px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-1.5 py-0.5 rounded cursor-pointer"
                  title="Date du jour"
                >
                  Aujourd'hui
                </button>
                <button
                  type="button"
                  onClick={() => handleSetBerthingDateOffset(1)}
                  className="text-[9px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-1.5 py-0.5 rounded cursor-pointer"
                  title="Date de demain"
                >
                  Demain
                </button>
              </div>
            </div>

            {/* Editable field & printed output */}
            <input
              type="text"
              value={berthing.berthingDate}
              onChange={e => handleChange('berthingDate', e.target.value)}
              className="w-full text-xs sm:text-sm font-bold text-slate-900 focus:outline-none bg-transparent border-b border-slate-400 focus:border-[#0f2c59] py-0.5 uppercase tracking-wide"
            />
          </div>

          {/* 
            4. HEURE D’ACCOSTAGE :
            Scroll format heure pour choisir heure OU Dès disponibilité
          */}
          <div className="p-2 bg-slate-50/80 rounded border border-slate-200 print:bg-transparent print:border-b print:border-slate-300 print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:p-1">
            <div className="font-extrabold text-[#0f2c59] text-[10.5px] uppercase tracking-wide mb-1 flex items-center justify-between flex-wrap gap-1">
              <span>HEURE D’ACCOSTAGE :</span>

              {/* Action tools: Dès disponibilité OU Scroll format heure */}
              <div className="print:hidden flex items-center gap-1.5 flex-wrap">
                {/* Bouton Dès disponibilité */}
                <button
                  type="button"
                  onClick={() => handleChange('berthingTime', 'DISPONIBILITE DE POSTE A QUAI')}
                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded cursor-pointer transition border ${
                    isBerthTimeAvailability
                      ? 'bg-[#0f2c59] text-white border-[#0f2c59]'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                  title="Dès disponibilité de poste à quai"
                >
                  Poste disponible
                </button>

                {/* Sélecteur scroll format heure */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-1.5 py-0.5 shadow-xs">
                  <span className="text-[9.5px] text-slate-600 font-semibold flex items-center gap-0.5">
                    <span>⏰</span>
                    <span>Heure :</span>
                  </span>
                  <select
                    value={STANDARD_HOURS.includes(berthing.berthingTime) ? berthing.berthingTime : 'CUSTOM'}
                    onChange={e => {
                      if (e.target.value !== 'CUSTOM') {
                        handleChange('berthingTime', e.target.value);
                      }
                    }}
                    className="text-[11px] font-bold text-[#0f2c59] bg-transparent cursor-pointer focus:outline-none"
                  >
                    <option value="CUSTOM">Choisir...</option>
                    {STANDARD_HOURS.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Time picker native */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-1.5 py-0.5 shadow-xs">
                  <label htmlFor={timePickerId} className="text-[9px] text-slate-500 font-semibold cursor-pointer">
                    Libre:
                  </label>
                  <input
                    id={timePickerId}
                    type="time"
                    value={/^\d{2}:\d{2}$/.test(berthing.berthingTime) ? berthing.berthingTime : ''}
                    onChange={e => {
                      if (e.target.value) {
                        handleChange('berthingTime', e.target.value);
                      }
                    }}
                    className="text-[11px] font-bold text-[#0f2c59] bg-transparent cursor-pointer focus:outline-none"
                  />
                </div>

                {/* Raccourcis postes */}
                {['08:00', '14:00', '20:00'].map(hourBadge => (
                  <button
                    key={hourBadge}
                    type="button"
                    onClick={() => handleChange('berthingTime', hourBadge)}
                    className="text-[9px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    {hourBadge}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable field & printed output */}
            <input
              type="text"
              value={berthing.berthingTime}
              onChange={e => handleChange('berthingTime', e.target.value)}
              className="w-full text-xs sm:text-sm font-bold text-slate-900 focus:outline-none bg-transparent border-b border-slate-400 focus:border-[#0f2c59] py-0.5 uppercase tracking-wide"
            />
          </div>

          {/* 5. ACCOSTAGE POUR : (Synchronisé avec PDA cargaison et poids) */}
          <div className="p-2 bg-amber-50/40 rounded border border-amber-200 print:bg-transparent print:border-b print:border-slate-300 print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:p-1">
            <div className="font-extrabold text-[#0f2c59] text-[10.5px] uppercase tracking-wide mb-1 flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center gap-1.5">
                <span>ACCOSTAGE POUR :</span>
                <span className="print:hidden text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                  Synchronisé PDA
                </span>
              </div>
              <div className="print:hidden flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const op = pda.vessel?.cargoOperation === 'Discharging' ? 'DEBARQUEMENT' : 'EMBARQUEMENT';
                    const weight = pda.vessel?.weightCargo ? pda.vessel.weightCargo.replace(/\s*MTS/i, '').trim() : '7500';
                    const cargo = pda.vessel?.cargo || 'sable';
                    handleChange('accostagePour', `${op} ${weight} MTS ${cargo}  EN VRAC`);
                    showNotification(`✓ Cargaison & Poids synchronisés: ${weight} MTS ${cargo}`);
                  }}
                  className="text-[9px] bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded cursor-pointer font-bold flex items-center gap-1"
                  title="Appliquer la cargaison et le tonnage de la Proforma"
                >
                  <span>🔄</span>
                  <span>Proforma : {pda.vessel?.weightCargo || '7500'} MTS {pda.vessel?.cargo || 'sable'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const current = berthing.accostagePour;
                    if (current.startsWith('EMBARQUEMENT')) {
                      handleChange('accostagePour', current.replace('EMBARQUEMENT', 'DEBARQUEMENT'));
                    } else if (current.startsWith('DEBARQUEMENT')) {
                      handleChange('accostagePour', current.replace('DEBARQUEMENT', 'EMBARQUEMENT'));
                    }
                  }}
                  className="text-[9px] bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded cursor-pointer font-semibold"
                >
                  Emb / Déb
                </button>
              </div>
            </div>
            <input
              type="text"
              value={berthing.accostagePour}
              onChange={e => handleChange('accostagePour', e.target.value)}
              className="w-full text-xs sm:text-sm font-extrabold text-[#0f2c59] focus:outline-none bg-transparent border-b border-slate-400 focus:border-[#0f2c59] py-0.5 uppercase tracking-wide"
            />
          </div>
        </div>

        {/* LIGNE PARTICULIÈRES : LONGEUR, LARGEUR, MAX DRAFT */}
        <div className="my-3 p-2.5 sm:p-3 bg-slate-100/90 rounded-md border border-slate-300 print:bg-transparent print:border-2 print:border-slate-800 print:p-2 print:my-2">
          <div className="text-[9.5px] font-bold text-slate-600 uppercase tracking-wider mb-1 print:hidden">
            Caractéristiques techniques du navire
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900">
            {/* LONGEUR: 116.23 m */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-start">
              <span className="font-extrabold text-[#0f2c59] uppercase tracking-wide">
                LONGEUR:
              </span>
              <div className="w-20">
                <SmartNumericInput
                  value={berthing.loa}
                  onChange={val => handleChange('loa', val)}
                  decimals={2}
                  align="left"
                  className="w-full font-extrabold text-xs sm:text-sm text-slate-900 border-b border-slate-400 focus:border-[#0f2c59] bg-transparent py-0.5"
                />
              </div>
              <span className="text-slate-700 font-bold">m</span>
            </div>

            {/* LARGEUR: 18.00 m */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-start">
              <span className="font-extrabold text-[#0f2c59] uppercase tracking-wide">
                LARGEUR:
              </span>
              <div className="w-20">
                <SmartNumericInput
                  value={berthing.beam}
                  onChange={val => handleChange('beam', val)}
                  decimals={2}
                  align="left"
                  className="w-full font-extrabold text-xs sm:text-sm text-slate-900 border-b border-slate-400 focus:border-[#0f2c59] bg-transparent py-0.5"
                />
              </div>
              <span className="text-slate-700 font-bold">m</span>
            </div>

            {/* MAX DRAFT : 7.60 m */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-start">
              <span className="font-extrabold text-[#0f2c59] uppercase tracking-wide">
                MAX DRAFT :
              </span>
              <div className="w-20">
                <SmartNumericInput
                  value={berthing.maxDraft}
                  onChange={val => handleChange('maxDraft', val)}
                  decimals={berthing.maxDraft.toFixed(3).endsWith('0') ? 2 : 3}
                  align="left"
                  className="w-full font-extrabold text-xs sm:text-sm text-slate-900 border-b border-slate-400 focus:border-[#0f2c59] bg-transparent py-0.5"
                />
              </div>
              <span className="text-slate-700 font-bold">m</span>
            </div>
          </div>
        </div>

        {/* Avec nos remerciements anticipés. */}
        <div className="my-4 print:my-2 text-xs sm:text-sm font-semibold text-slate-800">
          <input
            type="text"
            value={berthing.closingText}
            onChange={e => handleChange('closingText', e.target.value)}
            className="w-full text-xs sm:text-sm font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-[#0f2c59] focus:outline-none bg-transparent"
          />
        </div>

        {/* Bloc Signature : SOCOTU SOUSSE (compact pour page A4 unique) */}
        <div className="mt-6 sm:mt-8 print:mt-3 flex flex-col sm:flex-row justify-between items-end gap-4 pt-2">
          <div className="text-[9.5px] text-slate-400 font-mono hidden sm:block">
            Document généré par l'Agence Maritime SOCOTU
          </div>

          <div className="w-full sm:w-[260px] text-center border-t border-slate-300 sm:border-none pt-2 sm:pt-0">
            <input
              type="text"
              value={berthing.agencySignOff}
              onChange={e => handleChange('agencySignOff', e.target.value.toUpperCase())}
              className="w-full text-center text-xs sm:text-sm font-black text-[#0f2c59] tracking-wider uppercase border-b border-slate-400 focus:border-[#0f2c59] focus:outline-none bg-transparent py-0.5 mb-1"
            />
            <div className="text-[10px] font-bold text-slate-600 uppercase mb-2">
              {berthing.agentName || "L'Agent Maritime SOCOTU"}
            </div>
            
            {/* Boîte pour Cachet et Signature (compacte pour A4 strict) */}
            <div className="h-16 sm:h-20 print:h-16 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center p-1.5 text-slate-400">
              <span className="text-[9.5px] uppercase font-bold tracking-wider">
                {berthing.stampNote || 'Cachet & Signature'}
              </span>
              <span className="text-[8px] text-slate-400 mt-0.5 italic print:hidden">
                (Emplacement visa agence)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
