import { writable } from 'svelte/store';

export const compo = writable({});
export const categoryId = writable(undefined);
export const meterId = writable(undefined);
export const hwInfo = writable({});
export const sideOpen = writable(false);
export const editMeterOpen = writable(false);
export const editCompoOpen = writable(false);
export const editThrowerOpen = writable(false);
