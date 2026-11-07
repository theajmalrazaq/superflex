export const cleanStorageOnce = async () => {
  const response = await new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "SUPERFLEX_RESET_STORAGE_ONCE" }, resolve);
  });
  return response?.reset === true;
};
