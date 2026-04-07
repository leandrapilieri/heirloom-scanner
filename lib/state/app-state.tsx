"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { PREMIUM_PROMPT_COOLDOWN_MS, PremiumTriggerSource } from "@/lib/premium-access";
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
  setupSummarySeen: boolean;
  sampleResultViewed: boolean;
  firstScanCompleted: boolean;
  firstMeaningfulInteractionCompleted: boolean;
  firstMeaningfulInteractionType?: "save" | "compare" | "second_result_scan";
  resultContextScanSeen: boolean;
}

const onboardingDefaults: OnboardingState = {
  onboardingCompleted: false,
  onboardingVersion: 1,
  priorityTags: [],
  resultEducationSeen: false,
  setupSummarySeen: false,
  sampleResultViewed: false,
  firstScanCompleted: false,
  firstMeaningfulInteractionCompleted: false,
  resultContextScanSeen: false
};

export interface PremiumState {
  premiumPromptSeen: boolean;
  premiumPromptDismissedAt?: string;
  premiumPromptCooldownUntil?: string;
  premiumTriggerSource?: PremiumTriggerSource;
  premiumPreviewMode: boolean;
}

const premiumDefaults: PremiumState = {
  premiumPromptSeen: false,
  premiumPreviewMode: false
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
  premium: PremiumState;
  setOnboardingConcern: (concern: OnboardingState["onboardingPrimaryConcern"]) => void;
  togglePriorityTag: (tag: string) => void;
  markResultEducationSeen: () => void;
  markSampleResultViewed: () => void;
  markFirstScanCompleted: () => void;
  trackResultContextScan: () => void;
  markFirstMeaningfulInteraction: (type: "save" | "compare") => void;
  dismissSetupSummary: () => void;
  maybeTriggerPremiumPrompt: (source: PremiumTriggerSource) => boolean;
  dismissPremiumPrompt: () => void;
  openPremiumPreview: (source: PremiumTriggerSource) => void;
  closePremiumPreview: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { state: preferences, setState: setPreferences, hydrated: preferencesHydrated } = useLocalState<GuardianPreferences>(storageKeys.preferences, defaultPreferences);
  const { state: favorites, setState: setFavorites, hydrated: favoritesHydrated } = useLocalState<string[]>(storageKeys.favorites, []);
  const { state: shoppingList, setState: setShoppingList, hydrated: shoppingHydrated } = useLocalState<string[]>(storageKeys.shoppingList, []);
  const { state: recentScans, setState: setRecentScans, hydrated: recentHydrated } = useLocalState<string[]>(storageKeys.recentScans, []);
  const { state: compareSelection, setState: setCompareSelectionState, hydrated: compareHydrated } = useLocalState<CompareSelection>(storageKeys.compareSelection, {
    originalSlug: null,
    alternativeSlug: null
  });
  const { state: scanOutcomes, setState: setScanOutcomes, hydrated: scanOutcomesHydrated } = useLocalState<ScanOutcome[]>(storageKeys.scanOutcomes, []);
  const { state: onboarding, setState: setOnboarding, hydrated: onboardingHydrated } = useLocalState<OnboardingState>(storageKeys.onboarding, onboardingDefaults);
  const { state: premium, setState: setPremium, hydrated: premiumHydrated } = useLocalState<PremiumState>(storageKeys.premium, premiumDefaults);

  const hydrated =
    preferencesHydrated &&
    favoritesHydrated &&
    shoppingHydrated &&
    recentHydrated &&
    compareHydrated &&
    scanOutcomesHydrated &&
    onboardingHydrated &&
    premiumHydrated;

  const addRecentScan = useCallback((slug: string) => {
    setRecentScans((prev) => [slug, ...prev.filter((item) => item !== slug)].slice(0, 12));
  }, [setRecentScans]);

  const markSampleResultViewed = useCallback(() => {
    setOnboarding((prev) => ({ ...prev, sampleResultViewed: true }));
  }, [setOnboarding]);

  const value = useMemo<AppStateContextValue>(() => ({
      hydrated,
      preferences,
      setPreference: (key, enabled) => {
        setPreferences((prev) => ({ ...prev, [key]: enabled }));
      },
      favorites,
      toggleFavorite: (slug) => {
        setFavorites((prev) => (prev.includes(slug) ? prev.filter((item) => item !== slug) : [slug, ...prev]));
      },
      shoppingList,
      toggleShoppingList: (slug) => {
        setShoppingList((prev) => (prev.includes(slug) ? prev.filter((item) => item !== slug) : [slug, ...prev]));
      },
      recentScans,
      addRecentScan,
      compareSelection,
      setCompareSelection: (selection) => setCompareSelectionState(selection),
      scanOutcomes,
      recordScanOutcome: (outcome) => {
        setScanOutcomes((prev) => [outcome, ...prev].slice(0, 50));
      },
      confirmScanOutcome: (id, slug) => {
        setScanOutcomes((prev) => prev.map((outcome) => (outcome.id === id ? { ...outcome, confirmedCandidateSlug: slug } : outcome)));
      },
      onboarding,
      premium,
      setOnboardingConcern: (concern) => {
        setOnboarding((prev) => ({ ...prev, onboardingPrimaryConcern: concern }));
      },
      togglePriorityTag: (tag) => {
        setOnboarding((prev) => {
          const hasTag = prev.priorityTags.includes(tag);
          if (hasTag) return { ...prev, priorityTags: prev.priorityTags.filter((item) => item !== tag) };
          if (prev.priorityTags.length >= 3) return prev;
          return { ...prev, priorityTags: [...prev.priorityTags, tag] };
        });
      },
      markResultEducationSeen: () => {
        setOnboarding((prev) => ({ ...prev, resultEducationSeen: true }));
      },
      markSampleResultViewed,
      markFirstScanCompleted: () => {
        setOnboarding((prev) => ({ ...prev, firstScanCompleted: true }));
      },
      trackResultContextScan: () => {
        setOnboarding((prev) => {
          const nowMeaningful = prev.resultContextScanSeen;
          return {
            ...prev,
            resultContextScanSeen: true,
            firstMeaningfulInteractionCompleted: prev.firstMeaningfulInteractionCompleted || nowMeaningful,
            firstMeaningfulInteractionType: prev.firstMeaningfulInteractionType ?? (nowMeaningful ? "second_result_scan" : undefined)
          };
        });
      },
      markFirstMeaningfulInteraction: (type) => {
        setOnboarding((prev) => ({
          ...prev,
          firstMeaningfulInteractionCompleted: true,
          firstMeaningfulInteractionType: prev.firstMeaningfulInteractionType ?? type
        }));
      },
      dismissSetupSummary: () => {
        setOnboarding((prev) => ({ ...prev, setupSummarySeen: true }));
      },
      maybeTriggerPremiumPrompt: (source) => {
        if (!onboarding.firstMeaningfulInteractionCompleted) return false;
        const cooldownUntil = premium.premiumPromptCooldownUntil;
        if (cooldownUntil && new Date(cooldownUntil).getTime() > Date.now()) return false;
        setPremium((prev) => ({
          ...prev,
          premiumPromptSeen: true,
          premiumTriggerSource: source,
          premiumPreviewMode: true
        }));
        return true;
      },
      dismissPremiumPrompt: () => {
        const now = new Date();
        const cooldownUntil = new Date(now.getTime() + PREMIUM_PROMPT_COOLDOWN_MS).toISOString();
        setPremium((prev) => ({
          ...prev,
          premiumPromptDismissedAt: now.toISOString(),
          premiumPromptCooldownUntil: cooldownUntil,
          premiumPreviewMode: false
        }));
      },
      openPremiumPreview: (source) => {
        setPremium((prev) => ({
          ...prev,
          premiumPromptSeen: true,
          premiumTriggerSource: source,
          premiumPreviewMode: true
        }));
      },
      closePremiumPreview: () => {
        setPremium((prev) => ({ ...prev, premiumPreviewMode: false }));
      },
      completeOnboarding: () => {
        setOnboarding((prev) => ({
          ...prev,
          onboardingCompleted: true,
          completedAt: new Date().toISOString(),
          onboardingVersion: onboardingDefaults.onboardingVersion,
          setupSummarySeen: false
        }));
      },
      resetOnboarding: () => {
        setOnboarding(onboardingDefaults);
      }
    }), [
      hydrated,
      preferences,
      favorites,
      shoppingList,
      recentScans,
      compareSelection,
      scanOutcomes,
      onboarding,
      premium,
      setPreferences,
      setFavorites,
      setShoppingList,
      setCompareSelectionState,
      setScanOutcomes,
      setOnboarding,
      setPremium,
      addRecentScan,
      markSampleResultViewed
    ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
