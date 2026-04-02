# AGENTS.md

## Project
Heirloom Scanner is a mobile-first web app for parents and caregivers to scan kids snacks, identify the product quickly, and receive a premium in-app result.

The result should:
- identify the product from a barcode or package photo
- show a clean product image
- assign a health grade and numeric score
- explain the score in calm, parent-friendly language
- flag ingredients, additives, and allergens
- suggest healthier alternatives in the same product family
- show where to buy the scanned product and the suggested alternatives

## Visual direction
This app should feel like a premium editorial consumer product, not a dashboard.

Use this design language:
- warm ivory backgrounds
- soft stone / cream cards
- refined red-orange accent
- subtle sage secondary accent
- serif display headings
- clean modern sans-serif body type
- large editorial product imagery
- generous whitespace
- rounded cards and pills
- quiet shadows
- calm, sparse, luxurious mobile layouts

The tone should feel heritage, nursery, heirloom, refined, calm, and modern.
Do not make it cartoonish, loud, clinical, or generic SaaS.

## Product positioning
- Built for adults shopping for children
- Not a kids app
- Calm, intelligent, supportive
- The app should feel curated and trustworthy

## Tech stack
- Next.js with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui only where useful
- Mobile-first responsive design
- Mock data first, then clear service adapters for real APIs

## Pages to prioritize
1. Landing page
2. Scan page
3. Product result page
4. Favorites / Pantry page
5. Guardian Preferences page
6. Compare page
7. Full Ingredient Report page

## Functional priorities
1. Search and scan flows
2. Product result UI
3. Deterministic health scoring
4. Health grade and explanation
5. Smart swaps in the same product family
6. Retailer availability section
7. Local favorites and scan history

## Data and service architecture
Keep a clean separation between UI and data services.
Create clear service modules or API routes for:
- product identification
- product metadata lookup
- score calculation
- alternative recommendations
- retailer availability
- image enrichment

Use mock data first, but architect the app so real services can be added later without major refactoring.

## Scoring rules
Implement a deterministic scoring engine backed by numeric logic.
Start from 100 and adjust for:
- added sugar
- fiber
- protein
- sodium
- ingredient quality
- artificial dyes
- processing level
- whole grain signals
- real-fruit or simple-food signals
- guardian preference boosts / penalties

Map score to elegant grades such as:
- A+ exceptionally clean
- A excellent
- B good
- C average
- D poor

Also generate:
- one-line explanation
- top reasons
- ingredient flags
- allergen flags
- standards / purity badges

## UX rules
- Design for quick grocery-store use on a phone
- The grade should be understandable in under 3 seconds
- Favor beauty and clarity over density
- Use strong hierarchy and whitespace
- Keep the result screen premium and editorial
- Avoid overloading the user with raw data

## Build rules
- Do not overengineer
- Prefer readable, modular code
- Keep components reusable
- Use TypeScript types throughout
- Avoid unnecessary dependencies
- Ship a polished MVP rather than a broad platform

## Before finishing a task
- Run build and lint checks if configured
- Fix obvious errors
- Keep the UI visually coherent across routes
- Summarize what is real vs mocked
