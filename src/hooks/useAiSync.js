import { useState, useEffect } from "react";
import { getAiContext, updateAiContext } from "../utils/userDataStorage";
import { sendExtensionMessage } from "../utils/extensionApi";
import { getActiveStudentId } from "../utils/studentIdentity";

const readPermission = () =>
  new Promise((resolve) => {
    sendExtensionMessage({ type: "SUPERFLEX_AI_PERMISSION_GET" }, (result) =>
      resolve(result?.status || "denied"),
    );
  });

export const useAiSync = ({ data, dataKey, syncKey, isEnabled = true, eventExtras = {} }) => {
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
    window.addEventListener("superflex-ai-enabled-changed", handlePermissionUpdate);
    window.addEventListener("superflex-student-identity-changed", handleIdentityUpdate);
    return () => {
      window.removeEventListener("superflex-permission-updated", handlePermissionUpdate);
      window.removeEventListener("superflex-ai-enabled-changed", handlePermissionUpdate);
      window.removeEventListener("superflex-student-identity-changed", handleIdentityUpdate);
    };
  }, []);

  useEffect(() => {
    if (isEnabled && permissionStatus === "granted") {
      const syncData = async () => {
        try {
          const studentId = getActiveStudentId();
          if (!studentId || (await readPermission()) !== "granted") return;
          const storedContext = await getAiContext(studentId);
          if (getActiveStudentId() !== studentId || (await readPermission()) !== "granted") return;
          const newContext = await updateAiContext((latestContext) => {
            if (getActiveStudentId() !== studentId) return latestContext;
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
  }, [data, permissionStatus, isEnabled, dataKey, syncKey, serializedEventExtras, studentId]);

  return permissionStatus;
};
