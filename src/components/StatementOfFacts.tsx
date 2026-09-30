import React, { useState } from 'react';
import { SocotuOfficialHeader } from './SocotuOfficialHeader';
import { ArrivalDeclarationModel, CargoOperation, OfficialPdaModel, PortId } from '../types/pda';
import { SOCOTU_BRANCHES } from '../data/tunisianPorts';

interface StatementOfFactsProps {
  pda: OfficialPdaModel;
  declaration: ArrivalDeclarationModel;
  onUpdateDeclaration: (decl: ArrivalDeclarationModel) => void;
  onBackToPda: () => void;
  onGoToBerthing?: () => void;
}

// Standard BIMCO Chronological Port Milestones Checklist
const BIMCO_STANDARD_EVENTS = [
  "ETA NOTICE TENDERED (72H / 48H / 24H)",
  "ARRIVED ROADSTEAD / OUTER ANCHORAGE / PORT LIMITS",
  "DROPPED ANCHOR / ANCHORED",
  "NOTICE OF READINESS (NOR) TENDERED",
  "NOTICE OF READINESS (NOR) ACCEPTED / RECEIVED",
  "INWARD PILOT ON BOARD",
  "ANCHOR AWEIGH (HEAVED UP)",
  "FIRST LINE ASHORE",
  "ALL FAST / BERTHED ALONGSIDE",
  "GANGWAY DOWN & SAFE ACCESS SECURED",
  "PORT AUTHORITIES ON BOARD (CUSTOMS, IMMIGRATION, POLICE)",
  "FREE PRATIQUE GRANTED / HEALTH CLEARANCE COMPLETED",
  "INITIAL DRAFT SURVEY COMMENCED",
  "INITIAL DRAFT SURVEY COMPLETED",
  "CARGO HOLDS / TANKS INSPECTED & PASSED",
  "COMMENCED CARGO OPERATIONS (LOADING / DISCHARGING)",
  "COMPLETED CARGO OPERATIONS",
  "FINAL DRAFT SURVEY COMMENCED",
  "FINAL DRAFT SURVEY COMPLETED",
  "CARGO DOCUMENTS ON BOARD / BILLS OF LADING SIGNED",
  "OUTWARD PILOT ON BOARD",
  "UNBERTHED / CAST OFF ALL LINES",
  "DROPPED OUTWARD PILOT / SAILED FOR NEXT PORT"
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function getTodayFormatted(): { date: string; time: string; day: string } {
  const d = new Date();
  const date = `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = days[d.getDay()];
  return { date, time, day };
}

export const StatementOfFacts: React.FC<StatementOfFactsProps> = ({
  pda,
  declaration,
  onUpdateDeclaration,
  onBackToPda,
  onGoToBerthing
}) => {
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const currentBranch = SOCOTU_BRANCHES[declaration.portOfCall] || SOCOTU_BRANCHES.Sousse;
  const todayNow = getTodayFormatted();
  const currentPortEvents = declaration.portEvents || {};

  // Default BIMCO stoppages
  const currentStoppages = declaration.stoppages && declaration.stoppages.length > 0
    ? declaration.stoppages
    : [
        {
          id: 'stop-1',
          fromDate: todayNow.date,
          fromTime: '12:00',
          toDate: todayNow.date,
          toTime: '13:00',
          reason: 'Meal break / Stevedores shift change'
        },
        {
          id: 'stop-2',
          fromDate: todayNow.date,
          fromTime: '18:30',
          toDate: todayNow.date,
          toTime: '19:15',
          reason: 'Rain / Bad weather precaution (Hatches closed)'
        }
      ];

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

  const handleEventChange = (eventName: string, key: 'date' | 'time', val: string) => {
    const updated = {
      ...currentPortEvents,
      [eventName]: {
        ...(currentPortEvents[eventName] || { date: '', time: '' }),
        [key]: val
      }
    };
    onUpdateDeclaration({
      ...declaration,
      portEvents: updated
    });
  };

  const handleSetSingleEventNow = (eventName: string) => {
    const now = getTodayFormatted();
    const updated = {
      ...currentPortEvents,
      [eventName]: {
        date: now.date,
        time: now.time
      }
    };
    onUpdateDeclaration({
      ...declaration,
      portEvents: updated
    });
    showStatus(`✓ ${eventName} set to ${now.date} ${now.time}`);
  };

  const handleSetAllNow = () => {
    const now = getTodayFormatted();
    const updatedEvents = BIMCO_STANDARD_EVENTS.reduce((acc, evName) => {
      acc[evName] = { date: now.date, time: now.time };
      return acc;
    }, {} as Record<string, { date: string; time: string }>);

    onUpdateDeclaration({
      ...declaration,
      portEvents: updatedEvents
    });
    showStatus('✓ All event timestamps set to current date and time');
  };

  const handleAddStoppage = () => {
    const newStop = {
      id: `stop-${Date.now()}`,
      fromDate: todayNow.date,
      fromTime: todayNow.time,
      toDate: todayNow.date,
      toTime: todayNow.time,
      reason: ''
    };
    onUpdateDeclaration({
      ...declaration,
      stoppages: [...currentStoppages, newStop]
    });
    showStatus('✓ Stoppage / Delay added');
  };

  const handleRemoveStoppage = (id: string) => {
    onUpdateDeclaration({
      ...declaration,
      stoppages: currentStoppages.filter(s => s.id !== id)
    });
  };

  const handleStoppageChange = (id: string, field: string, value: string) => {
    onUpdateDeclaration({
      ...declaration,
      stoppages: currentStoppages.map(s => (s.id === id ? { ...s, [field]: value } : s))
    });
  };

  const handlePrintSof = () => {
    window.print();
  };

  return (
    <div className="max-w-[1000px] mx-auto animate-fade-in space-y-4">
      {/* Toast notification if any */}
      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-md print:hidden animate-fade-in flex items-center justify-between shadow-xs">
          <span>{statusMsg}</span>
          <span className="text-[10px] text-emerald-600 font-mono">BIMCO SOF</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-300 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#0f2c59] uppercase tracking-wide">
            ⏱️ BIMCO Standard Statement of Facts (SOF) / Time Sheet
          </span>
          <span className="text-[10px] bg-blue-100 text-blue-900 font-semibold px-2 py-0.5 rounded">
            Official BIMCO Standard Format
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

      {/* OFFICIAL BIMCO PRINTABLE STATEMENT OF FACTS */}
      <div
        id="sof-print-area"
        className="bg-white p-5 sm:p-7 rounded-md shadow-md text-[#1e293b] font-sans text-[10.5px] border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0"
      >
        {/* Corporate Header with Logo on the Left, Title in the Middle & Afaq Logo on the Right */}
        <SocotuOfficialHeader port={declaration.portOfCall || pda.port || 'Sousse'} />

        {/* Sub-header with BIMCO Standard Form Title */}
        <div className="flex justify-between items-center mb-2.5 bg-slate-50 p-2 border border-slate-300 rounded">
          <div>
            <h1 className="text-xs sm:text-sm font-black text-[#0f2c59] uppercase tracking-wide m-0">
              BIMCO STANDARD STATEMENT OF FACTS (SOF) / TIME SHEET
            </h1>
            <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">
              In accordance with BIMCO recommended laytime and time sheet reporting standards
            </div>
          </div>
          <div className="text-right flex items-center gap-1.5">
            <span className="font-bold text-[#0f2c59] text-[10px]">SOF Date :</span>
            <input
              type="text"
              value={declaration.declarationDate || todayNow.date}
              onChange={e => handleChange('declarationDate', e.target.value)}
              className="w-[95px] text-center font-mono font-bold text-[10px] border border-slate-300 rounded px-1.5 py-0.5 bg-white text-slate-900"
            />
          </div>
        </div>

        {/* SECTION 1: BIMCO GENERAL PARTICULARS (Grid) */}
        <div className="border border-slate-300 mb-3">
          <div className="bg-[#0f2c59] text-white font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider flex justify-between items-center">
            <span>1. Vessel, Voyage & Charterparty Particulars</span>
            <span className="text-[9px] text-blue-200">Standard BIMCO Header</span>
          </div>

          <table className="w-full border-collapse text-[9.5px]">
            <tbody>
              {/* Row 1: Vessel, Flag, IMO, Call Sign */}
              <tr>
                <th className="border border-slate-300 p-1 bg-slate-100 text-left font-bold text-[#0f2c59] w-[14%] uppercase">
                  Vessel Name :
                </th>
                <td className="border border-slate-300 p-1 w-[36%]">
                  <input
                    type="text"
                    value={declaration.vesselName}
                    onChange={e => handleChange('vesselName', e.target.value)}
                    className="w-full font-bold text-slate-950 uppercase bg-transparent p-0 outline-none"
                  />
                </td>
                <th className="border border-slate-300 p-1 bg-slate-100 text-left font-bold text-[#0f2c59] w-[14%] uppercase">
                  Flag / Registry :
                </th>
                <td className="border border-slate-300 p-1 w-[36%]">
                  <input
                    type="text"
                    value={declaration.flag || pda.vessel.flag || ''}
                    placeholder="e.g. Panama, Liberia, Malta, Tunisia..."
                    onChange={e => handleChange('flag', e.target.value)}
                    className="w-full font-semibold text-slate-800 bg-transparent p-0 outline-none"
                  />
                </td>
              </tr>

              {/* Row 2: IMO, Call Sign, GRT / NRT, DWT */}
              <tr>
                <th className="border border-slate-300 p-1 bg-slate-100 text-left font-bold text-[#0f2c59] uppercase">
                  IMO Number :
                </th>
                <td className="border border-slate-300 p-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={declaration.imoNumber}
                      onChange={e => handleChange('imoNumber', e.target.value)}
                      className="grow font-mono font-bold text-slate-900 bg-transparent p-0 outline-none"
                    />
                    <span className="text-slate-400 text-[9px]">C.SIGN:</span>
                    <input
                      type="text"
                      value={declaration.callSign}
                      onChange={e => handleChange('callSign', e.target.value)}
                      className="w-[60px] font-mono font-bold text-slate-900 uppercase bg-transparent p-0 outline-none"
                    />
                  </div>
                </td>
                <th className="border border-slate-300 p-1 bg-slate-100 text-left font-bold text-[#0f2c59] uppercase">
                  GRT / NRT / DWT :
                </th>
                <td className="border border-slate-300 p-1 font-mono text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span>GRT:</span>
                    <strong className="text-slate-900">{declaration.grt || pda.vessel.grt}</strong>
                    <span className="text-slate-400">|</span>
                    <span>NRT:</span>
                    <strong className="text-slate-900">{declaration.nrt || pda.vessel.nrt}</strong>
                    <span className="text-slate-400">|</span>
                    <span>DWT:</span>
                    <strong className="text-slate-900">{declaration.dwt || 12000}</strong>
                  </div>
                </td>
              </tr>

              {/* Row 3: Port, Berth, C/P Date */}
              <tr>
                <th className="border border-slate-300 p-1 bg-slate-100 text-left font-bold text-[#0f2c59] uppercase">
                  Port of Call :
                </th>
                <td className="border border-slate-300 p-1">
                  <select
                    value={declaration.portOfCall}
                    onChange={e => handleChange('portOfCall', e.target.value as PortId)}
                    className="w-full font-bold text-[#1d4ed8] bg-transparent p-0 outline-none cursor-pointer"
                  >
                    <option value="Sousse">Port of Sousse</option>
                    <option value="Sfax">Port of Sfax</option>
                    <option value="Rades">Port of Radès</option>
                    <option value="Bizerte">Port of Bizerte</option>
                    <option value="Gabes">Port of Gabès</option>
                  </select>
                </td>
                <th className="border border-slate-300 p-1 bg-slate-100 text-left font-bold text-[#0f2c59] uppercase">
                  Berth / Terminal :
                </th>
                <td className="border border-slate-300 p-1">
                  <input
                    type="text"
                    placeholder="e.g. Commercial Quay Berth No. 2"
                    value={declaration.berthAssigned || ''}
                    onChange={e => handleChange('berthAssigned', e.target.value)}
                    className="w-full font-semibold text-slate-800 bg-transparent p-0 outline-none"
                  />
                </td>
              </tr>

              {/* Row 4: Owners & Charterers */}
              <tr>
                <th className="border border-slate-300 p-1 bg-slate-100 text-left font-bold text-[#0f2c59] uppercase">
                  Ship Owners :
                </th>
                <td className="border border-slate-300 p-1">
                  <input
                    type="text"
                    value={declaration.shipOwner || pda.vesselOwner || ''}
                    placeholder="e.g. OCEANIC MARITIME SERVICES LTD"
                    onChange={e => handleChange('shipOwner', e.target.value)}
                    className="w-full text-slate-800 bg-transparent p-0 outline-none"
                  />
                </td>
                <th className="border border-slate-300 p-1 bg-slate-100 text-left font-bold text-[#0f2c59] uppercase">
                  Charterers :
                </th>
                <td className="border border-slate-300 p-1">
                  <input
                    type="text"
                    value={declaration.charterer || ''}
                    placeholder="e.g. CARTHAGE GRAIN TRADING LTD"
                    onChange={e => handleChange('charterer', e.target.value)}
                    className="w-full text-slate-800 bg-transparent p-0 outline-none"
                  />
                </td>
              </tr>

              {/* Row 5: Shippers & Receivers */}
              <tr>
                <th className="border border-slate-300 p-1 bg-slate-100 text-left font-bold text-[#0f2c59] uppercase">
                  Shippers :
                </th>
                <td className="border border-slate-300 p-1">
                  <input
                    type="text"
                    value={declaration.stowaways || 'AS PER BILL OF LADING'}
                    placeholder="Shipper designation..."
                    onChange={e => handleChange('stowaways', e.target.value)}
                    className="w-full text-slate-800 bg-transparent p-0 outline-none"
                  />
                </td>
                <th className="border border-slate-300 p-1 bg-slate-100 text-left font-bold text-[#0f2c59] uppercase">
                  Receivers :
                </th>
                <td className="border border-slate-300 p-1">
                  <input
                    type="text"
                    value={declaration.to || pda.vessel.to || 'TO ORDER'}
                    placeholder="Receivers designation..."
                    onChange={e => handleChange('to' as any, e.target.value)}
                    className="w-full text-slate-800 bg-transparent p-0 outline-none"
                  />
                </td>
              </tr>

              {/* Row 6: Cargo Description, Operation & Quantity */}
              <tr>
                <th className="border border-slate-300 p-1 bg-slate-100 text-left font-bold text-[#0f2c59] uppercase">
                  Cargo / Operation :
                </th>
                <td className="border border-slate-300 p-1">
                  <div className="flex items-center gap-1.5">
                    <select
                      value={declaration.cargoOperation || 'Discharging'}
                      onChange={e => handleChange('cargoOperation', e.target.value as CargoOperation)}
                      className="border border-blue-400 bg-blue-50 text-[#0f2c59] rounded text-[9.5px] px-1 py-0.5 font-bold cursor-pointer shrink-0"
                    >
                      <option value="Loading">Loading</option>
                      <option value="Discharging">Discharging</option>
                      <option value="Formalities">Formalities</option>
                      <option value="Transit">Transit</option>
                    </select>
                    <input
                      type="text"
                      value={declaration.cargo || declaration.cargoNature || ''}
                      placeholder="Merchandise description..."
                      onChange={e => {
                        handleChange('cargo', e.target.value);
                        handleChange('cargoNature', e.target.value);
                      }}
                      className="grow font-bold text-slate-900 bg-transparent p-0 outline-none"
                    />
                  </div>
                </td>
                <th className="border border-slate-300 p-1 bg-slate-100 text-left font-bold text-[#0f2c59] uppercase">
                  B/L Quantity (MT) :
                </th>
                <td className="border border-slate-300 p-1">
                  <input
                    type="text"
                    value={declaration.qty || declaration.cargoQuantityDischarge || ''}
                    placeholder="e.g. 5,000 MT"
                    onChange={e => {
                      handleChange('qty', e.target.value);
                      handleChange('cargoQuantityDischarge', e.target.value);
                    }}
                    className="w-full font-mono font-bold text-blue-900 bg-transparent p-0 outline-none"
                  />
                </td>
              </tr>

              {/* Row 7: Master's Name, Port Agent, Laytime Terms */}
              <tr>
                <th className="border border-slate-300 p-1 bg-slate-100 text-left font-bold text-[#0f2c59] uppercase">
                  Master's Name :
                </th>
                <td className="border border-slate-300 p-1">
                  <input
                    type="text"
                    value={declaration.master || declaration.masterName || ''}
                    placeholder="Master / Captain Name"
                    onChange={e => {
                      handleChange('master', e.target.value);
                      handleChange('masterName', e.target.value);
                    }}
                    className="w-full font-semibold text-slate-900 bg-transparent p-0 outline-none"
                  />
                </td>
                <th className="border border-slate-300 p-1 bg-slate-100 text-left font-bold text-[#0f2c59] uppercase">
                  Port Agent :
                </th>
                <td className="border border-slate-300 p-1 font-bold text-[#0f2c59]">
                  SOCOTU — {declaration.portOfCall} Agency
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 2: CHRONOLOGY OF BIMCO PORT EVENTS */}
        <div className="border border-[#0f2c59] mb-3">
          <div className="bg-[#0f2c59] text-white font-bold px-2 py-1 text-[10.5px] uppercase tracking-wide flex justify-between items-center">
            <span>2. Chronology of Port Events (BIMCO Standard Milestones)</span>
            <button
              type="button"
              onClick={handleSetAllNow}
              className="text-[9px] font-bold bg-amber-400 hover:bg-amber-300 text-[#0f2c59] px-2.5 py-0.5 rounded cursor-pointer print:hidden transition-colors shadow-xs"
              title="Set all event dates and times to current timestamp"
            >
              ⚡ Set All to Now
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[9.5px]">
              <thead>
                <tr className="bg-slate-100 text-[#0f2c59] font-bold">
                  <th className="border border-slate-300 p-1 text-center w-[12%] print:hidden">Action</th>
                  <th className="border border-slate-300 p-1 text-left w-[46%] print:w-[50%]">BIMCO Event Description</th>
                  <th className="border border-slate-300 p-1 text-center w-[21%] print:w-[25%]">Date (DD/MM/YYYY)</th>
                  <th className="border border-slate-300 p-1 text-center w-[21%] print:w-[25%]">Time (24H - HH:MM)</th>
                </tr>
              </thead>
              <tbody>
                {BIMCO_STANDARD_EVENTS.map((evName, idx) => {
                  const ev = currentPortEvents[evName] || { date: '', time: '' };
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="border border-slate-300 p-0.5 text-center print:hidden">
                        <button
                          type="button"
                          onClick={() => handleSetSingleEventNow(evName)}
                          className="bg-[#0f2c59] hover:bg-[#1d4ed8] text-white text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer whitespace-nowrap active:scale-95 transition-all shadow-xs"
                          title={`Set current timestamp for ${evName}`}
                        >
                          ⚡ Set now
                        </button>
                      </td>
                      <td className="border border-slate-300 px-2 py-1 font-semibold text-slate-900">
                        {evName}
                      </td>
                      <td className="border border-slate-300 p-0.5 text-center">
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="DD/MM/YYYY"
                          value={ev.date || ''}
                          onFocus={e => {
                            if (e.currentTarget.value === '0' || e.currentTarget.value === '1') {
                              handleEventChange(evName, 'date', '');
                            } else {
                              e.currentTarget.select();
                            }
                          }}
                          onChange={e => handleEventChange(evName, 'date', e.target.value)}
                          className="w-full max-w-[110px] mx-auto h-[22px] text-center border border-slate-300 p-0.5 text-[10px] font-mono bg-white rounded focus:bg-blue-50/40 focus:border-blue-600 outline-none"
                        />
                      </td>
                      <td className="border border-slate-300 p-0.5 text-center">
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="HH:MM"
                          value={ev.time || ''}
                          onFocus={e => {
                            if (e.currentTarget.value === '0' || e.currentTarget.value === '1') {
                              handleEventChange(evName, 'time', '');
                            } else {
                              e.currentTarget.select();
                            }
                          }}
                          onChange={e => handleEventChange(evName, 'time', e.target.value)}
                          className="w-full max-w-[80px] mx-auto h-[22px] text-center border border-slate-300 p-0.5 text-[10px] font-mono font-bold bg-white rounded focus:bg-blue-50/40 focus:border-blue-600 outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: BIMCO WORKING PERIODS, STOPPAGES & DELAYS LOG */}
        <div className="border border-slate-300 mb-3">
          <div className="bg-[#eef2f6] font-bold px-2 py-1 text-[10.5px] border-b border-slate-300 text-[#0f2c59] uppercase flex justify-between items-center">
            <span>3. Working Periods, Stoppages & Operational Delays (Time Sheet Log)</span>
            <button
              type="button"
              onClick={handleAddStoppage}
              className="text-[9px] font-bold bg-[#0f2c59] hover:bg-[#1d4ed8] text-white px-2.5 py-0.5 rounded print:hidden transition-colors cursor-pointer shadow-xs"
            >
              + Add Stoppage / Delay
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[9.5px]">
              <thead>
                <tr className="bg-[#f0f2f4] text-[#0f2c59] font-bold">
                  <th className="border border-slate-300 p-1 text-center w-[16%]">From Date</th>
                  <th className="border border-slate-300 p-1 text-center w-[12%]">From Time</th>
                  <th className="border border-slate-300 p-1 text-center w-[16%]">To Date</th>
                  <th className="border border-slate-300 p-1 text-center w-[12%]">To Time</th>
                  <th className="border border-slate-300 p-1 text-left w-[38%]">Nature of Work / Reason for Delay</th>
                  <th className="border border-slate-300 p-1 text-center w-[6%] print:hidden">Del</th>
                </tr>
              </thead>
              <tbody>
                {currentStoppages.map((stop) => (
                  <tr key={stop.id}>
                    <td className="border border-slate-300 p-0.5 text-center">
                      <div className="flex items-center gap-0.5 justify-center">
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="DD/MM/YYYY"
                          value={stop.fromDate}
                          onFocus={e => {
                            if (e.currentTarget.value === '0' || e.currentTarget.value === '1') {
                              handleStoppageChange(stop.id, 'fromDate', '');
                            } else {
                              e.currentTarget.select();
                            }
                          }}
                          onChange={e => handleStoppageChange(stop.id, 'fromDate', e.target.value)}
                          className="w-full h-[22px] text-center border border-slate-300 p-0.5 text-[10px] font-mono bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const now = getTodayFormatted();
                            handleStoppageChange(stop.id, 'fromDate', now.date);
                            handleStoppageChange(stop.id, 'fromTime', now.time);
                          }}
                          className="text-[8px] font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#0f2c59] px-1 py-0.5 rounded cursor-pointer print:hidden shrink-0"
                          title="Set From Date/Time to now"
                        >
                          Now
                        </button>
                      </div>
                    </td>
                    <td className="border border-slate-300 p-0.5 text-center">
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="HH:MM"
                        value={stop.fromTime}
                        onFocus={e => {
                          if (e.currentTarget.value === '0' || e.currentTarget.value === '1') {
                            handleStoppageChange(stop.id, 'fromTime', '');
                          } else {
                            e.currentTarget.select();
                          }
                        }}
                        onChange={e => handleStoppageChange(stop.id, 'fromTime', e.target.value)}
                        className="w-full h-[22px] text-center border border-slate-300 p-0.5 text-[10px] font-mono font-bold bg-white"
                      />
                    </td>
                    <td className="border border-slate-300 p-0.5 text-center">
                      <div className="flex items-center gap-0.5 justify-center">
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="DD/MM/YYYY"
                          value={stop.toDate}
                          onFocus={e => {
                            if (e.currentTarget.value === '0' || e.currentTarget.value === '1') {
                              handleStoppageChange(stop.id, 'toDate', '');
                            } else {
                              e.currentTarget.select();
                            }
                          }}
                          onChange={e => handleStoppageChange(stop.id, 'toDate', e.target.value)}
                          className="w-full h-[22px] text-center border border-slate-300 p-0.5 text-[10px] font-mono bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const now = getTodayFormatted();
                            handleStoppageChange(stop.id, 'toDate', now.date);
                            handleStoppageChange(stop.id, 'toTime', now.time);
                          }}
                          className="text-[8px] font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#0f2c59] px-1 py-0.5 rounded cursor-pointer print:hidden shrink-0"
                          title="Set To Date/Time to now"
                        >
                          Now
                        </button>
                      </div>
                    </td>
                    <td className="border border-slate-300 p-0.5 text-center">
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="HH:MM"
                        value={stop.toTime}
                        onFocus={e => {
                          if (e.currentTarget.value === '0' || e.currentTarget.value === '1') {
                            handleStoppageChange(stop.id, 'toTime', '');
                          } else {
                            e.currentTarget.select();
                          }
                        }}
                        onChange={e => handleStoppageChange(stop.id, 'toTime', e.target.value)}
                        className="w-full h-[22px] text-center border border-slate-300 p-0.5 text-[10px] font-mono font-bold bg-white"
                      />
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="text"
                        placeholder="e.g. Rain, meal break, shore crane breakdown, waiting for trucks/cargo, shifting..."
                        value={stop.reason}
                        onFocus={e => e.currentTarget.select()}
                        onChange={e => handleStoppageChange(stop.id, 'reason', e.target.value)}
                        className="w-full h-[22px] border border-slate-300 px-1.5 text-[10px] bg-white text-slate-800"
                      />
                    </td>
                    <td className="border border-slate-300 p-0.5 text-center print:hidden">
                      <button
                        type="button"
                        onClick={() => handleRemoveStoppage(stop.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer"
                        title="Remove stoppage"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 4: BIMCO CARGO HANDLING & PERFORMANCE BREAKDOWN (HATCHES / HOLDS) */}
        <div className="border border-slate-300 mb-3">
          <div className="bg-[#eef2f6] font-bold px-2 py-1 text-[10.5px] border-b border-slate-300 text-[#0f2c59] uppercase flex justify-between items-center">
            <span>4. Cargo Operations Breakdown by Hold / Hatch (MT)</span>
            <span className="text-[9px] text-slate-500 font-mono">BIMCO Working Performance</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[9.5px]">
              <thead>
                <tr className="bg-[#f0f2f4] text-[#0f2c59] font-bold">
                  <th className="border border-slate-300 p-1 text-center w-[16%]">Hatch / Hold N°</th>
                  <th className="border border-slate-300 p-1 text-right w-[21%]">Hold 1 (MT)</th>
                  <th className="border border-slate-300 p-1 text-right w-[21%]">Hold 2 (MT)</th>
                  <th className="border border-slate-300 p-1 text-right w-[21%]">Hold 3 (MT)</th>
                  <th className="border border-slate-300 p-1 text-right w-[21%]">Total Handled (MT)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-1 text-center font-bold bg-slate-50">Handled Today</td>
                  <td className="border border-slate-300 p-0.5 text-right">
                    <input
                      type="text"
                      placeholder="1,200"
                      className="w-full text-right p-0.5 font-mono text-[9.5px] bg-transparent outline-none"
                    />
                  </td>
                  <td className="border border-slate-300 p-0.5 text-right">
                    <input
                      type="text"
                      placeholder="1,800"
                      className="w-full text-right p-0.5 font-mono text-[9.5px] bg-transparent outline-none"
                    />
                  </td>
                  <td className="border border-slate-300 p-0.5 text-right">
                    <input
                      type="text"
                      placeholder="1,500"
                      className="w-full text-right p-0.5 font-mono text-[9.5px] bg-transparent outline-none"
                    />
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono font-bold text-blue-900">
                    {declaration.qty || '4,500 MT'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 5: DRAFTS & BUNKERS RECORD (ARRIVAL & DEPARTURE) */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-[9.5px]">
          {/* Drafts */}
          <div className="border border-slate-300">
            <div className="bg-[#eef2f6] font-bold px-2 py-0.5 text-[10px] text-[#0f2c59] uppercase border-b border-slate-300">
              Vessel Drafts (Meters)
            </div>
            <div className="p-1.5 grid grid-cols-2 gap-2">
              <div>
                <span className="font-semibold text-slate-700">Arrival Fwd :</span>
                <input
                  type="text"
                  value={declaration.arrivalDraftFwd ? `${declaration.arrivalDraftFwd} m` : '6.50 m'}
                  onChange={e => handleChange('arrivalDraftFwd', parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded px-1 text-[9.5px] font-mono mt-0.5 bg-white"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-700">Arrival Aft :</span>
                <input
                  type="text"
                  value={declaration.arrivalDraftAft ? `${declaration.arrivalDraftAft} m` : '8.38 m'}
                  onChange={e => handleChange('arrivalDraftAft', parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded px-1 text-[9.5px] font-mono mt-0.5 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Bunkers */}
          <div className="border border-slate-300">
            <div className="bg-[#eef2f6] font-bold px-2 py-0.5 text-[10px] text-[#0f2c59] uppercase border-b border-slate-300">
              Bunkers & Water ROB (Arrival)
            </div>
            <div className="p-1.5 grid grid-cols-3 gap-2">
              <div>
                <span className="font-semibold text-slate-700">VLSFO :</span>
                <input
                  type="text"
                  value={declaration.vlsfoROB || '145 MT'}
                  onChange={e => handleChange('vlsfoROB', e.target.value)}
                  className="w-full border border-slate-300 rounded px-1 text-[9.5px] font-mono mt-0.5 bg-white"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-700">LSMGO :</span>
                <input
                  type="text"
                  value={declaration.lsmgoROB || '38 MT'}
                  onChange={e => handleChange('lsmgoROB', e.target.value)}
                  className="w-full border border-slate-300 rounded px-1 text-[9.5px] font-mono mt-0.5 bg-white"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-700">Fresh Water :</span>
                <input
                  type="text"
                  value={declaration.freshWaterROB || '85 MT'}
                  onChange={e => handleChange('freshWaterROB', e.target.value)}
                  className="w-full border border-slate-300 rounded px-1 text-[9.5px] font-mono mt-0.5 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: GENERAL REMARKS & BIMCO RESERVATION CLAUSE */}
        <div className="mb-4">
          <div className="text-[10px] font-bold text-[#0f2c59] uppercase tracking-wide mb-1 flex justify-between items-center">
            <span>6. General Operational Remarks & Conditions</span>
            <span className="text-[8.5px] text-slate-500 italic">BIMCO Non-Prejudice Statement</span>
          </div>
          <textarea
            rows={2}
            value={declaration.sofremarks || ''}
            onChange={e => handleChange('sofremarks', e.target.value)}
            className="w-full border border-slate-300 rounded p-1.5 text-[10px] bg-slate-50/50 leading-relaxed text-slate-800"
            placeholder="Vessel berthed port side alongside. Cargo operations carried out with shore equipment in accordance with port regulations and customs. Weather condition fair, sea calm."
          />
          <div className="text-[8px] text-slate-500 italic mt-0.5 leading-tight">
            * This Statement of Facts is drawn up as a factual record of operational events and without prejudice to Charter Party terms and conditions.
          </div>
        </div>

        {/* SECTION 7: BIMCO JOINT SIGNATURES (3 PARTIES) */}
        <div className="grid grid-cols-3 gap-6 mt-8 pt-4 text-center text-[10px] border-t-2 border-[#0f2c59]">
          {/* Party 1: Master */}
          <div className="text-center pt-1">
            <div className="font-bold uppercase text-slate-900">
              {declaration.master || declaration.masterName || 'MASTER / CAPTAIN'}
            </div>
            <div className="text-[8.5px] text-slate-500 mt-0.5">
              Master of MV {declaration.vesselName || 'VESSEL'}
            </div>
            <div className="mt-8 border-t border-dashed border-slate-400 pt-1 text-[8px] text-slate-400">
              Signature & Ship's Stamp
            </div>
          </div>

          {/* Party 2: Charterer / Shipper / Receiver */}
          <div className="text-center pt-1">
            <div className="font-bold uppercase text-slate-900">
              CHARTERERS / RECEIVERS / SHIPPERS
            </div>
            <div className="text-[8.5px] text-slate-500 mt-0.5">
              Terminal / Stevedores Representative
            </div>
            <div className="mt-8 border-t border-dashed border-slate-400 pt-1 text-[8px] text-slate-400">
              Signature & Commercial Stamp
            </div>
          </div>

          {/* Party 3: SOCOTU Port Agent */}
          <div className="text-center pt-1">
            <div className="font-bold uppercase text-[#0f2c59]">
              SOCOTU — PORT AGENT
            </div>
            <div className="text-[8.5px] text-slate-500 mt-0.5">
              SOCIETE COMMERCIALE TUNISIENNE
            </div>
            <div className="mt-8 border-t border-dashed border-slate-400 pt-1 text-[8px] text-slate-400">
              Agent Visa & Official Stamp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
