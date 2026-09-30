export interface VesselRecord {
  imo: string;
  name: string;
  flag: string;
  callSign: string;
  vesselType: string;
  loa: number;
  beam: number;
  draft: number;
  grt: number;
  nrt: number;
  dwt?: number;
  yearBuilt?: number;
  portOfRegistry?: string;
}

const LOCAL_STORAGE_VESSELS_KEY = 'SOCOTU_CUSTOM_VESSEL_DB';

export const INITIAL_VESSEL_DATABASE: VesselRecord[] = [
  {
    imo: '9198642',
    name: 'JOY X',
    flag: 'Panama',
    callSign: '3FFE8',
    vesselType: 'General Cargo / Bulk',
    loa: 108.2,
    beam: 18.2,
    draft: 7.2,
    grt: 4990,
    nrt: 2650,
    dwt: 7500,
    yearBuilt: 2000,
    portOfRegistry: 'Panama'
  },
  {
    imo: '9384722',
    name: 'OCEAN STAR',
    flag: 'Malta',
    callSign: '9HA2345',
    vesselType: 'Bulk Carrier',
    loa: 115.0,
    beam: 16.5,
    draft: 6.4,
    grt: 4500,
    nrt: 2300,
    dwt: 6800,
    yearBuilt: 2007,
    portOfRegistry: 'Valletta'
  },
  {
    imo: '9180188',
    name: 'CARTHAGE',
    flag: 'Tunisia',
    callSign: 'TSAK',
    vesselType: 'Ro-Ro / Passenger',
    loa: 166.0,
    beam: 27.4,
    draft: 6.5,
    grt: 32298,
    nrt: 15000,
    dwt: 4500,
    yearBuilt: 1999,
    portOfRegistry: 'Tunis / La Goulette'
  },
  {
    imo: '9598579',
    name: 'TANIT',
    flag: 'Tunisia',
    callSign: 'TSNT',
    vesselType: 'Ro-Ro / Passenger',
    loa: 212.0,
    beam: 30.0,
    draft: 7.0,
    grt: 52600,
    nrt: 24500,
    dwt: 6500,
    yearBuilt: 2012,
    portOfRegistry: 'Tunis / La Goulette'
  },
  {
    imo: '9133408',
    name: 'MEDKON GEMLIK',
    flag: 'Turkey',
    callSign: 'TCA321',
    vesselType: 'Container Ship',
    loa: 100.5,
    beam: 16.0,
    draft: 5.9,
    grt: 3806,
    nrt: 1890,
    dwt: 5100,
    yearBuilt: 1996,
    portOfRegistry: 'Istanbul'
  },
  {
    imo: '9454400',
    name: 'CMA CGM CORTE REAL',
    flag: 'France',
    callSign: 'FMOX',
    vesselType: 'Container Ship',
    loa: 365.5,
    beam: 51.2,
    draft: 15.5,
    grt: 151446,
    nrt: 60233,
    dwt: 165500,
    yearBuilt: 2010,
    portOfRegistry: 'Marseille'
  },
  {
    imo: '9200456',
    name: 'AMILCAR',
    flag: 'Tunisia',
    callSign: 'TSAM',
    vesselType: 'General Cargo',
    loa: 130.0,
    beam: 19.5,
    draft: 7.0,
    grt: 7200,
    nrt: 3400,
    dwt: 9200,
    yearBuilt: 2001,
    portOfRegistry: 'Sousse'
  },
  {
    imo: '9145678',
    name: 'HABIB EXPRESS',
    flag: 'Panama',
    callSign: 'HP4567',
    vesselType: 'General Cargo',
    loa: 142.5,
    beam: 22.0,
    draft: 6.8,
    grt: 11450,
    nrt: 5200,
    dwt: 9800,
    yearBuilt: 1998,
    portOfRegistry: 'Panama'
  },
  {
    imo: '9356789',
    name: 'SEA PATRON',
    flag: 'Liberia',
    callSign: 'A8PO9',
    vesselType: 'Bulk Carrier',
    loa: 122.0,
    beam: 18.0,
    draft: 6.9,
    grt: 5600,
    nrt: 2900,
    dwt: 8100,
    yearBuilt: 2006,
    portOfRegistry: 'Monrovia'
  },
  {
    imo: '9287654',
    name: 'LADY AMNA',
    flag: 'Togo',
    callSign: '5VBA',
    vesselType: 'General Cargo',
    loa: 98.0,
    beam: 14.5,
    draft: 5.8,
    grt: 2990,
    nrt: 1540,
    dwt: 4200,
    yearBuilt: 2004,
    portOfRegistry: 'Lome'
  },
  {
    imo: '9178901',
    name: 'PRINCESS NORA',
    flag: 'Sierra Leone',
    callSign: '9LA23',
    vesselType: 'General Cargo',
    loa: 105.0,
    beam: 15.8,
    draft: 6.2,
    grt: 3850,
    nrt: 2100,
    dwt: 5500,
    yearBuilt: 1999,
    portOfRegistry: 'Freetown'
  },
  {
    imo: '9234567',
    name: 'VITA',
    flag: 'Marshall Islands',
    callSign: 'V7A12',
    vesselType: 'Bulk Carrier',
    loa: 138.0,
    beam: 21.0,
    draft: 7.5,
    grt: 8500,
    nrt: 4100,
    dwt: 11500,
    yearBuilt: 2002,
    portOfRegistry: 'Majuro'
  },
  {
    imo: '9123456',
    name: 'ATLANTIC STAR',
    flag: 'Cyprus',
    callSign: '5BXY',
    vesselType: 'Chemical / Oil Tanker',
    loa: 150.0,
    beam: 23.5,
    draft: 8.2,
    grt: 12000,
    nrt: 6200,
    dwt: 16000,
    yearBuilt: 1997,
    portOfRegistry: 'Limassol'
  },
  {
    imo: '9456789',
    name: 'MARITIME LADY',
    flag: 'Bahamas',
    callSign: 'C6TR',
    vesselType: 'Handysize Bulk Carrier',
    loa: 175.0,
    beam: 28.0,
    draft: 9.8,
    grt: 19800,
    nrt: 10200,
    dwt: 28500,
    yearBuilt: 2011,
    portOfRegistry: 'Nassau'
  },
  {
    imo: '9312345',
    name: 'CAPE FLORES',
    flag: 'Panama',
    callSign: '3EBC',
    vesselType: 'Supramax Bulk Carrier',
    loa: 189.9,
    beam: 32.2,
    draft: 11.5,
    grt: 30500,
    nrt: 16200,
    dwt: 53000,
    yearBuilt: 2005,
    portOfRegistry: 'Panama'
  },
  {
    imo: '9412345',
    name: 'ELEEN SOFIA',
    flag: 'Malta',
    callSign: '9HB34',
    vesselType: 'Handymax Bulk Carrier',
    loa: 180.0,
    beam: 30.0,
    draft: 10.2,
    grt: 24000,
    nrt: 12800,
    dwt: 35000,
    yearBuilt: 2009,
    portOfRegistry: 'Valletta'
  }
];

export function getCustomVessels(): VesselRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VESSELS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse custom vessels from localStorage', e);
  }
  return [];
}

export function getAllVessels(): VesselRecord[] {
  const custom = getCustomVessels();
  // Merge custom over initial by IMO
  const map = new Map<string, VesselRecord>();
  for (const v of INITIAL_VESSEL_DATABASE) {
    map.set(v.imo.toLowerCase().trim(), v);
  }
  for (const v of custom) {
    map.set(v.imo.toLowerCase().trim(), v);
  }
  return Array.from(map.values());
}

export function searchVessels(query: string): VesselRecord[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return getAllVessels().slice(0, 10);

  const all = getAllVessels();
  return all.filter(v => 
    v.imo.toLowerCase().includes(clean) ||
    v.name.toLowerCase().includes(clean) ||
    (v.callSign && v.callSign.toLowerCase().includes(clean)) ||
    (v.flag && v.flag.toLowerCase().includes(clean))
  );
}

export function getVesselByImo(imo: string): VesselRecord | undefined {
  const clean = imo.trim().toLowerCase();
  return getAllVessels().find(v => v.imo.toLowerCase() === clean);
}

export function saveVesselToLocalDb(record: VesselRecord): void {
  try {
    const current = getCustomVessels();
    const cleanImo = record.imo.trim();
    const existingIndex = current.findIndex(v => v.imo.trim() === cleanImo);
    let updated: VesselRecord[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...current];
    }
    localStorage.setItem(LOCAL_STORAGE_VESSELS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save vessel to localStorage', e);
  }
}
