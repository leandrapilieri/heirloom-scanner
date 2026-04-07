"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PremiumTriggerSource } from "@/lib/premium-access";
import { premiumSourceLabel, premiumSourceProof, premiumSourcePrompt } from "@/lib/premium-copy";
import { useAppState } from "@/lib/state/app-state";

const plans = [
  {
    name: "Monthly",
    price: "$7.99",
    note: "Flexible month-to-month access"
  },
  {
    name: "Yearly",
    price: "$59.99",
    note: "Best value for regular family shops"
  }
];

function PremiumPageContent() {
  const searchParams = useSearchParams();
  const source = (searchParams.get("source") as PremiumTriggerSource | null) ?? "premium_preview";
  const { dismissPremiumPrompt, closePremiumPreview, preferences } = useAppState();
  const activePreferenceCount = Object.values(preferences).filter(Boolean).length;
  const isKnownSource = source !== "premium_preview";
  const sourceLabel = premiumSourceLabel(source);

  return (
    <main className="shell section-gap ">
      <header className="card-hero space-y-3">
        <p className="pill-accent inline-flex">Heirloom Premium</p>
        <h1 className="display text-3xl leading-tight">
          {isKnownSource ? `Go deeper on ${sourceLabel}` : "A calmer intelligence layer for family grocery decisions"}
        </h1>
        <p className="text-sm text-ink/70">
          {isKnownSource ? premiumSourcePrompt(source) : "Unlock deeper ingredient intelligence, richer compare insights, advanced swaps, and enhanced retailer context."}
        </p>
        <p className="text-xs text-ink/55">
          {isKnownSource ? premiumSourceProof(source) : "Designed to extend the guidance you already used in free mode."}
        </p>
        <p className="text-xs text-ink/55">Active standards detected: {activePreferenceCount}.</p>
      </header>

      <section className="grid gap-3">
        {[
          "Deeper ingredient intelligence with clearer additive context",
          "Advanced healthier swaps for tighter same-family optimization",
          "Richer compare insights for faster in-aisle decisions",
          "Enhanced retailer intelligence with sharper buy guidance",
          "Unlimited scans (soft preview while limits are not yet enforced)"
        ].map((item) => (
          <article key={item} className="card-metric text-sm text-ink/80">{item}</article>
        ))}
      </section>

      <section className="card-narrative space-y-3">
        <h2 className="display text-2xl">Choose your plan</h2>
        <div className="grid grid-cols-2 gap-3">
          {plans.map((plan) => (
            <article key={plan.name} className="card-metric space-y-1 text-sm">
              <p className="eyebrow">{plan.name}</p>
              <p className="display text-3xl text-accent">{plan.price}</p>
              <p className="text-xs text-ink/65">{plan.note}</p>
            </article>
          ))}
        </div>
        <Link className="btn-primary inline-flex justify-center" href="/scan">
          Return to scan
        </Link>
        <p className="text-xs text-ink/60">Plans are informational in this MVP. Billing is not connected yet.</p>
        <div className="flex gap-2">
          <button
            className="btn-secondary text-sm"
            onClick={() => {
              dismissPremiumPrompt();
              closePremiumPreview();
            }}
            type="button"
          >
            Not now
          </button>
          <Link className="btn-secondary text-sm text-center" href="/" onClick={() => closePremiumPreview()}>
            Keep exploring free
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function PremiumPage() {
  return (
    <Suspense fallback={<main className="shell section-gap "><section className="card-state text-sm text-ink/70">Loading premium details…</section></main>}>
      <PremiumPageContent />
    </Suspense>
  );
}
