import { createIndexedStore } from "./createIndexedStore";

const appStore = createIndexedStore("superflex-app", "user-data");

export const getAppData = appStore.get;
export const setAppData = appStore.set;
export const deleteAppData = appStore.delete;
export const updateAppData = appStore.update;
