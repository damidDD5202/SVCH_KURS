import { toDatetimeLocalValue } from "./resourceUtils";

export type ResourceFilters = {
  search: string;
  city: string;
  typeCode: string;
  sort: string;
  slotStart: string;
  slotEnd: string;
};

export const PREFERENCES_KEY = "coworking.preferences.v1";

function defaultSlotStart(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return toDatetimeLocalValue(d);
}

function defaultSlotEnd(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 2);
  return toDatetimeLocalValue(d);
}

const defaultFilters: ResourceFilters = {
  search: "",
  city: "",
  typeCode: "",
  sort: "",
  slotStart: "",
  slotEnd: "",
};

export function readPreferences(): ResourceFilters {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return { ...defaultFilters };
    const parsed = JSON.parse(raw) as Partial<ResourceFilters>;
    return {
      search: typeof parsed.search === "string" ? parsed.search : "",
      city: typeof parsed.city === "string" ? parsed.city : "",
      typeCode: typeof parsed.typeCode === "string" ? parsed.typeCode : "",
      sort: typeof parsed.sort === "string" ? parsed.sort : "",
      slotStart: typeof parsed.slotStart === "string" ? parsed.slotStart : "",
      slotEnd: typeof parsed.slotEnd === "string" ? parsed.slotEnd : "",
    };
  } catch {
    return { ...defaultFilters };
  }
}

export function writePreferences(filters: ResourceFilters) {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(filters));
}

export function clearAllPreferences() {
  localStorage.removeItem(PREFERENCES_KEY);
}

export function defaultResourceFilters(): ResourceFilters {
  return { ...defaultFilters };
}

export function defaultBookingSlot(): { slotStart: string; slotEnd: string } {
  return { slotStart: defaultSlotStart(), slotEnd: defaultSlotEnd() };
}

export function slotFilterActive(filters: ResourceFilters): boolean {
  return Boolean(filters.slotStart.trim() && filters.slotEnd.trim());
}
