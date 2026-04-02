"use client";

import Link from "next/link";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/services/product-catalog";
import { useAppState } from "@/lib/state/app-state";

export default function LandingPage() {
  const highlights = listProducts().slice(0, 3);
  const { onboarding, hydrated } = useAppState();

  return (
    <main className="shell section-gap">
      <section className="space-y-3 pt-1">
        <p className="pill-accent inline-flex">Curated nutrition intelligence</p>
        <h1 className="display text-4xl leading-tight">Heirloom Scanner</h1>
        <p className="text-sm leading-relaxed text-ink/70">Identify snacks, understand their score, and find calmer, cleaner swaps for family grocery runs.</p>
        <div className="flex gap-3">
          <Link href="/scan" className="btn-primary">Scan a snack</Link>
          <Link href="/compare" className="btn-secondary">Compare picks</Link>
        </div>
      </section>

      {hydrated && !onboarding.onboardingCompleted ? <OnboardingFlow /> : null}

      <section className="card-hero space-y-3">
        <h2 className="display text-2xl">How it works</h2>
        <ol className="space-y-2 text-sm leading-relaxed text-ink/75">
          <li>1. Scan a barcode or package photo.</li>
          <li>2. We identify the product and enrich details.</li>
          <li>3. You get an elegant grade, reasons, and better swaps.</li>
        </ol>
      </section>

      <section className="section-gap pb-8">
        <h2 className="display text-2xl">Editor&apos;s examples</h2>
        {highlights.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </main>
  );
}
