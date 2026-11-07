import * as z from "zod/mini";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import {
  customBackgroundSchema,
  persistedPreferencesSchema,
  themeModeSchema,
  type ThemeMode,
  type CustomBackground,
} from "./preferencesSchemas";

interface PreferencesState {
  themeMode: ThemeMode;
  customBackground: CustomBackground;
  aiEnabled: boolean;
  setThemeMode: (value: ThemeMode) => void;
  setCustomBackground: (value: CustomBackground) => void;
  setAiEnabled: (value: boolean) => void;
}

const storage = {
  getItem: (key: string) => {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {}
  },
  removeItem: (key: string) => {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {}
  },
} satisfies StateStorage;
const read = (key: string): string | null => storage.getItem(key);
const write = (key: string, value: string) => {
  void storage.setItem(key, value);
};
const readThemeMode = (): ThemeMode => {
  const parsed = themeModeSchema.safeParse(read("superflex-theme-mode"));
  return parsed.success ? parsed.data : "light";
};
const readCustomBackground = (): CustomBackground => {
  const parsed = customBackgroundSchema.safeParse({
    enabled: read("superflex-bg-enabled") === "true",
    url: read("superflex-bg-url") || "",
  });
  return parsed.success ? parsed.data : { enabled: false, url: "" };
};
function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", mode === "dark");
}

export const createPreferencesStore = () =>
  create<PreferencesState>()(
    persist(
      (set) => ({
        themeMode: readThemeMode(),
        customBackground: readCustomBackground(),
        aiEnabled: read("superflex_ai_enabled") !== "false",
        setThemeMode: (value) => {
          const parsed = themeModeSchema.safeParse(value);
          if (!parsed.success) return;
          set({ themeMode: parsed.data });

          write("superflex-theme-mode", parsed.data);
          applyTheme(parsed.data);
        },
        setCustomBackground: (value) => {
          const parsed = customBackgroundSchema.safeParse(value);
          if (!parsed.success) return;
          set({ customBackground: parsed.data });
          write("superflex-bg-enabled", String(parsed.data.enabled));
          write("superflex-bg-url", parsed.data.url);
        },
        setAiEnabled: (value) => {
          const parsed = z.boolean().safeParse(value);
          if (!parsed.success) return;
          set({ aiEnabled: parsed.data });
          write("superflex_ai_enabled", String(parsed.data));
        },
      }),
      {
        name: "superflex-preferences-v1",
        version: 2,
        storage: createJSONStorage(() => storage),
        partialize: ({ themeMode, customBackground, aiEnabled }) => ({
          themeMode,
          customBackground,
          aiEnabled,
        }),
        migrate: (persisted) => {
          storage.removeItem("superflex-nav-order");
          const parsed = persistedPreferencesSchema.safeParse(persisted);
          return parsed.success ? parsed.data : {};
        },
        merge: (persisted, current) => {
          const parsed = persistedPreferencesSchema.safeParse(persisted);
          return {
            ...current,
            ...(parsed.success ? parsed.data : {}),
          };
        },
      },
    ),
  );

export const usePreferencesStore = createPreferencesStore();

if (typeof window !== "undefined") {
  applyTheme(usePreferencesStore.getState().themeMode);

  window.addEventListener("storage", (event) => {
    if (event.key === "superflex-preferences-v1" || event.key === null) {
      void usePreferencesStore.persist.rehydrate();
      applyTheme(usePreferencesStore.getState().themeMode);
    } else if (event.key === "superflex-theme-mode") {
      usePreferencesStore.getState().setThemeMode(readThemeMode());
    } else if (event.key === "superflex_ai_enabled") {
      usePreferencesStore.getState().setAiEnabled(read("superflex_ai_enabled") !== "false");
    }
  });

  window.addEventListener("superflex-custom-background-changed", (event) => {
    const parsed = customBackgroundSchema.safeParse((event as CustomEvent<unknown>).detail);
    if (parsed.success) usePreferencesStore.getState().setCustomBackground(parsed.data);
  });
}
