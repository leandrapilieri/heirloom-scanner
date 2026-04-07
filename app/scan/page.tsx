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
  const [confidenceLabel, setConfidenceLabel] = useState("High confidence");
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

  const buildResultHref = (state: { slug: string; confidenceTier: ScanOutcome["confidenceTier"]; reason: string; firstScan: boolean }) => {
    const params = new URLSearchParams({
      source: "scan",
      scan: "1",
      tier: state.confidenceTier,
      matchedBy: state.reason
    });
    if (state.firstScan) params.set("firstScan", "1");
    return `/product/${state.slug}?${params.toString()}`;
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
      router.push(buildResultHref({ slug, confidenceTier, reason, firstScan }));
    }, 1700);
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
      setStatusMessage("Likely matches ready");
      setConfidenceLabel("Confirm needed");
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

  const successHighlights = latestResolvedProduct
    ? [
        latestResolvedProduct.addedSugarG <= 6 ? "Lower added sugar for this category" : "Higher added sugar than ideal",
        latestResolvedProduct.additives.length ? `${latestResolvedProduct.additives.length} additive signal${latestResolvedProduct.additives.length > 1 ? "s" : ""}` : "No flagged additives",
        latestResolvedProduct.processingLevel === "minimal" ? "Minimally processed profile" : `${latestResolvedProduct.processingLevel} processing level`
      ].slice(0, 3)
    : [];

  const verdictLine = latestResolvedProduct
    ? latestResolvedProduct.grade === "A+" || latestResolvedProduct.grade === "A"
      ? "A clean choice for quick family decisions."
      : latestResolvedProduct.grade === "B"
        ? "A solid option with a few watchouts."
        : "Best treated as an occasional pick."
    : "";

  const handleManualRecovery = () => {
    const manualFallback = document.getElementById("manual-fallback") as HTMLDetailsElement | null;
    if (manualFallback) manualFallback.open = true;
    manualSearchRef.current?.focus();
    manualFallback?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRetry = () => {
    clearPendingReveal();
    setConfirmCandidates([]);
    setStatusMessage("Ready to scan");
    setConfidenceLabel("High confidence");
  };

  const openResolvedProduct = () => {
    if (!revealState || !latestResolvedProduct) return;
    if (latestAttemptIdRef.current) {
      hasNavigatedForAttemptRef.current = latestAttemptIdRef.current;
    }
    router.push(buildResultHref(revealState));
  };

  return (
    <main className="shell section-gap">
      <section className="relative min-h-[74vh] overflow-hidden rounded-[34px] border border-white/75 bg-[#201710] p-4 shadow-[0_18px_50px_rgba(26,15,9,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,243,224,0.24),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,10,6,0.66),rgba(14,10,6,0.5))]" />

        <div className="relative flex min-h-[67vh] flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="pill-accent border-white/15 bg-white/10 text-white/85">{confidenceLabel}</p>
          </div>

          <div className="mx-auto w-full max-w-[18.75rem] rounded-[36px] border border-white/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <div className="rounded-[30px] border border-dashed border-white/70 p-2">
              <div className="aspect-[3/4] rounded-[24px] border border-white/30 bg-white/5" />
            </div>
          </div>

          <button className="btn-primary w-full text-base" onClick={() => runScan({ photoHint: "little orchard cocoa cookie" })} type="button">
            Scan package now
          </button>
        </div>

        {revealState && latestResolvedProduct ? (
          <div className="absolute inset-x-4 bottom-4 rounded-[26px] border border-white/80 bg-[#fffaf3] p-4 text-ink shadow-[0_18px_48px_rgba(26,15,9,0.24)]">
            <div className="flex items-start gap-3">
              <img alt={latestResolvedProduct.name} className="h-14 w-14 rounded-2xl border border-ink/10 bg-white/70 object-cover" src={latestResolvedProduct.image} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{latestResolvedProduct.name}</p>
                <p className="text-xs text-ink/65">{latestResolvedProduct.grade} · {Math.round(latestResolvedProduct.numericScore)}</p>
                <p className="mt-1 text-xs text-ink/75">{verdictLine}</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-ink/70">
              {successHighlights.map((highlight) => (
                <li key={highlight}>• {highlight}</li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="btn-primary text-sm" onClick={openResolvedProduct} type="button">View full result</button>
              <button className="btn-secondary text-sm" onClick={handleRetry} type="button">Scan again</button>
            </div>
          </div>
        ) : null}

        {showFailureRecovery ? (
          <div className="absolute inset-x-4 bottom-4 rounded-[26px] border border-accent/25 bg-[#fff9f6] p-4 text-sm text-ink shadow-[0_16px_42px_rgba(26,15,9,0.2)]">
            <p className="font-medium">We couldn&apos;t confidently identify that package yet.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="btn-primary text-sm" onClick={handleManualRecovery} type="button">Search by name</button>
              <button className="btn-secondary text-sm" onClick={handleRetry} type="button">Try again</button>
            </div>
          </div>
        ) : null}

        {confirmCandidates.length ? (
          <div className="absolute inset-x-4 bottom-4 rounded-[24px] border border-white/75 bg-[#fffaf3] p-3 shadow-[0_16px_42px_rgba(26,15,9,0.2)]">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink/50">Confirm likely match</p>
            <div className="mt-2 space-y-2">
              {confirmCandidates.slice(0, 3).map((candidate) => (
                <button
                  className="w-full rounded-2xl border border-ink/10 bg-white px-3 py-2 text-left"
                  key={candidate.slug}
                  onClick={() => confirmCandidate(candidate)}
                  type="button"
                >
                  <p className="truncate text-sm font-medium text-ink">{candidate.name}</p>
                  <p className="text-xs text-ink/65">{Math.round(candidate.confidence * 100)}% match</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {!cameraAvailable || isDesktopLike ? (
        <section className="card-state text-sm text-ink/75">
          <p className="font-medium text-ink">Camera unavailable on this device</p>
          <p className="mt-1">Use the secondary manual path below to keep scanning.</p>
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

      <details className="rounded-3xl border border-white/70 bg-[#f5efe5] p-4" id="manual-fallback">
        <summary className="cursor-pointer text-sm font-medium text-ink/75">Enter barcode or name instead</summary>
        <div className="mt-3 space-y-2">
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
      </details>

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
