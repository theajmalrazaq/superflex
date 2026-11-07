import { openDB, type IDBPDatabase } from "idb";

export function createIndexedStore(databaseName: string, storeName: string) {
  let databasePromise: Promise<IDBPDatabase> | undefined;
  const getDatabase = () => {
    if (!databasePromise) {
      databasePromise = openDB(databaseName, 1, {
        upgrade(database) {
          if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName);
          }
        },
      }).catch((error) => {
        databasePromise = undefined;
        throw error;
      });
    }
    return databasePromise;
  };

  return {
    async get<T = any>(key: IDBValidKey): Promise<T | null> {
      const database = await getDatabase();
      return (await database.get(storeName, key)) ?? null;
    },
    async set<T>(key: IDBValidKey, value: T): Promise<T> {
      const database = await getDatabase();
      await database.put(storeName, value, key);
      return value;
    },
    async delete(key: IDBValidKey) {
      const database = await getDatabase();
      await database.delete(storeName, key);
    },
    async update<T = any>(
      key: IDBValidKey,
      updater: (current: T | null) => T | null | undefined,
    ): Promise<T | null> {
      const database = await getDatabase();
      const transaction = database.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      try {
        const nextValue = updater((await store.get(key)) ?? null);
        if (nextValue && typeof (nextValue as { then?: unknown }).then === "function") {
          void Promise.resolve(nextValue).catch(() => {});
          throw new TypeError("IndexedDB updater must return synchronously");
        }
        if (nextValue == null) await store.delete(key);
        else await store.put(nextValue, key);
        await transaction.done;
        return nextValue ?? null;
      } catch (error) {
        try {
          transaction.abort();
        } catch {}
        try {
          await transaction.done;
        } catch {}
        throw error;
      }
    },
  };
}
