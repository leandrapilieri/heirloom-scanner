# Codex Next Steps

## Prompt 2: Real data architecture and service layer

Use this after the first polished MVP scaffold exists.

```text
Now build the real data architecture for Heirloom Scanner without breaking the existing UI.

Keep the current visual design and routes.
Do not redesign the app.
Do not rebuild from scratch.
Preserve the premium heirloom/editorial mobile-first look.

Goal:
Add a clean service layer and API structure for product identification, image enrichment, healthier alternatives, and retailer availability.

Implement this in a production-minded but still MVP-friendly way.
Use mock or fallback data where needed, but structure everything so real integrations can be swapped in later.

Build these layers:

1. Product identification pipeline
Create a scan resolution flow that can support:
- barcode scan
- package photo scan
- manual search fallback

For now, if true barcode or OCR is not fully implemented, create a realistic mocked resolver plus a clear interface for real providers later.

Create these route handlers and service modules:
- app/api/scan/route.ts
- app/api/product/[slug]/route.ts
- lib/services/scan-resolver.ts
- lib/services/product-catalog.ts
- lib/services/image-enrichment.ts
- lib/services/alternative-engine.ts
- lib/services/retailer-engine.ts

2. Product catalog layer
Create a normalized product data model and central product catalog helper.
Support fields like:
- id
- slug
- name
- brand
- category
- subcategory
- barcode
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

Refactor existing mock data into this structure.

3. Image enrichment layer
Create a dedicated image enrichment service.
Its job is:
- prefer a clean catalog image over a messy user scan
- support future external image providers
- gracefully fall back to local placeholder images if no clean image is found

Create a clean interface for this.

4. Alternative recommendation engine
Create a same-category healthier substitute engine.
This is important.
Suggestions must feel realistic.

Rules:
- alternatives must stay within the same product family
- preserve the same use case or craving profile
- prefer lower sugar, better fiber, cleaner ingredient list, fewer dyes/additives
- avoid random unrelated healthy foods

Example:
- Oreos should map to healthier sandwich cookie style products, not granola bars or fruit pouches

Build this as a reusable engine, not hardcoded page logic.

5. Retailer availability layer
Create retailer availability structures and service logic.
For MVP, mocked data is fine.
But architect this so real retailer/product lookup can be connected later.

Retailers to support in mock data:
- Whole Foods
- Target
- Walmart
- Amazon
- Thrive Market
- Sprouts

Display availability in elegant retailer pills/cards in the UI.

6. Score engine refactor
Move health scoring into a dedicated reusable scoring layer.
If not already done, create:
- lib/scoring.ts
- lib/grade.ts
- lib/flags.ts

The scoring engine must output:
- numeric score
- grade
- short explanation
- top reasons
- standards badges
- ingredient flags
- allergen flags

7. Guardian preferences integration
Connect guardian preferences to scoring and recommendation behavior.
Examples:
- nut-free households should flag or penalize products with nuts
- dye-free should penalize artificial colors
- low sugar focus should tighten score logic
- organic only should influence recommendation priority

8. Error states and confidence handling
Add graceful low-confidence states.
If scan confidence is weak, show a beautiful confirmation state asking the user to confirm the matched product.
Do not make the system feel brittle.

9. Developer documentation
Add or update README with:
- architecture overview
- how scan resolution works
- what is mocked
- where to plug in real providers later

Important rules:
- keep code modular and typed
- do not damage the existing UI polish
- preserve current routes and styling
- do not overengineer
- build for extension later

Before finishing:
- run build/lint checks if configured
- fix obvious issues
- summarize exactly what was implemented
- list what is still mocked
```

## Prompt 3: Scan realism, product intelligence, and richer result flow

Use this after Prompt 2 is complete.

```text
Now improve the product intelligence flow and make the scan/result experience feel more realistic and premium.

Keep the existing UI and architecture.
Do not redesign from scratch.

Goals:
- make scan resolution feel faster and more believable
- improve result quality
- improve healthier swap logic
- improve retailer experience
- add richer state transitions

Implement the following:

1. Better scan UX
- add a premium analyzing state
- add intermediate states like identifying product, finding best image, scoring ingredients, suggesting swaps
- keep these subtle and elegant
- make the user feel the app is doing real work within a few seconds

2. Product confirmation flow
If product match confidence is below threshold, show a premium confirmation UI with 2 to 4 likely matches.

3. Richer result narrative
On the product result page, add a more refined explanation block that feels like a premium guardian note.
This should explain:
- overall product quality
- main concerns or strengths
- why the alternatives are better aligned

4. Better alternative matching
Improve the alternative engine so results are more nuanced by:
- flavor family
- texture/use case
- lunchbox suitability
- toddler suitability
- household preferences

5. Better retailer presentation
Upgrade retailer availability UI so original and suggested products both show clear store availability.
Use calm premium retailer cards or pills.

6. Compare flow polish
Improve the compare page so it feels more useful and editorial.
Highlight:
- grade difference
- added sugar difference
- ingredient cleanliness
- additive flags
- allergen differences
- store availability

7. Recent scans and saved flows
Make recent scans, favorites, and pantry feel more coherent and premium.

8. Empty, loading, and low-confidence states
Polish all system states so they feel intentional and beautiful.

Before finishing:
- run checks
- fix obvious issues
- summarize what changed
```

## Questions to ask Codex before each next step

Use these questions after each major round so you can check direction before moving on.

### After initial scaffold
1. Can you summarize the current architecture, routes, and component structure in plain English?
2. Which parts are real and which parts are mocked right now?
3. Does the current UI match the intended heirloom/editorial aesthetic, and where is it still too generic?
4. Which page is currently the weakest visually?
5. What should be refined first to make the app feel more premium on mobile?

### Before moving into real data architecture
1. Where is product data currently stored and how easy will it be to swap in real providers later?
2. Is the score logic centralized and reusable yet?
3. Are alternatives generated in a reusable engine or are they still hardcoded in UI components?
4. Is retailer availability structured as data or just presentation?
5. What refactor would reduce future mess the most before we add more functionality?

### After Prompt 2
1. Show me the current service architecture and explain each module briefly.
2. If I later plug in barcode, OCR, product image, and retailer APIs, where exactly will each integration go?
3. Is the scan flow resilient to low-confidence matches yet?
4. Are healthier alternatives truly based on same product family logic now?
5. What part of the data architecture still feels too mocked or fragile?

### Before Prompt 3
1. Which user flow currently feels least believable as a real product?
2. Where does the app still feel static instead of intelligent?
3. Are the result pages emotionally premium enough, or do they still read like a nutrition database?
4. What would most improve trust in the scan results?
5. What would most improve the perceived intelligence of the alternatives?

### After Prompt 3
1. Walk me through the end-to-end scan experience now from first tap to saved result.
2. What are the current confidence states and fallback states?
3. How does the app decide what healthier alternatives to recommend?
4. Which 3 parts are still weakest before a user test?
5. If we had one more iteration, where would you spend it for the biggest product gain?

## Questions to force better product judgment

Ask these whenever the app starts drifting.

1. Is this feature helping the product feel premium, intelligent, and calm, or is it adding noise?
2. Is this screen solving a real parent decision fast enough for grocery-store use?
3. Does this result feel like a curated recommendation or a generic nutrition lookup?
4. Are the alternatives actually believable replacements for the original product?
5. Does this UI look like a refined consumer app or like a dashboard in disguise?
6. What would make this feel more emotionally trustworthy?
7. What would make this result more useful in under 3 seconds?
8. What should be removed because it adds clutter without increasing trust?

## Short checkpoint prompt

Use this when you want Codex to audit itself before continuing.

```text
Before taking the next step, audit the current app honestly.
Tell me:
1. what is strongest right now,
2. what is weakest right now,
3. what still feels too generic,
4. what still feels too mocked,
5. what exact next step would create the biggest product improvement without overcomplicating the app.
Be specific and critical.
```
