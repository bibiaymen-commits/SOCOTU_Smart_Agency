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
    const q = searchTerm.toLowerCase();
    return (
      pda.ref.toLowerCase().includes(q) ||
      pda.vessel.name.toLowerCase().includes(q) ||
      pda.port.toLowerCase().includes(q) ||
      pda.targetCurrency.toLowerCase().includes(q) ||
      (pda.vessel.cargo && pda.vessel.cargo.toLowerCase().includes(q))
    );
  });

  const uniqueVesselsCount = new Set(history.map(x => x.vessel.name).filter(Boolean)).size;
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
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
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

      {/* Search & Actions */}
      <div className="flex gap-2 flex-wrap items-center mb-3">
        <input
          type="text"
          placeholder="Search by vessel, reference, port, cargo..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[220px] p-2 border border-slate-300 rounded text-xs"
        />

        <button
          onClick={() => {
            if (window.confirm("Clear all local PDA archive history?")) {
              onClearHistory();
            }
          }}
          className="border-0 rounded px-3 py-2 text-xs font-bold cursor-pointer bg-red-600 hover:bg-red-700 text-white transition"
        >
          Clear History
        </button>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300 text-[10.5px]">
          <thead>
            <tr className="bg-slate-100 text-[#0f2c59] font-bold">
              <th className="border border-slate-300 p-1.5 text-left">Reference</th>
              <th className="border border-slate-300 p-1.5 text-center">Date</th>
              <th className="border border-slate-300 p-1.5 text-left">Vessel Name</th>
              <th className="border border-slate-300 p-1.5 text-left">Port</th>
              <th className="border border-slate-300 p-1.5 text-center">Currency</th>
              <th className="border border-slate-300 p-1.5 text-right">Total</th>
              <th className="border border-slate-300 p-1.5 text-center w-28">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={7} className="border border-slate-300 p-4 text-center text-slate-400 italic">
                  No saved proforma records found.
                </td>
              </tr>
            ) : (
              filteredHistory.map(item => (
                <tr key={item.ref} className="hover:bg-slate-50 transition">
                  <td className="border border-slate-300 p-1.5 font-mono font-bold text-blue-900">
                    {item.ref}
                  </td>
                  <td className="border border-slate-300 p-1.5 text-center font-mono">
                    {item.date}
                  </td>
                  <td className="border border-slate-300 p-1.5 font-semibold text-slate-900">
                    {item.vessel.name}
                  </td>
                  <td className="border border-slate-300 p-1.5">
                    {item.port}
                  </td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold font-mono">
                    {item.targetCurrency}
                  </td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono font-bold text-slate-900">
                    {formatNum(item.portExpenses.grandTotalTargetCurr)}
                  </td>
                  <td className="border border-slate-300 p-1.5 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => {
                          onLoadPda(item);
                          onClose();
                        }}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete proforma ${item.ref}?`)) {
                            onDeletePda(item.ref);
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition"
                        title="Delete this proforma"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
