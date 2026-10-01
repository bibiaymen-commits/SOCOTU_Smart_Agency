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

export interface CongenbillModel {
  blNumber: string;
  shipper: string;
  consignee: string;
  notifyAddress: string;
  preCarriageBy: string;
  placeOfReceipt: string;
  oceanVessel: string;
  portOfLoading: string;
  portOfDischarge: string;
  placeOfDelivery: string;
  // Goods description
  marksAndNumbers: string;
  descriptionOfPackagesAndGoods: string;
  grossWeightKg: string;
  measurementM3: string;
  deckCargoRemarks: string;
  // Freight & Charges
  freightPayableAsPerCharterPartyDate: string;
  freightPayableAt: 'PREPAID' | 'PAYABLE AT DESTINATION' | string;
  freightAmount: string;
  // Originals & Issue
  numberOfOriginals: string;
  placeOfIssue: string;
  dateOfIssue: string;
  // Signatory
  signedAs: 'AGENT' | 'MASTER';
  agentName: string;
  masterName: string;
  signatureDate: string;
}

export function createDefaultCongenbill(
  pda?: OfficialPdaModel,
  decl?: ArrivalDeclarationModel
): CongenbillModel {
  const today = new Date().toISOString().slice(0, 10);
  const port = decl?.portOfCall || pda?.port || 'Sousse';
  const vesselName = decl?.vesselName || pda?.vessel?.name || '';
  const cargoName = decl?.cargo || decl?.cargoNature || pda?.vessel?.cargo || '';
  const cargoQty = decl?.qty || decl?.cargoQuantityDischarge || pda?.vessel?.weightCargo || '';

  return {
    blNumber: 'CONGEN-01',
    shipper: '',
    consignee: 'TO ORDER',
    notifyAddress: 'SAME AS CONSIGNEE',
    preCarriageBy: '',
    placeOfReceipt: '',
    oceanVessel: vesselName,
    portOfLoading: decl?.lastPort || '',
    portOfDischarge: `PORT OF ${port.toUpperCase()}, TUNISIA`,
    placeOfDelivery: '',
    marksAndNumbers: 'IN BULK',
    descriptionOfPackagesAndGoods: cargoName ? `BULK CARGO SAID TO BE:\n${cargoName.toUpperCase()}` : '',
    grossWeightKg: cargoQty,
    measurementM3: '',
    deckCargoRemarks: 'SHIPPED ON BOARD INTO THE VESSEL CARGO HOLDS IN APPARENT GOOD ORDER AND CONDITION',
    freightPayableAsPerCharterPartyDate: decl?.charterpartyDate || '',
    freightPayableAt: 'PAYABLE AT DESTINATION',
    freightAmount: 'AS PER CHARTER PARTY',
    numberOfOriginals: 'THREE (3)',
    placeOfIssue: port ? `${port}, Tunisia` : 'Tunisia',
    dateOfIssue: today,
    signedAs: 'AGENT',
    agentName: `SOCOTU — Société Commerciale Tunisienne (${port})`,
    masterName: decl?.master || decl?.masterName || '',
    signatureDate: today
  };
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
  // Specific Arrival Movements & Nautical Timeline
  eosp?: string;
  droppedAnchor?: string;
  heaveUpAnchor?: string;
  pilotOnBoard?: string;
  firstLineAshore?: string;
  berthedAllFast?: string;
  anchorageDetails?: string;
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
  draftDepFwd?: string;
  draftDepAft?: string;
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
  const draftVal = v?.actualDraft ? +v.actualDraft.toFixed(2) : (v?.draft || 0);
  const cargoVal = v?.cargo || '';
  const qtyVal = v?.weightCargo || '';
  const ownerVal = pda?.vesselOwner || '';
  const agentVal = pda?.port ? `SOCOTU — Agence ${pda.port}` : '';

  return {
    portOfCall: pda?.port || 'Sousse',
    declarationDate: pda?.date || today,
    declarationRef: pda ? `ARR-${pda.ref}` : '',
    vesselName: v?.name || '',
    imoNumber: v?.imo || '',
    callSign: v?.callSign || '',
    flag: v?.flag || '',
    portOfRegistry: '',
    shipType: '',
    masterName: '',
    master: '',
    shipOwner: ownerVal,
    owner: ownerVal,
    charterer: '',
    shippingAgent: agentVal,
    agent: agentVal,
    grt: v?.grt || 0,
    nrt: v?.nrt || 0,
    dwt: 0,
    loa: v?.loa || 0,
    beam: v?.beam || 0,
    volume: v?.volume || 0,
    draft: draftVal || 0,
    arrivalDraftFwd: draftVal ? +(Math.max(draftVal - 0.3, 0)).toFixed(2) : 0,
    arrivalDraftAft: draftVal || 0,
    airDraft: 0,
    lastPort: '',
    lastPortDepartureDate: '',
    nextPort: '',
    nextPortEta: '',
    eta: '',
    ata: '',
    berthAssigned: '',
    pilotBoardingTime: '',
    allFastTime: '',
    // Specific Arrival Movements & Nautical Timeline (remain blank until edited)
    eosp: '',
    droppedAnchor: '',
    heaveUpAnchor: '',
    pilotOnBoard: '',
    firstLineAshore: '',
    berthedAllFast: '',
    anchorageDetails: '',
    purposeOfCall: '',
    purpose: '',
    cargoOperation: v?.cargoOperation || 'Discharging',
    cargoNature: cargoVal,
    cargo: cargoVal,
    cargoQuantityDischarge: qtyVal,
    qty: qtyVal,
    cargoQuantityLoad: '',
    crewCount: 0,
    passengerCount: 0,
    stowaways: '',
    vlsfoROB: '',
    lsmgoROB: '',
    freshWaterROB: '',
    sludgeROB: '',
    sanitaryCondition: '',
    derattingCertExpiry: '',
    dangerousGoodsCarried: '',
    remarks: '',
    // SOF Events default (blank until recorded)
    nor: '',
    pratique: '',
    customs: '',
    pilot: '',
    firstline: '',
    allfast: '',
    cargoStart: '',
    cargoEnd: '',
    survey: '',
    lastline: '',
    departure: '',
    sofremarks: '',
    stoppages: [],
    masterSignatureName: '',
    agentSignatureName: agentVal
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
  
  let dateFormatted = '';
  if (pda?.date && /^\d{4}-\d{2}-\d{2}$/.test(pda.date)) {
    const parts = pda.date.split('-');
    dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const vesselStr = pda?.vessel?.name ? pda.vessel.name.trim() : '';

  let accostagePourStr = '';
  if (pda?.vessel?.cargo || pda?.vessel?.weightCargo) {
    const op = pda.vessel.cargoOperation === 'Loading' ? 'EMBARQUEMENT' : 'DEBARQUEMENT';
    const qty = pda.vessel.weightCargo ? `${pda.vessel.weightCargo}` : '';
    const cargo = pda.vessel.cargo || '';
    accostagePourStr = `${op} ${qty} ${cargo}`.trim();
  }

  return {
    port: portName,
    city: cityName,
    date: dateFormatted,
    recipient: `Monsieur le Commandant Du Port De ${portName}`,
    object: "OBJET : DEMANDE D'ACCOSTAGE",
    introText: 'Nous vous prions de bien vouloir faire accoster le navire :',
    vesselName: vesselStr,
    desiredBerth: '',
    berthingDate: dateFormatted,
    berthingTime: '',
    accostagePour: accostagePourStr,
    loa: pda?.vessel?.loa || 0,
    beam: pda?.vessel?.beam || 0,
    maxDraft: pda?.vessel?.draft || pda?.vessel?.actualDraft || 0,
    closingText: "Dans l'attente de votre réponse, veuillez agréer, Monsieur le Commandant, l'assurance de notre considération distinguée.",
    agencySignOff: `SOCOTU ${cityName}`,
    agentName: '',
    stampNote: ''
  };
}
