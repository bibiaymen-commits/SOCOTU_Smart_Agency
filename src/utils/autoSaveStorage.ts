import { OfficialPdaModel, ArrivalDeclarationModel } from '../types/pda';

export const AUTOSAVE_PDA_KEY = 'SOCOTU_CURRENT_PDA_AUTOSAVE';
export const AUTOSAVE_DECLARATION_KEY = 'SOCOTU_DECLARATION_AUTOSAVE';
export const AUTOSAVE_SOF_KEY = 'SOCOTU_SOF_AUTOSAVE';
export const AUTOSAVE_META_KEY = 'SOCOTU_AUTOSAVE_METADATA';

export interface SofDraftModel {
  vesselName: string;
  portOfCall: string;
  portEvents?: Record<string, { date: string; time: string }>;
  stoppages?: Array<{
    id: string;
    fromDate: string;
    fromTime: string;
    toDate: string;
    toTime: string;
    reason: string;
  }>;
  nor?: string;
  pratique?: string;
  customs?: string;
  pilot?: string;
  firstline?: string;
  allfast?: string;
  cargoStart?: string;
  cargoEnd?: string;
  survey?: string;
  lastline?: string;
  departure?: string;
  sofremarks?: string;
  masterSignatureName?: string;
  updatedAt: string;
}

export interface AutoSaveMetadata {
  lastSavedAt: string; // ISO string
  pdaRef: string;
  vesselName: string;
  port: string;
}

/**
 * Extracts Statement of Facts (SOF) fields from the master arrival declaration
 */
export function extractSofState(decl: ArrivalDeclarationModel): SofDraftModel {
  return {
    vesselName: decl.vesselName || '',
    portOfCall: decl.portOfCall || '',
    portEvents: decl.portEvents || {},
    stoppages: decl.stoppages || [],
    nor: decl.nor || '',
    pratique: decl.pratique || '',
    customs: decl.customs || '',
    pilot: decl.pilot || '',
    firstline: decl.firstline || '',
    allfast: decl.allfast || '',
    cargoStart: decl.cargoStart || '',
    cargoEnd: decl.cargoEnd || '',
    survey: decl.survey || '',
    lastline: decl.lastline || '',
    departure: decl.departure || '',
    sofremarks: decl.sofremarks || '',
    masterSignatureName: decl.masterSignatureName || '',
    updatedAt: new Date().toISOString()
  };
}

/**
 * Merges saved SOF fields into an arrival declaration model
 */
export function mergeSofIntoDeclaration(
  decl: ArrivalDeclarationModel,
  sof: SofDraftModel
): ArrivalDeclarationModel {
  return {
    ...decl,
    portEvents: sof.portEvents && Object.keys(sof.portEvents).length > 0 ? sof.portEvents : decl.portEvents,
    stoppages: sof.stoppages && sof.stoppages.length > 0 ? sof.stoppages : decl.stoppages,
    nor: sof.nor !== undefined ? sof.nor : decl.nor,
    pratique: sof.pratique !== undefined ? sof.pratique : decl.pratique,
    customs: sof.customs !== undefined ? sof.customs : decl.customs,
    pilot: sof.pilot !== undefined ? sof.pilot : decl.pilot,
    firstline: sof.firstline !== undefined ? sof.firstline : decl.firstline,
    allfast: sof.allfast !== undefined ? sof.allfast : decl.allfast,
    cargoStart: sof.cargoStart !== undefined ? sof.cargoStart : decl.cargoStart,
    cargoEnd: sof.cargoEnd !== undefined ? sof.cargoEnd : decl.cargoEnd,
    survey: sof.survey !== undefined ? sof.survey : decl.survey,
    lastline: sof.lastline !== undefined ? sof.lastline : decl.lastline,
    departure: sof.departure !== undefined ? sof.departure : decl.departure,
    sofremarks: sof.sofremarks !== undefined ? sof.sofremarks : decl.sofremarks,
    masterSignatureName: sof.masterSignatureName !== undefined ? sof.masterSignatureName : decl.masterSignatureName
  };
}

/**
 * Saves current PDA, Declaration, and SOF states into localStorage
 */
export function saveCurrentStatesToLocalStorage(
  pda: OfficialPdaModel,
  declaration: ArrivalDeclarationModel
): AutoSaveMetadata {
  const now = new Date();
  const meta: AutoSaveMetadata = {
    lastSavedAt: now.toISOString(),
    pdaRef: pda.ref || 'PROFORMA',
    vesselName: pda.vessel?.name || declaration.vesselName || 'M/V VESSEL',
    port: pda.port || declaration.portOfCall || 'Sousse'
  };

  try {
    // 1. Persist PDA state
    localStorage.setItem(AUTOSAVE_PDA_KEY, JSON.stringify(pda));

    // 2. Persist Declaration state
    localStorage.setItem(AUTOSAVE_DECLARATION_KEY, JSON.stringify(declaration));

    // 3. Persist SOF state specifically
    const sofState = extractSofState(declaration);
    localStorage.setItem(AUTOSAVE_SOF_KEY, JSON.stringify(sofState));

    // 4. Persist metadata
    localStorage.setItem(AUTOSAVE_META_KEY, JSON.stringify(meta));
  } catch (err) {
    console.error('AutoSave localStorage error:', err);
  }

  return meta;
}

/**
 * Retrieves auto-saved session if available
 */
export function loadAutoSavedSession(): {
  pda: OfficialPdaModel | null;
  declaration: ArrivalDeclarationModel | null;
  sof: SofDraftModel | null;
  metadata: AutoSaveMetadata | null;
} {
  let pda: OfficialPdaModel | null = null;
  let declaration: ArrivalDeclarationModel | null = null;
  let sof: SofDraftModel | null = null;
  let metadata: AutoSaveMetadata | null = null;

  try {
    const rawMeta = localStorage.getItem(AUTOSAVE_META_KEY);
    if (rawMeta) {
      metadata = JSON.parse(rawMeta);
    }

    const rawPda = localStorage.getItem(AUTOSAVE_PDA_KEY);
    if (rawPda) {
      pda = JSON.parse(rawPda);
    }

    const rawDecl = localStorage.getItem(AUTOSAVE_DECLARATION_KEY);
    if (rawDecl) {
      declaration = JSON.parse(rawDecl);
    }

    const rawSof = localStorage.getItem(AUTOSAVE_SOF_KEY);
    if (rawSof) {
      sof = JSON.parse(rawSof);
    }

    if (declaration && sof) {
      declaration = mergeSofIntoDeclaration(declaration, sof);
    }
  } catch (err) {
    console.error('Error reading auto-saved session from localStorage:', err);
  }

  return { pda, declaration, sof, metadata };
}
