"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import {
  InterpretationCard,
  ReasonChip,
  RecommendationModule,
  RetailerRow,
  SeverityChip
} from "@/components/premium";
import { getAlternativeProducts } from "@/lib/services/alternative-engine";
import { getProductBySlug } from "@/lib/services/product-catalog";
import { getRetailerAvailability } from "@/lib/services/retailer-engine";
import { useAppState } from "@/lib/state/app-state";
import { scoreProduct } from "@/lib/scoring";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { preferences, favorites, shoppingList, toggleFavorite, toggleShoppingList, setCompareSelection, addRecentScan } = useAppState();

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

  const whatMatters = [
    `Added sugar sits at ${product.addedSugarG}g`,
    `Fiber provides ${product.fiberG}g support`,
    `Sodium is ${product.sodiumMg}mg per serving`
  ];

  return (
    <main className="shell section-gap pb-24">
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

      <div className="grid grid-cols-2 gap-3">
        <button
          className="btn-primary"
          onClick={() => {
            toggleFavorite(product.slug);
            addRecentScan(product.slug);
          }}
        >
          {isFavorite ? "Saved" : "Save to favorites"}
        </button>
        <button className="btn-secondary" onClick={() => toggleShoppingList(product.slug)}>
          {inShoppingList ? "In shopping list" : "Add to list"}
        </button>
      </div>

      <Link href={`/report/${product.slug}`} className="card-state block text-sm text-ink/80">View full ingredient report</Link>
    </main>
  );
}
