import React, { useState } from 'react';
import { SocotuOfficialHeader } from './SocotuOfficialHeader';
import { SmartNumericInput } from './SmartNumericInput';
import { 
  MooringPeriod, 
  OfficialPdaModel, 
  PortId, 
  ServiceItem, 
  TargetCurrency 
} from '../types/pda';
import { 
  SERVICE_OPTIONS, 
  SOCOTU_BRANCHES 
} from '../data/tunisianPorts';
import { 
  calcVesselMetrics, 
  calculateLamanageCost,
  calculatePortDues, 
  calculatePortExpenses, 
  formatInt, 
  formatNum,
  getDefaultMooringLines,
  getTodayIsoDate,
  formatDisplayDate
} from '../utils/calculations';

interface OfficialPdaContainerProps {
  pda: OfficialPdaModel;
  onUpdatePda: (pda: OfficialPdaModel) => void;
}

export const OfficialPdaContainer: React.FC<OfficialPdaContainerProps> = ({
  pda,
  onUpdatePda
}) => {
  const [selectedShipService, setSelectedShipService] = useState('');
  const [selectedCrewService, setSelectedCrewService] = useState('');
  const [selectedCargoService, setSelectedCargoService] = useState('');

  const [loaStr, setLoaStr] = useState<string | null>(null);
  const [beamStr, setBeamStr] = useState<string | null>(null);
  const [draftStr, setDraftStr] = useState<string | null>(null);

  const currentBranch = SOCOTU_BRANCHES[pda.port] || SOCOTU_BRANCHES.Sousse;

  // Handle port change
  const handlePortChange = (portId: PortId) => {
    const branch = SOCOTU_BRANCHES[portId] || SOCOTU_BRANCHES.Sousse;
    onUpdatePda({
      ...pda,
      port: portId,
      branchName: branch.agencyTitle,
      restrictions: branch.restrictions
    });
  };

  // Trigger recalculation on vessel spec changes
  const handleVesselSpecChange = (field: string, val: any) => {
    let parsedVal = val;
    if (typeof val === 'string' && (field === 'loa' || field === 'beam' || field === 'draft')) {
      const normalized = val.replace(',', '.');
      parsedVal = parseFloat(normalized);
      if (isNaN(parsedVal)) parsedVal = 0;
    }

    const updatedVessel = { ...pda.vessel, [field]: parsedVal };
    const loa = field === 'loa' ? parsedVal : (parseFloat(String(updatedVessel.loa).replace(',', '.')) || 0);
    const beam = field === 'beam' ? parsedVal : (parseFloat(String(updatedVessel.beam).replace(',', '.')) || 0);
    const draft = field === 'draft' ? parsedVal : (parseFloat(String(updatedVessel.draft).replace(',', '.')) || 0);

    const metrics = calcVesselMetrics(loa, beam, draft);
    updatedVessel.theorDraft = metrics.theorDraft;
    updatedVessel.actualDraft = metrics.actualDraft;
    updatedVessel.volume = metrics.volume;
    updatedVessel.bracketName = metrics.bracketName;

    // Default mooring lines for new volume unless user had manually customized it
    const defaultLinesForPrevVol = getDefaultMooringLines(pda.vessel.volume);
    const newDefaultLines = getDefaultMooringLines(metrics.volume);
    const updatedMooringLines = (pda.portDues.nMooring === defaultLinesForPrevVol || pda.portDues.nMooring <= 2)
      ? newDefaultLines 
      : pda.portDues.nMooring;

    // Recalculate port dues with new volume
    const newPortDues = calculatePortDues(
      metrics.volume,
      pda.portDues.nShelter,
      pda.portDues.nStay,
      pda.portDues.nPilot,
      pda.portDues.nTug,
      updatedMooringLines,
      pda.portDues.mooringPeriod,
      pda.portDues.nLamanageBoat
    );

    // Recalculate port expenses strictly with Lamanage according to new Volume (V)
    const defaultMooringU = newPortDues.combinedMooringTotalEUR;
    const uMooring = defaultMooringU;
    const nMooring = pda.portExpenses?.nMooring ?? 2;

    const newPortExpenses = calculatePortExpenses(
      newPortDues.subtotalPortDuesEUR,
      uMooring,
      nMooring,
      pda.portExpenses.uWatchEUR,
      pda.portExpenses.nWatch,
      pda.portExpenses.uGarbEUR,
      pda.portExpenses.nGarb,
      pda.portExpenses.agencyFeesEUR,
      pda.portExpenses.currencyControlRate,
      pda.portExpenses.additionalServices,
      pda.exchangeRate,
      updatedMooringLines
    );

    onUpdatePda({
      ...pda,
      vessel: updatedVessel,
      portDues: newPortDues,
      portExpenses: newPortExpenses
    });
  };

  // Recalculate Port Dues parameter changes
  const handlePortDuesChange = (field: string, val: any) => {
    const updatedDuesParams = { ...pda.portDues, [field]: val };

    const newPortDues = calculatePortDues(
      pda.vessel.volume,
      updatedDuesParams.nShelter,
      updatedDuesParams.nStay,
      updatedDuesParams.nPilot,
      updatedDuesParams.nTug,
      updatedDuesParams.nMooring,
      updatedDuesParams.mooringPeriod,
      updatedDuesParams.nLamanageBoat
    );

    const defaultMooringU = newPortDues.combinedMooringTotalEUR;
    const uMooring = field === 'nMooring' ? defaultMooringU : (pda.portExpenses?.uMooringEUR ?? defaultMooringU);
    const nMooring = pda.portExpenses?.nMooring ?? 2;
    const nWatch = field === 'nStay' ? val : pda.portExpenses.nWatch;

    const newPortExpenses = calculatePortExpenses(
      newPortDues.subtotalPortDuesEUR,
      uMooring,
      nMooring,
      pda.portExpenses.uWatchEUR,
      nWatch,
      pda.portExpenses.uGarbEUR,
      pda.portExpenses.nGarb,
      pda.portExpenses.agencyFeesEUR,
      pda.portExpenses.currencyControlRate,
      pda.portExpenses.additionalServices,
      pda.exchangeRate,
      newPortDues.nMooring
    );

    onUpdatePda({
      ...pda,
      portDues: newPortDues,
      portExpenses: newPortExpenses
    });
  };

  // Recalculate Port Expenses parameter changes
  const handlePortExpensesChange = (field: string, val: any) => {
    const updatedExpensesParams = { ...pda.portExpenses, [field]: val };
    const defaultMooringU = pda.portDues?.combinedMooringTotalEUR ?? 249.90;

    const newPortExpenses = calculatePortExpenses(
      pda.portDues.subtotalPortDuesEUR,
      updatedExpensesParams.uMooringEUR ?? defaultMooringU,
      updatedExpensesParams.nMooring ?? 2,
      updatedExpensesParams.uWatchEUR,
      updatedExpensesParams.nWatch,
      updatedExpensesParams.uGarbEUR,
      updatedExpensesParams.nGarb,
      updatedExpensesParams.agencyFeesEUR,
      updatedExpensesParams.currencyControlRate,
      updatedExpensesParams.additionalServices,
      pda.exchangeRate,
      pda.portDues.nMooring
    );

    onUpdatePda({
      ...pda,
      portExpenses: newPortExpenses
    });
  };

  // Handle direct change of "Case Nbr Amarres à remplir" (JORT N°90)
  const handleMooringLinesChange = (lines: number) => {
    const safeLines = Math.max(0, lines);
    const newPortDues = calculatePortDues(
      pda.vessel.volume,
      pda.portDues.nShelter,
      pda.portDues.nStay,
      pda.portDues.nPilot,
      pda.portDues.nTug,
      safeLines,
      pda.portDues.mooringPeriod,
      pda.portDues.nLamanageBoat
    );

    const newMooringU = newPortDues.combinedMooringTotalEUR;
    const nMooringOps = pda.portExpenses?.nMooring ?? 2;

    const newPortExpenses = calculatePortExpenses(
      newPortDues.subtotalPortDuesEUR,
      newMooringU,
      nMooringOps,
      pda.portExpenses.uWatchEUR,
      pda.portExpenses.nWatch,
      pda.portExpenses.uGarbEUR,
      pda.portExpenses.nGarb,
      pda.portExpenses.agencyFeesEUR,
      pda.portExpenses.currencyControlRate,
      pda.portExpenses.additionalServices,
      pda.exchangeRate,
      safeLines
    );

    onUpdatePda({
      ...pda,
      portDues: newPortDues,
      portExpenses: newPortExpenses
    });
  };

  // Currency or Exchange Rate changes
  const handleCurrencyChange = (curr: TargetCurrency, rate: number) => {
    const defaultMooringU = pda.portDues?.combinedMooringTotalEUR ?? 249.90;
    const newPortExpenses = calculatePortExpenses(
      pda.portDues.subtotalPortDuesEUR,
      pda.portExpenses?.uMooringEUR ?? defaultMooringU,
      pda.portExpenses?.nMooring ?? 2,
      pda.portExpenses.uWatchEUR,
      pda.portExpenses.nWatch,
      pda.portExpenses.uGarbEUR,
      pda.portExpenses.nGarb,
      pda.portExpenses.agencyFeesEUR,
      pda.portExpenses.currencyControlRate,
      pda.portExpenses.additionalServices,
      rate,
      pda.portDues.nMooring
    );

    onUpdatePda({
      ...pda,
      targetCurrency: curr,
      exchangeRate: rate,
      portExpenses: newPortExpenses
    });
  };

  // Add Dynamic Service
  const handleAddDynamicService = (category: 'Vessel' | 'Cargo' | 'Crew', name: string) => {
    if (!name) return;
    const newService: ServiceItem = {
      id: `svc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      category,
      name,
      quantity: 1,
      unit: 'Unit',
      unitPriceEUR: 0,
      totalEUR: 0
    };

    const updatedServices = [...pda.portExpenses.additionalServices, newService];
    const defaultMooringU = pda.portDues?.combinedMooringTotalEUR ?? 249.90;
    const newPortExpenses = calculatePortExpenses(
      pda.portDues.subtotalPortDuesEUR,
      pda.portExpenses?.uMooringEUR ?? defaultMooringU,
      pda.portExpenses?.nMooring ?? 2,
      pda.portExpenses.uWatchEUR,
      pda.portExpenses.nWatch,
      pda.portExpenses.uGarbEUR,
      pda.portExpenses.nGarb,
      pda.portExpenses.agencyFeesEUR,
      pda.portExpenses.currencyControlRate,
      updatedServices,
      pda.exchangeRate,
      pda.portDues.nMooring
    );

    onUpdatePda({
      ...pda,
      portExpenses: newPortExpenses
    });
  };

  // Remove Dynamic Service
  const handleRemoveDynamicService = (id: string) => {
    const updatedServices = pda.portExpenses.additionalServices.filter(s => s.id !== id);
    const defaultMooringU = pda.portDues?.combinedMooringTotalEUR ?? 249.90;
    const newPortExpenses = calculatePortExpenses(
      pda.portDues.subtotalPortDuesEUR,
      pda.portExpenses?.uMooringEUR ?? defaultMooringU,
      pda.portExpenses?.nMooring ?? 2,
      pda.portExpenses.uWatchEUR,
      pda.portExpenses.nWatch,
      pda.portExpenses.uGarbEUR,
      pda.portExpenses.nGarb,
      pda.portExpenses.agencyFeesEUR,
      pda.portExpenses.currencyControlRate,
      updatedServices,
      pda.exchangeRate,
      pda.portDues.nMooring
    );

    onUpdatePda({
      ...pda,
      portExpenses: newPortExpenses
    });
  };

  // Update Dynamic Service Row
  const handleUpdateDynamicServiceRow = (id: string, updates: Partial<ServiceItem>) => {
    const updatedServices = pda.portExpenses.additionalServices.map(s => {
      if (s.id === id) {
        const merged = { ...s, ...updates };
        merged.totalEUR = merged.quantity * merged.unitPriceEUR;
        return merged;
      }
      return s;
    });

    const defaultMooringU = pda.portDues?.combinedMooringTotalEUR ?? 249.90;
    const newPortExpenses = calculatePortExpenses(
      pda.portDues.subtotalPortDuesEUR,
      pda.portExpenses?.uMooringEUR ?? defaultMooringU,
      pda.portExpenses?.nMooring ?? 2,
      pda.portExpenses.uWatchEUR,
      pda.portExpenses.nWatch,
      pda.portExpenses.uGarbEUR,
      pda.portExpenses.nGarb,
      pda.portExpenses.agencyFeesEUR,
      pda.portExpenses.currencyControlRate,
      updatedServices,
      pda.exchangeRate,
      pda.portDues.nMooring
    );

    onUpdatePda({
      ...pda,
      portExpenses: newPortExpenses
    });
  };

  return (
    <div id="official-pda-print-area" className="max-w-[1000px] mx-auto bg-white p-3.5 sm:p-5 rounded-md shadow-md text-[#1e293b] font-sans text-[11px] print:shadow-none print:p-0 print:max-w-full">
      {/* Corporate Header with Logo on the Left, Title in the Middle & Afaq Logo on the Right */}
      <SocotuOfficialHeader port={pda.port} />

      {/* Sub-header below horizontal line */}
      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
        <div className="text-sm font-extrabold text-[#0f2c59] uppercase tracking-wide">
          Proforma Disbursement Account
        </div>
        <div className="text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 flex items-center gap-1.5 shadow-2xs print:border-none print:bg-transparent print:p-0">
          <span className="font-semibold text-[#0f2c59]">{pda.port} on :</span>
          
          {/* Print-only clean formatted date */}
          <span className="hidden print:inline font-mono font-bold text-slate-900">
            {formatDisplayDate(pda.date || getTodayIsoDate())}
          </span>

          {/* Interactive Screen Date with Automatic Today Feature */}
          <div className="flex items-center gap-1 print:hidden">
            <input
              type="date"
              value={pda.date || getTodayIsoDate()}
              onChange={e => onUpdatePda({ ...pda, date: e.target.value })}
              className="w-[125px] border border-slate-300 rounded px-1.5 py-0.5 bg-white text-center font-bold font-mono text-[11px] text-slate-800 cursor-pointer hover:border-blue-400 focus:ring-1 focus:ring-blue-500 outline-none"
              title="Date du PDA (modifiable ou automatique)"
            />
            <button
              type="button"
              onClick={() => onUpdatePda({ ...pda, date: getTodayIsoDate() })}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                (pda.date === getTodayIsoDate() || !pda.date)
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'
                  : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-50'
              }`}
              title="Mettre automatiquement à la date d'aujourd'hui"
            >
              <span>⚡</span>
              <span>Aujourd'hui</span>
            </button>
          </div>
        </div>
      </div>

      {/* META GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2.5 gap-y-1 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-300 rounded p-1.5 mb-1.5 text-[10px]">
        <div className="flex items-center">
          <span className="font-bold text-[#0f2c59] w-[80px] shrink-0 text-left">From / Branch:</span>
          <span className="text-slate-800 grow text-left">
            <input
              type="text"
              value={pda.branchName}
              onChange={e => onUpdatePda({ ...pda, branchName: e.target.value })}
              className="w-full px-1.5 py-0 border border-slate-300 rounded text-[10px] bg-white h-[20px] font-bold text-slate-900"
            />
          </span>
        </div>

        <div className="flex items-center">
          <span className="font-bold text-[#0f2c59] w-[80px] shrink-0 text-left">Port of Call:</span>
          <span className="text-slate-800 grow text-left">
            <select
              value={pda.port}
              onChange={e => handlePortChange(e.target.value as PortId)}
              className="w-full px-1.5 py-0 border border-slate-300 rounded text-[10px] bg-white h-[20px] font-bold text-[#0f2c59] cursor-pointer"
            >
              <option value="Sousse">Sousse Port</option>
              <option value="Sfax">Sfax Port</option>
              <option value="Rades">Radès / La Goulette Port</option>
              <option value="Bizerte">Bizerte Port</option>
              <option value="Gabes">Gabès Port</option>
            </select>
          </span>
        </div>

        <div className="flex items-center">
          <span className="font-bold text-[#0f2c59] w-[80px] shrink-0 text-left">To:</span>
          <span className="text-slate-800 grow text-left">
            <input
              type="text"
              value={pda.vessel.to}
              onChange={e => handleVesselSpecChange('to', e.target.value)}
              className="w-full px-1.5 py-0 border border-slate-300 rounded text-[10px] bg-white h-[20px]"
            />
          </span>
        </div>

        <div className="flex items-center">
          <span className="font-bold text-[#0f2c59] w-[80px] shrink-0 text-left">Kind Attn:</span>
          <span className="text-slate-800 grow text-left">
            <input
              type="text"
              value={pda.vessel.attn}
              onChange={e => handleVesselSpecChange('attn', e.target.value)}
              className="w-full px-1.5 py-0 border border-slate-300 rounded text-[10px] bg-white h-[20px]"
            />
          </span>
        </div>

        <div className="flex items-center">
          <span className="font-bold text-[#0f2c59] w-[80px] shrink-0 text-left">Vessel Name:</span>
          <span className="text-slate-800 grow text-left">
            <input
              type="text"
              value={pda.vessel.name}
              onChange={e => handleVesselSpecChange('name', e.target.value)}
              className="w-full px-1.5 py-0 border border-slate-300 rounded text-[10px] bg-white h-[20px] font-bold text-blue-900 uppercase"
            />
          </span>
        </div>

        <div className="flex items-center">
          <span className="font-bold text-[#0f2c59] w-[80px] shrink-0 text-left">Flag:</span>
          <span className="text-slate-800 grow text-left">
            <input
              type="text"
              value={pda.vessel.flag || ''}
              placeholder="e.g. Panama, Liberia, Malta, Tunisia..."
              onChange={e => handleVesselSpecChange('flag', e.target.value)}
              className="w-full px-1.5 py-0 border border-slate-300 rounded text-[10px] bg-white h-[20px] font-semibold text-slate-800"
            />
          </span>
        </div>

        {/* Cargo Designation with Operation dropdown scroll (Loading, Discharging, Formalities, Transit) */}
        <div className="flex items-center sm:col-span-2">
          <span className="font-bold text-[#0f2c59] w-[80px] shrink-0 text-left">Cargo:</span>
          <div className="grow flex items-center gap-1.5">
            <select
              value={pda.vessel.cargoOperation || 'Discharging'}
              onChange={e => handleVesselSpecChange('cargoOperation', e.target.value)}
              className="px-2 py-0 border border-blue-400 bg-blue-50 text-[#0f2c59] rounded text-[10px] h-[20px] font-bold cursor-pointer shrink-0 shadow-2xs"
              title="Select Cargo Operation: Loading, Discharging, Formalities, or Transit"
            >
              <option value="Loading">Loading</option>
              <option value="Discharging">Discharging</option>
              <option value="Formalities">Formalities</option>
              <option value="Transit">Transit</option>
            </select>
            <input
              type="text"
              value={pda.vessel.cargo}
              placeholder="Merchandise description, e.g. EXHAUSTED POMACE (BIOMASS)..."
              onChange={e => handleVesselSpecChange('cargo', e.target.value)}
              className="grow px-1.5 py-0 border border-slate-300 rounded text-[10px] bg-white h-[20px] font-medium"
            />
          </div>
        </div>

        <div className="flex items-center">
          <span className="font-bold text-[#0f2c59] w-[80px] shrink-0 text-left">Weight / Qty:</span>
          <span className="text-slate-800 grow text-left">
            <input
              type="text"
              value={pda.vessel.weightCargo}
              onChange={e => handleVesselSpecChange('weightCargo', e.target.value)}
              className="w-full px-1.5 py-0 border border-slate-300 rounded text-[10px] bg-white h-[20px] font-mono font-bold text-blue-900"
            />
          </span>
        </div>

        <div className="flex items-center">
          <span className="font-bold text-[#0f2c59] w-[80px] shrink-0 text-left">Vessel Owner:</span>
          <span className="text-slate-800 grow text-left">
            <input
              type="text"
              value={pda.vesselOwner || ''}
              placeholder="e.g. OCEANIC MARITIME SERVICES LTD"
              onChange={e => onUpdatePda({ ...pda, vesselOwner: e.target.value })}
              className="w-full px-1.5 py-0 border border-slate-300 rounded text-[10px] bg-white h-[20px]"
            />
          </span>
        </div>

        <div className="flex items-center sm:col-span-2">
          <span className="font-bold text-[#0f2c59] w-[80px] shrink-0 text-left">Remarks:</span>
          <span className="text-slate-800 grow text-left">
            <input
              type="text"
              value={pda.remarks || ''}
              placeholder="Additional operational remarks or notes..."
              onChange={e => onUpdatePda({ ...pda, remarks: e.target.value })}
              className="w-full px-1.5 py-0 border border-slate-300 rounded text-[10px] bg-white h-[20px]"
            />
          </span>
        </div>
      </div>

      {/* VESSEL TECHNICAL PARTICULARS: Clean compact grid, unified font and smaller rectangular inputs */}
      <div className="bg-[#f8fafc] border border-slate-300 rounded p-1.5 mb-2 grid grid-cols-3 gap-x-2.5 gap-y-1 text-[9.5px]">
        {/* ROW 1: LOA (m) :, Beam (m) :, S.Draft (m) : */}
        <div className="flex items-center gap-1.5">
          <label className="text-[8.5px] sm:text-[9px] font-bold text-[#0f2c59] uppercase whitespace-nowrap" title="Length Over All">
            LOA (m) :
          </label>
          <SmartNumericInput
            value={pda.vessel.loa || 0}
            decimals={2}
            align="left"
            onChange={val => handleVesselSpecChange('loa', val)}
            className="w-[52px] sm:w-[56px] h-[19px] px-1 border border-slate-300 rounded bg-white text-left font-mono font-bold text-[9.5px] text-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-[8.5px] sm:text-[9px] font-bold text-[#0f2c59] uppercase whitespace-nowrap" title="Beam">
            Beam (m) :
          </label>
          <SmartNumericInput
            value={pda.vessel.beam || 0}
            decimals={2}
            align="left"
            onChange={val => handleVesselSpecChange('beam', val)}
            className="w-[52px] sm:w-[56px] h-[19px] px-1 border border-slate-300 rounded bg-white text-left font-mono font-bold text-[9.5px] text-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-[8.5px] sm:text-[9px] font-bold text-[#0f2c59] uppercase whitespace-nowrap" title="Summer Draft (m) avec 3 chiffres après la virgule">
            S.Draft (m) :
          </label>
          <SmartNumericInput
            value={pda.vessel.draft || 0}
            decimals={3}
            align="left"
            onChange={val => handleVesselSpecChange('draft', val)}
            className="w-[52px] sm:w-[56px] h-[19px] px-1 border border-slate-300 rounded bg-white text-left font-mono font-bold text-[9.5px] text-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* ROW 2: Th. Draft (m) :, N° Days :, GRT : */}
        <div className="flex items-center gap-1.5" title="Theoretical Draft: 0,14 * sqrt(LOA * Beam)">
          <label className="text-[8.5px] sm:text-[9px] font-bold text-[#1d4ed8] uppercase whitespace-nowrap">
            Th. Draft (m) :
          </label>
          <input
            type="text"
            readOnly
            value={pda.vessel.theorDraft.toFixed(3).replace('.', ',')}
            title="0,14 * sqrt(LOA * Beam)"
            className="w-[52px] sm:w-[56px] h-[19px] px-1 border border-slate-300 rounded bg-slate-100 text-left font-mono font-bold text-[9.5px] text-blue-900 outline-none cursor-default"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-[8.5px] sm:text-[9px] font-bold text-[#0f2c59] uppercase whitespace-nowrap">
            N° Days :
          </label>
          <SmartNumericInput
            value={pda.portDues.nStay || 0}
            decimals={0}
            align="left"
            onChange={val => handlePortDuesChange('nStay', val)}
            className="w-[52px] sm:w-[56px] h-[19px] px-1 border border-slate-300 rounded bg-white text-left font-mono font-bold text-[9.5px] text-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-[8.5px] sm:text-[9px] font-bold text-[#0f2c59] uppercase whitespace-nowrap">
            GRT :
          </label>
          <SmartNumericInput
            value={pda.vessel.grt || 0}
            decimals={0}
            align="left"
            onChange={val => handleVesselSpecChange('grt', val)}
            className="w-[52px] sm:w-[56px] h-[19px] px-1 border border-slate-300 rounded bg-white text-left font-mono font-bold text-[9.5px] text-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* ROW 3: NRT :, IMO N° :, Call Sign : */}
        <div className="flex items-center gap-1.5">
          <label className="text-[8.5px] sm:text-[9px] font-bold text-[#0f2c59] uppercase whitespace-nowrap">
            NRT :
          </label>
          <SmartNumericInput
            value={pda.vessel.nrt || 0}
            decimals={0}
            align="left"
            onChange={val => handleVesselSpecChange('nrt', val)}
            className="w-[52px] sm:w-[56px] h-[19px] px-1 border border-slate-300 rounded bg-white text-left font-mono font-bold text-[9.5px] text-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-[8.5px] sm:text-[9px] font-bold text-[#0f2c59] uppercase whitespace-nowrap">
            IMO N° :
          </label>
          <input
            type="text"
            value={pda.vessel.imo}
            onFocus={e => {
              if (e.currentTarget.value === '0' || e.currentTarget.value === '1') {
                handleVesselSpecChange('imo', '');
              } else {
                e.currentTarget.select();
              }
            }}
            onChange={e => handleVesselSpecChange('imo', e.target.value)}
            className="w-[52px] sm:w-[56px] h-[19px] px-1 border border-slate-300 rounded bg-white text-left font-mono font-bold text-[9.5px] text-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-[8.5px] sm:text-[9px] font-bold text-[#0f2c59] uppercase whitespace-nowrap">
            C.SIGN :
          </label>
          <input
            type="text"
            value={pda.vessel.callSign}
            onFocus={e => {
              if (e.currentTarget.value === '0' || e.currentTarget.value === '1') {
                handleVesselSpecChange('callSign', '');
              } else {
                e.currentTarget.select();
              }
            }}
            onChange={e => handleVesselSpecChange('callSign', e.target.value)}
            className="w-[52px] sm:w-[56px] h-[19px] px-1 border border-slate-300 rounded bg-white text-left font-mono font-bold text-[9.5px] text-slate-900 outline-none focus:ring-1 focus:ring-blue-500 uppercase"
          />
        </div>

        {/* BOTTOM METRICS ROW: Volume (V) on left & Currency Converter in place of base de calcul text */}
        <div className="col-span-3 text-[10px] font-mono border-t border-dashed border-[#cbd5e1] pt-1 mt-0.5 flex items-center justify-between px-1 flex-wrap gap-2">
          <div className="font-mono flex items-center gap-1">
            <span className="font-sans font-bold text-[9px] text-[#0f2c59] uppercase">Volume (V): </span>
            <span className="font-bold text-[10px] text-blue-950">{formatInt(pda.vessel.volume)}</span> m³
          </div>

          {/* Currency Converter (EUR, USD, TND, AED, GBP) avec total affiché selon demande */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-sans font-extrabold text-[8.5px] sm:text-[9px] text-[#0f2c59] uppercase">Currency:</span>
            <select
              value={pda.targetCurrency}
              onChange={e => {
                const newCurr = e.target.value as TargetCurrency;
                const defaultRates: Record<TargetCurrency, number> = {
                  EUR: 1.0000,
                  USD: 1.0800,
                  TND: 3.3500,
                  AED: 3.9600,
                  GBP: 0.8500
                };
                handleCurrencyChange(newCurr, defaultRates[newCurr] ?? pda.exchangeRate);
              }}
              className="px-1 border border-slate-300 rounded text-[9.5px] font-mono font-bold h-[19px] bg-white cursor-pointer text-[#0f2c59]"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="TND">TND</option>
              <option value="AED">AED</option>
              <option value="GBP">GBP</option>
            </select>

            <span className="font-sans text-[8.5px] text-slate-500 font-semibold">1 EUR =</span>
            <input
              type="number"
              step="0.0001"
              value={pda.exchangeRate}
              onChange={e => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val > 0) {
                  handleCurrencyChange(pda.targetCurrency, val);
                }
              }}
              className="w-[58px] sm:w-[64px] h-[19px] px-1 border border-slate-300 rounded text-right font-mono font-bold text-[9px] bg-white text-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="font-mono text-[9px] font-bold text-[#1d4ed8]">
              {pda.targetCurrency}
            </span>
          </div>
        </div>
      </div>

      {/* TABLE 1: PORT DUES (EURO) */}
      <div className="bg-[#0f2c59] text-white font-bold px-2 py-1 mt-2 text-[11px] uppercase tracking-wide rounded-t flex justify-between items-center">
        <span>Port Dues (Euro)</span>
      </div>
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full border-collapse border border-slate-300 text-[10px] mb-2 bg-white table-fixed">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[22%]" />
            <col className="w-[18%]" />
            <col className="w-[10%]" />
            <col className="w-[24%]" />
          </colgroup>
          <thead>
            <tr className="bg-slate-100 text-[#0f2c59] font-bold text-[9.5px]">
              <th className="border border-slate-300 p-1 text-left">Item</th>
              <th className="border border-slate-300 p-1 text-left">Details</th>
              <th className="border border-slate-300 p-1 px-2 text-right whitespace-nowrap">U. Cost</th>
              <th className="border border-slate-300 p-1 text-center whitespace-nowrap">N°</th>
              <th className="border border-slate-300 p-1 px-2 text-right whitespace-nowrap">Total Costs</th>
            </tr>
          </thead>
          <tbody>
            {/* Shelter */}
            <tr>
              <td className="border border-slate-300 p-1 font-bold text-left truncate">Shelter:</td>
              <td className="border border-slate-300 p-1 text-left text-slate-600 truncate">(Per Call)</td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums whitespace-nowrap">{formatNum(pda.portDues.shelterUnitEUR)}</td>
              <td className="border border-slate-300 p-1 text-center">
                <SmartNumericInput
                  value={pda.portDues.nShelter}
                  decimals={0}
                  align="center"
                  onChange={val => handlePortDuesChange('nShelter', val)}
                  className="w-[34px] mx-auto text-center font-bold bg-white border border-slate-300 rounded p-0.5 text-[10px] h-[19px] outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">{formatNum(pda.portDues.totShelter)}</td>
            </tr>

            {/* Stay Dues */}
            <tr>
              <td className="border border-slate-300 p-1 font-bold text-left truncate">Stay Dues:</td>
              <td className="border border-slate-300 p-1 text-left text-slate-600 truncate">(Per Day)</td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums whitespace-nowrap">{formatNum(pda.portDues.stayUnitEUR)}</td>
              <td className="border border-slate-300 p-1 text-center">
                <SmartNumericInput
                  value={pda.portDues.nStay}
                  decimals={0}
                  align="center"
                  onChange={val => handlePortDuesChange('nStay', val)}
                  className="w-[34px] mx-auto text-center font-bold bg-white border border-slate-300 rounded p-0.5 text-[10px] h-[19px] outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">{formatNum(pda.portDues.totStay)}</td>
            </tr>

            {/* Pilotage */}
            <tr>
              <td className="border border-slate-300 p-1 font-bold text-left truncate">Pilotage:</td>
              <td className="border border-slate-300 p-1 text-left text-slate-600 truncate">(Per hour)</td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums whitespace-nowrap">{formatNum(pda.portDues.pilotUnitEUR)}</td>
              <td className="border border-slate-300 p-1 text-center">
                <SmartNumericInput
                  value={pda.portDues.nPilot}
                  decimals={0}
                  align="center"
                  onChange={val => handlePortDuesChange('nPilot', val)}
                  className="w-[34px] mx-auto text-center font-bold bg-white border border-slate-300 rounded p-0.5 text-[10px] h-[19px] outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">{formatNum(pda.portDues.totPilot)}</td>
            </tr>

            {/* Tug Boat */}
            <tr>
              <td className="border border-slate-300 p-1 font-bold text-left truncate">Tug Boat:</td>
              <td className="border border-slate-300 p-1 text-left text-slate-600 truncate">(Per hour)</td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums whitespace-nowrap">{formatNum(pda.portDues.tugUnitEUR)}</td>
              <td className="border border-slate-300 p-1 text-center">
                <SmartNumericInput
                  value={pda.portDues.nTug}
                  decimals={0}
                  align="center"
                  onChange={val => handlePortDuesChange('nTug', val)}
                  className="w-[34px] mx-auto text-center font-bold bg-white border border-slate-300 rounded p-0.5 text-[10px] h-[19px] outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">{formatNum(pda.portDues.totTug)}</td>
            </tr>

            {/* ISPS APRÈS REMORQUAGE - Ligne 1: ISPS (Shelter) 5% - Exonéré de TVA */}
            {(() => {
              const ispsShelterUnit = pda.portDues.ispsShelterUnitEUR ?? (pda.portDues.tShelter * 0.05);
              const ispsShelterT = pda.portDues.tIspsShelter ?? ispsShelterUnit;
              const ispsShelterTot = pda.portDues.totIspsShelter ?? ispsShelterT;
              return (
                <tr className="bg-amber-50/30">
                  <td className="border border-slate-300 p-1 font-bold text-left text-[#b45309] truncate">ISPS (Shelter):</td>
                  <td className="border border-slate-300 p-1 text-left text-slate-600 truncate font-medium">5%</td>
                  <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums whitespace-nowrap">{formatNum(ispsShelterUnit)}</td>
                  <td className="border border-slate-300 p-1 text-center font-mono font-bold text-slate-700">1</td>
                  <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">{formatNum(ispsShelterTot)}</td>
                </tr>
              );
            })()}

            {/* ISPS APRÈS REMORQUAGE - Ligne 2: ISPS (Stay Dues) 5% - Exonéré de TVA */}
            {(() => {
              const ispsStayUnit = pda.portDues.ispsStayUnitEUR ?? (pda.portDues.tStay * 0.05);
              const ispsStayT = pda.portDues.tIspsStay ?? ispsStayUnit;
              const ispsStayTot = pda.portDues.totIspsStay ?? ispsStayT;
              return (
                <tr className="bg-amber-50/30">
                  <td className="border border-slate-300 p-1 font-bold text-left text-[#b45309] truncate">ISPS (Stay Dues):</td>
                  <td className="border border-slate-300 p-1 text-left text-slate-600 truncate font-medium">5%</td>
                  <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums whitespace-nowrap">{formatNum(ispsStayUnit)}</td>
                  <td className="border border-slate-300 p-1 text-center font-mono font-bold text-slate-700">1</td>
                  <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">{formatNum(ispsStayTot)}</td>
                </tr>
              );
            })()}

            {/* Subtotal Port Dues */}
            <tr className="bg-slate-50 font-bold">
              <td colSpan={4} className="border border-slate-300 p-1 px-2 text-right uppercase tracking-wider text-[10px] text-[#0f2c59]">
                PORT DUES SUB TOTAL (Euro)
              </td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums text-xs text-[#0f2c59] font-black whitespace-nowrap">
                {formatNum(pda.portDues.subtotalPortDuesEUR)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TABLE 2: PORT EXPENSES (EURO) */}
      <div className="bg-[#0f2c59] text-white font-bold px-2 py-1 mt-2 text-[11px] uppercase tracking-wide rounded-t flex justify-between items-center">
        <span>Port Expenses (Euro)</span>
      </div>
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full border-collapse border border-slate-300 text-[10px] mb-2 bg-white table-fixed">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[22%]" />
            <col className="w-[18%]" />
            <col className="w-[10%]" />
            <col className="w-[24%]" />
          </colgroup>
          <thead>
            <tr className="bg-slate-100 text-[#0f2c59] font-bold text-[9.5px]">
              <th className="border border-slate-300 p-1 text-left">Item</th>
              <th className="border border-slate-300 p-1 text-left">Details</th>
              <th className="border border-slate-300 p-1 px-2 text-right whitespace-nowrap">U. Costs</th>
              <th className="border border-slate-300 p-1 text-center whitespace-nowrap">Nbr</th>
              <th className="border border-slate-300 p-1 px-2 text-right whitespace-nowrap">Total Costs</th>
            </tr>
          </thead>
          <tbody>
            {/* Mooring / Lamanage selon JORT N°90 du 04/09/2020 */}
            {(() => {
              const uMooringVal = pda.portExpenses.uMooringEUR ?? pda.portDues.combinedMooringTotalEUR ?? 249.90;
              const nMooringVal = pda.portExpenses.nMooring ?? 2;
              const totMooringVal = pda.portExpenses.totMooring ?? (uMooringVal * nMooringVal);
              return (
                <tr className="hover:bg-blue-50/20 transition-colors">
                  <td className="border border-slate-300 p-1 text-left font-semibold truncate">Mooring & Unmooring:</td>
                  <td className="border border-slate-300 p-1 text-left text-slate-600 truncate">( In&Out )</td>
                  <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums whitespace-nowrap">
                    <SmartNumericInput
                      value={uMooringVal}
                      decimals={2}
                      align="right"
                      onChange={val => handlePortExpensesChange('uMooringEUR', val)}
                      className="w-full max-w-[70px] text-right font-mono tabular-nums bg-white border border-slate-300 rounded px-1 py-0.5 text-[10px] font-bold h-[19px] print:hidden outline-none focus:ring-1 focus:ring-blue-500"
                      title="Tarif Mooring unitaire TTC par opération selon JORT N°90 (rectifiable)"
                    />
                    <span className="hidden print:inline font-mono tabular-nums">{formatNum(uMooringVal)}</span>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <SmartNumericInput
                      value={nMooringVal}
                      decimals={0}
                      align="center"
                      onChange={val => handlePortExpensesChange('nMooring', val)}
                      className="w-[34px] mx-auto text-center font-bold bg-white border border-slate-300 rounded p-0.5 text-[10px] h-[19px] outline-none focus:ring-1 focus:ring-blue-500"
                      title="Case Nbr d'opérations à remplir (2 = In + Out)"
                    />
                  </td>
                  <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                    {formatNum(totMooringVal)}
                  </td>
                </tr>
              );
            })()}

            {/* Watchmen */}
            <tr>
              <td className="border border-slate-300 p-1 text-left font-semibold truncate">Watchmen:</td>
              <td className="border border-slate-300 p-1 text-left text-slate-600 truncate">(Per Day)</td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums whitespace-nowrap">
                <SmartNumericInput
                  value={pda.portExpenses.uWatchEUR}
                  decimals={2}
                  align="right"
                  onChange={val => handlePortExpensesChange('uWatchEUR', val)}
                  className="w-full max-w-[70px] text-right font-mono tabular-nums bg-white border border-slate-300 rounded px-1 py-0.5 text-[10px] font-bold h-[19px] print:hidden outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="hidden print:inline font-mono tabular-nums">{formatNum(pda.portExpenses.uWatchEUR)}</span>
              </td>
              <td className="border border-slate-300 p-1 text-center">
                <SmartNumericInput
                  value={pda.portExpenses.nWatch}
                  decimals={0}
                  align="center"
                  onChange={val => handlePortExpensesChange('nWatch', val)}
                  className="w-[34px] mx-auto text-center font-bold bg-white border border-slate-300 rounded p-0.5 text-[10px] h-[19px] outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">{formatNum(pda.portExpenses.totWatch)}</td>
            </tr>

            {/* Garbage */}
            <tr>
              <td className="border border-slate-300 p-1 text-left font-semibold truncate">Garbage Removal:</td>
              <td className="border border-slate-300 p-1 text-left text-slate-600 truncate">(Per Voyage)</td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums whitespace-nowrap">
                <SmartNumericInput
                  value={pda.portExpenses.uGarbEUR}
                  decimals={2}
                  align="right"
                  onChange={val => handlePortExpensesChange('uGarbEUR', val)}
                  className="w-full max-w-[70px] text-right font-mono tabular-nums bg-white border border-slate-300 rounded px-1 py-0.5 text-[10px] font-bold h-[19px] print:hidden outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="hidden print:inline font-mono tabular-nums">{formatNum(pda.portExpenses.uGarbEUR)}</span>
              </td>
              <td className="border border-slate-300 p-1 text-center">
                <SmartNumericInput
                  value={pda.portExpenses.nGarb}
                  decimals={0}
                  align="center"
                  onChange={val => handlePortExpensesChange('nGarb', val)}
                  className="w-[34px] mx-auto text-center font-bold bg-white border border-slate-300 rounded p-0.5 text-[10px] h-[19px] outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">{formatNum(pda.portExpenses.totGarb)}</td>
            </tr>

            {/* Dynamic Services Rows */}
            {pda.portExpenses.additionalServices.map(svc => (
              <tr key={svc.id} className="bg-blue-50/30">
                <td className="border border-slate-300 p-1 text-left font-semibold text-blue-900 truncate">
                  {svc.name}:
                </td>
                <td className="border border-slate-300 p-1 text-left text-slate-500 italic truncate">
                  ({svc.category} Service)
                </td>
                <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums whitespace-nowrap">
                  <SmartNumericInput
                    value={svc.unitPriceEUR}
                    decimals={2}
                    align="right"
                    onChange={val => handleUpdateDynamicServiceRow(svc.id, { unitPriceEUR: val })}
                    className="w-full max-w-[70px] text-right font-mono tabular-nums bg-white border border-slate-300 rounded px-1 py-0.5 text-[10px] font-bold h-[19px] print:hidden outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="hidden print:inline font-mono tabular-nums">{formatNum(svc.unitPriceEUR)}</span>
                </td>
                <td className="border border-slate-300 p-1 text-center">
                  <SmartNumericInput
                    value={svc.quantity}
                    decimals={0}
                    align="center"
                    onChange={val => handleUpdateDynamicServiceRow(svc.id, { quantity: val })}
                    className="w-[34px] mx-auto text-center font-bold bg-white border border-slate-300 rounded p-0.5 text-[10px] h-[19px] outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                  <span>{formatNum(svc.quantity * svc.unitPriceEUR)}</span>
                  <button
                    onClick={() => handleRemoveDynamicService(svc.id)}
                    className="text-red-500 hover:text-red-700 font-bold ml-1.5 print:hidden cursor-pointer"
                    title="Remove"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}

            {/* TOTALS SECTION: Bank Details on the Left (Col 1-2) side-by-side with Totals on the Right (Col 3-5) */}
            {/* Row 1: Subtotal Port Expenses */}
            <tr className="bg-slate-50 font-bold">
              <td colSpan={2} rowSpan={5} className="border border-slate-300 p-2 bg-gradient-to-br from-slate-50 to-blue-50/20 align-top text-left">
                <div className="h-full flex flex-col justify-between text-[8.5px] leading-relaxed">
                  <div className="border-b border-slate-200 pb-0.5 mb-1 flex items-center justify-between">
                    <strong className="text-[#0f2c59] text-[9px] uppercase tracking-wide font-extrabold flex items-center gap-1">
                      🏛️ Bank Details
                    </strong>
                    <span className="text-[7.5px] text-blue-900 bg-blue-100 px-1 py-0.2 rounded font-mono font-bold">SOCOTU Account</span>
                  </div>
                  <div className="text-slate-700 space-y-0.5 text-[8.5px]">
                    <div><span className="text-slate-500 font-semibold">COMPANY:</span> <strong className="text-slate-900">{pda.bankDetails.companyName}</strong></div>
                    <div><span className="text-slate-500 font-semibold">BANK:</span> <strong>{pda.bankDetails.bankName}</strong></div>
                    <div><span className="text-slate-500 font-semibold">BRANCH:</span> {pda.bankDetails.branch}</div>
                    <div><span className="text-slate-500 font-semibold">SWIFT:</span> <span className="font-mono font-bold text-[#0f2c59]">{pda.bankDetails.swift}</span> | <span className="text-slate-500 font-semibold">ACC N°:</span> <span className="font-mono font-semibold">{pda.bankDetails.accNum}</span></div>
                    <div><span className="text-slate-500 font-semibold">IBAN:</span> <span className="font-mono font-bold text-[#0f2c59]">{pda.bankDetails.iban}</span></div>
                  </div>
                </div>
              </td>
              <td colSpan={2} className="border border-slate-300 p-1 px-2 text-right uppercase tracking-wider text-[9.5px] text-[#0f2c59]">
                Port Expenses Sub Total: (Euro)
              </td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums text-xs text-[#0f2c59] font-black whitespace-nowrap">
                {formatNum(pda.portExpenses.subtotalPortExpensesEUR)}
              </td>
            </tr>

            {/* Row 2: Agency Fees */}
            <tr className="bg-slate-50/90 font-bold hover:bg-slate-100/60 transition-colors">
              <td colSpan={2} className="border border-slate-300 p-1 px-2 text-right uppercase tracking-wider text-[9.5px] text-[#0f2c59]">
                Agency Fees: (Euro)
              </td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums">
                <div className="flex items-center justify-end">
                  <SmartNumericInput
                    value={pda.portExpenses.agencyFeesEUR}
                    decimals={3}
                    align="right"
                    onChange={val => handlePortExpensesChange('agencyFeesEUR', val)}
                    className="w-full max-w-[90px] font-bold text-right font-mono tabular-nums h-[20px] bg-white border border-slate-300 rounded px-1.5 text-[10px] text-slate-900 print:hidden focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    title="Agency Fees in Euro (3 décimales, éditable)"
                  />
                  <span className="hidden print:inline font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                    {formatNum(pda.portExpenses.agencyFeesEUR)}
                  </span>
                </div>
              </td>
            </tr>

            {/* Row 3: Currency Control Charges */}
            <tr className="bg-[#fff7ed] text-[9.5px]">
              <td className="border border-slate-300 p-1 px-2 text-right font-bold text-[#9a3412]">
                Currency Control:
              </td>
              <td className="border border-slate-300 p-0.5 text-center">
                <select
                  value={pda.portExpenses.currencyControlRate}
                  onChange={e => handlePortExpensesChange('currencyControlRate', parseFloat(e.target.value) || 0)}
                  className="border border-slate-300 rounded text-[9px] w-[50px] p-0.5 bg-white text-center font-bold text-[#9a3412] cursor-pointer"
                >
                  <option value="0">0%</option>
                  <option value="1">1%</option>
                  <option value="2">2%</option>
                  <option value="3">3%</option>
                </select>
              </td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums font-bold text-[#9a3412] whitespace-nowrap">
                {formatNum(pda.portExpenses.currencyControlChargeEUR)}
              </td>
            </tr>

            {/* Row 4: Grand Total EURO */}
            <tr className="bg-[#eff6ff] text-[10.5px] font-bold text-[#0f2c59]">
              <td colSpan={2} className="border border-slate-300 p-1 px-2 text-right uppercase tracking-wide font-extrabold">
                TOTAL: (Euro)
              </td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums text-xs font-black text-[#0f2c59] whitespace-nowrap">
                {formatNum(pda.portExpenses.grandTotalEUR)}
              </td>
            </tr>

            {/* Row 5: Grand Total TARGET CURRENCY */}
            <tr className="bg-[#dbeafe] text-[10.5px] font-bold text-[#0f2c59] border-t-2 border-[#1d4ed8]">
              <td colSpan={2} className="border border-slate-300 p-1 px-2 text-right uppercase tracking-wide font-black">
                TOTAL: ({pda.targetCurrency})
              </td>
              <td className="border border-slate-300 p-1 px-2 text-right font-mono tabular-nums text-sm font-black text-[#1d4ed8] whitespace-nowrap">
                {formatNum(pda.portExpenses.grandTotalTargetCurr)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PORT RESTRICTIONS & REGULATIONS - Compact Full-Width Footer Box */}
      <div className="bg-slate-50 border border-slate-300 rounded p-1.5 mt-1 text-[8.5px] leading-tight">
        <div className="border-b border-slate-200 pb-0.5 mb-0.5">
          <strong className="text-[#0f2c59] uppercase tracking-wide font-extrabold text-[9px] flex items-center gap-1">
            <span>Restrictions / Port Regulations ({pda.port})</span>
          </strong>
        </div>
        <div className="text-slate-700 whitespace-pre-line">
          {pda.restrictions}
        </div>
      </div>

      {/* PAGE FOOTER */}
      <div className="flex justify-between items-center text-[8.5px] text-slate-500 mt-1 border-t border-slate-200 pt-0.5">
        <span>SOCIETE COMMERCIALE TUNISIENNE - Proforma Disbursement Account</span>
        <span>SOCOTU Maritime Agency</span>
      </div>

      {/* SERVICES SELECTOR (Provisions & Services to include in PDA) - Hidden on print */}
      <section className="mt-4 border border-slate-300 rounded-lg p-3 bg-slate-50 print:hidden text-xs">
        <h3 className="text-xs font-bold text-[#0f2c59] uppercase tracking-wider mb-2">
          Additional Provisions & Services to Include in PDA
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Vessel services */}
          <div className="bg-white p-2.5 rounded border border-slate-200">
            <label className="block font-bold text-[#0f2c59] text-[10.5px] mb-1">
              🚢 Add Vessel / Ship Service:
            </label>
            <div className="flex gap-1.5">
              <select
                value={selectedShipService}
                onChange={e => setSelectedShipService(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 text-[10.5px] bg-white"
              >
                <option value="">— Select a vessel service —</option>
                {SERVICE_OPTIONS.Vessel.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (selectedShipService) {
                    handleAddDynamicService('Vessel', selectedShipService);
                    setSelectedShipService('');
                  }
                }}
                className="bg-[#0f2c59] text-white px-3 py-1 rounded text-xs font-bold cursor-pointer hover:bg-blue-900 shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Crew services */}
          <div className="bg-white p-2.5 rounded border border-slate-200">
            <label className="block font-bold text-[#0f2c59] text-[10.5px] mb-1">
              👥 Add Crew Service:
            </label>
            <div className="flex gap-1.5">
              <select
                value={selectedCrewService}
                onChange={e => setSelectedCrewService(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 text-[10.5px] bg-white"
              >
                <option value="">— Select a crew service —</option>
                {SERVICE_OPTIONS.Crew.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (selectedCrewService) {
                    handleAddDynamicService('Crew', selectedCrewService);
                    setSelectedCrewService('');
                  }
                }}
                className="bg-[#0f2c59] text-white px-3 py-1 rounded text-xs font-bold cursor-pointer hover:bg-blue-900 shrink-0"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
