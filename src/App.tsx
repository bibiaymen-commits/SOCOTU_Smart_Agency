import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OfficialPdaContainer } from './components/OfficialPdaContainer';
import { DeclarationOfArrival } from './components/DeclarationOfArrival';
import { StatementOfFacts } from './components/StatementOfFacts';
import { BerthingRequest } from './components/BerthingRequest';
import { BillOfLading } from './components/BillOfLading';
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
  createDefaultBerthingRequest,
  CongenbillModel,
  createDefaultCongenbill
} from './types/pda';
import { createDefaultOfficialPda, SOCOTU_BRANCHES } from './data/tunisianPorts';
import { calculatePortDues, calculatePortExpenses, calcVesselMetrics, getDefaultMooringLines, getTodayIsoDate } from './utils/calculations';

const V6_KEY = 'SOCOTU_PDA_V6_HISTORY';
const DECLARATION_KEY = 'SOCOTU_ARRIVAL_DECLARATION';
const BERTHING_KEY = 'SOCOTU_BERTHING_REQUEST';
const CONGENBILL_KEY = 'SOCOTU_CONGENBILL_V1';

function ensureUpdatedPda(p: OfficialPdaModel): OfficialPdaModel {
  try {
    if (!p || !p.vessel) return createDefaultOfficialPda();
    
    // Automatically ensure date is present (defaults to today's date)
    const date = p.date || getTodayIsoDate();

    // If port dues or port expenses are missing, provide defaults while preserving user data
    if (!p.portDues || !p.portExpenses) {
      const def = createDefaultOfficialPda();
      return {
        ...def,
        ...p,
        date,
        vessel: { ...def.vessel, ...p.vessel },
        portDues: p.portDues || def.portDues,
        portExpenses: p.portExpenses || def.portExpenses
      };
    }

    // Preserve user data and guarantee automatic valid date
    return {
      ...p,
      date
    };
  } catch (e) {
    return p || createDefaultOfficialPda();
  }
}

export default function App() {
  const [activeVolet, setActiveVolet] = useState<'pda' | 'arrival' | 'sof' | 'berthing' | 'bol' | 'history'>('pda');

  const [history, setHistory] = useState<OfficialPdaModel[]>(() => {
    try {
      const stored = localStorage.getItem(V6_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(ensureUpdatedPda).sort((a, b) => {
            const timeA = a.savedAt ? new Date(a.savedAt).getTime() : 0;
            const timeB = b.savedAt ? new Date(b.savedAt).getTime() : 0;
            return timeB - timeA;
          });
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
      const autoSaved = loadAutoSavedSession();
      if (autoSaved.berthing) {
        return autoSaved.berthing;
      }
      const stored = localStorage.getItem(BERTHING_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load berthing request from localStorage:', e);
    }
    return createDefaultBerthingRequest(currentPda);
  });

  const [congenbill, setCongenbill] = useState<CongenbillModel>(() => {
    try {
      const stored = localStorage.getItem(CONGENBILL_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load congenbill from localStorage:', e);
    }
    return createDefaultCongenbill(currentPda, arrivalDeclaration);
  });

  // Dedicated Auto-Save Hook: immediately persists PDA, Declaration, SOF, and Berthing states on any change
  const { lastSavedAt, isSaving, saveNow } = useAutoSave(
    currentPda,
    arrivalDeclaration,
    berthingRequest,
    (meta) => {
      setHistory(prev => {
        const idx = prev.findIndex(item => item.ref === currentPda.ref);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...currentPda, savedAt: meta.lastSavedAt };
          return copy;
        }
        return [{ ...currentPda, savedAt: meta.lastSavedAt }, ...prev];
      });
    }
  );

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

  // Auto-sync congenbill with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CONGENBILL_KEY, JSON.stringify(congenbill));
    } catch (e) {
      console.error('Failed to save congenbill to localStorage:', e);
    }
  }, [congenbill]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleUpdateCongenbill = (updated: CongenbillModel) => {
    setCongenbill(updated);
  };

  // 1. Sync from PDA to Declaration, Berthing & Congenbill
  const handleUpdatePda = (updated: OfficialPdaModel) => {
    setCurrentPda(updated);
    setHistory(prev => {
      const existingIdx = prev.findIndex(item => item.ref === updated.ref);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });

    // Auto-sync to Congenbill
    setCongenbill(prev => ({
      ...prev,
      oceanVessel: updated.vessel?.name ?? prev.oceanVessel,
      portOfDischarge: `PORT OF ${(updated.port || 'SOUSSE').toUpperCase()}, TUNISIA`,
      grossWeightKg: updated.vessel?.weightCargo ?? prev.grossWeightKg,
      descriptionOfPackagesAndGoods: updated.vessel?.cargo
        ? `BULK CARGO SAID TO BE:\n${updated.vessel.cargo.toUpperCase()}`
        : prev.descriptionOfPackagesAndGoods
    }));

    // Auto-sync to Arrival Declaration
    setArrivalDeclaration(prev => ({
      ...prev,
      vesselName: updated.vessel?.name ?? prev.vesselName,
      portOfCall: updated.port || prev.portOfCall,
      imoNumber: updated.vessel?.imo ?? prev.imoNumber,
      callSign: updated.vessel?.callSign ?? prev.callSign,
      flag: updated.vessel?.flag ?? prev.flag,
      grt: updated.vessel?.grt || prev.grt,
      nrt: updated.vessel?.nrt || prev.nrt,
      loa: updated.vessel?.loa || prev.loa,
      beam: updated.vessel?.beam || prev.beam,
      volume: updated.vessel?.volume || prev.volume,
      draft: updated.vessel?.draft || prev.draft,
      arrivalDraftAft: updated.vessel?.actualDraft || updated.vessel?.draft || prev.arrivalDraftAft,
      cargoNature: updated.vessel?.cargo ?? prev.cargoNature,
      cargo: updated.vessel?.cargo ?? prev.cargo,
      cargoOperation: updated.vessel?.cargoOperation || prev.cargoOperation,
      cargoQuantityDischarge: updated.vessel?.weightCargo ?? prev.cargoQuantityDischarge,
      qty: updated.vessel?.weightCargo ?? prev.qty,
      shipOwner: updated.vesselOwner ?? prev.shipOwner,
      owner: updated.vesselOwner ?? prev.owner
    }));

    // Auto-sync to Berthing Request
    setBerthingRequest(prev => {
      const portName = updated.port || prev.port;
      const cityName = portName.toUpperCase();
      const vName = updated.vessel?.name || prev.vesselName;

      let accostageStr = '';
      if (updated.vessel?.cargo || updated.vessel?.weightCargo) {
        const op = updated.vessel?.cargoOperation === 'Loading' ? 'EMBARQUEMENT' : 'DEBARQUEMENT';
        const weight = updated.vessel?.weightCargo || '';
        const cargo = updated.vessel?.cargo || '';
        accostageStr = `${op} ${weight} ${cargo}`.trim();
      }

      return {
        ...prev,
        port: portName,
        city: cityName,
        recipient: `Monsieur le Commandant Du Port De ${portName}`,
        vesselName: vName,
        accostagePour: accostageStr || prev.accostagePour,
        agencySignOff: `SOCOTU ${cityName}`,
        loa: updated.vessel?.loa || prev.loa,
        beam: updated.vessel?.beam || prev.beam,
        maxDraft: updated.vessel?.draft || updated.vessel?.actualDraft || prev.maxDraft
      };
    });
  };

  // 2. Sync from Declaration / SOF to PDA and Berthing
  const handleUpdateDeclaration = (updated: ArrivalDeclarationModel) => {
    setArrivalDeclaration(updated);

    // Sync back to PDA
    setCurrentPda(prevPda => {
      let v = { ...prevPda.vessel };
      let changed = false;

      if (updated.vesselName !== undefined && updated.vesselName !== v.name) {
        v.name = updated.vesselName;
        changed = true;
      }
      if (updated.imoNumber !== undefined && updated.imoNumber !== v.imo) {
        v.imo = updated.imoNumber;
        changed = true;
      }
      if (updated.callSign !== undefined && updated.callSign !== v.callSign) {
        v.callSign = updated.callSign;
        changed = true;
      }
      if (updated.flag !== undefined && updated.flag !== v.flag) {
        v.flag = updated.flag;
        changed = true;
      }
      if (updated.grt && updated.grt !== v.grt) {
        v.grt = updated.grt;
        changed = true;
      }
      if (updated.nrt && updated.nrt !== v.nrt) {
        v.nrt = updated.nrt;
        changed = true;
      }
      if (updated.loa && updated.loa !== v.loa) {
        v.loa = updated.loa;
        changed = true;
      }
      if (updated.beam && updated.beam !== v.beam) {
        v.beam = updated.beam;
        changed = true;
      }
      const newDraft = updated.draft || updated.arrivalDraftAft;
      if (newDraft && newDraft !== v.draft) {
        v.draft = newDraft;
        changed = true;
      }
      const newCargo = updated.cargoNature ?? updated.cargo;
      if (newCargo !== undefined && newCargo !== v.cargo) {
        v.cargo = newCargo;
        changed = true;
      }
      if (updated.cargoOperation && updated.cargoOperation !== v.cargoOperation) {
        v.cargoOperation = updated.cargoOperation;
        changed = true;
      }
      const newQty = updated.cargoQuantityDischarge ?? updated.qty;
      if (newQty !== undefined && newQty !== v.weightCargo) {
        v.weightCargo = newQty;
        changed = true;
      }
      const newOwner = updated.shipOwner ?? updated.owner;
      let newPdaOwner = prevPda.vesselOwner;
      if (newOwner !== undefined && newOwner !== prevPda.vesselOwner) {
        newPdaOwner = newOwner;
        changed = true;
      }
      let newPort = prevPda.port;
      if (updated.portOfCall && updated.portOfCall !== prevPda.port) {
        newPort = updated.portOfCall;
        changed = true;
      }

      if (!changed) return prevPda;

      const metrics = calcVesselMetrics(v.loa, v.beam, v.draft);
      v.theorDraft = metrics.theorDraft;
      v.actualDraft = metrics.actualDraft;
      v.volume = metrics.volume;
      v.bracketName = metrics.bracketName;

      return {
        ...prevPda,
        port: newPort,
        vesselOwner: newPdaOwner,
        vessel: v
      };
    });

    // Sync back to Berthing Request
    setBerthingRequest(prevBerthing => {
      const portName = updated.portOfCall || prevBerthing.port;
      const cityName = portName.toUpperCase();
      let berthingDate = prevBerthing.berthingDate;
      let berthingTime = prevBerthing.berthingTime;

      // Extract date and time from berthedAllFast / allFastTime if available
      const allFastVal = updated.berthedAllFast || updated.allFastTime || updated.allfast;
      if (allFastVal) {
        const m = allFastVal.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
        if (m) {
          const [, y, mo, d, h, mi] = m;
          berthingDate = `${d}/${mo}/${y}`;
          if (h && mi) berthingTime = `${h}:${mi}`;
        }
      }

      let accostageStr = prevBerthing.accostagePour;
      const cargoName = updated.cargoNature || updated.cargo;
      const cargoQty = updated.cargoQuantityDischarge || updated.qty;
      if (cargoName || cargoQty) {
        const op = updated.cargoOperation === 'Loading' ? 'EMBARQUEMENT' : 'DEBARQUEMENT';
        accostageStr = `${op} ${cargoQty || ''} ${cargoName || ''}`.trim();
      }

      return {
        ...prevBerthing,
        port: portName,
        city: cityName,
        recipient: `Monsieur le Commandant Du Port De ${portName}`,
        vesselName: updated.vesselName || prevBerthing.vesselName,
        desiredBerth: updated.berthAssigned || prevBerthing.desiredBerth,
        loa: updated.loa || prevBerthing.loa,
        beam: updated.beam || prevBerthing.beam,
        maxDraft: updated.draft || updated.arrivalDraftAft || prevBerthing.maxDraft,
        berthingDate,
        berthingTime,
        accostagePour: accostageStr,
        agencySignOff: `SOCOTU ${cityName}`
      };
    });

    // Sync back to Congenbill
    setCongenbill(prev => ({
      ...prev,
      oceanVessel: updated.vesselName || prev.oceanVessel,
      portOfLoading: updated.lastPort || prev.portOfLoading,
      portOfDischarge: `PORT OF ${(updated.portOfCall || 'SOUSSE').toUpperCase()}, TUNISIA`,
      grossWeightKg: updated.qty || updated.cargoQuantityDischarge || prev.grossWeightKg,
      descriptionOfPackagesAndGoods: updated.cargo
        ? `BULK CARGO SAID TO BE:\n${updated.cargo.toUpperCase()}`
        : prev.descriptionOfPackagesAndGoods,
      masterName: updated.master || updated.masterName || prev.masterName,
      freightPayableAsPerCharterPartyDate: updated.charterpartyDate || prev.freightPayableAsPerCharterPartyDate
    }));
  };

  // 3. Sync from Berthing Request to PDA and Declaration
  const handleUpdateBerthing = (updated: BerthingRequestModel) => {
    setBerthingRequest(updated);

    // Sync back to PDA
    setCurrentPda(prevPda => {
      let v = { ...prevPda.vessel };
      let changed = false;

      if (updated.vesselName && updated.vesselName !== v.name) {
        v.name = updated.vesselName;
        changed = true;
      }
      if (updated.port && updated.port !== prevPda.port) {
        changed = true;
      }
      if (updated.loa && updated.loa !== v.loa) {
        v.loa = updated.loa;
        changed = true;
      }
      if (updated.beam && updated.beam !== v.beam) {
        v.beam = updated.beam;
        changed = true;
      }
      if (updated.maxDraft && updated.maxDraft !== v.draft) {
        v.draft = updated.maxDraft;
        changed = true;
      }

      if (!changed) return prevPda;

      const metrics = calcVesselMetrics(v.loa, v.beam, v.draft);
      v.theorDraft = metrics.theorDraft;
      v.actualDraft = metrics.actualDraft;
      v.volume = metrics.volume;
      v.bracketName = metrics.bracketName;

      return {
        ...prevPda,
        port: updated.port || prevPda.port,
        vessel: v
      };
    });

    // Sync back to Declaration
    setArrivalDeclaration(prevDecl => ({
      ...prevDecl,
      vesselName: updated.vesselName || prevDecl.vesselName,
      portOfCall: updated.port || prevDecl.portOfCall,
      berthAssigned: updated.desiredBerth || prevDecl.berthAssigned,
      loa: updated.loa || prevDecl.loa,
      beam: updated.beam || prevDecl.beam,
      draft: updated.maxDraft || prevDecl.draft,
      arrivalDraftAft: updated.maxDraft || prevDecl.arrivalDraftAft
    }));
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
    } else if (activeVolet === 'bol') {
      try {
        localStorage.setItem(CONGENBILL_KEY, JSON.stringify(congenbill));
        showToast('✓ Bill of Lading (CONGENBILL 94) enregistré avec succès');
      } catch (e) {
        showToast('Error saving Bill of Lading');
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
            onClick={() => setActiveVolet('bol')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeVolet === 'bol'
                ? 'bg-[#0f2c59] text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📜</span>
            <span>5. Bill of Lading (CONGENBILL 94)</span>
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

        {/* Real-time Auto-Save Indicator */}
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
            onUpdateDeclaration={handleUpdateDeclaration}
            onBackToPda={() => setActiveVolet('pda')}
            onGoToSof={() => setActiveVolet('sof')}
            onGoToBerthing={() => setActiveVolet('berthing')}
            onGoToBol={() => setActiveVolet('bol')}
          />
        )}

        {activeVolet === 'sof' && (
          <StatementOfFacts
            pda={currentPda}
            declaration={arrivalDeclaration}
            onUpdateDeclaration={handleUpdateDeclaration}
            onBackToPda={() => setActiveVolet('pda')}
            onGoToBerthing={() => setActiveVolet('berthing')}
            onGoToBol={() => setActiveVolet('bol')}
          />
        )}

        {activeVolet === 'berthing' && (
          <BerthingRequest
            pda={currentPda}
            berthing={berthingRequest}
            onUpdateBerthing={handleUpdateBerthing}
            onBackToPda={() => setActiveVolet('pda')}
            onGoToArrival={() => setActiveVolet('arrival')}
          />
        )}

        {activeVolet === 'bol' && (
          <BillOfLading
            pda={currentPda}
            declaration={arrivalDeclaration}
            congenbill={congenbill}
            onUpdateCongenbill={handleUpdateCongenbill}
            onUpdateDeclaration={handleUpdateDeclaration}
            onUpdatePda={handleUpdatePda}
            onBackToPda={() => setActiveVolet('pda')}
            onGoToArrival={() => setActiveVolet('arrival')}
            onGoToSof={() => setActiveVolet('sof')}
          />
        )}

        {activeVolet === 'pda' && (
          <OfficialPdaContainer
            pda={currentPda}
            onUpdatePda={handleUpdatePda}
          />
        )}
      </main>

      {/* Bar d'actions inférieure fixe & toujours visible : Print, Save (print:hidden) */}
      <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md py-3 px-4 border-t-2 border-slate-300 shadow-2xl print:hidden mt-8">
        <div className="max-w-[1000px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Les 2 boutons principaux actifs */}
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
              title="Save document locally"
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
