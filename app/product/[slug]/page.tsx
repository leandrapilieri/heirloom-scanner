"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  InterpretationCard,
  ReasonChip,
  RecommendationModule,
  RetailerRow,
  SeverityChip
} from "@/components/premium";
import { premiumSourceProof } from "@/lib/premium-copy";
import { getAlternativeProducts } from "@/lib/services/alternative-engine";
import { getProductBySlug } from "@/lib/services/product-catalog";
import { getRetailerAvailability } from "@/lib/services/retailer-engine";
import { useAppState } from "@/lib/state/app-state";
import { scoreProduct } from "@/lib/scoring";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug;
  const sampleMode = searchParams.get("sample") === "1";
  const scanMode = searchParams.get("scan") === "1" || searchParams.get("source") === "scan";
  const fromFirstScan = searchParams.get("firstScan") === "1";
  const scanTier = searchParams.get("tier");
  const matchedBy = searchParams.get("matchedBy");

  const {
    preferences,
    favorites,
    shoppingList,
    toggleFavorite,
    toggleShoppingList,
    setCompareSelection,
    addRecentScan,
    markSampleResultViewed,
    markFirstMeaningfulInteraction,
    trackResultContextScan,
    openPremiumPreview,
    premium,
    onboarding
  } = useAppState();

  const product = getProductBySlug(slug);

  useEffect(() => {
    if (!product) return;
    addRecentScan(product.slug);
  }, [addRecentScan, product]);

  useEffect(() => {
    if (sampleMode && !onboarding.sampleResultViewed) {
      markSampleResultViewed();
    }
  }, [sampleMode, markSampleResultViewed, onboarding.sampleResultViewed]);

  if (!product) {
    return (
      <main className="shell section-gap">
        <section className="card-state space-y-3 text-sm text-ink/75">
          <p className="font-medium text-ink">We couldn&apos;t find that product result.</p>
          <p>The scan may be outdated or the link may no longer be available. You can jump right back into scanning.</p>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-primary text-sm" href="/scan">
              Scan again
            </Link>
            <Link className="btn-secondary text-sm" href="/">
              Go home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const score = scoreProduct(product, preferences);
  const alternatives = getAlternativeProducts(product, preferences);
  const retailers = getRetailerAvailability(product);

  const isFavorite = favorites.includes(product.slug);
  const inShoppingList = shoppingList.includes(product.slug);

  const whatMatters = [
    `Added sugar sits at ${product.addedSugarG}g`,
    `Fiber provides ${product.fiberG}g support`,
    `Sodium is ${product.sodiumMg}mg per serving`
  ];

  const selectiveHighlights = [
    score.topReasons[0],
    score.topReasons[1],
    score.standardsBadges[0]
  ].filter(Boolean) as string[];

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-24 pt-6 lg:max-w-4xl xl:max-w-5xl xl:space-y-8 xl:px-8">
      {sampleMode ? (
        <section className="card-state max-w-3xl text-sm text-ink/75">
          <p className="font-medium">Sample result preview</p>
          <p className="mt-1">This preview shows how your active standards influence grade, “what matters most,” and healthier swaps.</p>
        </section>
      ) : null}

      {scanMode ? (
        <section className="card-narrative max-w-3xl space-y-2 text-sm text-ink/75">
          <p className="font-medium">{fromFirstScan ? "First real scan complete" : "Real scan result"}</p>
          <p>Matched from live package signals: {matchedBy ?? "strong scan confidence alignment"}.</p>
          <p>
            This matters because it shortens aisle decisions while keeping your standards active for grade, explanation, and same-family swaps.
          </p>
          <p className="text-xs text-ink/60">
            Preference influence: {onboarding.priorityTags.slice(0, 2).join(" · ") || "Household standards applied"}
            {scanTier ? ` · ${scanTier} confidence` : ""}.
          </p>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr] xl:gap-6">
        <article className="card-hero overflow-hidden p-3 sm:p-4">
          <div className="relative h-[20rem] overflow-hidden rounded-[26px] sm:h-[24rem]">
            <Image src={product.image} alt={product.name} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 sm:p-6">
              <p className="text-[11px] uppercase tracking-[0.15em] text-white/85">{product.brand}</p>
              <h1 className="display max-w-xl text-3xl leading-tight text-white drop-shadow sm:text-4xl">{product.name}</h1>
            </div>
          </div>
          <div className="mt-4 rounded-3xl border border-white/70 bg-[#f7f1e8] p-4 sm:p-5">
            <p className="eyebrow">Quick interpretation</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/80">{score.explanation}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectiveHighlights.map((highlight) => (
                <ReasonChip key={highlight} reason={highlight} />
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-[30px] border border-accent/20 bg-gradient-to-b from-[#fff4ef] via-[#fdf0ea] to-[#f8ebdf] p-5 shadow-quiet lg:p-6">
          <p className="eyebrow">Health grade</p>
          <div className="mt-2 rounded-[24px] border border-white/80 bg-white/70 p-5 text-center">
            <p className="display text-6xl text-accent lg:text-7xl">{score.grade}</p>
            <p className="mt-1 text-sm text-ink/65">{score.numericScore}/100 overall score</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink/75">
            Active preference influence: {onboarding.priorityTags.slice(0, 2).join(" · ") || "Household standards applied"}.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              className="btn-primary"
              onClick={() => {
                toggleFavorite(product.slug);
                addRecentScan(product.slug);
                markFirstMeaningfulInteraction("save");
              }}
            >
              {isFavorite ? "Saved" : "Save to favorites"}
            </button>
            <button className="btn-secondary" onClick={() => toggleShoppingList(product.slug)}>
              {inShoppingList ? "In shopping list" : "Add to list"}
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link className="btn-secondary text-center text-sm" href={`/report/${product.slug}`}>
              View report
            </Link>
            <Link
              className="btn-secondary text-center text-sm"
              href="/scan"
              onClick={() => trackResultContextScan()}
            >
              Scan another
            </Link>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr] xl:gap-6">
        <div className="space-y-4 sm:space-y-5">
          <InterpretationCard
            title="What matters most"
            summary="A guided read of the nutrition profile, focused on what parents usually care about first."
          >
            <div className="space-y-2 text-sm text-ink/80">
              {whatMatters.map((point) => (
                <p className="card-metric" key={point}>{point}</p>
              ))}
            </div>
          </InterpretationCard>

          <InterpretationCard
            title="What to notice"
            summary="Ingredient quality and additives often tell a clearer story than calories alone."
          >
            <div className="flex flex-wrap gap-2">
              {score.standardsBadges.map((badge) => (
                <SeverityChip key={badge} label={badge} severity="clean" />
              ))}
              {score.ingredientFlags.map((flag) => (
                <SeverityChip key={flag} label={flag} severity="caution" />
              ))}
              {product.additives.map((additive) => (
                <SeverityChip key={additive} label={additive} severity="concern" />
              ))}
            </div>
          </InterpretationCard>

          <InterpretationCard
            title="Why swaps may align better"
            summary="Alternatives are chosen to keep the same snack use case with improved ingredient and sugar profile."
          >
            <p className="text-sm text-ink/75">Active guardian preferences are now applied to scoring and ranking for these recommendations.</p>
          </InterpretationCard>

          <section className="space-y-3 rounded-[30px] border border-sage/25 bg-gradient-to-b from-[#eef4ea] to-[#f5f8f2] p-5 shadow-quiet">
            <div className="flex items-end justify-between">
              <h2 className="display text-2xl">Curated alternatives</h2>
              <p className="text-xs text-ink/60">Same product family fit</p>
            </div>
            <div className="space-y-3">
              {alternatives.slice(0, 3).map((alt) => (
                <RecommendationModule
                  key={alt.id}
                  product={alt}
                  onCompare={() => {
                    setCompareSelection({ originalSlug: product.slug, alternativeSlug: alt.slug });
                    addRecentScan(product.slug);
                    markFirstMeaningfulInteraction("compare");
                    router.push("/compare");
                  }}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <section className="card space-y-2 text-sm">
            <h2 className="display text-xl">Retailer availability</h2>
            {retailers.map((offer) => (
              <RetailerRow key={offer.retailer} retailer={offer.retailer} price={offer.price} inStock={offer.inStock} />
            ))}
          </section>

          <section className="rounded-3xl border border-accent/15 bg-[#fff9f6] p-4 text-sm text-ink/70">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink/50">Premium preview</p>
            <p className="mt-2">Core results above stay fully free. Premium adds deeper swap rationale and richer retailer confidence context.</p>
            {premium.premiumPreviewMode ? (
              <p className="mt-2 rounded-2xl border border-accent/10 bg-white/70 p-3 text-xs blur-[1px]">
                {premium.premiumTriggerSource === "extended_swaps"
                  ? premiumSourceProof("extended_swaps")
                  : premiumSourceProof("retailer_intel")}
              </p>
            ) : null}
            <div className="mt-3 flex gap-2">
              <Link
                className="btn-secondary inline-flex text-xs"
                href="/premium?source=extended_swaps"
                onClick={() => openPremiumPreview("extended_swaps")}
              >
                Deeper swaps
              </Link>
              <Link
                className="btn-secondary inline-flex text-xs"
                href="/premium?source=retailer_intel"
                onClick={() => openPremiumPreview("retailer_intel")}
              >
                Retailer layer
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
