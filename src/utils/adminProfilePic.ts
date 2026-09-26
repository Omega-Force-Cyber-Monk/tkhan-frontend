const DB_NAME = "AdminDashboardDB";
const STORE_NAME = "settings";
const LEGACY_KEY = "adminProfilePic";

export const PROFILE_PIC_UPDATED = "admin-profile-pic-updated";

const profilePicKey = (userId?: string | null) =>
  userId ? `${LEGACY_KEY}:${userId}` : LEGACY_KEY;

const openImageDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const readFromDB = async (key: string): Promise<string | null> => {
  try {
    const db = await openImageDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(key);
    return await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB Get Error:", err);
    return null;
  }
};

const writeToDB = async (key: string, value: string): Promise<void> => {
  try {
    const db = await openImageDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("IndexedDB Save Error:", err);
  }
};

const readFromStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeToStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.error("Profile picture storage error:", err);
  }
};

const storageKeys = (userId?: string | null) =>
  userId ? [profilePicKey(userId), LEGACY_KEY] : [LEGACY_KEY];

const isSavedProfileUrl = (value: string | null): value is string =>
  !!value && /^https?:\/\//.test(value);

export function readSavedProfileImage(userId?: string | null): string | null {
  for (const key of storageKeys(userId)) {
    const saved = readFromStorage(key);
    if (isSavedProfileUrl(saved)) return saved;
  }
  return null;
}

export async function loadAdminProfilePic(
  userId?: string | null,
): Promise<string | null> {
  const fromStorage = readSavedProfileImage(userId);
  if (fromStorage) return fromStorage;

  for (const key of storageKeys(userId)) {
    const fromDb = await readFromDB(key);
    if (isSavedProfileUrl(fromDb)) return fromDb;
  }
  return null;
}

export async function saveAdminProfilePic(
  userId: string | null | undefined,
  dataUrl: string,
) {
  for (const key of storageKeys(userId)) {
    writeToStorage(key, dataUrl);
    await writeToDB(key, dataUrl);
  }

  window.dispatchEvent(
    new CustomEvent(PROFILE_PIC_UPDATED, { detail: dataUrl }),
  );
}
