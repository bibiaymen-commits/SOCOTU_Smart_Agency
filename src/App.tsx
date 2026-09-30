import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OfficialPdaContainer } from './components/OfficialPdaContainer';
import { DeclarationOfArrival } from './components/DeclarationOfArrival';
import { StatementOfFacts } from './components/StatementOfFacts';
import { BerthingRequest } from './components/BerthingRequest';
import { DashboardView } from './components/DashboardView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AutoSaveIndicator } from './components/AutoSaveIndicator';
import { useAutoSave } from './hooks/useAutoSave';
import { loadAutoSavedSession } from './utils/autoSaveStorage';
import { exportToPdf, generatePdfBlob } from './utils/pdfExport';
import {
  OfficialPdaModel,
  ArrivalDeclarationModel,
  createDefaultArrivalDeclaration,
  BerthingRequestModel,
  createDefaultBerthingRequest
} from './types/pda';
import { createDefaultOfficialPda, SOCOTU_BRANCHES } from './data/tunisianPorts';
import { calculatePortDues, calculatePortExpenses, calcVesselMetrics, getDefaultMooringLines } from './utils/calculations';

const V6_KEY = 'SOCOTU_PDA_V6_HISTORY';
const DECLARATION_KEY = 'SOCOTU_ARRIVAL_DECLARATION';
const BERTHING_KEY = 'SOCOTU_BERTHING_REQUEST';

function ensureUpdatedPda(p: OfficialPdaModel): OfficialPdaModel {
  try {
    if (!p || !p.vessel || !p.portDues) return createDefaultOfficialPda();
    
    // Auto-update to new official vessel dimensions if at old placeholder
    let vessel = p.vessel;
    if (vessel.loa === 127.87 || vessel.loa === 105.5 || vessel.loa === 138.07 || vessel.loa === 140.00 || !vessel.loa) {
      const loa = 160.00;
      const beam = 21.00;
      const draft = 8.38;
      const metrics = calcVesselMetrics(loa, beam, draft);
      vessel = {
        ...vessel,
        loa,
        beam,
        draft,
        theorDraft: metrics.theorDraft,
        actualDraft: metrics.actualDraft,
        volume: metrics.volume,
        bracketName: metrics.bracketName,
        grt: 9556,
        nrt: 4378,
        imo: '9370094',
        callSign: '8PSO7',
        flag: ''
      };
    }

    const nStayDays = (p.portDues.nStay === 4 || p.portDues.nStay === 5 || !p.portDues.nStay) ? 2 : p.portDues.nStay;
    const defaultLines = p.portExpenses?.nMooringLines ?? p.portDues?.nMooring ?? getDefaultMooringLines(vessel.volume);
    const newPortDues = calculatePortDues(
      vessel.volume,
      p.portDues.nShelter,
      nStayDays,
      p.portDues.nPilot,
      p.portDues.nTug,
      defaultLines,
      p.portDues.mooringPeriod ?? '0',
      0
    );
    // Recalculate accurate JORT N°90 Lamanage (90 € + lines × rate) × 1.19 strictly according to Volume (V)
    const uMooring = newPortDues.combinedMooringTotalEUR;
    const nMooring = (p.portExpenses?.nMooring && p.portExpenses.nMooring !== defaultLines) ? p.portExpenses.nMooring : 2;

    const newPortExpenses = calculatePortExpenses(
      newPortDues.subtotalPortDuesEUR,
      uMooring,
      nMooring,
      p.portExpenses?.uWatchEUR ?? 178.50,
      p.portExpenses?.nWatch ?? nStayDays,
      p.portExpenses?.uGarbEUR ?? 150,
      p.portExpenses?.nGarb ?? 1,
      p.portExpenses?.agencyFeesEUR ?? 1500,
      p.portExpenses?.currencyControlRate ?? 0,
      p.portExpenses?.additionalServices ?? [],
      p.exchangeRate ?? 1.20,
      defaultLines
    );
    let restrictions = p.restrictions;
    if (!restrictions || p.port === 'Sousse' && (restrictions.includes('160.00') || restrictions.includes('Salt or Silica Sand'))) {
      restrictions = SOCOTU_BRANCHES.Sousse.restrictions;
    }

    return {
      ...p,
      vessel,
      restrictions,
      portDues: newPortDues,
      portExpenses: newPortExpenses
    };
  } catch (e) {
    return p;
  }
}

export default function App() {
  const [activeVolet, setActiveVolet] = useState<'pda' | 'arrival' | 'sof' | 'berthing' | 'history'>('pda');

  const [history, setHistory] = useState<OfficialPdaModel[]>(() => {
    try {
      const stored = localStorage.getItem(V6_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(ensureUpdatedPda);
        }
      }
    } catch (e) {
      console.error('Failed to load history from localStorage:', e);
    }
    return [createDefaultOfficialPda()];
  });

  const [currentPda, setCurrentPda] = useState<OfficialPdaModel>(() => {
    try {
      const autoSaved = loadAutoSavedSession();
      if (autoSaved.pda) {
        return ensureUpdatedPda(autoSaved.pda);
      }
    } catch (e) {
      console.warn('Failed to restore auto-saved PDA:', e);
    }
    return ensureUpdatedPda(history[0] || createDefaultOfficialPda());
  });

  const [arrivalDeclaration, setArrivalDeclaration] = useState<ArrivalDeclarationModel>(() => {
    try {
      const autoSaved = loadAutoSavedSession();
      if (autoSaved.declaration) {
        return autoSaved.declaration;
      }
      const stored = localStorage.getItem(DECLARATION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load declaration from localStorage:', e);
    }
    return createDefaultArrivalDeclaration(currentPda);
  });

  const [berthingRequest, setBerthingRequest] = useState<BerthingRequestModel>(() => {
    try {
      const stored = localStorage.getItem(BERTHING_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load berthing request from localStorage:', e);
    }
    return createDefaultBerthingRequest(currentPda);
  });

  // Dedicated Auto-Save Hook: persists PDA, Declaration, and SOF states every 30 seconds
  const { lastSavedAt, isSaving, saveNow } = useAutoSave(currentPda, arrivalDeclaration);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-sync history with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(V6_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage:', e);
    }
  }, [history]);

  // Auto-sync declaration with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DECLARATION_KEY, JSON.stringify(arrivalDeclaration));
    } catch (e) {
      console.error('Failed to save declaration to localStorage:', e);
    }
  }, [arrivalDeclaration]);

  // Auto-sync berthing request with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BERTHING_KEY, JSON.stringify(berthingRequest));
    } catch (e) {
      console.error('Failed to save berthing request to localStorage:', e);
    }
  }, [berthingRequest]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Sync vessel name, cargo, weight and port to arrival declaration & berthing request when PDA changes
  const handleUpdatePda = (updated: OfficialPdaModel) => {
    setCurrentPda(updated);
    setArrivalDeclaration(prev => ({
      ...prev,
      vesselName: updated.vessel.name || prev.vesselName,
      portOfCall: updated.port || prev.portOfCall,
      imoNumber: updated.vessel.imo || prev.imoNumber,
      callSign: updated.vessel.callSign || prev.callSign,
      flag: updated.vessel.flag || prev.flag,
      grt: updated.vessel.grt || prev.grt,
      nrt: updated.vessel.nrt || prev.nrt,
      loa: updated.vessel.loa || prev.loa,
      beam: updated.vessel.beam || prev.beam,
      volume: updated.vessel.volume || prev.volume,
      arrivalDraftAft: updated.vessel.actualDraft || prev.arrivalDraftAft,
      cargoNature: updated.vessel.cargo || prev.cargoNature,
      cargoOperation: updated.vessel.cargoOperation || prev.cargoOperation,
      cargoQuantityDischarge: updated.vessel.weightCargo || prev.cargoQuantityDischarge
    }));

    setBerthingRequest(prev => {
      const portName = updated.port || prev.port;
      const cityName = portName.toUpperCase();

      let vesselStr = prev.vesselName;
      if (updated.vessel?.name) {
        const raw = updated.vessel.name.trim();
        vesselStr = raw.toUpperCase().startsWith('M/V') || raw.toUpperCase().startsWith('MV')
          ? raw
          : `M/V « ${raw} »`;
      }

      // Synchronize cargaison (cargo) and poids (weight) with PDA
      const op = updated.vessel?.cargoOperation === 'Discharging' ? 'DEBARQUEMENT' : 'EMBARQUEMENT';
      const weightRaw = updated.vessel?.weightCargo ? updated.vessel.weightCargo.replace(/\s*MTS/i, '').trim() : '7500';
      const cargoName = updated.vessel?.cargo ? updated.vessel.cargo : 'sable';
      const accostageStr = `${op} ${weightRaw} MTS ${cargoName}  EN VRAC`;

      return {
        ...prev,
        port: portName,
        city: cityName,
        recipient: `Monsieur le Commandant Du Port De ${portName}`,
        vesselName: vesselStr,
        accostagePour: accostageStr,
        agencySignOff: `SOCOTU ${cityName}`,
        loa: updated.vessel.loa || prev.loa,
        beam: updated.vessel.beam || prev.beam,
        maxDraft: updated.vessel.draft || updated.vessel.actualDraft || prev.maxDraft
      };
    });
  };

  // Save current PDA
  const handleSavePda = () => {
    const updated = { ...currentPda, savedAt: new Date().toISOString() };
    setHistory(prev => {
      const existingIdx = prev.findIndex(item => item.ref === updated.ref);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = updated;
        return copy;
      } else {
        return [updated, ...prev];
      }
    });
    saveNow();
    showToast('✓ Proforma saved successfully');
  };

  // Save active view
  const handleSaveActive = () => {
    saveNow();
    if (activeVolet === 'arrival' || activeVolet === 'sof') {
      try {
        localStorage.setItem(DECLARATION_KEY, JSON.stringify(arrivalDeclaration));
        localStorage.setItem('socotu_arrival_v3', JSON.stringify(arrivalDeclaration));
        showToast(activeVolet === 'sof' ? '✓ Statement of Facts saved successfully' : '✓ Master Declaration saved successfully');
      } catch (e) {
        showToast('Error saving data');
      }
    } else if (activeVolet === 'berthing') {
      try {
        localStorage.setItem(BERTHING_KEY, JSON.stringify(berthingRequest));
        showToast('✓ Demande d\'accostage enregistrée avec succès');
      } catch (e) {
        showToast('Error saving berthing request');
      }
    } else {
      handleSavePda();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#e2e8f0] text-[#1e293b] font-sans antialiased text-[11px] p-2 sm:p-3 print:p-0 print:bg-white pb-10">
      {/* Top Header */}
      <Header />

      {/* Discrete Offline Indicator */}
      <OfflineIndicator />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed right-4 bottom-6 bg-[#0f2c59] text-white py-2.5 px-4 rounded-xl shadow-2xl z-50 animate-bounce text-xs font-bold border border-amber-400 print:hidden flex items-center gap-2">
          <span>✅</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Tabs & Auto-Save Status */}
      <div className="max-w-[1000px] mx-auto my-2.5 flex items-center justify-between gap-2 flex-wrap print:hidden">
        <div className="inline-flex rounded-lg bg-white p-1 border border-slate-300 shadow-sm text-xs font-bold gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveVolet('pda')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeVolet === 'pda'
                ? 'bg-[#0f2c59] text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📄</span>
            <span>1. Proforma (PDA)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveVolet('arrival')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeVolet === 'arrival'
                ? 'bg-[#0f2c59] text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🚢</span>
            <span>2. Master's Declaration</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveVolet('sof')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeVolet === 'sof'
                ? 'bg-[#0f2c59] text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>⏱️</span>
            <span>3. Statement of Facts (SOF)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveVolet('berthing')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeVolet === 'berthing'
                ? 'bg-[#0f2c59] text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>⚓</span>
            <span>4. Demande d'accostage</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveVolet('history')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeVolet === 'history'
                ? 'bg-[#0f2c59] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📊</span>
            <span>Archive & History</span>
          </button>
        </div>

        {/* Real-time Auto-Save Indicator (Persists every 30s) */}
        <div className="flex items-center gap-2">
          <AutoSaveIndicator
            lastSavedAt={lastSavedAt}
            isSaving={isSaving}
            onSaveNow={saveNow}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main>
        {activeVolet === 'history' && (
          <DashboardView
            history={history}
            onLoadPda={(selected) => {
              handleUpdatePda(ensureUpdatedPda(selected));
              setActiveVolet('pda');
              showToast(`Loaded ${selected.ref}`);
            }}
            onDeletePda={(ref) => {
              setHistory(prev => prev.filter(item => item.ref !== ref));
              showToast(`Deleted ${ref}`);
            }}
            onClearHistory={() => {
              setHistory([createDefaultOfficialPda()]);
              showToast('History cleared');
            }}
            onClose={() => setActiveVolet('pda')}
          />
        )}

        {activeVolet === 'arrival' && (
          <DeclarationOfArrival
            pda={currentPda}
            declaration={arrivalDeclaration}
            onUpdateDeclaration={setArrivalDeclaration}
            onBackToPda={() => setActiveVolet('pda')}
            onGoToSof={() => setActiveVolet('sof')}
            onGoToBerthing={() => setActiveVolet('berthing')}
          />
        )}

        {activeVolet === 'sof' && (
          <StatementOfFacts
            pda={currentPda}
            declaration={arrivalDeclaration}
            onUpdateDeclaration={setArrivalDeclaration}
            onBackToPda={() => setActiveVolet('pda')}
            onGoToBerthing={() => setActiveVolet('berthing')}
          />
        )}

        {activeVolet === 'berthing' && (
          <BerthingRequest
            pda={currentPda}
            berthing={berthingRequest}
            onUpdateBerthing={setBerthingRequest}
            onBackToPda={() => setActiveVolet('pda')}
            onGoToArrival={() => setActiveVolet('arrival')}
          />
        )}

        {activeVolet === 'pda' && (
          <OfficialPdaContainer
            pda={currentPda}
            onUpdatePda={handleUpdatePda}
          />
        )}
      </main>

      {/* Bar d'actions inférieure fixe & toujours visible : Print, Save, Share (print:hidden) */}
      <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md py-3 px-4 border-t-2 border-slate-300 shadow-2xl print:hidden mt-8">
        <div className="max-w-[1000px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Les 3 boutons principaux actifs */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start flex-wrap">
            {/* 1. Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#0f2c59] hover:bg-[#1d4ed8] active:bg-blue-900 cursor-pointer text-white px-6 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 border border-blue-900 grow sm:grow-0 justify-center"
              title="Print document"
            >
              <span className="text-base">🖨️</span>
              <span>Print</span>
            </button>

            {/* 2. Save */}
            <button
              type="button"
              onClick={handleSaveActive}
              className="bg-[#059669] hover:bg-[#047857] active:bg-emerald-900 cursor-pointer text-white px-6 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 border border-emerald-700 grow sm:grow-0 justify-center"
              title="Save document"
            >
              <span className="text-base">💾</span>
              <span>Save</span>
            </button>
          </div>

          {/* Statut de sauvegarde discret */}
          <div className="text-[10.5px] text-slate-600 flex items-center gap-1.5 font-medium shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              {lastSavedAt ? (
                <>Données actives & sauvegardées à {lastSavedAt.toLocaleTimeString()}</>
              ) : (
                <>Sauvegarde automatique active</>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
