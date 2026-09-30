export type PortId = 
  | 'Sousse'
  | 'Sfax'
  | 'Rades'
  | 'Bizerte'
  | 'Gabes';

export type MooringPeriod = '0' | '0.50_night' | '0.50_holiday' | '1.00_night_holiday';

export type TargetCurrency = 'USD' | 'EUR' | 'TND' | 'AED' | 'GBP';

export interface ServiceItem {
  id: string;
  category: 'Vessel' | 'Cargo' | 'Crew' | 'Other';
  name: string;
  quantity: number;
  unit: string;
  unitPriceEUR: number;
  totalEUR: number;
}

export type CargoOperation = 'Loading' | 'Discharging' | 'Formalities' | 'Transit';

export interface VesselSpecs {
  name: string;
  flag?: string; // Flag / Pavillon
  imo: string;
  callSign: string;
  loa: number; // meters
  beam: number; // meters
  draft: number; // meters (Summer Draft)
  theorDraft: number; // 0.14 * sqrt(loa * beam)
  actualDraft: number; // max(draft, theorDraft)
  volume: number; // ceil(loa * beam * actualDraft)
  bracketName: string;
  grt: number;
  nrt: number;
  weightCargo: string;
  cargo: string;
  cargoOperation?: CargoOperation;
  to: string;
  attn: string;
}

export interface PortDuesCalculation {
  shelterUnitEUR: number;
  nShelter: number;
  tShelter: number;
  ispsShelter: number;
  vatShelter: number;
  totShelter: number;

  stayUnitEUR: number;
  nStay: number;
  tStay: number;
  ispsStay: number;
  vatStay: number;
  totStay: number;

  pilotUnitEUR: number;
  nPilot: number;
  tPilot: number;
  vatPilot: number;
  totPilot: number;

  tugUnitEUR: number;
  nTug: number;
  tTug: number;
  vatTug: number;
  totTug: number;
  tugBracketLabel: string;

  // ISPS after Remorquage: 5% on Shelter (line 1)
  ispsShelterUnitEUR: number;
  nIspsShelter: number;
  tIspsShelter: number;
  vatIspsShelter: number;
  totIspsShelter: number;

  // ISPS after Remorquage: 5% on Stay Dues (line 2)
  ispsStayUnitEUR: number;
  nIspsStay: number;
  tIspsStay: number;
  vatIspsStay: number;
  totIspsStay: number;

  // Aggregate ISPS (for backward compatibility)
  ispsUnitEUR?: number;
  nIsps?: number;
  tIsps?: number;
  vatIsps?: number;
  totIsps?: number;

  mooringUnitEUR: number;
  mooringPeriod: MooringPeriod;
  mooringSurchargeRate: number;
  mooringRateEffectiveEUR: number;
  nMooring: number;
  tMooring: number;
  vatMooring: number;
  totMooring: number;
  mooringBracketLabel: string;

  lamanageBoatUnitEUR: number;
  nLamanageBoat: number;
  tLamanageBoat: number;
  vatLamanageBoat: number;
  totLamanageBoat: number;

  // Combined Mooring & Boat (Lamanage / Mooring-Unmooring & Boat)
  combinedMooringTotalEUR: number;
  combinedMooringVatEUR: number;
  combinedMooringGrandTotalEUR: number;

  subtotalPortDuesEUR: number;
}

export interface PortExpensesCalculation {
  uMooringEUR: number;
  nMooring: number;
  nMooringLines?: number; // Nombre d'amarres (JORT N°90 du 04/09/2020)
  tMooring: number;
  vatMooring: number;
  totMooring: number;

  uWatchEUR: number;
  nWatch: number;
  tWatch: number;
  vatWatch: number;
  totWatch: number;

  uGarbEUR: number;
  nGarb: number;
  tGarb: number;
  vatGarb: number; // 0
  totGarb: number;

  agencyFeesEUR: number;
  currencyControlRate: number; // 0, 1, 2, 3 (%)
  currencyControlChargeEUR: number;

  additionalServices: ServiceItem[];
  additionalServicesTotalEUR: number;

  subtotalPortExpensesEUR: number;
  grandTotalEUR: number;
  grandTotalTargetCurr: number;
}

export interface OfficialPdaModel {
  id: string;
  ref: string;
  date: string;
  port: PortId;
  branchName: string;
  vessel: VesselSpecs;
  targetCurrency: TargetCurrency;
  exchangeRate: number; // e.g. 1.200 (EUR to USD) or 3.42 (EUR to TND)
  portDues: PortDuesCalculation;
  portExpenses: PortExpensesCalculation;
  selectedServicesList: string[]; // V7 services list
  bankDetails: {
    companyName: string;
    bankName: string;
    branch: string;
    swift: string;
    accNum: string;
    iban: string;
  };
  restrictions: string;
  // Custom Metadata
  vesselOwner?: string;
  agentContact?: string;
  remarks?: string;
  savedAt: string;
}

export interface ArrivalDeclarationModel {
  portOfCall: PortId;
  declarationDate: string;
  declarationRef: string;
  vesselName: string;
  imoNumber: string;
  callSign: string;
  flag: string;
  portOfRegistry: string;
  shipType: string;
  masterName: string;
  shipOwner: string;
  charterer: string;
  shippingAgent: string;
  // Particulars
  grt: number;
  nrt: number;
  dwt: number;
  loa: number;
  beam: number;
  volume: number;
  arrivalDraftFwd: number;
  arrivalDraftAft: number;
  airDraft: number;
  // Voyage
  lastPort: string;
  lastPortDepartureDate: string;
  nextPort: string;
  nextPortEta: string;
  eta: string;
  ata: string;
  berthAssigned: string;
  pilotBoardingTime: string;
  allFastTime: string;
  // Cargo & Crew
  purposeOfCall: string;
  cargoNature: string;
  cargoQuantityDischarge: string;
  cargoQuantityLoad: string;
  crewCount: number;
  passengerCount: number;
  stowaways: string;
  // ROB Bunkers
  vlsfoROB: string;
  lsmgoROB: string;
  freshWaterROB: string;
  sludgeROB: string;
  // Sanitary & Customs
  sanitaryCondition: string;
  derattingCertExpiry: string;
  dangerousGoodsCarried: string;
  remarks: string;
  // Supply quantities on arrival and departure
  fuelOilArr?: string;
  fuelOilDep?: string;
  dieselOilArr?: string;
  dieselOilDep?: string;
  gasolineArr?: string;
  gasolineDep?: string;
  lubOilArr?: string;
  lubOilDep?: string;
  freshWaterArr?: string;
  freshWaterDep?: string;
  draftArr?: string;
  draftDep?: string;
  // Cargo & Documents
  cargoOperation?: CargoOperation;
  cargoDescription?: string;
  cargoQuantityInput?: string;
  cargoDocsOnBoard?: 'YES' | 'NO';
  cargoRemarks?: string;
  // Port Events dates & times
  portEvents?: Record<string, { date: string; time: string }>;
  // Stoppages list
  stoppages?: Array<{
    id: string;
    fromDate: string;
    fromTime: string;
    toDate: string;
    toTime: string;
    reason: string;
  }>;
  // SOF Event Timestamps
  nor: string;
  pratique: string;
  customs: string;
  pilot: string;
  firstline: string;
  allfast: string;
  cargoStart: string;
  cargoEnd: string;
  survey: string;
  lastline: string;
  departure: string;
  sofremarks: string;
  to?: string;
  charterpartyDate?: string;
  // Aliases for user fields
  draft: number;
  cargo: string;
  qty: string;
  purpose: string;
  agent: string;
  owner: string;
  master: string;
  masterSignatureName: string;
  agentSignatureName: string;
}

export function createDefaultArrivalDeclaration(pda?: OfficialPdaModel): ArrivalDeclarationModel {
  const today = new Date().toISOString().slice(0, 10);
  const v = pda?.vessel;
  const draftVal = v?.actualDraft ? +v.actualDraft.toFixed(2) : 6.50;
  const cargoVal = v?.cargo || 'Bulk Wheat';
  const qtyVal = v?.weightCargo || '4500';
  const masterVal = 'Capt. Mohamed Ben Salem';
  const ownerVal = pda?.vesselOwner || 'Tunisian Shipping Line Co.';
  const purposeVal = 'Cargo operations';
  const agentVal = `SOCOTU — ${pda?.port || 'Sousse'} Agency`;

  return {
    portOfCall: pda?.port || 'Sousse',
    declarationDate: pda?.date || today,
    declarationRef: pda ? `ARR-${pda.ref}` : `ARR-${today.replace(/-/g, '')}-001`,
    vesselName: v?.name || 'MV PONTICA',
    imoNumber: v?.imo || '9370094',
    callSign: v?.callSign || '8PSO7',
    flag: v?.flag || '',
    portOfRegistry: pda?.port || 'Sousse',
    shipType: 'General Cargo / Bulk Carrier',
    masterName: masterVal,
    master: masterVal,
    shipOwner: ownerVal,
    owner: ownerVal,
    charterer: 'Carthage Grain Trading Ltd',
    shippingAgent: agentVal,
    agent: agentVal,
    grt: v?.grt || 9556,
    nrt: v?.nrt || 4378,
    dwt: 12000,
    loa: v?.loa || 140.00,
    beam: v?.beam || 21.00,
    volume: v?.volume || 24638,
    draft: draftVal || 8.38,
    arrivalDraftFwd: +( (draftVal || 8.38) - 0.3 ).toFixed(2),
    arrivalDraftAft: draftVal || 8.38,
    airDraft: 28.5,
    lastPort: 'Malta (Marsaxlokk)',
    lastPortDepartureDate: today,
    nextPort: 'Ravenna (Italy)',
    nextPortEta: '',
    eta: `${pda?.date || today}T06:00`,
    ata: `${pda?.date || today}T07:30`,
    berthAssigned: 'Berth No. 2 (Commercial Quay)',
    pilotBoardingTime: `${pda?.date || today}T06:45`,
    allFastTime: `${pda?.date || today}T08:15`,
    purposeOfCall: purposeVal,
    purpose: purposeVal,
    cargoOperation: v?.cargoOperation || 'Discharging',
    cargoNature: cargoVal,
    cargo: cargoVal,
    cargoQuantityDischarge: qtyVal,
    qty: qtyVal,
    cargoQuantityLoad: 'NIL',
    crewCount: 16,
    passengerCount: 0,
    stowaways: 'None reported',
    vlsfoROB: '145 MT',
    lsmgoROB: '38 MT',
    freshWaterROB: '85 MT',
    sludgeROB: '6.5 m3',
    sanitaryCondition: 'All crew healthy — Free Pratique requested',
    derattingCertExpiry: '2027-01-15',
    dangerousGoodsCarried: 'NIL / No IMDG cargo on board',
    remarks: 'I hereby declare that the above particulars are, to the best of my knowledge, correct and complete.',
    // SOF Events default
    nor: `${pda?.date || today}T06:15`,
    pratique: `${pda?.date || today}T08:30`,
    customs: `${pda?.date || today}T08:45`,
    pilot: `${pda?.date || today}T06:45`,
    firstline: `${pda?.date || today}T07:45`,
    allfast: `${pda?.date || today}T08:15`,
    cargoStart: `${pda?.date || today}T09:30`,
    cargoEnd: '',
    survey: '',
    lastline: '',
    departure: '',
    sofremarks: 'Vessel berthed port side alongside. Discharging commenced using shore cranes. Weather clear, sea calm.',
    masterSignatureName: masterVal,
    agentSignatureName: 'SOCOTU Port Operations Agent'
  };
}

export interface BerthingRequestModel {
  port: PortId;
  city: string;
  date: string;
  recipient: string;
  object: string;
  introText: string;
  vesselName: string;
  desiredBerth: string;
  berthingDate: string;
  berthingTime: string;
  accostagePour: string;
  loa: number;
  beam: number;
  maxDraft: number;
  closingText: string;
  agencySignOff: string;
  agentName?: string;
  stampNote?: string;
}

export function createDefaultBerthingRequest(pda?: OfficialPdaModel): BerthingRequestModel {
  const portName = pda?.port || 'Sousse';
  const cityName = portName.toUpperCase();
  
  // Convert PDA date (YYYY-MM-DD) to French DD/MM/YYYY if available, else 14/02/2025 as in user request
  let dateFormatted = '14/02/2025';
  if (pda?.date && /^\d{4}-\d{2}-\d{2}$/.test(pda.date)) {
    const parts = pda.date.split('-');
    dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  // Vessel name formatting: M/V « joy x   » or from PDA
  let vesselStr = 'M/V « joy x   »';
  if (pda?.vessel?.name) {
    const raw = pda.vessel.name.trim();
    if (raw.toUpperCase().startsWith('M/V') || raw.toUpperCase().startsWith('MV')) {
      vesselStr = raw;
    } else {
      vesselStr = `M/V « ${raw} »`;
    }
  }

  // Operation text: EMBARQUEMENT 7500 MTS sable  EN VRAC or from PDA
  let accostagePourStr = 'EMBARQUEMENT 7500 MTS sable  EN VRAC';
  if (pda?.vessel?.cargo || pda?.vessel?.weightCargo) {
    const op = pda.vessel.cargoOperation === 'Loading' ? 'EMBARQUEMENT' : 'DEBARQUEMENT';
    const qty = pda.vessel.weightCargo ? `${pda.vessel.weightCargo} MTS` : '7500 MTS';
    const cargo = pda.vessel.cargo ? pda.vessel.cargo : 'sable';
    accostagePourStr = `${op} ${qty} ${cargo}  EN VRAC`;
  }

  return {
    port: portName,
    city: cityName,
    date: dateFormatted,
    recipient: `Monsieur le Commandant Du Port De ${portName}`,
    object: "OBJET : DEMANDE D'ACCOSTAGE",
    introText: 'Nous vous prions de bien vouloir faire accoster le navire :',
    vesselName: vesselStr,
    desiredBerth: 'DISPONIBILITE DE POSTE A QUAI',
    berthingDate: 'DISPONIBILITE DE POSTE A QUAI',
    berthingTime: 'DISPONIBILITE DE POSTE A QUAI',
    accostagePour: accostagePourStr,
    loa: pda?.vessel?.loa || 116.23,
    beam: pda?.vessel?.beam || 18.00,
    maxDraft: pda?.vessel?.draft || pda?.vessel?.actualDraft || 7.60,
    closingText: 'Avec nos remerciements anticipés.',
    agencySignOff: `SOCOTU ${cityName}`,
    agentName: "L'Agent Maritime SOCOTU",
    stampNote: 'Cachet & Signature'
  };
}
