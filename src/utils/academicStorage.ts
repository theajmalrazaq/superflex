import { createIndexedStore } from "./createIndexedStore";

const academicStore = createIndexedStore("superflex-academic", "state");

export const readAcademicState = academicStore.get;
export const writeAcademicState = academicStore.set;
export const deleteAcademicState = academicStore.delete;
export const updateAcademicState = academicStore.update;
