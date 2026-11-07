import { describe, expect, it } from "vitest";
import { DeferredCleanupManager } from "../../../src/components/ui/DeferredDragDropProvider";

describe("DeferredCleanupManager", () => {
  it("defers destroy to a microtask instead of executing synchronously during insertion effects", async () => {
    const manager = new DeferredCleanupManager();
    let syncDestroyOccurred = false;
    let destroyedDuringSync = false;
    let destroyed = false;

    manager.registry.plugins.register(
      class SpyPlugin {
        destroy() {
          if (!syncDestroyOccurred) {
            destroyedDuringSync = true;
          }
          destroyed = true;
        }
      },
    );

    manager.destroy();
    syncDestroyOccurred = true;

    expect(destroyedDuringSync).toBe(false);
    expect(destroyed).toBe(false);

    await Promise.resolve();

    expect(destroyed).toBe(true);
  });

  it("cancels deferred destruction when cancelDeferredDestroy is invoked", async () => {
    const manager = new DeferredCleanupManager();
    let destroyed = false;

    manager.registry.plugins.register(
      class SpyPlugin {
        destroy() {
          destroyed = true;
        }
      },
    );

    manager.destroy();
    manager.cancelDeferredDestroy();

    await Promise.resolve();

    expect(destroyed).toBe(false);
  });
});
