"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { InterpretationCard, ReasonChip, SeverityChip } from "@/components/premium";
import { premiumSourceProof, premiumSourcePrompt } from "@/lib/premium-copy";
import { getAlternativeProducts } from "@/lib/services/alternative-engine";
import { getProductBySlug } from "@/lib/services/product-catalog";
import { useAppState } from "@/lib/state/app-state";
import { scoreProduct } from "@/lib/scoring";

export default function ReportPage() {
  const params = useParams<{ slug: string }>();
  const product = getProductBySlug(params.slug);
  const { preferences, premium, maybeTriggerPremiumPrompt, dismissPremiumPrompt, closePremiumPreview } = useAppState();
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const checkedPromptRef = useRef(false);

  useEffect(() => {
    if (!product) return;
    if (checkedPromptRef.current) return;
    checkedPromptRef.current = true;
    const shouldPrompt = maybeTriggerPremiumPrompt("report");
    setShowPremiumPrompt(shouldPrompt);
  }, [maybeTriggerPremiumPrompt, product]);

  if (!product) {
    return <main className="shell"><p className="card-state text-sm">Ingredient report unavailable.</p></main>;
  }

  const score = scoreProduct(product, preferences);
  const topAlternative = getAlternativeProducts(product, preferences)[0];

  const cleanIngredients = product.ingredients.filter((item) => /(whole|oat|fruit|banana|apple|spinach|chia|flax|pea)/i.test(item));
  const cautionIngredients = product.ingredients.filter((item) => /(sugar|oil|syrup|flavor)/i.test(item));
  const concerningAdditives = product.additives;
  const currentFlags = product.additives.length + score.ingredientFlags.length;
  const alternativeFlags = topAlternative ? topAlternative.additives.length : currentFlags;
  const flagDelta = Math.max(0, currentFlags - alternativeFlags);
  const cleanerPercent = currentFlags > 0 ? Math.round((flagDelta / currentFlags) * 100) : 0;

  return (
    <main className="shell section-gap">
      <header className="space-y-2">
        <p className="pill-accent inline-flex">Editorial ingredient report</p>
        <h1 className="display text-3xl">{product.name}</h1>
        <p className="text-sm leading-relaxed text-ink/70">A guided ingredient read for parents: what looks clean, what needs context, and where caution may help.</p>
      </header>

      <section className="card-hero space-y-2">
        <p className="eyebrow">Overall interpretation</p>
        <p className="display text-4xl text-accent">{score.grade}</p>
        <p className="text-sm text-ink/75">{score.explanation}</p>
        <div className="flex flex-wrap gap-2">
          {score.topReasons.map((reason) => (
            <ReasonChip key={reason} reason={reason} />
          ))}
        </div>
      </section>

      <InterpretationCard
        title="Ingredient profile"
        summary="Grouped by likely household perception so you can read quality faster than parsing a full panel."
      >
        <div className="space-y-3">
          <div className="card-metric">
            <p className="eyebrow">Clean leaning ingredients</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(cleanIngredients.length ? cleanIngredients : ["No clear clean-forward signals detected"]).map((item) => (
                <SeverityChip key={item} label={item} severity="clean" />
              ))}
            </div>
          </div>

          <div className="card-metric">
            <p className="eyebrow">Use-context ingredients</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(cautionIngredients.length ? cautionIngredients : ["No caution ingredients highlighted"]).map((item) => (
                <SeverityChip key={item} label={item} severity="caution" />
              ))}
            </div>
          </div>

          <div className="card-metric">
            <p className="eyebrow">Concerning additives</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(concerningAdditives.length ? concerningAdditives : ["No concerning additives listed"]).map((item) => (
                <SeverityChip key={item} label={item} severity={concerningAdditives.length ? "concern" : "clean"} />
              ))}
            </div>
          </div>
        </div>
      </InterpretationCard>

      <InterpretationCard
        title="What this means for your family"
        summary="A calmer translation of technical ingredient details into everyday grocery decisions."
      >
        <div className="space-y-2 text-sm text-ink/75">
          <p className="card-state">Best for occasional use if added sugar or additive flags are elevated.</p>
          <p className="card-state">Better daily fit when fiber support is stronger and clean ingredient signals dominate.</p>
          <p className="card-state">Use alternatives when you want the same snack family with fewer tradeoffs.</p>
        </div>
      </InterpretationCard>

      {showPremiumPrompt ? (
        <section className="card-narrative space-y-2 text-sm text-ink/75">
          <p className="font-medium">Unlock deeper ingredient intelligence</p>
          <p>{premiumSourcePrompt("report")}</p>
          <p className="text-xs text-ink/60">{premiumSourceProof("report")}</p>
          <div className="flex gap-2">
            <Link className="btn-primary text-sm" href="/premium?source=report">View premium details</Link>
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

      <InterpretationCard
        title="Advanced ingredient intelligence"
        summary="Deeper additive classification, family-fit risk cues, and cleaner-substitute ranking."
      >
        {premium.premiumPreviewMode && premium.premiumTriggerSource === "report" ? (
          <div className="space-y-2 text-sm text-ink/75">
            <p className="card-state">Premium preview: additive severity ladder and household-risk context by frequency and serving profile.</p>
            <p className="card-state">Premium preview: prioritized “upgrade path” to cleaner alternatives in this exact snack family.</p>
            <p className="card-state blur-[1px]">{premiumSourceProof("report")} · tailored to your current standards.</p>
            <p className="card-state blur-[1px]">
              Locked insight: {cleanerPercent}% cleaner flagged-additive profile available in this family ({flagDelta} fewer flagged additives).
            </p>
            <Link className="btn-secondary inline-flex text-sm" href="/premium?source=report">See premium preview options</Link>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-ink/70">
            <p className="card-state">This deeper layer is reserved for premium preview.</p>
            <button className="text-xs underline" onClick={() => closePremiumPreview()}>Keep core report view</button>
          </div>
        )}
      </InterpretationCard>

      <section className="card text-sm">
        <p className="eyebrow">Full ingredient line</p>
        <p className="mt-2 leading-relaxed text-ink/80">{product.ingredients.join(", ")}</p>
      </section>
    </main>
  );
}
