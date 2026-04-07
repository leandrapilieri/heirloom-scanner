"use client";

import Link from "next/link";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/services/product-catalog";
import { useAppState } from "@/lib/state/app-state";

const TRUST_POINTS = [
  "Scan barcode or package",
  "See grade and top reasons",
  "Find cleaner same-family swaps",
];

export default function LandingPage() {
  const highlights = listProducts().slice(0, 3);
  const { onboarding, hydrated } = useAppState();

  return (
    <main className="shell section-gap">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] border border-black/5 bg-gradient-to-br from-white/80 via-stone/30 to-accent/10 backdrop-blur-xs px-6 pb-8 pt-8 shadow-soft">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-accent-warm/10 blur-3xl" />

        <div className="relative z-10">
          <p className="pill-accent inline-flex mb-4">Trusted grocery guidance for caregivers</p>

          <div className="mt-6 space-y-4">
            <h1 className="display text-[2.5rem] leading-[1.1] tracking-tight text-ink font-bold">
              Find the best snack choice in seconds.
            </h1>
            <p className="max-w-[42ch] text-base leading-relaxed text-ink-light">
              Scan once to get a clear health grade, calm ingredient guidance, and healthier alternatives in the same snack family.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link href="/scan" className="btn-primary w-full justify-center text-base font-semibold">
              Scan a snack
            </Link>
            <Link href="#how-it-works" className="btn-secondary w-full justify-center font-semibold">
              How it works
            </Link>
          </div>

          {/* Trust Points */}
          <ul className="mt-8 grid gap-3 rounded-[24px] border border-black/5 bg-white/50 backdrop-blur-xs p-4 text-sm">
            {TRUST_POINTS.map((point, index) => (
              <li key={point} className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                  {index + 1}
                </span>
                <span className="text-ink font-medium">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Onboarding Flow */}
      {hydrated && !onboarding.onboardingCompleted ? <OnboardingFlow /> : null}

      {/* How It Works Section */}
      <section id="how-it-works" className="card-narrative space-y-3">
        <h2 className="display text-2xl font-bold text-ink">How it works</h2>
        <p className="text-base leading-relaxed text-ink-light">
          Use your camera to identify a snack, then get an easy-to-read verdict with the key reasons and practical swap ideas.
        </p>
      </section>

      {/* Editor's Examples Section */}
      <section id="browse-examples" className="space-y-4 pb-2">
        <div className="space-y-2">
          <h2 className="display text-2xl font-bold text-ink">Editor&apos;s examples</h2>
          <p className="text-base text-ink-light">Browse a few common snacks and preview the style of result you&apos;ll get after scanning.</p>
        </div>
        <div className="space-y-3">
          {highlights.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
