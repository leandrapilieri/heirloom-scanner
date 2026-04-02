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
