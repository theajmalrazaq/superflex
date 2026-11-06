import { useState, useEffect } from "react";
import { getAiContext, updateAiContext } from "../utils/userDataStorage";

export const useAiSync = ({ data, dataKey, syncKey, isEnabled = true, eventExtras = {} }) => {
  const serializedEventExtras = JSON.stringify(eventExtras);
  const [permissionStatus, setPermissionStatus] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("superflex_ai_data_permission");
    }
    return "pending";
  });

  useEffect(() => {
    const handlePermissionUpdate = (e) => {
      setPermissionStatus(e.detail);
    };
    window.addEventListener("superflex-permission-updated", handlePermissionUpdate);
    return () => {
      window.removeEventListener("superflex-permission-updated", handlePermissionUpdate);
    };
  }, []);

  useEffect(() => {
    if (isEnabled && permissionStatus === "granted") {
      const syncData = async () => {
        try {
          await getAiContext();
          const newContext = await updateAiContext((storedContext) => {
            const existing = storedContext || window.superflex_ai_context || {};
            const nextContext = dataKey
              ? { ...existing, [dataKey]: data }
              : typeof data === "object" && data !== null
                ? { ...existing, ...data }
                : { ...existing };

            nextContext.lastSync = {
              ...existing.lastSync,
              [syncKey]: new Date().toISOString(),
            };
            return nextContext;
          });

          window.superflex_ai_context = newContext;
          window.dispatchEvent(
            new CustomEvent("superflex-data-updated", {
              detail: { ...newContext, ...JSON.parse(serializedEventExtras) },
            }),
          );
        } catch (e) {
          console.error(`AI Sync Failed for ${syncKey}`, e);
        }
      };
      syncData();
    }
  }, [data, permissionStatus, isEnabled, dataKey, syncKey, serializedEventExtras]);

  return permissionStatus;
};
