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

export const readNavOrder = () => {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem("superflex-nav-order");
    if (raw === null) return null;
    const parsed = navOrderSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const resolveNavOrder = (storedOrder, parsed, currentOrder) =>
  storedOrder !== null ? storedOrder : parsed.success ? parsed.data.navOrder : currentOrder;

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
        const mergedOrder = resolveNavOrder(storedOrder, parsed, current.navOrder);
        return { ...current, navOrder: mergedOrder };
      },
    },
  ),
);
