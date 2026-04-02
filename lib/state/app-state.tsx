"use client";

import { createContext, useContext, useMemo } from "react";
import { defaultPreferences } from "@/lib/preferences";
import { storageKeys } from "@/lib/storage";
import { useLocalState } from "@/lib/state/use-local-state";
import { GuardianPreferences } from "@/lib/types";

interface CompareSelection {
  originalSlug: string | null;
  alternativeSlug: string | null;
}

export interface ScanOutcome {
  id: string;
  timestamp: string;
  method: "barcode" | "photo" | "manual";
  confidence: number;
  confidenceTier: "high" | "medium" | "low";
  status: "resolved" | "confirm_needed" | "not_found";
  candidateSlugs: string[];
  confirmedCandidateSlug?: string;
}

export interface OnboardingState {
  onboardingCompleted: boolean;
  completedAt?: string;
  onboardingVersion: number;
  onboardingPrimaryConcern?: "sugar" | "additives" | "allergies" | "speed";
  priorityTags: string[];
  resultEducationSeen: boolean;
}

const onboardingDefaults: OnboardingState = {
  onboardingCompleted: false,
  onboardingVersion: 1,
  priorityTags: [],
  resultEducationSeen: false
};

interface AppStateContextValue {
  hydrated: boolean;
  preferences: GuardianPreferences;
  setPreference: (key: keyof GuardianPreferences, value: boolean) => void;
  favorites: string[];
  toggleFavorite: (slug: string) => void;
  shoppingList: string[];
  toggleShoppingList: (slug: string) => void;
  recentScans: string[];
  addRecentScan: (slug: string) => void;
  compareSelection: CompareSelection;
  setCompareSelection: (selection: CompareSelection) => void;
  scanOutcomes: ScanOutcome[];
  recordScanOutcome: (outcome: ScanOutcome) => void;
  confirmScanOutcome: (id: string, slug: string) => void;
  onboarding: OnboardingState;
  setOnboardingConcern: (concern: OnboardingState["onboardingPrimaryConcern"]) => void;
  togglePriorityTag: (tag: string) => void;
  markResultEducationSeen: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const prefState = useLocalState<GuardianPreferences>(storageKeys.preferences, defaultPreferences);
  const favoriteState = useLocalState<string[]>(storageKeys.favorites, []);
  const shoppingState = useLocalState<string[]>(storageKeys.shoppingList, []);
  const recentState = useLocalState<string[]>(storageKeys.recentScans, []);
  const compareState = useLocalState<CompareSelection>(storageKeys.compareSelection, {
    originalSlug: null,
    alternativeSlug: null
  });
  const scanOutcomeState = useLocalState<ScanOutcome[]>(storageKeys.scanOutcomes, []);
  const onboardingState = useLocalState<OnboardingState>(storageKeys.onboarding, onboardingDefaults);

  const hydrated =
    prefState.hydrated &&
    favoriteState.hydrated &&
    shoppingState.hydrated &&
    recentState.hydrated &&
    compareState.hydrated &&
    scanOutcomeState.hydrated &&
    onboardingState.hydrated;

  const value = useMemo<AppStateContextValue>(
    () => ({
      hydrated,
      preferences: prefState.state,
      setPreference: (key, enabled) => {
        prefState.setState((prev) => ({ ...prev, [key]: enabled }));
      },
      favorites: favoriteState.state,
      toggleFavorite: (slug) => {
        favoriteState.setState((prev) => (prev.includes(slug) ? prev.filter((item) => item !== slug) : [slug, ...prev]));
      },
      shoppingList: shoppingState.state,
      toggleShoppingList: (slug) => {
        shoppingState.setState((prev) => (prev.includes(slug) ? prev.filter((item) => item !== slug) : [slug, ...prev]));
      },
      recentScans: recentState.state,
      addRecentScan: (slug) => {
        recentState.setState((prev) => [slug, ...prev.filter((item) => item !== slug)].slice(0, 12));
      },
      compareSelection: compareState.state,
      setCompareSelection: (selection) => compareState.setState(selection),
      scanOutcomes: scanOutcomeState.state,
      recordScanOutcome: (outcome) => {
        scanOutcomeState.setState((prev) => [outcome, ...prev].slice(0, 50));
      },
      confirmScanOutcome: (id, slug) => {
        scanOutcomeState.setState((prev) => prev.map((outcome) => (outcome.id === id ? { ...outcome, confirmedCandidateSlug: slug } : outcome)));
      },
      onboarding: onboardingState.state,
      setOnboardingConcern: (concern) => {
        onboardingState.setState((prev) => ({ ...prev, onboardingPrimaryConcern: concern }));
      },
      togglePriorityTag: (tag) => {
        onboardingState.setState((prev) => {
          const hasTag = prev.priorityTags.includes(tag);
          if (hasTag) return { ...prev, priorityTags: prev.priorityTags.filter((item) => item !== tag) };
          if (prev.priorityTags.length >= 3) return prev;
          return { ...prev, priorityTags: [...prev.priorityTags, tag] };
        });
      },
      markResultEducationSeen: () => {
        onboardingState.setState((prev) => ({ ...prev, resultEducationSeen: true }));
      },
      completeOnboarding: () => {
        onboardingState.setState((prev) => ({
          ...prev,
          onboardingCompleted: true,
          completedAt: new Date().toISOString(),
          onboardingVersion: onboardingDefaults.onboardingVersion
        }));
      },
      resetOnboarding: () => {
        onboardingState.setState(onboardingDefaults);
      }
    }),
    [
      hydrated,
      prefState.state,
      prefState.setState,
      favoriteState.state,
      favoriteState.setState,
      shoppingState.state,
      shoppingState.setState,
      recentState.state,
      recentState.setState,
      compareState.state,
      compareState.setState,
      scanOutcomeState.state,
      scanOutcomeState.setState,
      onboardingState.state,
      onboardingState.setState
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
