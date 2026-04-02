"use client";

import { PreferenceToggle } from "@/components/premium";
import { useAppState } from "@/lib/state/app-state";

const labels: Record<string, { title: string; description: string }> = {
  nutFree: { title: "Nut-free", description: "Penalize products that include nut allergens." },
  dairyFree: { title: "Dairy-free", description: "Favor products without milk ingredients." },
  lowSugar: { title: "Low sugar", description: "Increase penalties for higher added sugar." },
  organicOnly: { title: "Organic only", description: "Prioritize cleaner sourcing where possible." },
  glutenAware: { title: "Gluten-aware", description: "Surface products that align with gluten sensitivity." },
  dyeFree: { title: "Dye-free", description: "Flag and penalize artificial color additives." },
  seedOilAware: { title: "Seed-oil aware", description: "Prefer products with simpler oil profiles." },
  toddlerFriendly: { title: "Toddler-friendly", description: "Boost gentler sodium and sugar thresholds." },
  proteinFocused: { title: "Protein-focused", description: "Reward products with stronger protein support." },
  noArtificialSweeteners: { title: "No artificial sweeteners", description: "Penalize sweetener-heavy products." }
};

const sections = [
  { title: "Safety & sensitivities", keys: ["nutFree", "dairyFree", "glutenAware", "dyeFree", "noArtificialSweeteners"] },
  { title: "Nutrition priorities", keys: ["lowSugar", "proteinFocused", "toddlerFriendly"] },
  { title: "Shopping philosophy", keys: ["organicOnly", "seedOilAware"] }
] as const;

export default function PreferencesPage() {
  const { preferences, setPreference, hydrated, resetOnboarding } = useAppState();

  return (
    <main className="shell section-gap">
      <header className="space-y-2">
        <p className="pill-sage inline-flex">Guardian profile</p>
        <h1 className="display text-3xl">Household standards</h1>
        <p className="text-sm leading-relaxed text-ink/70">These settings directly influence scoring, flags, and alternative recommendations across the app.</p>
      </header>

      <section className="card-state text-sm text-ink/75">
        <p className="font-medium">Live scoring influence</p>
        <p className="mt-1">
          {hydrated
            ? "Preferences are persisted locally and applied to score interpretation and recommendation ranking."
            : "Loading saved household standards..."}
        </p>
      </section>


      <section className="card-state text-sm text-ink/75">
        <p className="font-medium">First-session setup</p>
        <p className="mt-1">Need to revisit your guided setup? You can rerun onboarding any time.</p>
        <button className="btn-secondary mt-3" onClick={resetOnboarding}>Rerun guided setup</button>
      </section>

      {sections.map((section) => (
        <section className="card-narrative space-y-3" key={section.title}>
          <h2 className="display text-xl">{section.title}</h2>
          {section.keys.map((key) => {
            const option = labels[key];
            const enabled = preferences[key];
            return (
              <PreferenceToggle
                key={key}
                title={option.title}
                description={option.description}
                enabled={enabled}
                disabled={!hydrated}
                onToggle={() => setPreference(key, !enabled)}
              />
            );
          })}
        </section>
      ))}
    </main>
  );
}
