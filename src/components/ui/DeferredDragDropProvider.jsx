import React, { useEffect, useMemo } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { DragDropManager } from "@dnd-kit/dom";

export class DeferredCleanupManager extends DragDropManager {
  cleanupVersion = 0;

  constructor(options) {
    super(options);
    const originalDestroy = this.destroy.bind(this);
    this.destroy = () => {
      const cleanupVersion = ++this.cleanupVersion;
      queueMicrotask(() => {
        if (cleanupVersion === this.cleanupVersion) {
          try {
            originalDestroy();
          } catch {
          }
        }
      });
    };
  }

  cancelDeferredDestroy() {
    this.cleanupVersion += 1;
  }
}

export default function DeferredDragDropProvider({ children, ...props }) {
  const manager = useMemo(() => new DeferredCleanupManager(props), []);

  useEffect(() => {
    manager.cancelDeferredDestroy();
  }, [manager]);

  return (
    <DragDropProvider {...props} manager={manager}>
      {children}
    </DragDropProvider>
  );
}
