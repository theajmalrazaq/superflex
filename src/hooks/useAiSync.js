import { useState, useEffect } from "react";

export const useAiSync = ({
  data,
  dataKey,
  syncKey,
  isEnabled = true,
  eventExtras = {},
}) => {
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
    window.addEventListener(
      "superflex-permission-updated",
      handlePermissionUpdate,
    );
    return () => {
      window.removeEventListener(
        "superflex-permission-updated",
        handlePermissionUpdate,
      );
    };
  }, []);

  useEffect(() => {
    if (isEnabled && permissionStatus === "granted") {
      try {
        const existing =
          window.superflex_ai_context ||
          JSON.parse(localStorage.getItem("superflex_ai_context") || "{}");

        let newContext = { ...existing };

        if (dataKey) {
          newContext[dataKey] = data;
        } else if (typeof data === "object" && data !== null) {
          newContext = { ...newContext, ...data };
        }

        newContext.lastSync = {
          ...(existing.lastSync || {}),
          [syncKey]: new Date().toISOString(),
        };

        window.superflex_ai_context = newContext;
        localStorage.setItem(
          "superflex_ai_context",
          JSON.stringify(newContext),
        );

        window.dispatchEvent(
          new CustomEvent("superflex-data-updated", {
            detail: { ...newContext, ...eventExtras },
          }),
        );
      } catch (e) {
        console.error(`AI Sync Failed for ${syncKey}`, e);
      }
    }
  }, [data, permissionStatus, isEnabled, dataKey, syncKey]);

  return permissionStatus;
};
