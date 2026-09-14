import { Patient } from '../types';

const DB_NAME = 'FieldCarePatientsDB';
const DB_VERSION = 1;
const STORE_NAME = 'patients';
const LOCAL_STORAGE_KEY = 'fieldcare_patients_backup';

// Generate unique PAT-XXXXXX identifier
export function generatePatientId(existingIds?: Set<string>): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let id = '';
  let attempts = 0;
  
  do {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    id = `PAT-${code}`;
    attempts++;
  } while (existingIds && existingIds.has(id) && attempts < 50);

  return id;
}

// Open IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('diagnosis', 'diagnosis', { unique: false });
        store.createIndex('camp', 'camp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

// Fallback to localStorage if IndexedDB has issues
function getFromLocalStorage(): Patient[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read from localStorage fallback', e);
    return [];
  }
}

function saveToLocalStorage(patients: Patient[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
  } catch (e) {
    console.warn('Failed to write to localStorage fallback', e);
  }
}

// Retrieve all patients
export async function getAllPatients(): Promise<Patient[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results: Patient[] = request.result || [];
        // Sort newest first by default
        results.sort((a, b) => b.createdAt - a.createdAt);
        // Also sync to localStorage fallback for redundancy
        saveToLocalStorage(results);
        resolve(results);
      };

      request.onerror = () => {
        console.warn('IndexedDB getAll error, falling back to localStorage');
        resolve(getFromLocalStorage());
      };
    });
  } catch (err) {
    console.warn('IndexedDB unavailable, using localStorage fallback', err);
    return getFromLocalStorage();
  }
}

// Save or add a patient
export async function savePatient(patient: Patient): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(patient);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB put failed, updating localStorage directly', err);
  }

  // Always update localStorage mirror
  const current = getFromLocalStorage();
  const existingIdx = current.findIndex(p => p.id === patient.id);
  if (existingIdx >= 0) {
    current[existingIdx] = patient;
  } else {
    current.unshift(patient);
  }
  saveToLocalStorage(current);
}

// Delete a patient
export async function deletePatient(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete failed', err);
  }

  const current = getFromLocalStorage().filter(p => p.id !== id);
  saveToLocalStorage(current);
}

// Clean text for CSV: handle commas, double quotes, line breaks
function sanitizeCSVField(val: unknown): string {
  if (val === null || val === undefined) {
    return '""';
  }
  const str = String(val).trim();
  // Escape double quotes by doubling them: " -> ""
  const escaped = str.replace(/"/g, '""');
  // Always wrap in quotes to preserve formatting and punctuation
  return `"${escaped}"`;
}

// CSV Export functionality meeting all requirements:
// Gathers all records, formats with header: ID, Name, Age, Diagnosis, Camp, Block, Household, Landmark, CreatedAt
// Sanitizes entries and triggers browser file download as "patients_export.csv"
export function exportToCSV(patients: Patient[]): void {
  const headers = [
    'ID',
    'Name',
    'Age',
    'Diagnosis',
    'Camp',
    'Block',
    'Household',
    'Landmark',
    'CreatedAt',
  ];

  const rows = patients.map((p) => {
    // Format timestamp cleanly as ISO string and readable human date
    const dateFormatted = new Date(p.createdAt).toISOString();
    return [
      sanitizeCSVField(p.id),
      sanitizeCSVField(p.name),
      sanitizeCSVField(p.age),
      sanitizeCSVField(p.diagnosis),
      sanitizeCSVField(p.camp || ''),
      sanitizeCSVField(p.block || ''),
      sanitizeCSVField(p.household || ''),
      sanitizeCSVField(p.landmark || ''),
      sanitizeCSVField(dateFormatted),
    ].join(',');
  });

  // Include UTF-8 BOM (\uFEFF) for Excel & spreadsheet software compatibility
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'patients_export.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Initial realistic field records for offline health clinic
export const INITIAL_FIELD_PATIENTS: Patient[] = [
  {
    id: 'PAT-942810',
    name: 'Fatima Begum',
    age: 34,
    diagnosis: 'Acute Respiratory Infection',
    camp: 'Camp 1 East',
    block: 'Block B-4',
    household: 'HH-082',
    landmark: 'Near Water Point 3',
    createdAt: Date.now() - 3600000 * 2, // 2 hours ago
  },
  {
    id: 'PAT-619284',
    name: 'Mohammad Tariq',
    age: 7,
    diagnosis: 'Malaria',
    camp: 'Camp 4 Extension',
    block: 'Block D-1',
    household: 'HH-144',
    landmark: 'Behind Red Cross Tent',
    createdAt: Date.now() - 3600000 * 5, // 5 hours ago
  },
  {
    id: 'PAT-382915',
    name: 'Amina Khatun',
    age: 26,
    diagnosis: 'Antenatal Care / Pregnancy',
    camp: 'Camp 1 East',
    block: 'Block A-2',
    household: 'HH-019',
    landmark: 'West Bamboo Footbridge',
    createdAt: Date.now() - 3600000 * 18, // 18 hours ago
  },
  {
    id: 'PAT-751930',
    name: 'Rashid Ahmed',
    age: 62,
    diagnosis: 'Hypertension',
    camp: 'Camp 2 North',
    block: 'Block C-7',
    household: 'HH-210',
    landmark: 'Near Solar Lighting Post 12',
    createdAt: Date.now() - 3600000 * 28, // 1 day ago
  },
  {
    id: 'PAT-209481',
    name: 'Nadia Yasmin',
    age: 3,
    diagnosis: 'Severe Acute Malnutrition',
    camp: 'Camp 4 Extension',
    block: 'Block D-3',
    household: 'HH-093',
    landmark: 'Beside Community Learning Center',
    createdAt: Date.now() - 3600000 * 40, // 1.5 days ago
  },
  {
    id: 'PAT-582019',
    name: 'Zakir Hossain',
    age: 45,
    diagnosis: 'Gastroenteritis / Dehydration',
    camp: 'Camp 3 South',
    block: 'Block F-2',
    household: 'HH-301',
    landmark: 'Opposite Tube Well 7',
    createdAt: Date.now() - 3600000 * 55, // 2 days ago
  },
];

// Seed initial data if database is empty on first boot
export async function seedInitialDataIfEmpty(): Promise<Patient[]> {
  const existing = await getAllPatients();
  if (existing.length === 0) {
    for (const patient of INITIAL_FIELD_PATIENTS) {
      await savePatient(patient);
    }
    return INITIAL_FIELD_PATIENTS;
  }
  return existing;
}

// Common field health diagnoses for dropdown selection
export const COMMON_FIELD_DIAGNOSES = [
  'Acute Respiratory Infection',
  'Malaria',
  'Gastroenteritis / Dehydration',
  'Severe Acute Malnutrition',
  'Antenatal Care / Pregnancy',
  'Hypertension',
  'Diabetes Mellitus',
  'Skin Infection / Scabies',
  'Tuberculosis Screening',
  'Eye Infection / Conjunctivitis',
  'Trauma / Burn / Injury',
  'Suspected Cholera / Watery Diarrhea',
  'Other / Custom Diagnosis',
] as const;

// Common field camps for quick suggestion
export const COMMON_CAMPS = [
  'Camp 1 East',
  'Camp 1 West',
  'Camp 2 North',
  'Camp 3 South',
  'Camp 4 Extension',
  'Transit Center',
  'Host Community Sector A',
] as const;
