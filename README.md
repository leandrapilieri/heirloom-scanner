# Heirloom Scanner MVP

Premium, mobile-first Next.js MVP for scanning kids snacks and surfacing healthier swaps.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Local-first state persistence (no auth, no DB)
- Mock service adapters with production-oriented boundaries

## Routes
- `/` landing + first-run onboarding
- `/scan`
- `/product/[slug]`
- `/favorites`
- `/preferences`
- `/compare`
- `/report/[slug]`
- `/premium`

## Local-first storage architecture
This app intentionally runs without accounts or a backend database in v1.
State is persisted in `localStorage` via:
- `lib/storage.ts`
- `lib/state/use-local-state.ts`
- `lib/state/app-state.tsx`

Persisted user data:
- guardian preferences
- favorites
- recent scans
- shopping list
- compare selections
- scan outcomes (confidence tier, status, candidates, confirmed selection)
- onboarding completion/profile state

## Onboarding and first-run logic
First-run onboarding appears on `/` only when `onboardingCompleted` is false.
Flow:
1. Welcome
2. Parent friction focus
3. Household standards
4. Top priorities
5. Result education preview
6. Ready to scan (or view sample result)

Local onboarding state includes:
- `onboardingCompleted`
- `completedAt`
- `onboardingVersion`
- `onboardingPrimaryConcern`
- `priorityTags`
- `resultEducationSeen`

Users can reset and rerun onboarding from `/preferences`.


## First-session success flow
After onboarding completion, first session is guided with local state:
- setup summary banner appears on `/scan` until dismissed
- first successful real scan triggers a brief premium reveal (about 900ms), then transitions directly to `/product/[slug]`
- resolved and confirm-needed + candidate-confirmed scans use the same reveal-to-result payoff handoff
- sample result path (`/product/[slug]?sample=1`) is treated as intentional preview
- first meaningful interaction is tracked locally when user completes:
  - first save, or
  - first compare, or
  - second scan from a result context

Persisted first-session flags are part of onboarding state and include:
- `setupSummarySeen`
- `sampleResultViewed`
- `firstScanCompleted`
- `firstMeaningfulInteractionCompleted`
- `firstMeaningfulInteractionType`
- `resultContextScanSeen`

Real scan result context is passed as lightweight query params (`source=scan`, `scan=1`, `tier`, `matchedBy`, optional `firstScan=1`) so `/product/[slug]` can render a concise recap:
- why this matched
- why this matters in-aisle
- how active preferences influenced the result

Sample mode remains useful (`?sample=1`) but is positioned as a secondary preview path.

## Soft premium-access experiment (local-first)
This build includes a calm premium-access UX experiment with no auth and no billing backend.

Trigger logic (named constants + local state):
- premium prompt can trigger only after `firstMeaningfulInteractionCompleted === true`
- premium prompt can trigger only on deeper surfaces:
  - `/report/[slug]`
  - advanced compare insights area on `/compare`
- prompt is suppressed during cooldown after dismissal (`PREMIUM_PROMPT_COOLDOWN_DAYS` in `lib/premium-access.ts`)
- prompt copy is context-specific by trigger source (`report`, `compare_insights`, `extended_swaps`, `retailer_intel`)

Free surfaces remain fully valuable:
- onboarding, scan flows, first-session payoff, product result basics, core swaps, basic retailer list, favorites, and basic compare

Premium-preview/gated surfaces:
- advanced ingredient intelligence in report
- extended swap intelligence beyond core swaps
- advanced compare insights section (compare page itself stays free)
- enhanced retailer intelligence module
- product page teaser pressure is intentionally reduced to a single compact premium-enhancements module (not multiple stacked teaser cards)

Persisted premium state:
- `premiumPromptSeen`
- `premiumPromptDismissedAt`
- `premiumPromptCooldownUntil`
- `premiumTriggerSource`
- `premiumPreviewMode`

Billing remains mocked; `/premium` is a styling + trigger experiment only.

## Service layer (mocked, integration-ready)
Service modules under `lib/services` keep UI and data concerns separate:
- `scan-resolver.ts` feature-scored scan pipeline
- `product-catalog.ts` normalized product catalog + lookup/search
- `image-enrichment.ts` image enrichment adapter
- `alternative-engine.ts` same-family recommendation ranking
- `retailer-engine.ts` retailer availability normalization

## API routes (service-backed)
- `POST /api/scan`
- `GET /api/product/[slug]`
- `GET /api/alternatives/[slug]`
- `GET /api/retailers/[slug]`

All routes call the service layer and return mocked but structured payloads.

## Scan resolution flow (current)
`input -> identify package -> check packaging signals -> rank likely matches -> confirm if needed -> score -> alternatives -> retailers`

Input modes currently supported:
- barcode input
- package photo hint input
- manual search input

## Confidence model overview
Implemented in `lib/services/scan-resolver.ts` with named tunable constants:
- high confidence: `>= 0.82`
- medium confidence: `>= 0.58 and < 0.82`
- low confidence: `< 0.58`

Ambiguity gap rule:
- if top-two candidate confidence gap `< 0.12`, resolver triggers confirmation flow.

`confirm_needed` is triggered when:
- top candidate is not high confidence, or
- ambiguity gap is too small, or
- conflicting strong features are present (e.g., strong brand match + weak product tokens, or strong product tokens + category mismatch).

## What is mocked today
- barcode recognition provider (still local catalog lookup)
- OCR/package visual intelligence provider (photo hints are local token signals)
- image enrichment provider
- alternatives ranking inputs (catalog-driven heuristics)
- retailer inventory/pricing lookups

## Future provider plug-in points
- Barcode/OCR/CV resolver provider: `lib/services/scan-resolver.ts`
- Image enrichment provider: `lib/services/image-enrichment.ts`
- Retailer APIs: `lib/services/retailer-engine.ts`
- Catalog provider swap: `lib/services/product-catalog.ts`

## Local development
```bash
npm install
npm run dev
```

## Notes
- No sign-up required
- No backend DB required for v1 MVP
- Preferences and saved actions visibly influence scoring and recommendation behavior
