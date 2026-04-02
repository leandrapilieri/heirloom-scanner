"use client";

import Link from "next/link";
import { useState } from "react";
import { ScanCandidate, resolveScan } from "@/lib/services/scan-resolver";
import { CatalogProduct, listProducts } from "@/lib/services/product-catalog";
import { ScanOutcome, useAppState } from "@/lib/state/app-state";

const pipelineStages = ["Identify package", "Check packaging signals", "Rank likely matches", "Prepare alternatives"];

export default function ScanPage() {
  const { recentScans, addRecentScan, recordScanOutcome, confirmScanOutcome } = useAppState();
  const all = listProducts();
  const recent = recentScans.map((slug) => all.find((product) => product.slug === slug)).filter((product): product is CatalogProduct => Boolean(product));

  const [lastAttemptId, setLastAttemptId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Ready to scan");
  const [confirmCandidates, setConfirmCandidates] = useState<ScanCandidate[]>([]);
  const [confidenceLabel, setConfidenceLabel] = useState("High confidence match");

  const runScan = (input: { barcode?: string; photoHint?: string; query?: string; categoryHint?: string }) => {
    const resolution = resolveScan(input);
    const attemptId = crypto.randomUUID();
    setLastAttemptId(attemptId);

    const outcome: ScanOutcome = {
      id: attemptId,
      timestamp: new Date().toISOString(),
      method: resolution.method,
      confidence: resolution.confidence,
      confidenceTier: resolution.confidenceTier,
      status: resolution.status,
      candidateSlugs: resolution.candidates.map((item) => item.slug)
    };
    recordScanOutcome(outcome);

    if (resolution.status === "resolved" && resolution.candidateSlug) {
      addRecentScan(resolution.candidateSlug);
      setConfirmCandidates([]);
      setStatusMessage("High confidence match ready");
      setConfidenceLabel("High confidence match");
      return;
    }

    if (resolution.status === "confirm_needed") {
      setConfirmCandidates(resolution.candidates.slice(0, 4));
      setStatusMessage("We found a few likely matches");
      setConfidenceLabel("Confirm for best accuracy");
      return;
    }

    setConfirmCandidates([]);
    setStatusMessage("No clear match found");
    setConfidenceLabel("Low confidence");
  };

  const confirmCandidate = (candidate: ScanCandidate) => {
    addRecentScan(candidate.slug);
    if (lastAttemptId) {
      confirmScanOutcome(lastAttemptId, candidate.slug);
    }
    setConfirmCandidates([]);
    setStatusMessage("Confirmed and ready for score");
    setConfidenceLabel(`${candidate.confidenceTier} confidence`);
  };

  return (
    <main className="shell section-gap">
      <header className="space-y-2">
        <p className="pill-accent inline-flex">Live scan simulator</p>
        <h1 className="display text-3xl">Scan in aisle, decide with confidence</h1>
        <p className="text-sm leading-relaxed text-ink/70">A smarter resolver now scores brand, keyword, category, barcode, and ambiguity signals before recommending a match.</p>
      </header>

      <section className="card-hero space-y-4">
        <div className="relative mx-auto h-72 w-full overflow-hidden rounded-[28px] border border-white/80 bg-[#f3e7d6]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.35),transparent_58%)]" />
          <div className="absolute inset-6 rounded-[24px] border border-accent/35" />
          <div className="absolute inset-10 rounded-[18px] border-2 border-dashed border-sage/35" />
          <div className="absolute left-1/2 top-1/2 w-44 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="eyebrow">Smart scan assistant</p>
            <p className="display text-2xl">{statusMessage}</p>
          </div>
          <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs text-ink/75">{confidenceLabel}</div>
          <div className="absolute bottom-4 right-4 rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">Deterministic match model</div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <button className="pill" onClick={() => runScan({ barcode: all[0].barcode })} type="button">Barcode</button>
          <button className="pill" onClick={() => runScan({ photoHint: "little orchard cocoa cookie" })} type="button">Photo capture</button>
          <button className="pill" onClick={() => runScan({ query: "apple oat bar", categoryHint: "granola bars" })} type="button">Manual search</button>
        </div>
      </section>

      <section className="card-state text-sm text-ink/75">
        <p className="font-medium">Pipeline stages</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {pipelineStages.map((stage) => (
            <span className="pill" key={stage}>{stage}</span>
          ))}
        </div>
      </section>

      {confirmCandidates.length ? (
        <section className="card-narrative space-y-3">
          <div>
            <p className="eyebrow">Smart assist</p>
            <h2 className="display text-2xl">Confirm the product</h2>
            <p className="text-sm text-ink/70">We found a few likely matches. Choose one to get the most accurate score.</p>
          </div>
          <div className="space-y-2">
            {confirmCandidates.map((candidate) => (
              <button className="card-recommendation w-full text-left" key={candidate.slug} onClick={() => confirmCandidate(candidate)} type="button">
                <p className="eyebrow">{candidate.confidenceTier} confidence</p>
                <p className="text-sm font-medium">{candidate.name}</p>
                <p className="text-xs text-ink/65">{candidate.brand} · {Math.round(candidate.confidence * 100)}% · {candidate.reason}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-gap">
        <h2 className="display text-2xl">Recent scans</h2>
        <div className="grid gap-2">
          {(recent.length ? recent : all.slice(0, 3)).slice(0, 5).map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`} className="card-recommendation block text-sm">
              <p className="eyebrow">{product.brand}</p>
              <p>{product.name}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
