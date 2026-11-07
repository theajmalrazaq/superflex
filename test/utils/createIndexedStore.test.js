import { beforeEach, expect, it, vi } from "vitest";
import { openDB } from "idb";
import { createIndexedStore } from "../../src/utils/createIndexedStore";

vi.mock("idb", () => ({ openDB: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

it("aborts and preserves the updater error", async () => {
  let rejectDone;
  const done = new Promise((_, reject) => {
    rejectDone = reject;
  });
  const store = { get: vi.fn().mockResolvedValue({ count: 1 }), put: vi.fn() };
  const transaction = {
    objectStore: () => store,
    abort: vi.fn(() => rejectDone(new Error("transaction aborted"))),
    done,
  };
  openDB.mockResolvedValue({ transaction: () => transaction });

  const originalError = new Error("updater failed");
  const indexedStore = createIndexedStore("test", "data");
  await expect(
    indexedStore.update("counter", () => {
      throw originalError;
    }),
  ).rejects.toBe(originalError);
  expect(transaction.abort).toHaveBeenCalledOnce();
  expect(store.put).not.toHaveBeenCalled();
});

it("rejects asynchronous updater results before writing", async () => {
  let rejectDone;
  const done = new Promise((_, reject) => {
    rejectDone = reject;
  });
  const store = { get: vi.fn().mockResolvedValue(null), put: vi.fn() };
  const transaction = {
    objectStore: () => store,
    abort: vi.fn(() => rejectDone(new Error("transaction aborted"))),
    done,
  };
  openDB.mockResolvedValue({ transaction: () => transaction });

  const indexedStore = createIndexedStore("test", "data");
  await expect(indexedStore.update("counter", () => Promise.resolve({ count: 1 }))).rejects.toThrow(
    "must return synchronously",
  );
  expect(store.put).not.toHaveBeenCalled();
});
