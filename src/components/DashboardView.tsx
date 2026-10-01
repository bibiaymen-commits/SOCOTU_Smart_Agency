import React, { useState } from 'react';
import { OfficialPdaModel } from '../types/pda';
import { formatNum } from '../utils/calculations';

interface DashboardViewProps {
  history: OfficialPdaModel[];
  onLoadPda: (pda: OfficialPdaModel) => void;
  onDeletePda: (ref: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  history,
  onLoadPda,
  onDeletePda,
  onClearHistory,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(pda => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const vesselName = (pda.vessel?.name || '').toLowerCase();
    const imo = (pda.vessel?.imo || '').toLowerCase();
    const ref = (pda.ref || '').toLowerCase();
    const port = (pda.port || '').toLowerCase();
    const cargo = (pda.vessel?.cargo || '').toLowerCase();

    return (
      vesselName.includes(q) ||
      imo.includes(q) ||
      ref.includes(q) ||
      port.includes(q) ||
      cargo.includes(q)
    );
  });

  const uniqueVesselsCount = new Set(history.map(x => x.vessel?.name).filter(Boolean)).size;
  const latestPda = history[0];
  const latestTotalFormatted = latestPda 
    ? formatNum(latestPda.portExpenses.grandTotalTargetCurr) + ' ' + latestPda.targetCurrency
    : '0.000';
  const latestPort = latestPda ? latestPda.port : '—';

  return (
    <div className="max-w-[1000px] mx-auto my-3 bg-white rounded-lg p-4 shadow-lg border border-slate-200 print:hidden animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-[#0f2c59] m-0">Archive & History Dashboard</span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
            {history.length} Saved Records
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer leading-none"
          title="Close dashboard"
        >
          &times;
        </button>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="border border-slate-300 rounded-md p-2.5 bg-slate-50">
          <b className="block text-xl font-bold text-[#0f2c59]">{history.length}</b>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Saved PDAs</span>
        </div>

        <div className="border border-slate-300 rounded-md p-2.5 bg-slate-50">
          <b className="block text-xl font-bold text-[#0f2c59]">{uniqueVesselsCount}</b>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Distinct Vessels</span>
        </div>

        <div className="border border-slate-300 rounded-md p-2.5 bg-slate-50">
          <b className="block text-lg font-bold text-[#0f2c59] font-mono truncate">{latestTotalFormatted}</b>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Latest Grand Total</span>
        </div>

        <div className="border border-slate-300 rounded-md p-2.5 bg-slate-50">
          <b className="block text-lg font-bold text-[#0f2c59]">{latestPort}</b>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Latest Port</span>
        </div>
      </div>

      {/* Dedicated Search Input Field directly above the Archive & History Table */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              aria-label="Filter past PDAs by vessel name or IMO number"
              placeholder="Filter past PDAs by vessel name or IMO number (e.g. CARRIER, 9370094)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-md text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2c59] focus:border-transparent font-medium shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                title="Clear filter"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <span className="text-[11px] text-slate-600 font-medium">
              Showing <b className="text-[#0f2c59]">{filteredHistory.length}</b> of <b>{history.length}</b> PDAs
            </span>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to clear all local PDA archive history?")) {
                  onClearHistory();
                }
              }}
              className="rounded px-2.5 py-1.5 text-xs font-bold cursor-pointer bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
              title="Clear all saved records"
            >
              Clear History
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto border border-slate-300 rounded-md">
        <table className="w-full border-collapse text-[10.5px]">
          <thead>
            <tr className="bg-slate-100 text-[#0f2c59] font-bold">
              <th className="border-b border-r border-slate-300 p-2 text-left">Reference</th>
              <th className="border-b border-r border-slate-300 p-2 text-center">Date</th>
              <th className="border-b border-r border-slate-300 p-2 text-left">Vessel Name & IMO</th>
              <th className="border-b border-r border-slate-300 p-2 text-left">Port</th>
              <th className="border-b border-r border-slate-300 p-2 text-center">Currency</th>
              <th className="border-b border-r border-slate-300 p-2 text-right">Grand Total</th>
              <th className="border-b border-slate-300 p-2 text-center w-28">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500 italic bg-slate-50/50">
                  {searchTerm ? (
                    <div>
                      <p className="font-semibold text-slate-700">No past PDAs matched "{searchTerm}"</p>
                      <p className="text-[10px] text-slate-400 mt-1">Try searching by vessel name, IMO number, or reference.</p>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-2 text-[10.5px] text-blue-600 underline font-semibold cursor-pointer"
                      >
                        Reset search filter
                      </button>
                    </div>
                  ) : (
                    'No saved proforma records found.'
                  )}
                </td>
              </tr>
            ) : (
              filteredHistory.map((item, idx) => {
                const isLatest = item.ref === history[0]?.ref;
                return (
                <tr key={item.ref} className={`transition border-b border-slate-200 last:border-b-0 ${isLatest ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-blue-50/40'}`}>
                  <td className="p-2 border-r border-slate-200 font-mono font-bold text-blue-900">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{item.ref}</span>
                      {isLatest && (
                        <span className="text-[8.5px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-300 tracking-tight">
                          Dernière version
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-700">
                    {item.date}
                  </td>
                  <td className="p-2 border-r border-slate-200">
                    <div className="font-bold text-slate-900">{item.vessel?.name || 'Unnamed Vessel'}</div>
                    <div className="text-[9.5px] font-mono text-slate-500">
                      IMO: <span className="font-bold text-slate-700">{item.vessel?.imo || 'N/A'}</span>
                      {item.vessel?.flag && ` • ${item.vessel.flag}`}
                    </div>
                  </td>
                  <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">
                    {item.port}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-bold font-mono">
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                      {item.targetCurrency}
                    </span>
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                    {formatNum(item.portExpenses?.grandTotalTargetCurr || 0)}
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => {
                          onLoadPda(item);
                          onClose();
                        }}
                        className={`text-white text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer transition shadow-2xs ${
                          isLatest ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-[#0f2c59] hover:bg-[#1d4ed8]'
                        }`}
                        title={isLatest ? 'Ouvrir la dernière version active' : 'Ouvrir ce proforma'}
                      >
                        {isLatest ? 'Ouvrir' : 'Open'}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete proforma ${item.ref}?`)) {
                            onDeletePda(item.ref);
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-1 rounded cursor-pointer transition"
                        title="Delete this proforma"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              );})
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
