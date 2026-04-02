"use client";

import { useParams } from "next/navigation";
import { InterpretationCard, ReasonChip, SeverityChip } from "@/components/premium";
import { getProductBySlug } from "@/lib/services/product-catalog";
import { useAppState } from "@/lib/state/app-state";
import { scoreProduct } from "@/lib/scoring";

export default function ReportPage() {
  const params = useParams<{ slug: string }>();
  const product = getProductBySlug(params.slug);
  const { preferences } = useAppState();

  if (!product) {
    return <main className="shell"><p className="card-state text-sm">Ingredient report unavailable.</p></main>;
  }

  const score = scoreProduct(product, preferences);

  const cleanIngredients = product.ingredients.filter((item) => /(whole|oat|fruit|banana|apple|spinach|chia|flax|pea)/i.test(item));
  const cautionIngredients = product.ingredients.filter((item) => /(sugar|oil|syrup|flavor)/i.test(item));
  const concerningAdditives = product.additives;

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

      <section className="card text-sm">
        <p className="eyebrow">Full ingredient line</p>
        <p className="mt-2 leading-relaxed text-ink/80">{product.ingredients.join(", ")}</p>
      </section>
    </main>
  );
}
