"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/app-state";

const standards = [
  ["lowSugar", "Low sugar focus"],
  ["nutFree", "Nut-free"],
  ["dairyFree", "Dairy-free"],
  ["glutenAware", "Gluten-aware"],
  ["dyeFree", "Dye-free"],
  ["organicOnly", "Organic-minded"],
  ["toddlerFriendly", "Toddler-friendly"],
  ["proteinFocused", "Protein-focused"],
  ["noArtificialSweeteners", "Avoid artificial sweeteners"],
  ["seedOilAware", "Avoid seed oils"]
] as const;

const priorities = ["Low sugar", "Lunchbox fit", "Cleaner ingredients", "Higher fiber", "Fewer additives", "Kid-favorite swaps"];

export function OnboardingFlow() {
  const router = useRouter();
  const {
    onboarding,
    setOnboardingConcern,
    togglePriorityTag,
    markResultEducationSeen,
    completeOnboarding,
    preferences,
    setPreference
  } = useAppState();
  const [step, setStep] = useState(0);

  const next = () => setStep((value) => Math.min(value + 1, 5));
  const back = () => setStep((value) => Math.max(value - 1, 0));

  return (
    <section className="card-hero space-y-4">
      <p className="eyebrow">Setup {step + 1} of 6</p>

      {step === 0 ? (
        <div className="space-y-3">
          <h2 className="display text-3xl">Scan with confidence in aisle</h2>
          <p className="text-sm text-ink/75">Heirloom helps you decide faster with clear grades, calm explanations, and cleaner same-family swaps.</p>
          <button type="button" className="btn-primary" onClick={next}>Begin setup</button>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-3">
          <h2 className="display text-2xl">What matters most today?</h2>
          <p className="text-sm text-ink/70">Pick one concern so we can prioritize what you care about first.</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["sugar", "Sugar confusion"],
              ["additives", "Additive concerns"],
              ["allergies", "Allergy safety"],
              ["speed", "Decision speed"]
            ].map(([key, label]) => (
              <button
                type="button"
                key={key}
                aria-pressed={onboarding.onboardingPrimaryConcern === key}
                className={`card-metric text-left text-sm ${onboarding.onboardingPrimaryConcern === key ? "border-sage/40" : ""}`}
                onClick={() => setOnboardingConcern(key as typeof onboarding.onboardingPrimaryConcern)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={back}>Back</button>
            <button type="button" className="btn-primary" onClick={next}>Continue</button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3">
          <h2 className="display text-2xl">Set household standards</h2>
          <p className="text-sm text-ink/70">These standards directly influence scoring and swap ranking.</p>
          <div className="grid gap-2">
            {standards.map(([key, label]) => (
              <button
                type="button"
                key={key}
                aria-pressed={preferences[key]}
                className={`card-metric flex items-center justify-between text-sm ${preferences[key] ? "border-sage/40" : ""}`}
                onClick={() => setPreference(key, !preferences[key])}
              >
                <span>{label}</span>
                <span className="text-xs text-ink/60">{preferences[key] ? "On" : "Off"}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={back}>Back</button>
            <button type="button" className="btn-primary" onClick={next}>Continue</button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-3">
          <h2 className="display text-2xl">Pick top priorities</h2>
          <p className="text-sm text-ink/70">Choose up to three to guide your first recommendations.</p>
          <div className="flex flex-wrap gap-2">
            {priorities.map((priority) => {
              const active = onboarding.priorityTags.includes(priority);
              return (
                <button
                  type="button"
                  key={priority}
                  aria-pressed={active}
                  className={`pill ${active ? "bg-sage/20 border-sage/30" : ""}`}
                  onClick={() => togglePriorityTag(priority)}
                >
                  {priority}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={back}>Back</button>
            <button type="button" className="btn-primary" onClick={next}>Continue</button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-3">
          <h2 className="display text-2xl">How to read results fast</h2>
          <div className="card-narrative space-y-2">
            <p className="eyebrow">Grade first</p>
            <p className="text-sm text-ink/75">Check grade and one-line explanation first, then tap “what matters most” for sugar, additives, and ingredient quality context.</p>
            <p className="eyebrow">Swaps next</p>
            <p className="text-sm text-ink/75">We suggest same-family swaps that better match your household standards.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={back}>Back</button>
            <button type="button" className="btn-primary" onClick={() => { markResultEducationSeen(); next(); }}>Continue</button>
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-3">
          <h2 className="display text-3xl">You&apos;re ready to scan</h2>
          <p className="text-sm text-ink/75">Your standards are active. You can scan by barcode, package photo, or manual search on the next screen.</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                completeOnboarding();
                router.push("/scan");
              }}
            >
              Go to scan
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                completeOnboarding();
                router.push("/product/little-orchard-cocoa-creme-minis?sample=1");
              }}
            >
              View sample result
            </button>
          </div>
          <Link className="text-xs underline text-ink/60" href="/preferences">Setup later in Preferences</Link>
        </div>
      ) : null}
    </section>
  );
}
