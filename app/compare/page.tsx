"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ComparisonMetric } from "@/components/premium";
import { premiumSourceProof, premiumSourcePrompt } from "@/lib/premium-copy";
import { listProducts } from "@/lib/services/product-catalog";
import { useAppState } from "@/lib/state/app-state";
import { scoreProduct } from "@/lib/scoring";

function reasonLabel(original: number, alternative: number, betterWhenLower = true) {
  if (betterWhenLower) return alternative < original ? "Lower than original" : "Similar to original";
  return alternative > original ? "Stronger than original" : "Similar to original";
}

export default function ComparePage() {
  const {
    compareSelection,
    preferences,
    premium,
    maybeTriggerPremiumPrompt,
    dismissPremiumPrompt,
    closePremiumPreview
  } = useAppState();
  const all = listProducts();
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const checkedPromptRef = useRef(false);

  const original = compareSelection.originalSlug ? all.find((product) => product.slug === compareSelection.originalSlug) : null;
  const alternative = compareSelection.alternativeSlug
    ? all.find((product) => product.slug === compareSelection.alternativeSlug && product.slug !== compareSelection.originalSlug)
    : null;
  const effectiveOriginal = original;
  const effectiveAlternative = alternative;

  useEffect(() => {
    if (checkedPromptRef.current) return;
    checkedPromptRef.current = true;
    const shouldPrompt = maybeTriggerPremiumPrompt("compare_insights");
    setShowPremiumPrompt(shouldPrompt);
  }, [maybeTriggerPremiumPrompt]);

  if (!effectiveOriginal || !effectiveAlternative) {
    return (
      <main className="shell section-gap">
        <header className="space-y-2">
          <p className="pill-accent inline-flex">Decision sheet</p>
          <h1 className="display text-3xl leading-tight">Compare for this grocery moment</h1>
          <p className="text-sm leading-relaxed text-ink/70">Select a product and featured healthier swap from a product result page to start a truthful compare.</p>
        </header>

        <section className="card-state space-y-3 text-sm text-ink/75">
          <p className="font-medium text-ink">No comparison selected yet.</p>
          <p>Open any product result and tap the compare action on its featured healthier swap.</p>
          <Link className="btn-primary text-sm" href="/scan">
            Scan a product
          </Link>
        </section>
      </main>
    );
  }

  const left = scoreProduct(effectiveOriginal, preferences);
  const right = scoreProduct(effectiveAlternative, preferences);
  const healthierWins = right.numericScore >= left.numericScore;
  const addedSugarDelta = Math.max(0, effectiveOriginal.addedSugarG - effectiveAlternative.addedSugarG);
  const addedSugarPercent = effectiveOriginal.addedSugarG > 0 ? Math.round((addedSugarDelta / effectiveOriginal.addedSugarG) * 100) : 0;
  const additiveDelta = Math.max(0, effectiveOriginal.additives.length - effectiveAlternative.additives.length);

  return (
    <main className="shell section-gap">
      <header className="space-y-2">
        <p className="pill-accent inline-flex">Decision sheet</p>
        <h1 className="display text-3xl leading-tight">Compare for this grocery moment</h1>
        <p className="text-sm leading-relaxed text-ink/70">This page only shows a pair you explicitly started from a product result.</p>
      </header>

      <section className="card-hero space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[{ p: effectiveOriginal, s: left, label: "Original" }, { p: effectiveAlternative, s: right, label: "Healthier swap" }].map(({ p, s, label }) => {
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
          <span className="pill">{reasonLabel(effectiveOriginal.addedSugarG, effectiveAlternative.addedSugarG)} added sugar</span>
          <span className="pill">{reasonLabel(effectiveOriginal.fiberG, effectiveAlternative.fiberG, false)} fiber support</span>
          <span className="pill">{effectiveAlternative.ingredients.length <= effectiveOriginal.ingredients.length ? "Cleaner ingredient list" : "Ingredient list is comparable"}</span>
          <span className="pill">{right.grade === "A+" || right.grade === "A" ? "Better lunchbox option" : "Occasional treat tier"}</span>
        </div>
        <p className="text-sm leading-relaxed text-ink/70">{healthierWins ? `${effectiveAlternative.name} edges ahead with a stronger overall nutrition profile and cleaner badge mix.` : `${effectiveOriginal.name} currently remains the stronger choice based on this score model.`}</p>
      </section>

      <section className="grid grid-cols-2 gap-3 text-sm">
        <ComparisonMetric label="Added sugar" value={`${effectiveOriginal.addedSugarG}g vs ${effectiveAlternative.addedSugarG}g`} note="Lower is better" />
        <ComparisonMetric label="Fiber" value={`${effectiveOriginal.fiberG}g vs ${effectiveAlternative.fiberG}g`} note="Higher helps fullness" />
        <ComparisonMetric label="Additives" value={`${effectiveOriginal.additives.length} vs ${effectiveAlternative.additives.length}`} note="Fewer is gentler" />
        <ComparisonMetric
          label="Retailer stock"
          value={`${effectiveOriginal.retailerAvailability.filter((r) => r.inStock).length} vs ${effectiveAlternative.retailerAvailability.filter((r) => r.inStock).length}`}
          note="In-stock stores"
        />
      </section>

      {showPremiumPrompt ? (
        <section className="card-narrative space-y-2 text-sm text-ink/75">
          <p className="font-medium">Unlock richer compare insights</p>
          <p>{premiumSourcePrompt("compare_insights")}</p>
          <p className="text-xs text-ink/60">{premiumSourceProof("compare_insights")}</p>
          <div className="flex gap-2">
            <Link className="btn-primary text-sm" href="/premium?source=compare_insights">View premium details</Link>
            <button
              className="btn-secondary text-sm"
              onClick={() => {
                dismissPremiumPrompt();
                setShowPremiumPrompt(false);
              }}
            >
              Not now
            </button>
          </div>
        </section>
      ) : null}

      <section className="card-state space-y-2 text-sm text-ink/75">
        <p className="font-medium">Advanced compare insights</p>
        {premium.premiumPreviewMode && premium.premiumTriggerSource === "compare_insights" ? (
          <>
            <p>Previewing premium: deeper ingredient overlap diagnostics, confidence-weighted swap fit, and retailer value context.</p>
            <p className="card-state blur-[1px] text-xs">{premiumSourceProof("compare_insights")}</p>
            <p className="card-state blur-[1px] text-xs">
              Locked insight: {addedSugarPercent}% lower added sugar and {additiveDelta} fewer flagged additives in this current comparison pair.
            </p>
            <Link className="btn-secondary text-sm inline-flex" href="/premium?source=compare_insights">See premium preview options</Link>
          </>
        ) : (
          <p>This deeper analysis is part of premium preview. Core compare remains fully free and active.</p>
        )}
        <button className="text-xs underline" onClick={() => closePremiumPreview()}>Hide premium preview</button>
      </section>
    </main>
  );
}
