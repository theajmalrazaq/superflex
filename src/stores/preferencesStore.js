import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  customBackgroundSchema,
  navOrderSchema,
  persistedPreferencesSchema,
  themeModeSchema,
} from "./preferencesSchemas";

const readThemeMode = () => {
  if (typeof localStorage === "undefined") return "light";
  const parsed = themeModeSchema.safeParse(localStorage.getItem("superflex-theme-mode"));
  return parsed.success ? parsed.data : "light";
};

const readCustomBackground = () => {
  if (typeof localStorage === "undefined") return { enabled: false, url: "" };
  const parsed = customBackgroundSchema.safeParse({
    enabled: localStorage.getItem("superflex-bg-enabled") === "true",
    url: localStorage.getItem("superflex-bg-url") || "",
  });
  return parsed.success ? parsed.data : { enabled: false, url: "" };
};

const initialThemeMode = readThemeMode();

export const usePreferencesStore = create(
  persist(
    (set) => ({
      themeMode: initialThemeMode,
      customBackground: readCustomBackground(),
      navOrder: [],
      setThemeMode: (themeMode) => {
        const parsed = themeModeSchema.safeParse(themeMode);
        if (parsed.success) set({ themeMode: parsed.data });
      },
      setCustomBackground: (customBackground) => {
        const parsed = customBackgroundSchema.safeParse(customBackground);
        if (parsed.success) set({ customBackground: parsed.data });
      },
      setNavOrder: (navOrder) => {
        const parsed = navOrderSchema.safeParse(navOrder);
        if (parsed.success) set({ navOrder: [...new Set(parsed.data)] });
      },
    }),
    {
      name: "superflex-preferences-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ navOrder }) => ({ navOrder }),
      merge: (persisted, current) => {
        const parsed = persistedPreferencesSchema.safeParse(persisted);
        return parsed.success ? { ...current, ...parsed.data } : current;
      },
    },
  ),
);
