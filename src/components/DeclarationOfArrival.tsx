import React, { useState } from 'react';
import { SocotuOfficialHeader } from './SocotuOfficialHeader';
import { ArrivalDeclarationModel, CargoOperation, OfficialPdaModel, PortId } from '../types/pda';

interface DeclarationOfArrivalProps {
  pda: OfficialPdaModel;
  declaration: ArrivalDeclarationModel;
  onUpdateDeclaration: (decl: ArrivalDeclarationModel) => void;
  onBackToPda: () => void;
  onGoToSof?: () => void;
  onGoToBerthing?: () => void;
  onGoToBol?: () => void;
}

function formatDateTimeDisplay(val?: string): string {
  if (!val) return '—';
  const m = val.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (m) {
    const [, y, mo, d, h, mi] = m;
    return `${d}/${mo}/${y} ${h}:${mi}`;
  }
  return val;
}

function getNowIsoDateTime(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const DeclarationOfArrival: React.FC<DeclarationOfArrivalProps> = ({
  pda,
  declaration,
  onUpdateDeclaration,
  onBackToPda,
  onGoToSof,
  onGoToBerthing,
  onGoToBol
}) => {
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleChange = <K extends keyof ArrivalDeclarationModel>(
    field: K,
    value: ArrivalDeclarationModel[K]
  ) => {
    onUpdateDeclaration({
      ...declaration,
      [field]: value
    });
  };

  return (
    <div className="max-w-[950px] mx-auto animate-fade-in space-y-2">
      {/* Toast notification if any */}
      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold px-3 py-1 rounded-md print:hidden flex items-center justify-between shadow-xs">
          <span>{statusMsg}</span>
          <span className="text-[10px] text-emerald-600 font-mono">Master Declaration</span>
        </div>
      )}

      {/* Screen action bar */}
      <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-300 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#0f2c59] uppercase tracking-wide">
            ⚓ Déclaration d'Arrivée (Format A4 Épuré)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onBackToPda}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded cursor-pointer"
          >
            ← Back to PDA
          </button>
          {onGoToSof && (
            <button
              type="button"
              onClick={onGoToSof}
              className="text-xs font-bold text-white bg-[#0f2c59] hover:bg-blue-900 px-3 py-1 rounded cursor-pointer shadow-xs"
            >
              Statement of Facts (SOF) →
            </button>
          )}
          {onGoToBol && (
            <button
              type="button"
              onClick={onGoToBol}
              className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 px-3 py-1 rounded cursor-pointer shadow-xs"
            >
              Bill of Lading →
            </button>
          )}
        </div>
      </div>

      {/* 
        OFFICIAL MASTER DECLARATION DOCUMENT
        Sans en-têtes de sections (1, 2, 3), sans explications superflues, sans ATA/AllFast redondants
        Optimisé pour tenir STRICTEMENT sur une seule page A4
      */}
      <div
        id="arrival-declaration-print-area"
        className="bg-white p-3 sm:p-4 rounded-md shadow-md text-[#111] font-sans text-[9px] border border-slate-300 print:shadow-none print:border-none print:p-2 print:m-0 print:text-[8.5px] print:max-h-[275mm] print:overflow-hidden leading-tight"
      >
        {/* Corporate Header */}
        <SocotuOfficialHeader port={declaration.portOfCall || pda.port || 'Sousse'} />

        {/* Document Title Header (sans sous-titre d'explication) */}
        <div className="text-center my-1.5">
          <h1 className="text-sm sm:text-base font-black text-[#0f2c59] uppercase tracking-wider m-0">
            MASTER'S DECLARATION OF ARRIVAL
          </h1>
        </div>

        {/* TABLEAU PARTICULARS (sans bandeau SECTION 1) */}
        <div className="border border-[#333] mt-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 text-[9px]">
            <div className="p-1 border-r border-b border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">VESSEL NAME</label>
              <input
                type="text"
                value={declaration.vesselName || ''}
                onChange={e => handleChange('vesselName', e.target.value)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[10px] font-bold text-[#0f2c59] uppercase bg-white rounded-none"
              />
            </div>
            <div className="p-1 border-r border-b border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">IMO NUMBER</label>
              <input
                type="text"
                value={declaration.imoNumber || ''}
                onChange={e => handleChange('imoNumber', e.target.value)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[10px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1 border-r border-b border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">CALL SIGN</label>
              <input
                type="text"
                value={declaration.callSign || ''}
                onChange={e => handleChange('callSign', e.target.value)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[10px] font-mono font-bold bg-white rounded-none"
              />
            </div>
            <div className="p-1 border-b border-slate-300 sm:border-r-0">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">FLAG</label>
              <input
                type="text"
                value={declaration.flag || ''}
                onChange={e => handleChange('flag', e.target.value)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[10px] bg-white rounded-none font-semibold text-slate-800"
              />
            </div>

            <div className="p-1 border-r border-b border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">GRT</label>
              <input
                type="number"
                value={declaration.grt || ''}
                onChange={e => handleChange('grt', parseFloat(e.target.value) || 0)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[10px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1 border-r border-b border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">NRT</label>
              <input
                type="number"
                value={declaration.nrt || ''}
                onChange={e => handleChange('nrt', parseFloat(e.target.value) || 0)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[10px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1 border-r border-b border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">DWT</label>
              <input
                type="number"
                value={declaration.dwt || ''}
                onChange={e => handleChange('dwt', parseFloat(e.target.value) || 0)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[10px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1 border-b border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">PORT OF REGISTRY</label>
              <input
                type="text"
                value={declaration.portOfRegistry || ''}
                onChange={e => handleChange('portOfRegistry', e.target.value)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[10px] bg-white rounded-none"
              />
            </div>

            <div className="p-1 border-r border-b border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">LOA (m)</label>
              <input
                type="number"
                step="0.01"
                value={declaration.loa || ''}
                onChange={e => handleChange('loa', parseFloat(e.target.value) || 0)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[10px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1 border-r border-b border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">BEAM (m)</label>
              <input
                type="number"
                step="0.01"
                value={declaration.beam || ''}
                onChange={e => handleChange('beam', parseFloat(e.target.value) || 0)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[10px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1 border-r border-b border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">LAST PORT</label>
              <input
                type="text"
                value={declaration.lastPort || ''}
                onChange={e => handleChange('lastPort', e.target.value)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[9.5px] bg-white rounded-none"
              />
            </div>
            <div className="p-1 border-b border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">NEXT PORT</label>
              <input
                type="text"
                value={declaration.nextPort || ''}
                onChange={e => handleChange('nextPort', e.target.value)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[9.5px] bg-white rounded-none"
              />
            </div>

            {/* Row 4: Port of Call et Berth Assigned (ATA et All Fast Time annulés) */}
            <div className="p-1 border-r border-slate-300 col-span-2">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">PORT OF CALL</label>
              <select
                value={declaration.portOfCall}
                onChange={e => handleChange('portOfCall', e.target.value as PortId)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[9.5px] font-bold text-[#0f2c59] bg-white rounded-none cursor-pointer"
              >
                <option value="Sousse">Port of Sousse</option>
                <option value="Sfax">Port of Sfax</option>
                <option value="Rades">Port of Radès</option>
                <option value="Bizerte">Port of Bizerte</option>
                <option value="Gabes">Port of Gabès</option>
              </select>
            </div>
            <div className="p-1 col-span-2">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">BERTH ASSIGNED</label>
              <input
                type="text"
                placeholder="e.g. Berth No. 2"
                value={declaration.berthAssigned || ''}
                onChange={e => handleChange('berthAssigned', e.target.value)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[9.5px] bg-white rounded-none"
              />
            </div>
          </div>
        </div>

        {/* NAUTICAL TIMELINE (sans bandeau d'en-tête de section ni explications superflues) */}
        <div className="border border-[#333] mt-1 bg-white">
          <div className="p-1 bg-slate-50/50">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1">
              {/* 1. EOSP */}
              <div className="border border-slate-300 bg-white p-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[8px] font-extrabold text-[#0f2c59] uppercase">1. EOSP</span>
                  <button
                    type="button"
                    onClick={() => handleChange('eosp', getNowIsoDateTime())}
                    className="print:hidden text-[7.5px] bg-blue-50 text-blue-700 font-bold px-1 rounded border border-blue-200"
                  >
                    Now
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={declaration.eosp || ''}
                  onChange={e => handleChange('eosp', e.target.value)}
                  className="w-full border border-slate-300 px-0.5 py-0 text-[8.5px] font-mono font-bold bg-white text-slate-900 rounded-none print:hidden h-[20px]"
                />
                <div className="hidden print:block text-[8.5px] font-mono font-bold text-slate-900 border border-slate-300 py-0.5 text-center bg-slate-50">
                  {formatDateTimeDisplay(declaration.eosp)}
                </div>
              </div>

              {/* 2. DROPPED ANCHOR */}
              <div className="border border-slate-300 bg-white p-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[8px] font-extrabold text-[#0f2c59] uppercase">2. DROPPED ANCHOR</span>
                  <button
                    type="button"
                    onClick={() => handleChange('droppedAnchor', getNowIsoDateTime())}
                    className="print:hidden text-[7.5px] bg-blue-50 text-blue-700 font-bold px-1 rounded border border-blue-200"
                  >
                    Now
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={declaration.droppedAnchor || ''}
                  onChange={e => handleChange('droppedAnchor', e.target.value)}
                  className="w-full border border-slate-300 px-0.5 py-0 text-[8.5px] font-mono font-bold bg-white text-slate-900 rounded-none print:hidden h-[20px]"
                />
                <div className="hidden print:block text-[8.5px] font-mono font-bold text-slate-900 border border-slate-300 py-0.5 text-center bg-slate-50">
                  {formatDateTimeDisplay(declaration.droppedAnchor)}
                </div>
              </div>

              {/* 3. HEAVE UP ANCHOR */}
              <div className="border border-slate-300 bg-white p-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[8px] font-extrabold text-[#0f2c59] uppercase">3. HEAVE UP ANCHOR</span>
                  <button
                    type="button"
                    onClick={() => handleChange('heaveUpAnchor', getNowIsoDateTime())}
                    className="print:hidden text-[7.5px] bg-blue-50 text-blue-700 font-bold px-1 rounded border border-blue-200"
                  >
                    Now
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={declaration.heaveUpAnchor || ''}
                  onChange={e => handleChange('heaveUpAnchor', e.target.value)}
                  className="w-full border border-slate-300 px-0.5 py-0 text-[8.5px] font-mono font-bold bg-white text-slate-900 rounded-none print:hidden h-[20px]"
                />
                <div className="hidden print:block text-[8.5px] font-mono font-bold text-slate-900 border border-slate-300 py-0.5 text-center bg-slate-50">
                  {formatDateTimeDisplay(declaration.heaveUpAnchor)}
                </div>
              </div>

              {/* 4. PILOT ON BOARD */}
              <div className="border border-slate-300 bg-white p-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[8px] font-extrabold text-[#0f2c59] uppercase">4. PILOT ON BOARD</span>
                  <button
                    type="button"
                    onClick={() => {
                      const now = getNowIsoDateTime();
                      handleChange('pilotOnBoard', now);
                      handleChange('pilotBoardingTime', now);
                    }}
                    className="print:hidden text-[7.5px] bg-blue-50 text-blue-700 font-bold px-1 rounded border border-blue-200"
                  >
                    Now
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={declaration.pilotOnBoard || declaration.pilotBoardingTime || ''}
                  onChange={e => {
                    handleChange('pilotOnBoard', e.target.value);
                    handleChange('pilotBoardingTime', e.target.value);
                  }}
                  className="w-full border border-slate-300 px-0.5 py-0 text-[8.5px] font-mono font-bold bg-white text-slate-900 rounded-none print:hidden h-[20px]"
                />
                <div className="hidden print:block text-[8.5px] font-mono font-bold text-slate-900 border border-slate-300 py-0.5 text-center bg-slate-50">
                  {formatDateTimeDisplay(declaration.pilotOnBoard || declaration.pilotBoardingTime)}
                </div>
              </div>

              {/* 5. FIRST LINE ASHORE */}
              <div className="border border-slate-300 bg-white p-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[8px] font-extrabold text-[#0f2c59] uppercase">5. FIRST LINE ASHORE</span>
                  <button
                    type="button"
                    onClick={() => {
                      const now = getNowIsoDateTime();
                      handleChange('firstLineAshore', now);
                      handleChange('firstline', now);
                    }}
                    className="print:hidden text-[7.5px] bg-blue-50 text-blue-700 font-bold px-1 rounded border border-blue-200"
                  >
                    Now
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={declaration.firstLineAshore || declaration.firstline || ''}
                  onChange={e => {
                    handleChange('firstLineAshore', e.target.value);
                    handleChange('firstline', e.target.value);
                  }}
                  className="w-full border border-slate-300 px-0.5 py-0 text-[8.5px] font-mono font-bold bg-white text-slate-900 rounded-none print:hidden h-[20px]"
                />
                <div className="hidden print:block text-[8.5px] font-mono font-bold text-slate-900 border border-slate-300 py-0.5 text-center bg-slate-50">
                  {formatDateTimeDisplay(declaration.firstLineAshore || declaration.firstline)}
                </div>
              </div>

              {/* 6. BERTHED ALL FAST — Date et Heure Modifiables */}
              <div className="border border-emerald-400 bg-emerald-50/40 p-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[8px] font-extrabold text-emerald-900 uppercase">6. BERTHED ALL FAST</span>
                  <button
                    type="button"
                    onClick={() => {
                      const now = getNowIsoDateTime();
                      handleChange('berthedAllFast', now);
                      handleChange('allFastTime', now);
                      handleChange('allfast', now);
                    }}
                    className="print:hidden text-[7.5px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-1 rounded border border-emerald-300 cursor-pointer"
                  >
                    Now
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={declaration.berthedAllFast || declaration.allFastTime || declaration.allfast || ''}
                  onChange={e => {
                    const v = e.target.value;
                    handleChange('berthedAllFast', v);
                    handleChange('allFastTime', v);
                    handleChange('allfast', v);
                  }}
                  className="w-full border border-emerald-500 px-0.5 py-0 text-[8.5px] font-mono font-bold bg-white text-slate-900 rounded-none print:hidden h-[20px]"
                  title="Change date & time"
                />
                <div className="hidden print:block text-[8.5px] font-mono font-bold text-emerald-950 border border-slate-300 py-0.5 text-center bg-emerald-50">
                  {formatDateTimeDisplay(declaration.berthedAllFast || declaration.allFastTime || declaration.allfast)}
                </div>
              </div>
            </div>

            {/* Note Rade */}
            <div className="mt-1 pt-1 border-t border-slate-200 flex items-center gap-1.5 text-[8px]">
              <span className="font-bold text-slate-700 shrink-0 uppercase">ROADS / ANCHORAGE:</span>
              <input
                type="text"
                placeholder="Anchorage area..."
                value={declaration.anchorageDetails || ''}
                onChange={e => handleChange('anchorageDetails', e.target.value)}
                className="w-full border border-slate-300 px-1 py-0.5 text-[8.5px] bg-white rounded-none h-[18px]"
              />
            </div>
          </div>
        </div>

        {/* TABLEAU ROB & DRAFTS ON ARRIVAL (sans bandeau SECTION 2, sans données de sortie) */}
        <div className="border border-[#333] mt-1">
          <table className="w-full border-collapse text-[9px]">
            <thead>
              <tr className="bg-[#f0f2f4] text-[#111]">
                <th className="border border-[#aaa] p-1 text-left w-[46%] font-bold uppercase">CONSUMABLE / ROB</th>
                <th className="border border-[#aaa] p-1 text-center w-[40%] font-bold uppercase">QUANTITY ON ARRIVAL</th>
                <th className="border border-[#aaa] p-1 text-center w-[14%] font-bold uppercase">UNIT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-[#aaa] px-1.5 py-0.5 font-bold text-slate-800">FUEL OIL (VLSFO)</td>
                <td className="border border-[#aaa] p-0.5">
                  <input
                    type="text"
                    placeholder="—"
                    value={declaration.fuelOilArr ?? declaration.vlsfoROB ?? ''}
                    onChange={e => {
                      handleChange('fuelOilArr', e.target.value);
                      handleChange('vlsfoROB', e.target.value);
                    }}
                    className="w-full h-[20px] text-center border border-[#aaa] p-0.5 text-[9.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                  />
                </td>
                <td className="border border-[#aaa] p-0.5 text-center font-bold text-slate-600">MT</td>
              </tr>

              <tr>
                <td className="border border-[#aaa] px-1.5 py-0.5 font-bold text-slate-800">DIESEL OIL (LSMGO)</td>
                <td className="border border-[#aaa] p-0.5">
                  <input
                    type="text"
                    placeholder="—"
                    value={declaration.dieselOilArr ?? declaration.lsmgoROB ?? ''}
                    onChange={e => {
                      handleChange('dieselOilArr', e.target.value);
                      handleChange('lsmgoROB', e.target.value);
                    }}
                    className="w-full h-[20px] text-center border border-[#aaa] p-0.5 text-[9.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                  />
                </td>
                <td className="border border-[#aaa] p-0.5 text-center font-bold text-slate-600">MT</td>
              </tr>

              <tr>
                <td className="border border-[#aaa] px-1.5 py-0.5 font-bold text-slate-800">GASOLINE</td>
                <td className="border border-[#aaa] p-0.5">
                  <input
                    type="text"
                    placeholder="—"
                    value={declaration.gasolineArr || ''}
                    onChange={e => handleChange('gasolineArr', e.target.value)}
                    className="w-full h-[20px] text-center border border-[#aaa] p-0.5 text-[9.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                  />
                </td>
                <td className="border border-[#aaa] p-0.5 text-center font-bold text-slate-600">MT</td>
              </tr>

              <tr>
                <td className="border border-[#aaa] px-1.5 py-0.5 font-bold text-slate-800">LUB OIL</td>
                <td className="border border-[#aaa] p-0.5">
                  <input
                    type="text"
                    placeholder="—"
                    value={declaration.lubOilArr || ''}
                    onChange={e => handleChange('lubOilArr', e.target.value)}
                    className="w-full h-[20px] text-center border border-[#aaa] p-0.5 text-[9.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                  />
                </td>
                <td className="border border-[#aaa] p-0.5 text-center font-bold text-slate-600">MT</td>
              </tr>

              <tr>
                <td className="border border-[#aaa] px-1.5 py-0.5 font-bold text-slate-800">FRESH WATER</td>
                <td className="border border-[#aaa] p-0.5">
                  <input
                    type="text"
                    placeholder="—"
                    value={declaration.freshWaterArr ?? declaration.freshWaterROB ?? ''}
                    onChange={e => {
                      handleChange('freshWaterArr', e.target.value);
                      handleChange('freshWaterROB', e.target.value);
                    }}
                    className="w-full h-[20px] text-center border border-[#aaa] p-0.5 text-[9.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                  />
                </td>
                <td className="border border-[#aaa] p-0.5 text-center font-bold text-slate-600">MT</td>
              </tr>

              <tr>
                <td className="border border-[#aaa] px-1.5 py-0.5 font-bold text-slate-800">ARRIVAL DRAFTS</td>
                <td className="border border-[#aaa] p-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[7.5px] font-bold text-slate-600">FWD:</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="FWD"
                      value={declaration.arrivalDraftFwd || ''}
                      onChange={e => handleChange('arrivalDraftFwd', parseFloat(e.target.value) || 0)}
                      className="w-1/2 h-[20px] text-center border border-[#aaa] p-0.5 text-[9.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                    />
                    <span className="text-[7.5px] font-bold text-slate-600">AFT:</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="AFT"
                      value={declaration.arrivalDraftAft || declaration.draft || ''}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        handleChange('arrivalDraftAft', val);
                        handleChange('draft', val);
                      }}
                      className="w-1/2 h-[20px] text-center border border-[#aaa] p-0.5 text-[9.5px] font-mono font-bold text-amber-900 bg-white focus:bg-blue-50/40 outline-none"
                    />
                  </div>
                </td>
                <td className="border border-[#aaa] p-0.5 text-center font-bold text-slate-600">m</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CARGO & DOCUMENTS (sans bandeau SECTION 3) */}
        <div className="border border-[#333] mt-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 text-[9px]">
            <div className="p-1 border-r border-b sm:border-b-0 border-slate-300 sm:col-span-2">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">
                CARGO & OPERATION
              </label>
              <div className="flex gap-1">
                <select
                  value={declaration.cargoOperation || 'Discharging'}
                  onChange={e => handleChange('cargoOperation', e.target.value as CargoOperation)}
                  className="h-[21px] border border-blue-400 bg-blue-50 text-[#0f2c59] px-1 py-0 text-[9.5px] font-bold rounded-none cursor-pointer shrink-0"
                >
                  <option value="Loading">Loading</option>
                  <option value="Discharging">Discharging</option>
                  <option value="Formalities">Formalities</option>
                  <option value="Transit">Transit</option>
                </select>
                <input
                  type="text"
                  placeholder="Cargo description..."
                  value={declaration.cargoDescription ?? declaration.cargo ?? declaration.cargoNature ?? ''}
                  onChange={e => {
                    handleChange('cargoDescription', e.target.value);
                    handleChange('cargo', e.target.value);
                    handleChange('cargoNature', e.target.value);
                  }}
                  className="grow h-[21px] border border-[#aaa] px-1 text-[9.5px] font-semibold text-slate-900 bg-white rounded-none"
                />
              </div>
            </div>

            <div className="p-1 border-r border-b sm:border-b-0 border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">QUANTITY (MT)</label>
              <input
                type="text"
                placeholder="e.g. 5,000 MT"
                value={declaration.cargoQuantityInput ?? declaration.qty ?? declaration.cargoQuantityDischarge ?? ''}
                onChange={e => {
                  handleChange('cargoQuantityInput', e.target.value);
                  handleChange('qty', e.target.value);
                  handleChange('cargoQuantityDischarge', e.target.value);
                }}
                className="w-full h-[21px] border border-[#aaa] px-1 text-[9.5px] font-mono font-bold text-blue-900 bg-white rounded-none"
              />
            </div>

            <div className="p-1 border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">DOCUMENTS ON BOARD</label>
              <select
                value={declaration.cargoDocsOnBoard || 'YES'}
                onChange={e => handleChange('cargoDocsOnBoard', e.target.value as 'YES' | 'NO')}
                className="w-full h-[21px] border border-[#aaa] px-1 text-[9.5px] font-bold text-[#0f2c59] bg-white rounded-none cursor-pointer"
              >
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>
          </div>
        </div>

        {/* CREW & SANITARY (sans bandeau de section) */}
        <div className="border border-[#333] mt-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 text-[9px]">
            <div className="p-1 border-r border-b sm:border-b-0 border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">CREW</label>
              <input
                type="number"
                value={declaration.crewCount || ''}
                onChange={e => handleChange('crewCount', parseInt(e.target.value) || 0)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[9.5px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1 border-r border-b sm:border-b-0 border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">PASSENGERS</label>
              <input
                type="number"
                value={declaration.passengerCount || ''}
                onChange={e => handleChange('passengerCount', parseInt(e.target.value) || 0)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[9.5px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1 border-r border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">STOWAWAYS / ARMS</label>
              <input
                type="text"
                placeholder="—"
                value={declaration.stowaways || ''}
                onChange={e => handleChange('stowaways', e.target.value)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[9px] bg-white rounded-none"
              />
            </div>
            <div className="p-1 border-slate-300">
              <label className="block text-[7.5px] font-bold uppercase text-slate-700">DERATTING CERT. EXPIRY</label>
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={declaration.derattingCertExpiry || ''}
                onChange={e => handleChange('derattingCertExpiry', e.target.value)}
                className="w-full h-[20px] border border-[#aaa] px-1 text-[9px] font-mono bg-white rounded-none"
              />
            </div>
          </div>
        </div>

        {/* SOLEMN DECLARATION (sans bandeau de section) */}
        <div className="border border-[#333] mt-1 p-1.5 text-[8.5px] leading-tight text-slate-800 italic bg-slate-50/50">
          "I, the undersigned Master of the above-mentioned vessel, hereby solemnly declare and certify that the vessel particulars, arrival voyage records, bunker and consumable quantities on arrival, drafts, and cargo specifications declared herein are true, accurate, and complete."
        </div>

        {/* SIGNATURES & STAMP */}
        <div className="grid grid-cols-2 gap-3 mt-1.5">
          <div className="border border-[#777] h-[55px] p-1 text-[8.5px] flex flex-col justify-between bg-white">
            <div className="font-bold uppercase text-slate-700 text-[8px]">MASTER'S NAME & TITLE</div>
            <div>
              <input
                type="text"
                placeholder="Captain / Master Name..."
                value={declaration.master || declaration.masterName || ''}
                onChange={e => {
                  handleChange('master', e.target.value);
                  handleChange('masterName', e.target.value);
                }}
                className="w-full font-bold text-slate-900 border-b border-dotted border-slate-500 pb-0.5 bg-transparent outline-none text-[9.5px]"
              />
              <div className="text-[7.5px] text-slate-500">Master of the Vessel</div>
            </div>
          </div>
          <div className="border border-[#777] h-[55px] p-1 text-[8.5px] flex flex-col justify-between bg-white">
            <div className="font-bold uppercase text-slate-700 text-[8px]">MASTER'S SIGNATURE / SHIP'S STAMP</div>
            <div className="text-slate-400 italic text-right border-b border-dotted border-slate-400 pb-0.5 text-[8px]">
              Signature & Official Stamp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
