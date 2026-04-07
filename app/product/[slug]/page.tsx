"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { ReasonChip, RecommendationModule, RetailerRow, SeverityChip } from "@/components/premium";
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
  const lastTrackedRecentScanSlugRef = useRef<string | null>(null);

  useEffect(() => {
    if (!product) return;
    if (lastTrackedRecentScanSlugRef.current === product.slug) return;
    addRecentScan(product.slug);
    lastTrackedRecentScanSlugRef.current = product.slug;
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
  const featuredAlternative = alternatives[0];
  const secondaryAlternatives = alternatives.slice(1, 3);
  const featuredAlternativeScore = featuredAlternative ? scoreProduct(featuredAlternative, preferences) : null;
  const featuredIsHealthier = Boolean(
    featuredAlternativeScore && featuredAlternativeScore.numericScore > score.numericScore
  );
  const retailers = getRetailerAvailability(product);

  const isFavorite = favorites.includes(product.slug);
  const inShoppingList = shoppingList.includes(product.slug);

  const whatMatters = [
    `Added sugar sits at ${product.addedSugarG}g`,
    `Fiber provides ${product.fiberG}g support`,
    `Sodium is ${product.sodiumMg}mg per serving`
  ];

  const featuredSignals = featuredAlternative
    ? [
        featuredAlternative.addedSugarG < product.addedSugarG
          ? `${product.addedSugarG - featuredAlternative.addedSugarG}g less added sugar`
          : undefined,
        featuredAlternative.additives.length < product.additives.length ? "Cleaner ingredient list" : undefined,
        featuredAlternative.fiberG > product.fiberG ? `${featuredAlternative.fiberG - product.fiberG}g more fiber` : undefined,
        featuredAlternative.addedSugarG <= 5 ? "Lower sugar profile" : undefined
      ].filter((value): value is string => Boolean(value)).slice(0, 2)
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-24 pt-6 lg:max-w-4xl xl:max-w-5xl xl:space-y-8 xl:px-8">
      <div className="flex flex-wrap items-center gap-2 px-1 text-[11px] uppercase tracking-[0.1em] text-ink/55">
        {sampleMode ? <span className="rounded-full border border-ink/10 bg-white/70 px-2.5 py-1">Sample preview</span> : null}
        {scanMode ? (
          <span className="rounded-full border border-sage/20 bg-sage/10 px-2.5 py-1">
            {fromFirstScan ? "First real scan" : "Live scan"} · {matchedBy ?? "package match"}
            {scanTier ? ` · ${scanTier}` : ""}
          </span>
        ) : null}
      </div>

      <section className="card-hero overflow-hidden p-3 sm:p-4">
        <div className="relative h-[20rem] overflow-hidden rounded-[26px] sm:h-[24rem]">
          <Image src={product.image} alt={product.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.15em] text-white/85">{product.brand}</p>
            <h1 className="display max-w-xl text-3xl leading-tight text-white drop-shadow sm:text-4xl">{product.name}</h1>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-white/70 bg-[#f7f1e8] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Verdict</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/80">{score.explanation}</p>
            </div>
            <div className="min-w-[7rem] rounded-[22px] border border-accent/20 bg-white/80 px-4 py-3 text-center">
              <p className="display text-4xl text-accent">{score.grade}</p>
              <p className="text-xs text-ink/60">{score.numericScore}/100</p>
            </div>
          </div>

          <Link
            className="btn-primary mt-4 block w-full text-center"
            href={featuredAlternative ? `/product/${featuredAlternative.slug}` : "/scan"}
          >
            {featuredAlternative ? (featuredIsHealthier ? "View healthier option" : "View alternative option") : "Scan another product"}
          </Link>

          <div className="mt-3 flex items-center gap-4 text-xs text-ink/65">
            <button
              className="underline-offset-2 hover:underline"
              onClick={() => {
                toggleFavorite(product.slug);
                addRecentScan(product.slug);
                markFirstMeaningfulInteraction("save");
              }}
              type="button"
            >
              {isFavorite ? "Saved" : "Save"}
            </button>
            {isFavorite ? (
              <Link className="underline-offset-2 hover:underline" href="/favorites">
                View pantry
              </Link>
            ) : null}
            <Link className="underline-offset-2 hover:underline" href={`/report/${product.slug}`}>
              Full report
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr] xl:gap-6">
        <section className="space-y-3 rounded-[30px] border border-sage/25 bg-gradient-to-b from-[#eef4ea] to-[#f5f8f2] p-5 shadow-quiet">
          <div className="flex items-end justify-between">
            <h2 className="display text-2xl">{featuredIsHealthier ? "Best healthier swap" : "Best alternative swap"}</h2>
            <p className="text-xs text-ink/60">Same product family</p>
          </div>

          {featuredAlternative && featuredAlternativeScore ? (
            <article className="card-recommendation space-y-3">
              <div className="relative h-40 overflow-hidden rounded-2xl">
                <Image src={featuredAlternative.image} alt={featuredAlternative.name} fill className="object-cover" />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">Featured recommendation</p>
                  <h3 className="text-sm font-medium">{featuredAlternative.name}</h3>
                  <p className="text-xs text-ink/65">{featuredAlternative.brand}</p>
                </div>
                <div className="rounded-2xl border border-accent/20 bg-white px-3 py-2 text-center">
                  <p className="display text-2xl text-accent">{featuredAlternativeScore.grade}</p>
                  <p className="text-[11px] text-ink/60">{featuredAlternativeScore.numericScore}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {featuredSignals.length ? (
                  featuredSignals.map((reason) => <ReasonChip key={reason} reason={reason} />)
                ) : (
                  <ReasonChip reason="Better fit for current household preferences" />
                )}
              </div>
              <Link
                className="btn-secondary relative z-10 block w-full border-sage/30 bg-white text-center text-sm font-medium shadow-sm"
                href={`/product/${featuredAlternative.slug}`}
              >
                {featuredIsHealthier ? "View healthier result" : "View alternative result"}
              </Link>
              <Link
                className="btn-secondary block w-full border-sage/30 bg-white text-center text-sm font-medium shadow-sm"
                href={`/compare?original=${product.slug}&alternative=${featuredAlternative.slug}`}
                onClick={() => {
                  setCompareSelection({
                    originalSlug: product.slug,
                    alternativeSlug: featuredAlternative.slug
                  });
                  markFirstMeaningfulInteraction("compare");
                }}
              >
                Compare this swap
              </Link>
            </article>
          ) : (
            <p className="text-sm text-ink/75">No same-family swap is available right now for this product.</p>
          )}

          {secondaryAlternatives.length ? (
            <details className="rounded-2xl border border-white/80 bg-white/70 p-3">
              <summary className="cursor-pointer text-sm font-medium text-ink/80">More alternatives</summary>
              <div className="mt-3 space-y-3">
                {secondaryAlternatives.map((alt) => (
                  <RecommendationModule
                    key={alt.id}
                    product={alt}
                    primaryHref={`/product/${alt.slug}`}
                    ctaLabel={featuredIsHealthier ? "View healthier result" : "View alternative result"}
                    preferences={preferences}
                  />
                ))}
              </div>
            </details>
          ) : null}
        </section>

        <section className="rounded-[30px] border border-accent/15 bg-[#fff9f6] p-4 text-sm text-ink/70">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink/50">Quick actions</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="btn-secondary" onClick={() => toggleShoppingList(product.slug)} type="button">
              {inShoppingList ? "In shopping list" : "Add to list"}
            </button>
            <Link
              className="btn-secondary text-center text-sm"
              href="/scan"
              onClick={() => {
                trackResultContextScan();
              }}
            >
              Scan another
            </Link>
          </div>
          <p className="mt-3 text-xs text-ink/60">
            Preference influence: {onboarding.priorityTags.slice(0, 2).join(" · ") || "Household standards applied"}.
          </p>
        </section>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr] xl:gap-6">
        <section className="card-narrative space-y-4">
          <div>
            <p className="eyebrow">Interpretation</p>
            <h2 className="display text-2xl">What matters most</h2>
            <p className="mt-1 text-sm text-ink/75">A quick read of nutrition and ingredient signals for confident aisle decisions.</p>
          </div>
          <div className="space-y-2 text-sm text-ink/80">
            {whatMatters.map((point) => (
              <p className="card-metric" key={point}>{point}</p>
            ))}
          </div>
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
          <p className="text-sm text-ink/75">
            Alternatives stay in the same snack family while improving ingredient and sugar profile for your active preferences.
          </p>
        </section>

        <div className="space-y-3 sm:space-y-4">
          <details className="rounded-3xl border border-ink/10 bg-white/70 p-4 text-sm" open>
            <summary className="cursor-pointer font-medium text-ink">Retailer availability</summary>
            <div className="mt-3 space-y-2">
              {retailers.map((offer) => (
                <RetailerRow key={offer.retailer} retailer={offer.retailer} price={offer.price} inStock={offer.inStock} />
              ))}
            </div>
          </details>

          <details className="rounded-3xl border border-accent/15 bg-[#fff9f6] p-4 text-sm text-ink/70">
            <summary className="cursor-pointer text-[11px] uppercase tracking-[0.12em] text-ink/50">Premium preview</summary>
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
                Swap details
              </Link>
              <Link
                className="btn-secondary inline-flex text-xs"
                href="/premium?source=retailer_intel"
                onClick={() => openPremiumPreview("retailer_intel")}
              >
                Retailer details
              </Link>
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
