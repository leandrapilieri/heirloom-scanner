export const storageKeys = {
  preferences: "heirloom.preferences",
  favorites: "heirloom.favorites",
  recentScans: "heirloom.recentScans",
  shoppingList: "heirloom.shoppingList",
  compareSelection: "heirloom.compareSelection",
  scanOutcomes: "heirloom.scanOutcomes",
  onboarding: "heirloom.onboarding"
} as const;

function hasWindow() {
  return typeof window !== "undefined";
}

export function readStorage<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write failures in restricted contexts
  }
}
