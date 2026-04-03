"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
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
  if (!product) {
    return <main className="shell"><p className="card-state text-sm">Product not found.</p></main>;
  }

  const score = scoreProduct(product, preferences);
  const alternatives = getAlternativeProducts(product, preferences);
  const retailers = getRetailerAvailability(product);

  const isFavorite = favorites.includes(product.slug);
  const inShoppingList = shoppingList.includes(product.slug);

  useEffect(() => {
    addRecentScan(product.slug);
  }, [addRecentScan, product.slug]);

  useEffect(() => {
    if (sampleMode && !onboarding.sampleResultViewed) {
      markSampleResultViewed();
    }
  }, [sampleMode, markSampleResultViewed, onboarding.sampleResultViewed]);

  const whatMatters = [
    `Added sugar sits at ${product.addedSugarG}g`,
    `Fiber provides ${product.fiberG}g support`,
    `Sodium is ${product.sodiumMg}mg per serving`
  ];

  return (
    <main className="shell section-gap pb-24">
      {sampleMode ? (
        <section className="card-state text-sm text-ink/75">
          <p className="font-medium">Sample result preview</p>
          <p className="mt-1">This preview shows how your active standards influence grade, “what matters most,” and healthier swaps.</p>
        </section>
      ) : null}

      {scanMode ? (
        <section className="card-narrative space-y-2 text-sm text-ink/75">
          <p className="font-medium">{fromFirstScan ? "First real scan complete" : "Real scan result"}</p>
          <p>Matched from live package signals: {matchedBy ?? "strong scan confidence alignment"}.</p>
          <p>
            This matters because it shortens aisle decisions while keeping your standards active for grade, explanation, and same-family swaps.
          </p>
          <p className="text-xs text-ink/60">
            Preference influence: {onboarding.priorityTags.slice(0, 2).join(" · ") || "Household standards applied"}{scanTier ? ` · ${scanTier} confidence` : ""}.
          </p>
        </section>
      ) : null}

      <section className="card-hero overflow-hidden">
        <div className="relative h-64 overflow-hidden rounded-[24px]">
          <Image src={product.image} alt={product.name} fill className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-4 text-white">
            <p className="text-[11px] uppercase tracking-[0.15em] text-white/80">{product.brand}</p>
            <h1 className="display text-3xl text-white">{product.name}</h1>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[1fr_1.2fr] gap-3">
        <article className="card-metric text-center">
          <p className="eyebrow">Health grade</p>
          <p className="display mt-1 text-5xl text-accent">{score.grade}</p>
          <p className="text-xs text-ink/65">{score.numericScore}/100</p>
        </article>
        <article className="card-narrative">
          <p className="eyebrow">Quick explanation</p>
          <p className="mt-1 text-sm leading-relaxed text-ink/80">{score.explanation}</p>
          <p className="mt-1 text-xs text-ink/60">Active preference influence: {onboarding.priorityTags.slice(0, 2).join(" · ") || "Household standards applied"}.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {score.topReasons.slice(0, 3).map((reason) => (
              <ReasonChip key={reason} reason={reason} />
            ))}
          </div>
        </article>
      </section>

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

      <section className="section-gap">
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
              }}
            />
          ))}
        </div>
      </section>

      <section className="card space-y-2 text-sm">
        <h2 className="display text-xl">Retailer availability</h2>
        {retailers.map((offer) => (
          <RetailerRow key={offer.retailer} retailer={offer.retailer} price={offer.price} inStock={offer.inStock} />
        ))}
      </section>

      <section className="card-state space-y-2 text-sm text-ink/75">
        <p className="font-medium">Premium enhancements preview</p>
        <p>Core results above stay fully free. Premium adds deeper swap rationale and richer retailer confidence context when you want more depth.</p>
        {premium.premiumPreviewMode ? (
          <p className="card-state blur-[1px] text-xs">
            {premium.premiumTriggerSource === "extended_swaps" ? premiumSourceProof("extended_swaps") : premiumSourceProof("retailer_intel")}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Link
            className="btn-secondary inline-flex text-sm"
            href="/premium?source=extended_swaps"
            onClick={() => openPremiumPreview("extended_swaps")}
          >
            Deeper swaps
          </Link>
          <Link
            className="btn-secondary inline-flex text-sm"
            href="/premium?source=retailer_intel"
            onClick={() => openPremiumPreview("retailer_intel")}
          >
            Retailer layer
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
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

      <div className="grid grid-cols-2 gap-3">
        <Link className="btn-secondary text-center text-sm" href={`/report/${product.slug}`}>View ingredient report</Link>
        <Link
          className="btn-secondary text-center text-sm"
          href="/scan"
          onClick={() => trackResultContextScan()}
        >
          Scan another
        </Link>
      </div>
    </main>
  );
}
