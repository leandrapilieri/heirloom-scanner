# Codex Task Brief

Build a polished, mobile-first MVP for **Heirloom Scanner**, a premium AI-powered kids snack scanner and healthier-swap recommendation app for parents and caregivers.

## Core concept
A user scans a snack package or barcode. Within a few seconds, the app identifies the product, enriches it with a clean product image, and displays a premium result inside the app's own UI.

The result should show:
- product name and brand
- category / subcategory
- numeric score and elegant health grade
- short explanation in plain language
- ingredient and allergen flags
- standards / purity badges
- healthier alternatives in the same product family
- retailer availability for the original product and suggested alternatives

### Example
If a user scans Oreos, the app should identify Oreos, show a clean product image, explain why the score is weaker, and suggest healthier sandwich cookie alternatives that satisfy the same craving or use case.

## Stack
- Next.js latest with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui where helpful
- Mobile-first responsive design
- Local mock data for MVP
- Clear service layer for future integrations

## Visual direction
Build the app with a luxury editorial consumer aesthetic.

Use this design language:
- warm ivory background
- soft cream / stone surfaces
- refined red-orange accent
- subtle sage green secondary accent
- serif display headings
- clean sans-serif body text
- rounded cards and pill controls
- premium product imagery
- calm minimal layouts
- generous whitespace
- quiet shadows

The tone should feel:
- heirloom
- refined
- modern
- calm
- trustworthy
- curated

Avoid:
- generic SaaS dashboard styling
- bright playful kids branding
- clinical nutrition app styling
- crowded layouts

## Product routes to build
1. `/` landing page
2. `/scan` scan experience
3. `/product/[slug]` product result page
4. `/favorites` pantry / favorites page
5. `/preferences` guardian preferences page
6. `/compare` compare products page
7. `/report/[slug]` full ingredient report page

## MVP features
### 1. Landing page
- elegant hero
- short positioning copy
- CTA to search or scan
- example product cards
- explanation of how the app works

### 2. Scan page
- premium scan frame
- analyzing / focusing status chip or toast
- recent scans strip
- barcode / photo / manual-search entry points
- if real scanning is not wired yet, build a polished mocked flow that resolves into sample products

### 3. Product result page
Include:
- large hero product image
- title and brand
- grade card (A+, A, B, C, D)
- one-line explanation
- standards / purity badges
- nutrition snapshot
- ingredient flags
- allergen flags
- smart swaps section
- retailer availability section
- link to full ingredient report
- save / favorite action
- add to shopping list action

### 4. Favorites / Pantry page
- saved product cards
- filter pills like Grade A, low sugar, nut-free
- progress / pantry insight card
- recent scans

### 5. Guardian Preferences page
Let the user manage household settings:
- nut-free
- dairy-free
- low sugar
- organic only
- gluten-aware
- dye-free
- seed-oil aware
- toddler-friendly
- protein-focused
- no artificial sweeteners

### 6. Compare page
- compare original product vs healthier alternatives
- show grade, sugar, fiber, additives, allergens, and retailer availability

### 7. Full Ingredient Report page
- full ingredient list
- additive / dye / sweetener flags
- allergen markers
- concise AI-style explanation
- why the product received its grade

## Data model
Create realistic mock data for at least 30 products across categories like:
- sandwich cookies
- crackers
- granola bars
- fruit snacks
- yogurt snacks
- pouches
- cereals
- toddler snacks
- protein snacks

Each product should include fields like:
- id
- slug
- name
- brand
- category
- subcategory
- image
- calories
- addedSugarG
- totalSugarG
- fiberG
- proteinG
- sodiumMg
- ingredients
- allergens
- additives
- retailerAvailability
- shortSummary
- grade
- numericScore
- alternativeIds
- sourceConfidence

## Service architecture
Structure the code so the following can later be real integrations:
- product identification
- product metadata lookup
- image enrichment
- score engine
- alternative recommendation engine
- retailer availability lookup

Suggested service modules or route handlers:
- `lib/scoring.ts`
- `lib/products.ts`
- `lib/alternatives.ts`
- `lib/retailers.ts`
- `app/api/scan/route.ts`
- `app/api/product/[id]/route.ts`
- `app/api/alternatives/[id]/route.ts`
- `app/api/retailers/[id]/route.ts`

## Scoring logic
Implement deterministic scoring.
Start from 100 and adjust score based on:
- added sugar: negative
- fiber: positive
- protein: slight positive
- sodium: negative
- artificial dyes: negative
- highly processed signals: negative
- simple ingredient list: positive
- whole grain signals: positive
- real-fruit or simple-food signals: positive
- preference-based penalties or boosts from guardian settings

Map score bands to:
- A+ exceptionally clean
- A excellent
- B good
- C average
- D poor

Also create helpers that generate:
- short explanation sentence
- top reasons list
- standards badges
- ingredient flags
- allergen flags

## Engineering rules
- Keep the app mobile-first
- Use reusable components
- Use strict TypeScript types
- Keep architecture clean and easy to extend
- Prefer a polished narrow MVP over broad complexity
- Use tasteful motion only where it improves the feel
- Add loading, empty, and error states

## Deliverables
- full app scaffold
- reusable design system components
- mock dataset
- scoring engine
- working routes
- polished UI across all pages
- README updates as needed

## Final check
Before finishing:
- run build and lint if configured
- fix obvious issues
- make sure routes work
- keep visual style coherent
- summarize what is mocked vs production-ready
