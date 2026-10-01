import { 
  MooringPeriod, 
  PortDuesCalculation, 
  PortExpensesCalculation, 
  ServiceItem, 
  VesselSpecs 
} from '../types/pda';

export function formatNum(val: number): string {
  if (isNaN(val)) return '0,000';
  const parts = val.toFixed(3).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return integerPart + ',' + parts[1];
}

export function formatInt(val: number): string {
  if (isNaN(val)) return '0';
  const rounded = Math.ceil(val);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Returns today's date in local ISO format (YYYY-MM-DD)
 */
export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats YYYY-MM-DD into official business date DD/MM/YYYY
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    return `${d}/${m}/${y}`;
  }
  return dateStr;
}

export function calcVesselMetrics(loa: number, beam: number, draft: number) {
  const safeLoa = Math.max(loa || 0, 0);
  const safeBeam = Math.max(beam || 0, 0);
  const safeDraft = Math.max(draft || 0, 0);

  // min_draft = 0.14 * sqrt(loa * beam)
  const theorDraft = Math.round(0.14 * Math.sqrt(safeLoa * safeBeam) * 1000) / 1000;
  const actualDraft = Math.max(safeDraft, theorDraft);
  const volume = Math.ceil(safeLoa * safeBeam * actualDraft);

  let bracketName = 'Bracket 1 (0 - 1,000 m³)';
  if (volume <= 1000) {
    bracketName = 'Bracket 1 (0 - 1,000 m³)';
  } else if (volume <= 10000) {
    bracketName = 'Bracket 2 (1,001 - 10,000 m³)';
  } else if (volume <= 25000) {
    bracketName = 'Bracket 3 (10,001 - 25,000 m³)';
  } else if (volume <= 40000) {
    bracketName = 'Bracket 4 (25,001 - 40,000 m³)';
  } else if (volume <= 75000) {
    bracketName = 'Bracket 5 (40,001 - 75,000 m³)';
  } else {
    bracketName = 'Bracket 6 (> 75,000 m³)';
  }

  return {
    theorDraft,
    actualDraft,
    volume,
    bracketName
  };
}

export interface LamanageVScale {
  lines: number;
  ratePerLine: number;
  bracketDesc: string;
  boatHT: number;
  linesCostHT: number;
  totalCostHT: number;
  vatRate: number;
  vatEUR: number;
  totalCostTTC: number;
}

/**
 * Barème officiel Lamanage selon Volume géométrique (V) - JORT N°90 du 04.09.2020:
 * - V < 1 000 m³ : 6 € × 6 amarres
 * - 1 000 < V ≤ 10 000 m³ : 6 € × 8 amarres
 * - 10 000 < V ≤ 25 000 m³ : 12 € × 10 amarres
 * - 25 000 < V ≤ 40 000 m³ : 15 € × 12 amarres
 * - 40 000 < V ≤ 75 000 m³ : 18 € × 15 amarres
 * - 75 000 < V ≤ 150 000 m³ : 20 € × 20 amarres
 * - V > 150 000 m³ : 25 € × 24 amarres
 * + Embarcation: 90,00 € HT
 * + 19% TVA
 */
export function getLamanageScaleByVolume(volume: number): LamanageVScale {
  let lines = 6;
  let ratePerLine = 6;
  let bracketDesc = '< 1 000 m³ : 6 € × 6 amarres';

  if (volume <= 1000) {
    lines = 6;
    ratePerLine = 6;
    bracketDesc = '< 1 000 m³ : 6 € × 6 amarres';
  } else if (volume <= 10000) {
    lines = 8;
    ratePerLine = 6;
    bracketDesc = '1 000 – 10 000 m³ : 6 € × 8 amarres';
  } else if (volume <= 25000) {
    lines = 10;
    ratePerLine = 12;
    bracketDesc = '10 000 – 25 000 m³ : 12 € × 10 amarres';
  } else if (volume <= 40000) {
    lines = 12;
    ratePerLine = 15;
    bracketDesc = '25 000 – 40 000 m³ : 15 € × 12 amarres';
  } else if (volume <= 75000) {
    lines = 15;
    ratePerLine = 18;
    bracketDesc = '40 000 – 75 000 m³ : 18 € × 15 amarres';
  } else if (volume <= 150000) {
    lines = 20;
    ratePerLine = 20;
    bracketDesc = '75 000 – 150 000 m³ : 20 € × 20 amarres';
  } else {
    lines = 24;
    ratePerLine = 25;
    bracketDesc = '> 150 000 m³ : 25 € × 24 amarres';
  }

  const boatHT = 90.0;
  const linesCostHT = ratePerLine * lines;
  const totalCostHT = boatHT + linesCostHT;
  const vatRate = 0.19;
  const vatEUR = Math.round(totalCostHT * vatRate * 1000) / 1000;
  const totalCostTTC = Math.round(totalCostHT * (1 + vatRate) * 1000) / 1000;

  return {
    lines,
    ratePerLine,
    bracketDesc,
    boatHT,
    linesCostHT,
    totalCostHT,
    vatRate,
    vatEUR,
    totalCostTTC
  };
}

export function getDefaultMooringLines(volume: number): number {
  return getLamanageScaleByVolume(volume).lines;
}

export function getMooringUnitRate(volume: number): number {
  return getLamanageScaleByVolume(volume).ratePerLine;
}

/**
 * Complete Lamanage calculation according to JORT N°90:
 * VALEUR EMBARCATION: 90 EUR HT
 * + (Tarif amarre × Nbr amarres) HT
 * + 19% TVA
 */
export function calculateLamanageCost(
  volume: number,
  nMooringLines?: number,
  mooringPeriod: MooringPeriod = '0'
) {
  const scale = getLamanageScaleByVolume(volume);
  const boatCostHT = 90.0;
  const baseRatePerLine = scale.ratePerLine;

  let surchargeRate = 0;
  if (mooringPeriod === '0.50_night' || mooringPeriod === '0.50_holiday') {
    surchargeRate = 0.50;
  } else if (mooringPeriod === '1.00_night_holiday') {
    surchargeRate = 1.00;
  }

  const effectiveRatePerLine = baseRatePerLine * (1 + surchargeRate);
  // Ensure nLines adheres strictly to scale if <= 2 (avoiding operations count confusion)
  const nLines = (nMooringLines !== undefined && nMooringLines > 2)
    ? nMooringLines
    : scale.lines;

  const linesCostHT = effectiveRatePerLine * nLines;
  const totalCostHT = boatCostHT + linesCostHT;
  const vatRate = 0.19;
  const vatEUR = Math.round(totalCostHT * vatRate * 1000) / 1000;
  const totalCostTTC = Math.round(totalCostHT * (1 + vatRate) * 1000) / 1000;

  return {
    boatCostHT,
    baseRatePerLine,
    effectiveRatePerLine,
    nLines,
    linesCostHT,
    totalCostHT,
    vatRate,
    vatEUR,
    totalCostTTC,
    bracketDesc: scale.bracketDesc
  };
}

export function calculatePortDues(
  volume: number,
  nShelter: number = 1,
  nStay: number = 4,
  nPilot: number = 2,
  nTug: number = 2,
  nMooring: number = 2,
  mooringPeriod: MooringPeriod = '0',
  nLamanageBoat: number = 0
): PortDuesCalculation {
  let shelter_base = 0;
  let stay_unit = 0;
  let pilot_unit = 0;

  if (volume <= 10000) {
    shelter_base = volume * 0.0876;
    stay_unit = volume * 0.059;
    const calc_pilot = volume * 0.1104;
    pilot_unit = volume <= 1000 ? Math.max(calc_pilot, 110.4) : 110.4 + 0.0107 * (volume - 1000);
  } else if (volume <= 25000) {
    shelter_base = 876 + 0.0804 * (volume - 10000);
    stay_unit = 590 + 0.0536 * (volume - 10000);
    pilot_unit = 206.4 + 0.0096 * (volume - 10000);
  } else if (volume <= 40000) {
    shelter_base = 2082 + 0.0732 * (volume - 25000);
    stay_unit = 1394 + 0.0496 * (volume - 25000);
    pilot_unit = 350.4 + 0.0091 * (volume - 25000);
  } else if (volume <= 75000) {
    shelter_base = 3180 + 0.0696 * (volume - 40000);
    stay_unit = 2138 + 0.047 * (volume - 40000);
    pilot_unit = 487.2 + 0.0086 * (volume - 40000);
  } else if (volume <= 150000) {
    shelter_base = 5616 + 0.0648 * (volume - 75000);
    stay_unit = 3783 + 0.044 * (volume - 75000);
    pilot_unit = 781.2 + 0.0084 * (volume - 75000);
  } else {
    shelter_base = 10476 + 0.0624 * (volume - 150000);
    stay_unit = 7083 + 0.0415 * (volume - 150000);
    pilot_unit = 1419.6 + 0.0077 * (volume - 150000);
  }

  // Base de calcul avec TVA 19% intégrée automatiquement
  const shelterUnitTTC = shelter_base * 1.19;
  const totShelter = shelterUnitTTC * nShelter;
  const tShelter = shelter_base * nShelter;
  const vatShelter = 0; // Intégrée dans le coût unitaire

  // Stay Dues avec TVA 19% intégrée
  const stayUnitTTC = stay_unit * 1.19;
  const totStay = stayUnitTTC * nStay;
  const tStay = stay_unit * nStay;
  const vatStay = 0;

  // Pilotage avec TVA 19% intégrée
  const pilotUnitTTC = pilot_unit * 1.19;
  const totPilot = pilotUnitTTC * nPilot;
  const tPilot = pilot_unit * nPilot;
  const vatPilot = 0;

  // REMORQUAGE — JORT N°67 du 22.08.2017
  let tug_unit = 0;
  let tugBracketLabel = '';
  if (volume <= 1000) {
    tug_unit = 114;
    tugBracketLabel = '0–1 000 m³ : 114 EUR/h';
  } else if (volume <= 10000) {
    tug_unit = 114 + 0.03034 * (volume - 1000);
    tugBracketLabel = '1 001–10 000 : 114 + 0,03034 × excédent';
  } else if (volume <= 25000) {
    tug_unit = 387 + 0.0266 * (volume - 10000);
    tugBracketLabel = '10 001–25 000 : 387 + 0,0266 × excédent';
  } else if (volume <= 40000) {
    tug_unit = 786 + 0.0240 * (volume - 25000);
    tugBracketLabel = '25 001–40 000 : 786 + 0,0240 × excédent';
  } else if (volume <= 75000) {
    tug_unit = 1146 + 0.0236 * (volume - 40000);
    tugBracketLabel = '40 001–75 000 : 1 146 + 0,0236 × excédent';
  } else if (volume <= 150000) {
    tug_unit = 1972 + 0.0068 * (volume - 75000);
    tugBracketLabel = '75 001–150 000 : 1 972 + 0,0068 × excédent';
  } else {
    tug_unit = 2210 + 0.0061 * (volume - 150000);
    tugBracketLabel = '>150 000 : 2 210 + 0,0061 × excédent';
  }

  // Remorquage avec TVA 19% intégrée
  const tugUnitTTC = tug_unit * 1.19;
  const totTug = tugUnitTTC * nTug;
  const tTug = tug_unit * nTug;
  const vatTug = 0;

  // ISPS APRÈS REMORQUAGE — Non soumise à la TVA (0% TVA) :
  // Ligne 1 : 5% du Shelter HT (Exonéré TVA)
  const ispsShelterUnitEUR = tShelter * 0.05;
  const nIspsShelter = 1;
  const tIspsShelter = ispsShelterUnitEUR * nIspsShelter;
  const vatIspsShelter = 0;
  const totIspsShelter = tIspsShelter;

  // Ligne 2 : 5% de Stay Dues HT (Exonéré TVA)
  const ispsStayUnitEUR = tStay * 0.05;
  const nIspsStay = 1;
  const tIspsStay = ispsStayUnitEUR * nIspsStay;
  const vatIspsStay = 0;
  const totIspsStay = tIspsStay;

  // Aggregate ISPS for backward compatibility
  const ispsUnitEUR = ispsShelterUnitEUR + ispsStayUnitEUR;
  const nIsps = 1;
  const tIsps = tIspsShelter + tIspsStay;
  const vatIsps = 0;
  const totIsps = tIsps;

  // LAMANAGE / AMARRAGE-DESAMARRAGE — JORT N°90 du 04.09.2020
  const linesCount = (nMooring !== undefined && nMooring > 2) ? nMooring : getDefaultMooringLines(volume);
  const lamanageCalc = calculateLamanageCost(volume, linesCount, mooringPeriod);
  const mooring_unit = lamanageCalc.baseRatePerLine;
  const mooringSurchargeRate = lamanageCalc.effectiveRatePerLine > lamanageCalc.baseRatePerLine
    ? (lamanageCalc.effectiveRatePerLine / lamanageCalc.baseRatePerLine - 1)
    : 0;
  const mooringRateEffectiveEUR = lamanageCalc.effectiveRatePerLine;
  const tMooring = lamanageCalc.linesCostHT;
  const vatMooring = lamanageCalc.vatEUR;
  const totMooring = Math.round(tMooring * 1.19 * 1000) / 1000;

  let mooringBracketLabel = '';
  if (volume <= 1000) {
    mooringBracketLabel = '< 1 000 m³ : 6 EUR/amarre (déf. 6)';
  } else if (volume <= 10000) {
    mooringBracketLabel = '1 001–10 000 : 6 EUR/amarre (déf. 8)';
  } else if (volume <= 25000) {
    mooringBracketLabel = '10 001–25 000 : 12 EUR/amarre (déf. 10)';
  } else if (volume <= 40000) {
    mooringBracketLabel = '25 001–40 000 : 15 EUR/amarre (déf. 12)';
  } else if (volume <= 75000) {
    mooringBracketLabel = '40 001–75 000 : 18 EUR/amarre (déf. 15)';
  } else if (volume <= 150000) {
    mooringBracketLabel = '75 001–150 000 : 20 EUR/amarre (déf. 20)';
  } else {
    mooringBracketLabel = '> 150 000 m³ : 25 EUR/amarre (déf. 24)';
  }

  // Embarcation de lamanage : 90 EUR/opération HT
  const lamanageBoatUnitEUR = lamanageCalc.boatCostHT;
  const tLamanageBoat = lamanageBoatUnitEUR;
  const vatLamanageBoat = Math.round(tLamanageBoat * 0.19 * 1000) / 1000;
  const totLamanageBoat = Math.round(tLamanageBoat * 1.19 * 1000) / 1000;

  const subtotalPortDuesEUR = totShelter + totStay + totPilot + totIsps + totTug;

  // Combined Mooring & Boat (Lamanage unitaire TTC par opération selon JORT N°90)
  // Formule: (90 € embarcation + [Taux unitaire] × [Nbr amarres]) × 1.19
  const combinedMooringTotalEUR = lamanageCalc.totalCostTTC;
  const combinedMooringVatEUR = lamanageCalc.vatEUR;
  const combinedMooringGrandTotalEUR = combinedMooringTotalEUR;

  return {
    shelterUnitEUR: shelterUnitTTC,
    nShelter,
    tShelter: totShelter,
    ispsShelter: ispsShelterUnitEUR,
    vatShelter: 0,
    totShelter,

    stayUnitEUR: stayUnitTTC,
    nStay,
    tStay: totStay,
    ispsStay: ispsStayUnitEUR,
    vatStay: 0,
    totStay,

    pilotUnitEUR: pilotUnitTTC,
    nPilot,
    tPilot: totPilot,
    vatPilot: 0,
    totPilot,

    tugUnitEUR: tugUnitTTC,
    nTug,
    tTug: totTug,
    vatTug: 0,
    totTug,
    tugBracketLabel,

    // ISPS après Remorquage
    ispsShelterUnitEUR,
    nIspsShelter,
    tIspsShelter,
    vatIspsShelter,
    totIspsShelter,

    ispsStayUnitEUR,
    nIspsStay,
    tIspsStay,
    vatIspsStay,
    totIspsStay,

    ispsUnitEUR,
    nIsps,
    tIsps,
    vatIsps,
    totIsps,

    mooringUnitEUR: mooring_unit,
    mooringPeriod,
    mooringSurchargeRate,
    mooringRateEffectiveEUR,
    nMooring,
    tMooring,
    vatMooring,
    totMooring,
    mooringBracketLabel,

    lamanageBoatUnitEUR,
    nLamanageBoat,
    tLamanageBoat,
    vatLamanageBoat,
    totLamanageBoat,

    combinedMooringTotalEUR,
    combinedMooringVatEUR,
    combinedMooringGrandTotalEUR,

    subtotalPortDuesEUR
  };
}

export function calculatePortExpenses(
  subtotalPortDuesEUR: number,
  uMooringEUR: number = 249.90,
  nMooring: number = 2,
  uWatch: number = 178.50,
  nWatch: number = 4,
  uGarb: number = 150.0,
  nGarb: number = 1,
  agencyFeesEUR: number = 1500.0,
  currencyControlRate: number = 0,
  additionalServices: ServiceItem[] = [],
  exchangeRate: number = 1.20,
  nMooringLines?: number
): PortExpensesCalculation {
  // Use provided or updated U. Cost
  const effectiveUMooring = uMooringEUR;
  const effectiveUWatch = uWatch;

  // Calcul direct avec TVA 19% incluse dans la base de calcul (coût unitaire)
  const tMooring = effectiveUMooring * nMooring;
  const vatMooring = 0;
  const totMooring = tMooring;

  const tWatch = effectiveUWatch * nWatch;
  const vatWatch = 0;
  const totWatch = tWatch;

  const tGarb = uGarb * nGarb;
  const vatGarb = 0;
  const totGarb = tGarb;

  const additionalServicesTotalEUR = additionalServices.reduce(
    (acc, curr) => acc + (curr.quantity * curr.unitPriceEUR),
    0
  );

  const subtotalPortExpensesEUR = totMooring + totWatch + totGarb + additionalServicesTotalEUR;

  // Total proforma before Currency Control Charges
  const proformaBeforeCurrencyControl = subtotalPortDuesEUR + subtotalPortExpensesEUR + agencyFeesEUR;
  const currencyControlChargeEUR = proformaBeforeCurrencyControl * (currencyControlRate / 100);

  const grandTotalEUR = proformaBeforeCurrencyControl + currencyControlChargeEUR;
  const grandTotalTargetCurr = grandTotalEUR * exchangeRate;

  return {
    uMooringEUR: effectiveUMooring,
    nMooring,
    nMooringLines,
    tMooring,
    vatMooring: 0,
    totMooring,

    uWatchEUR: effectiveUWatch,
    nWatch,
    tWatch,
    vatWatch: 0,
    totWatch,

    uGarbEUR: uGarb,
    nGarb,
    tGarb,
    vatGarb: 0,
    totGarb,

    agencyFeesEUR,
    currencyControlRate,
    currencyControlChargeEUR,

    additionalServices,
    additionalServicesTotalEUR,

    subtotalPortExpensesEUR,
    grandTotalEUR,
    grandTotalTargetCurr
  };
}
