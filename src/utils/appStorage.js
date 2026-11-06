import { openDB } from "idb";

const DATABASE_NAME = "superflex-app";
const DATABASE_VERSION = 1;
const STORE_NAME = "user-data";

const databasePromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME);
    }
  },
});
const migrationPromises = new Map();

export const getAppData = async (key) => {
  const database = await databasePromise;
  return (await database.get(STORE_NAME, key)) ?? null;
};

export const setAppData = async (key, value) => {
  const database = await databasePromise;
  await database.put(STORE_NAME, value, key);
  return value;
};

export const deleteAppData = async (key) => {
  const database = await databasePromise;
  await database.delete(STORE_NAME, key);
};

export const updateAppData = async (key, updater) => {
  const database = await databasePromise;
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const nextValue = updater((await store.get(key)) ?? null);
  if (nextValue == null) await store.delete(key);
  else await store.put(nextValue, key);
  await transaction.done;
  return nextValue ?? null;
};

export const migrateLocalStorageValue = async (key, legacyKey = key) => {
  if (!migrationPromises.has(key)) {
    migrationPromises.set(
      key,
      (async () => {
        const stored = await getAppData(key);
        if (stored != null) return stored;

        const legacy = localStorage.getItem(legacyKey);
        if (legacy == null) return null;

        await setAppData(key, legacy);
        localStorage.removeItem(legacyKey);
        return legacy;
      })(),
    );
  }
  await migrationPromises.get(key);
  return getAppData(key);
};

export const migrateLocalStorageJson = async (key, legacyKey = key, fallback = null) => {
  if (!migrationPromises.has(key)) {
    migrationPromises.set(
      key,
      (async () => {
        const stored = await getAppData(key);
        if (stored != null) return stored;

        const legacy = localStorage.getItem(legacyKey);
        if (legacy == null) return fallback;

        try {
          const parsed = JSON.parse(legacy);
          await setAppData(key, parsed);
          localStorage.removeItem(legacyKey);
          return parsed;
        } catch {
          localStorage.removeItem(legacyKey);
          return fallback;
        }
      })(),
    );
  }
  await migrationPromises.get(key);
  return (await getAppData(key)) ?? fallback;
};
