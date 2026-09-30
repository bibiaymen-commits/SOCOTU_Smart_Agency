import { OfficialPdaModel, PortId } from '../types/pda';
import { calcVesselMetrics, calculatePortDues, calculatePortExpenses, getDefaultMooringLines } from '../utils/calculations';

export interface BranchInfo {
  id: PortId;
  name: string;
  agencyTitle: string;
  details: string;
  phone: string;
  fax: string;
  email: string;
  restrictions: string;
}

export const SOCOTU_BRANCHES: Record<PortId, BranchInfo> = {
  Sousse: {
    id: 'Sousse',
    name: 'Sousse Port',
    agencyTitle: 'SOCIETE COMMERCIALE TUNISIENNE - Agence Sousse',
    details: 'Z.I. Sidi AbdelHamid, 4061 Sousse - Tunisia | TEL: (+216) 70 108 158 / FAX: (+216) 70 108 137 | E-MAIL: bibi.aymen@socotu.com.tn',
    phone: '(+216) 70 108 158',
    fax: '(+216) 70 108 137',
    email: 'bibi.aymen@socotu.com.tn',
    restrictions: 'Port charges and selected services are calculated according to the applicable tariff or supplier rate.\nMax LOA: 165.00 m | Max Draft: 7.80 m LOADED\nFor loading salt, silica sand using conveyor belt, distance from sea water line to hatch coaming: 9.00 m\nBallast clean / Full on Arrival | Cargo Holds Clean, Dry\n7/7 & 24/24 Contact: + 216 21 352 109'
  },
  Sfax: {
    id: 'Sfax',
    name: 'Sfax Port',
    agencyTitle: 'SOCIETE COMMERCIALE TUNISIENNE - Agence Sfax',
    details: 'Route de la Plage, Immeuble SOCOTU, 3000 Sfax - Tunisia | TEL: (+216) 74 228 322 / FAX: (+216) 74 225 611 | E-MAIL: agency.sfax@socotu.com.tn',
    phone: '(+216) 74 228 322',
    fax: '(+216) 74 225 611',
    email: 'agency.sfax@socotu.com.tn',
    restrictions: 'Max LOA: 205.00 m | Max Permissible Draft: 10.50 m at high water.\nChannel navigation strictly subject to pilot station authorization.\nCompulsory 2 tugs for bulk carriers and tankers.'
  },
  Rades: {
    id: 'Rades',
    name: 'Radès / La Goulette Port',
    agencyTitle: 'SOCIETE COMMERCIALE TUNISIENNE - Agence Radès / La Goulette',
    details: 'Zone Portuaire de Radès, Bâtiment Transit & Agence Maritime, 2040 Radès - Tunisia | TEL: (+216) 71 448 000 | E-MAIL: agency.rades@socotu.com.tn',
    phone: '(+216) 71 448 000',
    fax: '(+216) 71 448 111',
    email: 'agency.rades@socotu.com.tn',
    restrictions: 'Max Draft: 10.50 m (Radès Container & Ro-Ro berths) / 9.00 m (La Goulette North basin).\nCompulsory 2 tugs for vessels >= 5,000 GRT or LOA > 130m.\n24/7 continuous operations for container and passenger traffic.'
  },
  Bizerte: {
    id: 'Bizerte',
    name: 'Bizerte Port',
    agencyTitle: 'SOCIETE COMMERCIALE TUNISIENNE - Agence Bizerte',
    details: 'Quai Tarak Ibn Ziad, 7000 Bizerte - Tunisia | TEL: (+216) 72 432 025 | E-MAIL: agency.bizerte@socotu.com.tn',
    phone: '(+216) 72 432 025',
    fax: '(+216) 72 431 100',
    email: 'agency.bizerte@socotu.com.tn',
    restrictions: 'Max Permissible Draft: 10.70 m.\nCompulsory 2 tugs for transit through the Bizerte canal to Lake and Menzel Bourguiba.\nOil terminal operations subject to safety clearance.'
  },
  Gabes: {
    id: 'Gabes',
    name: 'Gabès Port',
    agencyTitle: 'SOCIETE COMMERCIALE TUNISIENNE - Agence Gabès',
    details: 'Zone Portuaire Industrielle, 6000 Gabès - Tunisia | TEL: (+216) 75 272 540 | E-MAIL: agency.gabes@socotu.com.tn',
    phone: '(+216) 75 272 540',
    fax: '(+216) 75 270 200',
    email: 'agency.gabes@socotu.com.tn',
    restrictions: 'Max Permissible Draft: 11.80 m.\nCompulsory 2 tugs inward & outward for all chemical, sulfur, and phosphoric acid vessels.'
  }
};

export const DEFAULT_SOCOTU_BANK = {
  companyName: 'SOCIETE COMMERCIALE TUNISIENNE',
  bankName: 'SOCIETE TUNISIENNE DE BANQUE',
  branch: 'AGENCE DE SOUSSE',
  swift: 'STBKTNTT',
  accNum: '10 500 002 0016016 788 25',
  iban: 'TN59 1050 0002 0016 0167 8825'
};

export const PORT_BERTHS: Record<PortId, string[]> = {
  Sousse: [
    'DISPONIBILITE DE POSTE A QUAI',
    'poste 01',
    'poste 02',
    'poste 03',
    'poste 04',
    'poste 05',
    'poste 06',
    'poste 07/01',
    'poste 07/02'
  ],
  Sfax: [
    'DISPONIBILITE DE POSTE A QUAI',
    'Quai M\'Dilla (Phosphate / Engrais)',
    'Quai N° 1 (Commerce Nord)',
    'Quai N° 2 (Commerce Nord)',
    'Quai N° 3 (Commerce Nord)',
    'Quai N° 4 (Commerce Nord)',
    'Quai N° 5 (Vracs solides Sud)',
    'Quai N° 6 (Vracs solides Sud)',
    'Quai N° 7 (Vracs solides Sud)',
    'Quai N° 8 (Vracs solides Sud)',
    'Quai Silos (Céréales)',
    'Poste Salines (Sel en vrac)',
    'Poste Pétrolier (Hydrocarbures)',
    'Poste d\'attente sur rade'
  ],
  Rades: [
    'DISPONIBILITE DE POSTE A QUAI',
    'Poste 1 (Conteneurs - Portique)',
    'Poste 2 (Conteneurs - Portique)',
    'Poste 3 (Conteneurs - Portique)',
    'Poste 4 (Conteneurs & Ro-Ro)',
    'Poste 5 (Roulier Ro-Ro)',
    'Poste 6 (Roulier Ro-Ro & Divers)',
    'Poste 7 (Poste Céréalier Silos)',
    'La Goulette - Quai Nord (Croisières / Passagers)',
    'La Goulette - Quai Sud (Marchandises & Vracs)',
    'Poste d\'attente sur rade'
  ],
  Bizerte: [
    'DISPONIBILITE DE POSTE A QUAI',
    'Quai de Commerce (Bizerte Centre)',
    'Quai Céréalier (Silos)',
    'Quai Pétrolier (STIR - Raffinerie)',
    'Quai Cimentier (Baie de Sebra)',
    'Quai Métallurgique (El Fouladh)',
    'Quai Menzel Bourguiba (Bassin de Radoub / Réparation)',
    'Poste d\'attente sur rade'
  ],
  Gabes: [
    'DISPONIBILITE DE POSTE A QUAI',
    'Poste N° 1 (Soufre & Produits Chimiques)',
    'Poste N° 2 (Acide Phosphorique / CPG)',
    'Poste N° 3 (Vracs solides & Ammoniac)',
    'Poste N° 4 (Marchandises Diverses)',
    'Poste N° 5 (Poste Pétrolier)',
    'Poste N° 6 (GCT / Engrais)',
    'Poste d\'attente sur rade'
  ]
};

export const SERVICE_OPTIONS = {
  Vessel: [
    'Fresh Water Supply',
    'Bunkering / Lubricants',
    'Ship Supply',
    'Garbage Removal',
    'Sludge / Waste Oil Removal',
    'Cleaning',
    'Laundry Service',
    'Repair & Maintenance',
    'Electrical Service',
    'Welding Service',
    'Plumbing Service',
    'Technical Service',
    'Fire Watch',
    'Watchman Service',
    'Transport Service',
    'Launch / Boat Service',
    'Diving Service',
    'Underwater Inspection',
    'Communication Service',
    'Other Vessel Service'
  ],
  Cargo: [
    'Cargo Survey',
    'Draft Survey',
    'Cargo Inspection',
    'Cargo Sampling',
    'Cargo Analysis',
    'Tallying',
    'Cargo Securing / Lashing',
    'Unlashing / Unsecuring',
    'Stevedoring Assistance',
    'Cargo Cleaning',
    'Cargo Protection',
    'Weighbridge / Weighing',
    'Storage / Warehousing',
    'Transport of Cargo',
    'Customs / Transit Service',
    'Fumigation',
    'Pest Control',
    'Other Cargo Service'
  ],
  Crew: [
    'Crew Transport',
    'Crew Change Assistance',
    'Crew Medical Assistance',
    'Hospital / Clinic',
    'Repatriation',
    'Visa / Immigration Assistance',
    'Telecommunication',
    'Cash to Master / Crew Advance',
    'Laundry / Washing',
    'Provision Supply',
    'Accommodation',
    'Airport Assistance',
    'Travel / Ticketing',
    'Shore Pass / Local Transport',
    'Other Crew Service'
  ]
};

export function createDefaultOfficialPda(): OfficialPdaModel {
  const loa = 160.00;
  const beam = 21.00;
  const draft = 8.38;
  const metrics = calcVesselMetrics(loa, beam, draft);

  const defaultLines = getDefaultMooringLines(metrics.volume); // 12 amarres for 28,157 m³ (JORT N°90)
  const portDues = calculatePortDues(
    metrics.volume, // 28 157 m3 -> 12 amarres
    1, // nShelter
    2, // nStay: 2 days
    2, // nPilot
    2, // nTug
    defaultLines, // 12 amarres
    '0', // normal
    0  // nLamanageBoat
  );

  // Lamanage unitaire TTC = (90 € embarcation + 12 amarres × 15 €) × 1.19 = 321.30 €
  const uMooringEUR = portDues.combinedMooringTotalEUR;
  const nMooring = 2; // 2 opérations (In / Out)

  const portExpenses = calculatePortExpenses(
    portDues.subtotalPortDuesEUR,
    uMooringEUR,
    nMooring,
    178.50, // uWatch: 150 * 1.19
    2,     // nWatch: 2 days
    150.0, // uGarb (0% TVA)
    1,     // nGarb
    1500.0,// agencyFees
    0,     // currencyControlRate
    [],    // additionalServices
    1.20,  // ex_rate (EUR to USD)
    defaultLines
  );

  return {
    id: 'pda-20260925165710',
    ref: 'PDA-20260925165710',
    date: new Date().toISOString().slice(0, 10),
    port: 'Sousse',
    branchName: 'SOCIETE COMMERCIALE TUNISIENNE - Agence Sousse',
    vessel: {
      name: 'MV PONTICA',
      flag: '',
      imo: '9370094',
      callSign: '8PSO7',
      loa,
      beam,
      draft,
      theorDraft: metrics.theorDraft,
      actualDraft: metrics.actualDraft,
      volume: metrics.volume,
      bracketName: metrics.bracketName,
      grt: 9556,
      nrt: 4378,
      weightCargo: 'ABT 5 000 MTS',
      cargo: 'EXHAUSTED POMACE (BIOMASS)',
      cargoOperation: 'Discharging',
      to: 'COE 2 SEA',
      attn: 'OPERATIONS'
    },
    targetCurrency: 'USD',
    exchangeRate: 1.20,
    portDues,
    portExpenses,
    selectedServicesList: [
      'Shelter Dues',
      'Stay Dues',
      'Pilotage',
      'Towage',
      'Mooring / Unmooring',
      'Watchman Service'
    ],
    bankDetails: { ...DEFAULT_SOCOTU_BANK },
    restrictions: SOCOTU_BRANCHES.Sousse.restrictions,
    vesselOwner: 'OCEANIC MARITIME SERVICES LTD',
    agentContact: 'bibi.aymen@socotu.com.tn | Mob: +216 21 352 109',
    remarks: 'Official OMMP & SOCOTU port tariff. Subject to actual port operations, berth availability and tug assistance.',
    savedAt: new Date().toISOString()
  };
}
