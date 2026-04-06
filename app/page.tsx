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
    <main className="shell section-gap pb-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-ink/10 bg-gradient-to-b from-[#fffaf2] via-[#fff6eb] to-[#f6f0e6] px-5 pb-6 pt-6 shadow-[0_16px_50px_-28px_rgba(41,31,22,0.45)]">
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#e46f4e]/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-0 h-28 w-28 rounded-full bg-[#9caf88]/20 blur-2xl" />

        <p className="pill-accent inline-flex">Trusted grocery guidance for caregivers</p>

        <div className="mt-4 space-y-3">
          <h1 className="display text-[2rem] leading-[1.08] tracking-tight text-ink">
            Find the best snack choice in seconds.
          </h1>
          <p className="max-w-[34ch] text-sm leading-relaxed text-ink/75">
            Scan once to get a clear health grade, calm ingredient guidance, and healthier alternatives in the same snack family.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <Link href="/scan" className="btn-primary w-full justify-center text-base">
            Scan a snack
          </Link>
          <Link href="#how-it-works" className="btn-secondary w-full justify-center">
            How it works
          </Link>
        </div>

        <ul className="mt-5 grid gap-2 rounded-2xl border border-ink/10 bg-ivory/70 p-3 text-sm text-ink/75">
          {TRUST_POINTS.map((point, index) => (
            <li key={point} className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink/8 text-xs font-semibold text-ink/70">
                {index + 1}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {hydrated && !onboarding.onboardingCompleted ? <OnboardingFlow /> : null}

      <section id="how-it-works" className="space-y-2 rounded-3xl border border-ink/10 bg-card px-5 py-5 shadow-sm">
        <h2 className="display text-2xl">How it works</h2>
        <p className="text-sm leading-relaxed text-ink/75">
          Use your camera to identify a snack, then get an easy-to-read verdict with the key reasons and practical swap ideas.
        </p>
      </section>

      <section id="browse-examples" className="space-y-3 pb-2">
        <div className="space-y-1">
          <h2 className="display text-2xl">Editor&apos;s examples</h2>
          <p className="text-sm text-ink/70">Browse a few common snacks and preview the style of result you&apos;ll get after scanning.</p>
        </div>
        {highlights.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </main>
  );
}
