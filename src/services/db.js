const DB_NAME = 'CuiBonoIntelEngineDB';
const DB_VERSION = 1;
const CASE_STORE = 'cases';
const ICON_STORE = 'custom_icons';
const ACTIVE_CASE_KEY = 'ACTIVE_WORKSPACE_CASE';

export const INITIAL_EMPTY_CASE_FILE = {
  schemaVersion: '1.0.0',
  exportedAt: '',
  event: null,
  actors: [],
  evidences: [],
  osintEntities: [],
  matrix: {
    eventId: '',
    scores: [],
    calculatedNetScores: {},
    lastCalculatedAt: null,
  },
};

export function openIntelDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CASE_STORE)) db.createObjectStore(CASE_STORE);
      if (!db.objectStoreNames.contains(ICON_STORE)) db.createObjectStore(ICON_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('IndexedDB açılamadı.'));
  });
}

export async function loadActiveCaseFromIndexedDB() {
  try {
    const db = await openIntelDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(CASE_STORE, 'readonly');
      const req = tx.objectStore(CASE_STORE).get(ACTIVE_CASE_KEY);
      req.onsuccess = () => {
        if (req.result && req.result.schemaVersion === '1.0.0') {
          resolve({
            ...INITIAL_EMPTY_CASE_FILE,
            ...req.result,
            osintEntities: req.result.osintEntities || [],
          });
        } else {
          resolve(INITIAL_EMPTY_CASE_FILE);
        }
      };
      req.onerror = () => resolve(INITIAL_EMPTY_CASE_FILE);
    });
  } catch {
    return INITIAL_EMPTY_CASE_FILE;
  }
}

export async function saveActiveCaseToIndexedDB(caseFile) {
  const db = await openIntelDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CASE_STORE, 'readwrite');
    tx.objectStore(CASE_STORE).put(caseFile, ACTIVE_CASE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearActiveCaseInIndexedDB() {
  const db = await openIntelDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CASE_STORE, 'readwrite');
    tx.objectStore(CASE_STORE).delete(ACTIVE_CASE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveCustomIconToIndexedDB(id, name, dataUrl) {
  const db = await openIntelDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ICON_STORE, 'readwrite');
    tx.objectStore(ICON_STORE).put({ id, name, dataUrl });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllCustomIconsFromIndexedDB() {
  try {
    const db = await openIntelDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(ICON_STORE, 'readonly');
      const req = tx.objectStore(ICON_STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}
