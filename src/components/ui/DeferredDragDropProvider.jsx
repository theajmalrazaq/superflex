import React, { useEffect, useMemo } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { DragDropManager } from "@dnd-kit/dom";

class DeferredCleanupManager extends DragDropManager {
  cleanupVersion = 0;

  destroy() {
    // The adapter's insertion-effect cleanup must not synchronously notify React subscribers.
    const cleanupVersion = ++this.cleanupVersion;
    queueMicrotask(() => {
      if (cleanupVersion === this.cleanupVersion) super.destroy();
    });
  }

  cancelDeferredDestroy() {
    this.cleanupVersion += 1;
  }
}

export default function DeferredDragDropProvider({ children, ...props }) {
  const manager = useMemo(() => new DeferredCleanupManager(), []);

  useEffect(() => {
    manager.cancelDeferredDestroy();
  }, [manager]);

  return (
    <DragDropProvider {...props} manager={manager}>
      {children}
    </DragDropProvider>
  );
}
