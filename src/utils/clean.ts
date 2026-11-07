import { sendExtensionMessage } from "./extensionApi";

export const cleanStorageOnce = () =>
  new Promise<boolean>((resolve) => {
    sendExtensionMessage({ type: "SUPERFLEX_RESET_STORAGE_ONCE" }, (response) =>
      resolve(response?.reset === true),
    );
  });
