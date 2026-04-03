"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanCandidate, resolveScan } from "@/lib/services/scan-resolver";
import { CatalogProduct, listProducts } from "@/lib/services/product-catalog";
import { ScanOutcome, useAppState } from "@/lib/state/app-state";

const pipelineStages = ["Identify package", "Check packaging signals", "Rank likely matches", "Prepare alternatives"];

export default function ScanPage() {
  const router = useRouter();
  const {
    recentScans,
    addRecentScan,
    recordScanOutcome,
    confirmScanOutcome,
    onboarding,
    preferences,
    dismissSetupSummary,
    markFirstScanCompleted
  } = useAppState();

  const all = listProducts();
  const recent = recentScans.map((slug) => all.find((product) => product.slug === slug)).filter((product): product is CatalogProduct => Boolean(product));

  const [lastAttemptId, setLastAttemptId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Ready to scan");
  const [confirmCandidates, setConfirmCandidates] = useState<ScanCandidate[]>([]);
  const [confidenceLabel, setConfidenceLabel] = useState("High confidence match");
  const [showFirstSuccess, setShowFirstSuccess] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [manualQuery, setManualQuery] = useState("");
  const [manualCategoryHint, setManualCategoryHint] = useState("");
  const [isDesktopLike, setIsDesktopLike] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [revealState, setRevealState] = useState<{
    slug: string;
    confidenceTier: ScanOutcome["confidenceTier"];
    reason: string;
    firstScan: boolean;
  } | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);
  const latestAttemptIdRef = useRef<string | null>(null);
  const hasNavigatedForAttemptRef = useRef<string | null>(null);
  const manualBarcodeRef = useRef<HTMLInputElement | null>(null);
  const manualSearchRef = useRef<HTMLInputElement | null>(null);

  const clearPendingReveal = () => {
    if (revealTimeoutRef.current) {
      window.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    setRevealState(null);
  };

  const activeSignals = useMemo(() => {
    const standards = [
      preferences.lowSugar ? "Low sugar" : null,
      preferences.dyeFree ? "Dye-free" : null,
      preferences.nutFree ? "Nut-free" : null,
      onboarding.priorityTags[0] ?? null,
      onboarding.priorityTags[1] ?? null
    ].filter(Boolean) as string[];

    return standards.slice(0, 3);
  }, [preferences, onboarding.priorityTags]);

  const completeFirstScanIfNeeded = () => {
    if (!onboarding.firstScanCompleted) {
      markFirstScanCompleted();
      setShowFirstSuccess(true);
    }
  };

  const transitionToResult = ({
    attemptId,
    slug,
    confidenceTier,
    reason
  }: {
    attemptId: string;
    slug: string;
    confidenceTier: ScanOutcome["confidenceTier"];
    reason: string;
  }) => {
    if (latestAttemptIdRef.current !== attemptId) return;
    const firstScan = !onboarding.firstScanCompleted;
    completeFirstScanIfNeeded();
    setRevealState({ slug, confidenceTier, reason, firstScan });
    setStatusMessage("Match found");
    setConfidenceLabel(`${confidenceTier} confidence`);
    if (revealTimeoutRef.current) {
      window.clearTimeout(revealTimeoutRef.current);
    }
    revealTimeoutRef.current = window.setTimeout(() => {
      if (latestAttemptIdRef.current !== attemptId) return;
      if (hasNavigatedForAttemptRef.current === attemptId) return;
      hasNavigatedForAttemptRef.current = attemptId;
      const params = new URLSearchParams({
        source: "scan",
        scan: "1",
        tier: confidenceTier,
        matchedBy: reason
      });
      if (firstScan) params.set("firstScan", "1");
      router.push(`/product/${slug}?${params.toString()}`);
    }, 900);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const desktopViewport = window.matchMedia("(min-width: 1024px)").matches;
      const desktopPointer = window.matchMedia("(pointer:fine)").matches;
      setIsDesktopLike(desktopViewport || desktopPointer);
      setCameraAvailable(Boolean(navigator.mediaDevices?.getUserMedia));
    }

    return () => {
      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  const runScan = (input: { barcode?: string; photoHint?: string; query?: string; categoryHint?: string }) => {
    const resolution = resolveScan(input);
    const attemptId = crypto.randomUUID();
    setLastAttemptId(attemptId);
    latestAttemptIdRef.current = attemptId;
    hasNavigatedForAttemptRef.current = null;
    clearPendingReveal();

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
      const bestReason = resolution.candidates[0]?.reason ?? "Strong packaging signal alignment";
      transitionToResult({
        attemptId,
        slug: resolution.candidateSlug,
        confidenceTier: resolution.confidenceTier,
        reason: bestReason
      });
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
    if (!lastAttemptId) return;
    addRecentScan(candidate.slug);
    confirmScanOutcome(lastAttemptId, candidate.slug);
    setConfirmCandidates([]);
    transitionToResult({
      attemptId: lastAttemptId,
      slug: candidate.slug,
      confidenceTier: candidate.confidenceTier,
      reason: candidate.reason
    });
  };

  const showFailureRecovery = statusMessage === "No clear match found";

  const handleManualRecovery = () => {
    manualSearchRef.current?.focus();
    document.getElementById("manual-fallback")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRetry = () => {
    clearPendingReveal();
    setConfirmCandidates([]);
    setStatusMessage("Ready to scan");
    setConfidenceLabel("High confidence match");
  };

  return (
    <main className="shell section-gap">
      <header className="space-y-2">
        <p className="pill-accent inline-flex">Live scan simulator</p>
        <h1 className="display text-3xl">Scan in aisle, decide with confidence</h1>
        <p className="text-sm leading-relaxed text-ink/70">A smarter resolver now scores brand, keyword, category, barcode, and ambiguity signals before recommending a match.</p>
        <div className="flex gap-2 text-xs">
          <Link className="btn-secondary" href="/">Back home</Link>
          <Link className="btn-secondary" href="/product/little-orchard-cocoa-creme-minis?sample=1">View sample result</Link>
        </div>
      </header>

      {!cameraAvailable || isDesktopLike ? (
        <section className="card-state space-y-2 text-sm text-ink/75">
          <p className="font-medium">No camera? You can still continue right away.</p>
          <p>Try a sample result, enter a barcode manually, or search by product name to validate flows during desktop testing.</p>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary text-xs" href="/product/little-orchard-cocoa-creme-minis?sample=1">Try sample result</Link>
            <button className="btn-secondary text-xs" onClick={() => manualBarcodeRef.current?.focus()} type="button">Enter barcode manually</button>
            <button className="btn-secondary text-xs" onClick={() => manualSearchRef.current?.focus()} type="button">Search by product name</button>
          </div>
        </section>
      ) : null}

      {onboarding.onboardingCompleted && !onboarding.setupSummarySeen ? (
        <section className="card-state space-y-2 text-sm text-ink/75">
          <p className="font-medium">Your setup is active</p>
          <p>Optimizing for {activeSignals.join(" · ")}.</p>
          <button className="text-xs underline" onClick={dismissSetupSummary}>Got it</button>
        </section>
      ) : null}

      {showFirstSuccess ? (
        <section className="card-narrative space-y-2 text-sm text-ink/75">
          <p className="font-medium">First scan complete</p>
          <p>Your result now reflects your household standards. We&apos;ll keep favoring cleaner same-family swaps.</p>
          <div className="flex gap-2">
            <Link className="btn-secondary text-xs" href="/favorites">Save picks</Link>
            <Link className="btn-secondary text-xs" href="/compare">Compare options</Link>
            <button className="btn-secondary text-xs" onClick={() => setShowFirstSuccess(false)}>Scan another</button>
          </div>
        </section>
      ) : null}

      {revealState ? (
        <section className="card-hero space-y-2 border-accent/25 text-sm text-ink/75">
          <p className="eyebrow">Match found</p>
          <p className="display text-2xl text-ink">Preparing your result</p>
          <p>
            {revealState.reason}. Moving to your personalized score and cleaner same-family swaps.
          </p>
          {revealState.firstScan ? <p className="text-xs text-ink/60">First real scan milestone unlocked.</p> : null}
        </section>
      ) : null}

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

        {showFailureRecovery ? (
          <div className="card-state space-y-2 border-accent/25 bg-[#fff8f5] text-sm text-ink/80">
            <p className="font-medium text-ink">Need a hand finding the right match?</p>
            <p>Search manually for the product name to get to a result quickly.</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-primary text-sm" onClick={handleManualRecovery} type="button">Search manually</button>
              <button className="btn-secondary text-sm" onClick={handleRetry} type="button">Try again</button>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <button className="pill" onClick={() => runScan({ barcode: all[0].barcode })} type="button">Barcode</button>
          <button className="pill" onClick={() => runScan({ photoHint: "little orchard cocoa cookie" })} type="button">Photo capture</button>
          <button className="pill" onClick={() => runScan({ query: "apple oat bar", categoryHint: "granola bars" })} type="button">Manual search</button>
        </div>
      </section>

      <section className="card-narrative space-y-3" id="manual-fallback">
        <div>
          <p className="eyebrow">Manual fallback</p>
          <h2 className="display text-2xl">Enter barcode or search by name</h2>
          <p className="text-sm text-ink/70">Use this when camera is unavailable, or when testing scan flows from desktop.</p>
        </div>
        <div className="space-y-2">
          <input
            ref={manualBarcodeRef}
            className="w-full rounded-2xl border border-white/80 bg-white px-3 py-2 text-sm outline-none ring-accent/30 focus:ring"
            placeholder="Barcode (e.g. 112233445566)"
            value={manualBarcode}
            onChange={(event) => setManualBarcode(event.target.value)}
          />
          <button className="btn-secondary w-full text-sm" onClick={() => runScan({ barcode: manualBarcode.trim() })} type="button">
            Enter barcode manually
          </button>
          <input
            ref={manualSearchRef}
            className="w-full rounded-2xl border border-white/80 bg-white px-3 py-2 text-sm outline-none ring-accent/30 focus:ring"
            placeholder="Search by product name (e.g. apple oat bar)"
            value={manualQuery}
            onChange={(event) => setManualQuery(event.target.value)}
          />
          <input
            className="w-full rounded-2xl border border-white/80 bg-white px-3 py-2 text-sm outline-none ring-accent/30 focus:ring"
            placeholder="Optional category hint (e.g. granola bars)"
            value={manualCategoryHint}
            onChange={(event) => setManualCategoryHint(event.target.value)}
          />
          <button
            className="btn-secondary w-full text-sm"
            onClick={() => runScan({ query: manualQuery.trim(), categoryHint: manualCategoryHint.trim() || undefined })}
            type="button"
          >
            Search by product name
          </button>
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
