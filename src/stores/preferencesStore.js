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

const readNavOrder = () => {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem("superflex-nav-order");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const legacy = localStorage.getItem("superflex-preferences-v1");
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      if (Array.isArray(parsedLegacy?.state?.navOrder) && parsedLegacy.state.navOrder.length > 0) {
        return parsedLegacy.state.navOrder;
      }
    }
  } catch {}
  return [];
};

const initialThemeMode = readThemeMode();

export const usePreferencesStore = create(
  persist(
    (set) => ({
      themeMode: initialThemeMode,
      customBackground: readCustomBackground(),
      navOrder: readNavOrder(),
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
        if (parsed.success) {
          const unique = [...new Set(parsed.data)];
          try {
            localStorage.setItem("superflex-nav-order", JSON.stringify(unique));
          } catch {}
          set({ navOrder: unique });
        }
      },
    }),
    {
      name: "superflex-preferences-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ navOrder }) => ({ navOrder }),
      merge: (persisted, current) => {
        const parsed = persistedPreferencesSchema.safeParse(persisted);
        const storedOrder = readNavOrder();
        const mergedOrder =
          storedOrder.length > 0
            ? storedOrder
            : parsed.success && parsed.data.navOrder.length > 0
              ? parsed.data.navOrder
              : current.navOrder;
        return { ...current, navOrder: mergedOrder };
      },
    },
  ),
);
