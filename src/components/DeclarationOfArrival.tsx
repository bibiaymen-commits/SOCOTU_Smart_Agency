import React, { useState } from 'react';
import { SocotuOfficialHeader } from './SocotuOfficialHeader';
import { ArrivalDeclarationModel, CargoOperation, OfficialPdaModel, PortId } from '../types/pda';
import { exportToPdf } from '../utils/pdfExport';
import { SOCOTU_BRANCHES } from '../data/tunisianPorts';

interface DeclarationOfArrivalProps {
  pda: OfficialPdaModel;
  declaration: ArrivalDeclarationModel;
  onUpdateDeclaration: (decl: ArrivalDeclarationModel) => void;
  onBackToPda: () => void;
  onGoToSof?: () => void;
  onGoToBerthing?: () => void;
}

export const DeclarationOfArrival: React.FC<DeclarationOfArrivalProps> = ({
  pda,
  declaration,
  onUpdateDeclaration,
  onBackToPda,
  onGoToSof,
  onGoToBerthing
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const currentBranch = SOCOTU_BRANCHES[declaration.portOfCall] || SOCOTU_BRANCHES.Sousse;

  const handleChange = <K extends keyof ArrivalDeclarationModel>(
    field: K,
    value: ArrivalDeclarationModel[K]
  ) => {
    onUpdateDeclaration({
      ...declaration,
      [field]: value
    });
  };

  const showStatus = (text: string) => {
    setStatusMsg(text);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div className="max-w-[1000px] mx-auto animate-fade-in space-y-4">
      {/* Toast notification if any */}
      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-md print:hidden animate-fade-in flex items-center justify-between shadow-xs">
          <span>{statusMsg}</span>
          <span className="text-[10px] text-emerald-600 font-mono">Master Declaration</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-300 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#0f2c59] uppercase tracking-wide">
            🚢 Master's Declaration of Arrival
          </span>
          <span className="text-[10px] bg-blue-100 text-blue-900 font-semibold px-2 py-0.5 rounded">
            Official Arrival & Quantities Form
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToPda}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded transition cursor-pointer"
          >
            ← Back to PDA
          </button>
          {onGoToSof && (
            <button
              type="button"
              onClick={onGoToSof}
              className="text-xs font-semibold text-[#0f2c59] hover:text-[#1d4ed8] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1"
            >
              <span>Go to SOF →</span>
            </button>
          )}
          {onGoToBerthing && (
            <button
              type="button"
              onClick={onGoToBerthing}
              className="text-xs font-semibold text-[#0f2c59] hover:text-[#1d4ed8] bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1"
            >
              <span>Accostage →</span>
            </button>
          )}
        </div>
      </div>

      {/* OFFICIAL MASTER DECLARATION DOCUMENT */}
      <div
        id="arrival-declaration-print-area"
        className="bg-white p-5 sm:p-7 rounded-md shadow-md text-[#111] font-sans text-[11px] border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0"
      >
        {/* Corporate Header with Logo on the Left, Title in the Middle & Afaq Logo on the Right */}
        <SocotuOfficialHeader port={declaration.portOfCall || pda.port || 'Sousse'} />

        {/* Document Title Header */}
        <div className="text-center my-2.5">
          <h1 className="text-base sm:text-lg font-extrabold text-[#0f2c59] uppercase tracking-wide m-0">
            MASTER'S DECLARATION OF ARRIVAL
          </h1>
          <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
            Vessel Arrival, Voyage Records, Bunkers & Cargo Declaration
          </div>
        </div>

        {/* SECTION 1: VESSEL PARTICULARS & VOYAGE DETAILS */}
        <div className="border border-[#333] mt-2 rounded-none">
          <div className="bg-[#e7ebef] font-bold px-2 py-1 text-[11px] border-b border-[#333] text-[#0f2c59] uppercase flex justify-between items-center">
            <span>SECTION 1: VESSEL PARTICULARS & VOYAGE DETAILS</span>
            <span className="text-[9.5px] font-mono font-semibold text-slate-600">
              REF: {declaration.declarationRef || `ARR-${declaration.declarationDate}`}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 text-[10px]">
            <div className="p-1.5 border-r border-b border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">VESSEL NAME</label>
              <input
                type="text"
                value={declaration.vesselName || ''}
                onChange={e => handleChange('vesselName', e.target.value)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[11px] font-bold text-[#0f2c59] uppercase bg-white rounded-none"
              />
            </div>
            <div className="p-1.5 border-r border-b border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">IMO NUMBER</label>
              <input
                type="text"
                value={declaration.imoNumber || ''}
                onChange={e => handleChange('imoNumber', e.target.value)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[11px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1.5 border-r border-b border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">C.SIGN</label>
              <input
                type="text"
                value={declaration.callSign || ''}
                onChange={e => handleChange('callSign', e.target.value)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[11px] font-mono font-bold bg-white rounded-none"
              />
            </div>
            <div className="p-1.5 border-b border-slate-300 sm:border-r-0">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">FLAG</label>
              <input
                type="text"
                value={declaration.flag || ''}
                onChange={e => handleChange('flag', e.target.value)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[11px] bg-white rounded-none font-semibold text-slate-800"
              />
            </div>

            <div className="p-1.5 border-r border-b border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">GROSS TONNAGE (GRT)</label>
              <input
                type="number"
                value={declaration.grt || ''}
                onChange={e => handleChange('grt', parseFloat(e.target.value) || 0)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[11px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1.5 border-r border-b border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">NET TONNAGE (NRT)</label>
              <input
                type="number"
                value={declaration.nrt || ''}
                onChange={e => handleChange('nrt', parseFloat(e.target.value) || 0)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[11px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1.5 border-r border-b border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">DEADWEIGHT (DWT)</label>
              <input
                type="number"
                value={declaration.dwt || ''}
                onChange={e => handleChange('dwt', parseFloat(e.target.value) || 0)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[11px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1.5 border-b border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">PORT OF REGISTRY</label>
              <input
                type="text"
                value={declaration.portOfRegistry || ''}
                onChange={e => handleChange('portOfRegistry', e.target.value)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[11px] bg-white rounded-none"
              />
            </div>

            <div className="p-1.5 border-r border-b border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">L.O.A. (m)</label>
              <input
                type="number"
                step="0.01"
                value={declaration.loa || 140.00}
                onChange={e => handleChange('loa', parseFloat(e.target.value) || 0)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[11px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1.5 border-r border-b border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">BEAM (m)</label>
              <input
                type="number"
                step="0.01"
                value={declaration.beam || 21.00}
                onChange={e => handleChange('beam', parseFloat(e.target.value) || 0)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[11px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1.5 border-r border-b border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">LAST PORT OF CALL</label>
              <input
                type="text"
                placeholder="e.g. Marsaxlokk (Malta)"
                value={declaration.lastPort || ''}
                onChange={e => handleChange('lastPort', e.target.value)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[10px] bg-white rounded-none"
              />
            </div>
            <div className="p-1.5 border-b border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">NEXT PORT OF CALL</label>
              <input
                type="text"
                placeholder="e.g. Ravenna (Italy)"
                value={declaration.nextPort || ''}
                onChange={e => handleChange('nextPort', e.target.value)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[10px] bg-white rounded-none"
              />
            </div>

            <div className="p-1.5 border-r border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">PORT OF CALL</label>
              <select
                value={declaration.portOfCall}
                onChange={e => handleChange('portOfCall', e.target.value as PortId)}
                className="w-full h-[24px] border border-[#aaa] p-0.5 text-[10px] font-bold text-[#0f2c59] bg-white rounded-none cursor-pointer"
              >
                <option value="Sousse">Port of Sousse</option>
                <option value="Sfax">Port of Sfax</option>
                <option value="Rades">Port of Radès</option>
                <option value="Bizerte">Port of Bizerte</option>
                <option value="Gabes">Port of Gabès</option>
              </select>
            </div>
            <div className="p-1.5 border-r border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">BERTH ASSIGNED</label>
              <input
                type="text"
                placeholder="e.g. Berth No. 2 Commercial Quay"
                value={declaration.berthAssigned || ''}
                onChange={e => handleChange('berthAssigned', e.target.value)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[10px] bg-white rounded-none"
              />
            </div>
            <div className="p-1.5 border-r border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">ARRIVAL DATE & TIME (ATA)</label>
              <input
                type="datetime-local"
                value={declaration.ata || ''}
                onChange={e => handleChange('ata', e.target.value)}
                className="w-full h-[24px] border border-[#aaa] p-0.5 text-[10px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1.5">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">BERTHED / ALL FAST TIME</label>
              <input
                type="datetime-local"
                value={declaration.allFastTime || declaration.allfast || ''}
                onChange={e => {
                  handleChange('allFastTime', e.target.value);
                  handleChange('allfast', e.target.value);
                }}
                className="w-full h-[24px] border border-[#aaa] p-0.5 text-[10px] font-mono font-bold bg-white rounded-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ARRIVAL / DEPARTURE QUANTITIES & BUNKERS (ROB) */}
        <div className="border border-[#333] mt-2.5">
          <div className="bg-[#e7ebef] font-bold px-2 py-1 text-[11px] border-b border-[#333] text-[#0f2c59] uppercase">
            SECTION 2: ARRIVAL / DEPARTURE QUANTITIES & BUNKERS ON BOARD (ROB)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[9.5px]">
              <thead>
                <tr className="bg-[#f0f2f4] text-[#111]">
                  <th className="border border-[#aaa] p-1 text-left w-[34%]">ITEM / CONSUMABLE</th>
                  <th className="border border-[#aaa] p-1 text-center w-[26%]">ON ARRIVAL</th>
                  <th className="border border-[#aaa] p-1 text-center w-[26%]">ON DEPARTURE</th>
                  <th className="border border-[#aaa] p-1 text-center w-[14%]">UNIT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-[#aaa] px-2 py-1 font-bold text-slate-800">FUEL OIL (VLSFO / IFO)</td>
                  <td className="border border-[#aaa] p-0.5">
                    <input
                      type="text"
                      placeholder="e.g. 145"
                      value={declaration.fuelOilArr ?? declaration.vlsfoROB ?? ''}
                      onChange={e => handleChange('fuelOilArr', e.target.value)}
                      className="w-full h-[23px] text-center border border-[#aaa] p-0.5 text-[10.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                    />
                  </td>
                  <td className="border border-[#aaa] p-0.5">
                    <input
                      type="text"
                      placeholder="e.g. 130"
                      value={declaration.fuelOilDep || ''}
                      onChange={e => handleChange('fuelOilDep', e.target.value)}
                      className="w-full h-[23px] text-center border border-[#aaa] p-0.5 text-[10.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                    />
                  </td>
                  <td className="border border-[#aaa] p-1 text-center font-bold text-slate-600">MT</td>
                </tr>

                <tr>
                  <td className="border border-[#aaa] px-2 py-1 font-bold text-slate-800">DIESEL OIL (LSMGO / MGO)</td>
                  <td className="border border-[#aaa] p-0.5">
                    <input
                      type="text"
                      placeholder="e.g. 38"
                      value={declaration.dieselOilArr ?? declaration.lsmgoROB ?? ''}
                      onChange={e => handleChange('dieselOilArr', e.target.value)}
                      className="w-full h-[23px] text-center border border-[#aaa] p-0.5 text-[10.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                    />
                  </td>
                  <td className="border border-[#aaa] p-0.5">
                    <input
                      type="text"
                      placeholder="e.g. 35"
                      value={declaration.dieselOilDep || ''}
                      onChange={e => handleChange('dieselOilDep', e.target.value)}
                      className="w-full h-[23px] text-center border border-[#aaa] p-0.5 text-[10.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                    />
                  </td>
                  <td className="border border-[#aaa] p-1 text-center font-bold text-slate-600">MT</td>
                </tr>

                <tr>
                  <td className="border border-[#aaa] px-2 py-1 font-bold text-slate-800">GASOLINE</td>
                  <td className="border border-[#aaa] p-0.5">
                    <input
                      type="text"
                      placeholder="e.g. NIL"
                      value={declaration.gasolineArr || ''}
                      onChange={e => handleChange('gasolineArr', e.target.value)}
                      className="w-full h-[23px] text-center border border-[#aaa] p-0.5 text-[10.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                    />
                  </td>
                  <td className="border border-[#aaa] p-0.5">
                    <input
                      type="text"
                      placeholder="e.g. NIL"
                      value={declaration.gasolineDep || ''}
                      onChange={e => handleChange('gasolineDep', e.target.value)}
                      className="w-full h-[23px] text-center border border-[#aaa] p-0.5 text-[10.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                    />
                  </td>
                  <td className="border border-[#aaa] p-1 text-center font-bold text-slate-600">MT</td>
                </tr>

                <tr>
                  <td className="border border-[#aaa] px-2 py-1 font-bold text-slate-800">LUBRICATING OIL (LUB OIL)</td>
                  <td className="border border-[#aaa] p-0.5">
                    <input
                      type="text"
                      placeholder="e.g. 4.5"
                      value={declaration.lubOilArr || ''}
                      onChange={e => handleChange('lubOilArr', e.target.value)}
                      className="w-full h-[23px] text-center border border-[#aaa] p-0.5 text-[10.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                    />
                  </td>
                  <td className="border border-[#aaa] p-0.5">
                    <input
                      type="text"
                      placeholder="e.g. 4.2"
                      value={declaration.lubOilDep || ''}
                      onChange={e => handleChange('lubOilDep', e.target.value)}
                      className="w-full h-[23px] text-center border border-[#aaa] p-0.5 text-[10.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                    />
                  </td>
                  <td className="border border-[#aaa] p-1 text-center font-bold text-slate-600">MT</td>
                </tr>

                <tr>
                  <td className="border border-[#aaa] px-2 py-1 font-bold text-slate-800">FRESH WATER</td>
                  <td className="border border-[#aaa] p-0.5">
                    <input
                      type="text"
                      placeholder="e.g. 85"
                      value={declaration.freshWaterArr ?? declaration.freshWaterROB ?? ''}
                      onChange={e => handleChange('freshWaterArr', e.target.value)}
                      className="w-full h-[23px] text-center border border-[#aaa] p-0.5 text-[10.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                    />
                  </td>
                  <td className="border border-[#aaa] p-0.5">
                    <input
                      type="text"
                      placeholder="e.g. 70"
                      value={declaration.freshWaterDep || ''}
                      onChange={e => handleChange('freshWaterDep', e.target.value)}
                      className="w-full h-[23px] text-center border border-[#aaa] p-0.5 text-[10.5px] font-mono bg-white focus:bg-blue-50/40 outline-none"
                    />
                  </td>
                  <td className="border border-[#aaa] p-1 text-center font-bold text-slate-600">MT / m³</td>
                </tr>

                <tr>
                  <td className="border border-[#aaa] px-2 py-1 font-bold text-slate-800">VESSEL DRAFT (FWD / AFT)</td>
                  <td className="border border-[#aaa] p-0.5">
                    <input
                      type="text"
                      placeholder="e.g. F: 6.20 m / A: 6.50 m"
                      value={declaration.draftArr ?? `${declaration.arrivalDraftAft || declaration.draft || ''} m`}
                      onChange={e => handleChange('draftArr', e.target.value)}
                      className="w-full h-[23px] text-center border border-[#aaa] p-0.5 text-[10.5px] font-mono font-bold text-amber-900 bg-white focus:bg-blue-50/40 outline-none"
                    />
                  </td>
                  <td className="border border-[#aaa] p-0.5">
                    <input
                      type="text"
                      placeholder="e.g. F: 4.80 m / A: 5.10 m"
                      value={declaration.draftDep || ''}
                      onChange={e => handleChange('draftDep', e.target.value)}
                      className="w-full h-[23px] text-center border border-[#aaa] p-0.5 text-[10.5px] font-mono font-bold text-amber-900 bg-white focus:bg-blue-50/40 outline-none"
                    />
                  </td>
                  <td className="border border-[#aaa] p-1 text-center font-bold text-slate-600">m</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: CARGO & DOCUMENTS DECLARATION */}
        <div className="border border-[#333] mt-2.5">
          <div className="bg-[#e7ebef] font-bold px-2 py-1 text-[11px] border-b border-[#333] text-[#0f2c59] uppercase">
            SECTION 3: CARGO & DOCUMENTS DECLARATION
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 text-[10px]">
            {/* Cargo Operation Dropdown Scroll + Merchandise Description */}
            <div className="p-1.5 border-r border-b sm:border-b-0 border-slate-300 sm:col-span-2">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">
                CARGO OPERATION & MERCHANDISE DESIGNATION
              </label>
              <div className="flex gap-1.5">
                <select
                  value={declaration.cargoOperation || 'Discharging'}
                  onChange={e => handleChange('cargoOperation', e.target.value as CargoOperation)}
                  className="h-[25px] border border-blue-400 bg-blue-50 text-[#0f2c59] px-2 py-0 text-[10.5px] font-bold rounded-none cursor-pointer shrink-0"
                  title="Choose operation: Loading, Discharging, Formalities, or Transit"
                >
                  <option value="Loading">Loading</option>
                  <option value="Discharging">Discharging</option>
                  <option value="Formalities">Formalities</option>
                  <option value="Transit">Transit</option>
                </select>
                <input
                  type="text"
                  placeholder="Merchandise description..."
                  value={declaration.cargoDescription ?? declaration.cargo ?? declaration.cargoNature ?? ''}
                  onChange={e => {
                    handleChange('cargoDescription', e.target.value);
                    handleChange('cargo', e.target.value);
                    handleChange('cargoNature', e.target.value);
                  }}
                  className="grow h-[25px] border border-[#aaa] p-1 text-[11px] font-semibold text-slate-900 bg-white rounded-none"
                />
              </div>
            </div>

            <div className="p-1.5 border-r border-b sm:border-b-0 border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">CARGO QUANTITY (MT)</label>
              <input
                type="text"
                placeholder="e.g. 5,000 MT"
                value={declaration.cargoQuantityInput ?? declaration.qty ?? declaration.cargoQuantityDischarge ?? ''}
                onChange={e => {
                  handleChange('cargoQuantityInput', e.target.value);
                  handleChange('qty', e.target.value);
                  handleChange('cargoQuantityDischarge', e.target.value);
                }}
                className="w-full h-[25px] border border-[#aaa] p-1 text-[11px] font-mono font-bold text-blue-900 bg-white rounded-none"
              />
            </div>

            <div className="p-1.5 border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">CARGO DOCUMENTS ON BOARD</label>
              <select
                value={declaration.cargoDocsOnBoard || 'YES'}
                onChange={e => handleChange('cargoDocsOnBoard', e.target.value as 'YES' | 'NO')}
                className="w-full h-[25px] border border-[#aaa] p-1 text-[11px] font-bold text-[#0f2c59] bg-white rounded-none cursor-pointer"
              >
                <option value="YES">YES — B/L & Manifest On Board</option>
                <option value="NO">NO</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: CREW, PASSENGERS & HEALTH / CUSTOMS STATUS */}
        <div className="border border-[#333] mt-2.5">
          <div className="bg-[#e7ebef] font-bold px-2 py-1 text-[11px] border-b border-[#333] text-[#0f2c59] uppercase">
            SECTION 4: CREW, PASSENGERS & SHIPBOARD HEALTH / CUSTOMS STATUS
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 text-[10px]">
            <div className="p-1.5 border-r border-b sm:border-b-0 border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">NUMBER OF CREW</label>
              <input
                type="number"
                value={declaration.crewCount ?? 16}
                onChange={e => handleChange('crewCount', parseInt(e.target.value) || 0)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[11px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1.5 border-r border-b sm:border-b-0 border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">NUMBER OF PASSENGERS</label>
              <input
                type="number"
                value={declaration.passengerCount ?? 0}
                onChange={e => handleChange('passengerCount', parseInt(e.target.value) || 0)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[11px] font-mono bg-white rounded-none"
              />
            </div>
            <div className="p-1.5 border-r border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">STOWAWAYS / ARMS ON BOARD</label>
              <input
                type="text"
                value={declaration.stowaways || 'NIL / None reported'}
                onChange={e => handleChange('stowaways', e.target.value)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[10px] bg-white rounded-none"
              />
            </div>
            <div className="p-1.5 border-slate-300">
              <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600">DERATTING CERT. EXPIRY</label>
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={declaration.derattingCertExpiry || '2027-01-15'}
                onChange={e => handleChange('derattingCertExpiry', e.target.value)}
                className="w-full h-[24px] border border-[#aaa] p-1 text-[10px] font-mono bg-white rounded-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: MASTER'S OFFICIAL SOLEMN DECLARATION */}
        <div className="border border-[#333] mt-2.5">
          <div className="bg-[#e7ebef] font-bold px-2 py-1 text-[11px] border-b border-[#333] text-[#0f2c59] uppercase">
            SECTION 5: MASTER'S SOLEMN DECLARATION
          </div>
          <div className="p-2.5 text-[10px] leading-relaxed text-slate-800 italic bg-slate-50/50">
            "I, the undersigned Master of the above-mentioned vessel, hereby solemnly declare and certify on my honor that the vessel particulars, voyage details, bunker and consumable quantities on arrival and departure, drafts, crew status, and cargo specifications declared herein are true, accurate, and complete in all respects to the best of my knowledge and belief."
          </div>
        </div>

        {/* SECTION 6: MASTER'S SIGNATURE & SHIP'S STAMP */}
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="border border-[#777] h-[75px] p-2 text-[10px] flex flex-col justify-between bg-white">
            <div className="font-bold uppercase text-slate-700">MASTER'S NAME & TITLE</div>
            <div>
              <input
                type="text"
                value={declaration.master || declaration.masterName || 'Capt. Mohamed Ben Salem'}
                onChange={e => {
                  handleChange('master', e.target.value);
                  handleChange('masterName', e.target.value);
                }}
                className="w-full font-bold text-slate-900 border-b border-dotted border-slate-500 pb-0.5 bg-transparent outline-none"
              />
              <div className="text-[8.5px] text-slate-500 mt-0.5">Master of the Vessel</div>
            </div>
          </div>
          <div className="border border-[#777] h-[75px] p-2 text-[10px] flex flex-col justify-between bg-white">
            <div className="font-bold uppercase text-slate-700">MASTER'S SIGNATURE / SHIP'S OFFICIAL STAMP</div>
            <div className="text-slate-400 italic text-right border-b border-dotted border-slate-400 pb-0.5">
              Signature & Vessel Stamp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
