import { usePreferencesStore } from "../stores/preferencesStore";
import { useState, useEffect } from "react";
import { getAiContext, updateAiContext } from "../utils/userDataStorage";
import { sendExtensionMessage } from "../utils/extensionApi";
import { getActiveStudentId } from "../utils/studentIdentity";

const readPermission = () =>
  !usePreferencesStore.getState().aiEnabled
    ? Promise.resolve("denied")
    : new Promise<string>((resolve) => {
        sendExtensionMessage({ type: "SUPERFLEX_AI_PERMISSION_GET" }, (result) =>
          resolve(result?.status || "denied"),
        );
      });

export const useAiSync = ({
  data,
  dataKey = undefined,
  syncKey,
  isEnabled = true,
  eventExtras = {},
}) => {
  const aiEnabled = usePreferencesStore((state) => state.aiEnabled);
  const serializedEventExtras = JSON.stringify(eventExtras);
  const [permissionStatus, setPermissionStatus] = useState("pending");
  const [studentId, setStudentId] = useState(getActiveStudentId);

  useEffect(() => {
    const handlePermissionUpdate = () => {
      readPermission().then(setPermissionStatus);
    };
    const handleIdentityUpdate = () => setStudentId(getActiveStudentId());
    handlePermissionUpdate();
    window.addEventListener("superflex-permission-updated", handlePermissionUpdate);
    window.addEventListener("superflex-student-identity-changed", handleIdentityUpdate);
    return () => {
      window.removeEventListener("superflex-permission-updated", handlePermissionUpdate);
      window.removeEventListener("superflex-student-identity-changed", handleIdentityUpdate);
    };
  }, [aiEnabled]);

  useEffect(() => {
    if (isEnabled && aiEnabled && permissionStatus === "granted") {
      const syncData = async () => {
        try {
          const studentId = getActiveStudentId();
          if (!studentId || (await readPermission()) !== "granted") return;
          const storedContext = await getAiContext(studentId);
          if (getActiveStudentId() !== studentId || (await readPermission()) !== "granted") return;
          const newContext = await updateAiContext((latestContext) => {
            if (!usePreferencesStore.getState().aiEnabled || getActiveStudentId() !== studentId)
              return latestContext;
            const existing = latestContext || storedContext || {};
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
          }, studentId);

          if (getActiveStudentId() !== studentId || (await readPermission()) !== "granted") return;
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
  }, [
    data,
    permissionStatus,
    isEnabled,
    aiEnabled,
    dataKey,
    syncKey,
    serializedEventExtras,
    studentId,
  ]);

  return permissionStatus;
};
