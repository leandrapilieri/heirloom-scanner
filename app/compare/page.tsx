"use client";

import Image from "next/image";
import { ComparisonMetric } from "@/components/premium";
import { listProducts } from "@/lib/services/product-catalog";
import { useAppState } from "@/lib/state/app-state";
import { scoreProduct } from "@/lib/scoring";

function reasonLabel(original: number, alternative: number, betterWhenLower = true) {
  if (betterWhenLower) return alternative < original ? "Lower than original" : "Similar to original";
  return alternative > original ? "Stronger than original" : "Similar to original";
}

export default function ComparePage() {
  const { compareSelection, preferences } = useAppState();
  const all = listProducts();

  const original = all.find((product) => product.slug === compareSelection.originalSlug) ?? all[0];
  const alternative = all.find((product) => product.slug === compareSelection.alternativeSlug && product.slug !== original.slug) ?? all[1];

  const left = scoreProduct(original, preferences);
  const right = scoreProduct(alternative, preferences);
  const healthierWins = right.numericScore >= left.numericScore;

  return (
    <main className="shell section-gap">
      <header className="space-y-2">
        <p className="pill-accent inline-flex">Decision sheet</p>
        <h1 className="display text-3xl leading-tight">Compare for this grocery moment</h1>
        <p className="text-sm leading-relaxed text-ink/70">Selections persist locally from product pages so comparisons feel stateful.</p>
      </header>

      <section className="card-hero space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[{ p: original, s: left, label: "Original" }, { p: alternative, s: right, label: "Healthier swap" }].map(({ p, s, label }) => {
            const isWinner = label === "Healthier swap" ? healthierWins : !healthierWins;

            return (
              <article key={p.id} className={`rounded-3xl border p-3 ${isWinner ? "border-sage/40 bg-white shadow-quiet" : "border-white/70 bg-white/70"}`}>
                <div className="relative mb-3 h-28 overflow-hidden rounded-2xl">
                  <Image src={p.image} alt={p.name} fill className="object-cover" />
                </div>
                <p className="eyebrow">{label}</p>
                <h2 className="text-sm font-medium">{p.name}</h2>
                <div className="mt-2 flex items-end justify-between">
                  <p className="display text-3xl text-accent">{s.grade}</p>
                  <p className="text-xs text-ink/60">{s.numericScore}/100</p>
                </div>
                {isWinner ? <p className="mt-2 inline-flex rounded-full bg-sage/20 px-2 py-1 text-[11px] text-sage">Recommended pick</p> : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="card-narrative space-y-3">
        <h2 className="display text-xl">Why the swap can be better</h2>
        <div className="flex flex-wrap gap-2">
          <span className="pill">{reasonLabel(original.addedSugarG, alternative.addedSugarG)} added sugar</span>
          <span className="pill">{reasonLabel(original.fiberG, alternative.fiberG, false)} fiber support</span>
          <span className="pill">{alternative.ingredients.length <= original.ingredients.length ? "Cleaner ingredient list" : "Ingredient list is comparable"}</span>
          <span className="pill">{right.grade === "A+" || right.grade === "A" ? "Better lunchbox option" : "Occasional treat tier"}</span>
        </div>
        <p className="text-sm leading-relaxed text-ink/70">{healthierWins ? `${alternative.name} edges ahead with a stronger overall nutrition profile and cleaner badge mix.` : `${original.name} currently remains the stronger choice based on this score model.`}</p>
      </section>

      <section className="grid grid-cols-2 gap-3 text-sm">
        <ComparisonMetric label="Added sugar" value={`${original.addedSugarG}g vs ${alternative.addedSugarG}g`} note="Lower is better" />
        <ComparisonMetric label="Fiber" value={`${original.fiberG}g vs ${alternative.fiberG}g`} note="Higher helps fullness" />
        <ComparisonMetric label="Additives" value={`${original.additives.length} vs ${alternative.additives.length}`} note="Fewer is gentler" />
        <ComparisonMetric
          label="Retailer stock"
          value={`${original.retailerAvailability.filter((r) => r.inStock).length} vs ${alternative.retailerAvailability.filter((r) => r.inStock).length}`}
          note="In-stock stores"
        />
      </section>
    </main>
  );
}
