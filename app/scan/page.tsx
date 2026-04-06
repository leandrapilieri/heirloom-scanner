"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanCandidate, resolveScan } from "@/lib/services/scan-resolver";
import { CatalogProduct, listProducts } from "@/lib/services/product-catalog";
import { getAlternativeProducts } from "@/lib/services/alternative-engine";
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
    markFirstScanCompleted,
    toggleFavorite,
    setCompareSelection
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
  const [latestResolvedSlug, setLatestResolvedSlug] = useState<string | null>(null);
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
    setLatestResolvedSlug(slug);
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
  const latestResolvedProduct = latestResolvedSlug ? all.find((product) => product.slug === latestResolvedSlug) : null;
  const latestResolvedSwap = latestResolvedProduct ? getAlternativeProducts(latestResolvedProduct, preferences)[0] : null;

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
    <main className="shell section-gap pb-14">
      <header className="space-y-3">
        <p className="pill-accent inline-flex">Guided scan</p>
        <h1 className="display text-3xl">Scan quickly, choose with clarity</h1>
        <p className="max-w-[32rem] text-sm leading-relaxed text-ink/70">
          Point your camera at a snack package and we&apos;ll take you straight to a calm verdict with trusted same-family swaps.
        </p>
      </header>

      <section className="card-hero space-y-5 border border-white/80 bg-gradient-to-b from-[#fffaf3] to-[#f7ecdc] p-4 shadow-[0_14px_44px_rgba(36,24,16,0.1)]">
        <div className="relative overflow-hidden rounded-[26px] border border-white/90 bg-[#f4e6d3] px-4 py-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_55%)]" />
          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-accent/10 blur-2xl" />
          <div className="relative space-y-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="rounded-full bg-white/85 px-3 py-1 text-ink/70">{confidenceLabel}</span>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-accent">Deterministic scan model</span>
            </div>
            <div className="space-y-1">
              <p className="eyebrow">Scan status</p>
              <p className="display text-3xl text-ink">{statusMessage}</p>
            </div>
            <p className="text-sm text-ink/70">One guided step: scan first, then review the result and swaps.</p>
          </div>
        </div>

        <div className="space-y-2">
          <button className="btn-primary w-full text-base" onClick={() => runScan({ photoHint: "little orchard cocoa cookie" })} type="button">
            Scan package now
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary text-sm" onClick={() => runScan({ barcode: all[0].barcode })} type="button">
              Try barcode sample
            </button>
            <button className="btn-secondary text-sm" onClick={handleManualRecovery} type="button">
              Use manual entry
            </button>
          </div>
        </div>

        {showFailureRecovery ? (
          <div className="rounded-2xl border border-accent/25 bg-[#fff8f5] p-3 text-sm text-ink/80">
            <p className="font-medium text-ink">We couldn&apos;t confidently identify that package yet.</p>
            <p className="mt-1">Use manual search for a fast result, or retry with a clearer front-of-pack photo.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="btn-primary text-sm" onClick={handleManualRecovery} type="button">Search by name</button>
              <button className="btn-secondary text-sm" onClick={handleRetry} type="button">Try scan again</button>
            </div>
          </div>
        ) : null}

        {!cameraAvailable || isDesktopLike ? (
          <div className="rounded-2xl border border-white/80 bg-white/70 p-3 text-sm text-ink/75">
            <p className="font-medium text-ink">Camera unavailable on this device</p>
            <p className="mt-1">You can continue with barcode or name entry below.</p>
          </div>
        ) : null}
      </section>

      {onboarding.onboardingCompleted && !onboarding.setupSummarySeen ? (
        <section className="card-state space-y-2 text-sm text-ink/75">
          <p className="font-medium">Your setup is active</p>
          <p>Optimizing for {activeSignals.join(" · ")}.</p>
          <button className="text-xs underline" onClick={dismissSetupSummary}>Got it</button>
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

      {confirmCandidates.length ? (
        <section className="card-narrative space-y-3">
          <div>
            <p className="eyebrow">Confirm match</p>
            <h2 className="display text-2xl">Choose the right product</h2>
            <p className="text-sm text-ink/70">We found a few likely matches. Pick one to open the most accurate result.</p>
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

      {showFirstSuccess ? (
        <section className="card-narrative space-y-2 text-sm text-ink/75">
          <p className="font-medium">First scan complete</p>
          <p>Your result now reflects your household standards. We&apos;ll keep favoring cleaner same-family swaps.</p>
          <div className="flex gap-2">
            <button
              className="btn-secondary text-xs"
              onClick={() => {
                if (!latestResolvedSlug) return;
                toggleFavorite(latestResolvedSlug);
                setShowFirstSuccess(false);
                router.push("/favorites");
              }}
              type="button"
            >
              Save pick
            </button>
            <button
              className="btn-secondary text-xs disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                if (!latestResolvedSlug || !latestResolvedSwap) return;
                setCompareSelection({
                  originalSlug: latestResolvedSlug,
                  alternativeSlug: latestResolvedSwap.slug
                });
                setShowFirstSuccess(false);
                router.push("/compare");
              }}
              disabled={!latestResolvedSlug || !latestResolvedSwap}
              type="button"
            >
              Compare pick
            </button>
            <button className="btn-secondary text-xs" onClick={() => setShowFirstSuccess(false)} type="button">Scan another</button>
          </div>
        </section>
      ) : null}

      <section className="card-narrative space-y-3" id="manual-fallback">
        <div>
          <p className="eyebrow">Manual entry</p>
          <h2 className="display text-2xl">Use barcode or product name</h2>
          <p className="text-sm text-ink/70">Secondary path when camera scan is unavailable or not clear.</p>
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
            Enter barcode
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
            Search by name
          </button>
        </div>
      </section>

      <section className="card-state text-sm text-ink/75">
        <p className="font-medium">How scanning works</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {pipelineStages.map((stage) => (
            <span className="pill" key={stage}>{stage}</span>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="display text-2xl">Recent scans</h2>
          <Link className="text-xs text-ink/60 underline" href="/">Back home</Link>
        </div>
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
