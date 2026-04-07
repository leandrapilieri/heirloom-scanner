import { getAlternativeProducts } from "@/lib/services/alternative-engine";
import { enrichProductImage } from "@/lib/services/image-enrichment";
import { CatalogProduct, getProductByBarcode, listProducts } from "@/lib/services/product-catalog";
import { getRetailerAvailability } from "@/lib/services/retailer-engine";
import { scoreProduct } from "@/lib/scoring";

export const CONFIDENCE_THRESHOLDS = {
  high: 0.82,
  medium: 0.58,
  low: 0
} as const;

export const AMBIGUITY_GAP_THRESHOLD = 0.12;

const WEIGHTS = {
  barcodeExact: 0.95,
  brandExact: 0.24,
  brandPartial: 0.14,
  productTokenStrong: 0.34,
  productTokenPartial: 0.18,
  exactPhrase: 0.16,
  categoryMatch: 0.12,
  subcategoryMatch: 0.09,
  categoryMismatchPenalty: -0.13,
  weakTokenPenalty: -0.08,
  strongConflictPenalty: -0.16
} as const;

const knownCategoryHints: Record<string, string[]> = {
  "sandwich cookies": ["cookie", "creme", "sandwich"],
  crackers: ["cracker", "crisps", "cheddar"],
  "granola bars": ["bar", "granola", "oat"],
  "fruit snacks": ["fruit", "berry", "bites"],
  "yogurt snacks": ["yogurt", "buttons", "drops"],
  "fruit & veggie pouches": ["pouch", "puree"],
  cereals: ["cereal", "oats", "morning"],
  "toddler snacks": ["toddler", "puffs"],
  "protein snacks": ["protein", "crisps"]
};

const knownBrands = [...new Set(listProducts().map((product) => product.brand.toLowerCase()))];

export type ConfidenceTier = "high" | "medium" | "low";

interface ScanInput {
  barcode?: string;
  photoHint?: string;
  query?: string;
  categoryHint?: string;
}

function dedupeCandidates(candidates: ScanCandidate[]) {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    if (seen.has(candidate.slug)) return false;
    seen.add(candidate.slug);
    return true;
  });
}

interface MatchFeatureSet {
  brandOverlap: number;
  productTokenOverlap: number;
  exactPhraseMatch: boolean;
  categoryMatched: boolean;
  subcategoryMatched: boolean;
  categoryMismatch: boolean;
  strongConflicts: string[];
  matchedBrandTokens: string[];
  matchedProductTokens: string[];
  matchedCategoryTokens: string[];
}

export interface ScanCandidate {
  slug: string;
  name: string;
  brand: string;
  image: string;
  confidence: number;
  confidenceTier: ConfidenceTier;
  reason: string;
  featureSummary: MatchFeatureSet;
}

export interface ScanResolution {
  status: "resolved" | "confirm_needed" | "not_found";
  confidence: number;
  confidenceTier: ConfidenceTier;
  method: "barcode" | "photo" | "manual";
  candidateSlug?: string;
  message: string;
  candidates: ScanCandidate[];
  debug: {
    ambiguityGap: number;
    conflictFlags: string[];
    reasons: string[];
  };
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function overlapRatio(source: string[], target: string[]) {
  if (!source.length || !target.length) return 0;
  const sourceSet = new Set(source);
  const hits = target.filter((token) => sourceSet.has(token)).length;
  return hits / Math.max(target.length, source.length, 1);
}

function getConfidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= CONFIDENCE_THRESHOLDS.high) return "high";
  if (confidence >= CONFIDENCE_THRESHOLDS.medium) return "medium";
  return "low";
}

function clamp(value: number) {
  return Math.max(0, Math.min(0.99, value));
}

function buildInputContext(input: ScanInput) {
  const text = `${input.query ?? ""} ${input.photoHint ?? ""}`.trim().toLowerCase();
  const inputTokens = tokenize(text);
  const hintedBrand = knownBrands.find((brand) => text.includes(brand));

  const categoryTokens = Object.entries(knownCategoryHints)
    .filter(([, hints]) => hints.some((hint) => text.includes(hint)))
    .map(([category]) => category);

  return { text, inputTokens, hintedBrand, categoryTokens };
}

function evaluateCandidate(product: CatalogProduct, input: ScanInput, method: ScanResolution["method"]) {
  const context = buildInputContext(input);
  const productNameTokens = tokenize(product.name);
  const brandTokens = tokenize(product.brand);

  const brandOverlap = overlapRatio(brandTokens, context.inputTokens);
  const productTokenOverlap = overlapRatio(productNameTokens, context.inputTokens);
  const exactPhraseMatch = context.text.length > 0 && product.name.toLowerCase().includes(context.text);

  const matchedCategoryTokens = context.categoryTokens.filter((token) => product.category.toLowerCase() === token);
  const categoryMatched = matchedCategoryTokens.length > 0 || (input.categoryHint ? product.category.toLowerCase() === input.categoryHint.toLowerCase() : false);
  const subcategoryMatched = context.inputTokens.includes(product.subcategory.toLowerCase()) || (input.categoryHint ? product.subcategory.toLowerCase() === input.categoryHint.toLowerCase() : false);
  const categoryMismatch = context.categoryTokens.length > 0 && !categoryMatched;

  const strongConflicts: string[] = [];
  if (brandOverlap >= 0.5 && productTokenOverlap < 0.2) {
    strongConflicts.push("Brand token matched strongly but product keyword match is weak");
  }
  if (productTokenOverlap >= 0.5 && categoryMismatch) {
    strongConflicts.push("Product keywords matched but category hint points elsewhere");
  }

  let confidence = 0.08;
  const reasons: string[] = [];

  if (brandOverlap >= 0.65) {
    confidence += WEIGHTS.brandExact;
    reasons.push("strong brand token match");
  } else if (brandOverlap >= 0.35) {
    confidence += WEIGHTS.brandPartial;
    reasons.push("partial brand token match");
  }

  if (productTokenOverlap >= 0.6) {
    confidence += WEIGHTS.productTokenStrong;
    reasons.push("strong product keyword match");
  } else if (productTokenOverlap >= 0.3) {
    confidence += WEIGHTS.productTokenPartial;
    reasons.push("partial product keyword match");
  } else if (context.inputTokens.length > 0) {
    confidence += WEIGHTS.weakTokenPenalty;
  }

  if (exactPhraseMatch) {
    confidence += WEIGHTS.exactPhrase;
    reasons.push("exact phrase appears in product name");
  }

  if (categoryMatched) {
    confidence += WEIGHTS.categoryMatch;
    reasons.push("category hint alignment");
  }

  if (subcategoryMatched) {
    confidence += WEIGHTS.subcategoryMatch;
    reasons.push("subcategory hint alignment");
  }

  if (categoryMismatch) {
    confidence += WEIGHTS.categoryMismatchPenalty;
    reasons.push("category hint conflict");
  }

  if (strongConflicts.length) {
    confidence += WEIGHTS.strongConflictPenalty;
  }

  if (method === "photo") confidence = confidence * 0.96;
  if (method === "manual") confidence = confidence * 0.98;

  confidence = clamp(confidence);
  const tier = getConfidenceTier(confidence);

  const featureSummary: MatchFeatureSet = {
    brandOverlap,
    productTokenOverlap,
    exactPhraseMatch,
    categoryMatched,
    subcategoryMatched,
    categoryMismatch,
    strongConflicts,
    matchedBrandTokens: tokenize(product.brand).filter((token) => context.inputTokens.includes(token)),
    matchedProductTokens: productNameTokens.filter((token) => context.inputTokens.includes(token)),
    matchedCategoryTokens
  };

  const reason = reasons[0] ?? "Limited signal alignment";

  return {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    image: product.image,
    confidence,
    confidenceTier: tier,
    reason,
    featureSummary
  } satisfies ScanCandidate;
}

export function resolveScan(input: ScanInput): ScanResolution {
  const method: ScanResolution["method"] = input.barcode ? "barcode" : input.photoHint ? "photo" : "manual";
  const conflictFlags: string[] = [];

  if (input.barcode) {
    const barcodeMatch = getProductByBarcode(input.barcode);
    if (barcodeMatch) {
      const context = buildInputContext(input);
      const conflictingBrand = context.hintedBrand && context.hintedBrand !== barcodeMatch.brand.toLowerCase();
      if (conflictingBrand) {
        conflictFlags.push("Barcode match conflicts with hinted brand token");
      }

      const barcodeCandidate: ScanCandidate = {
        slug: barcodeMatch.slug,
        name: barcodeMatch.name,
        brand: barcodeMatch.brand,
        image: barcodeMatch.image,
        confidence: conflictingBrand ? 0.79 : 0.98,
        confidenceTier: conflictingBrand ? "medium" : "high",
        reason: conflictingBrand ? "Barcode matched but text hint conflicts" : "Exact barcode match",
        featureSummary: {
          brandOverlap: conflictingBrand ? 0 : 1,
          productTokenOverlap: 1,
          exactPhraseMatch: true,
          categoryMatched: true,
          subcategoryMatched: true,
          categoryMismatch: false,
          strongConflicts: conflictingBrand ? ["Barcode hit with conflicting brand hint"] : [],
          matchedBrandTokens: conflictingBrand ? [] : tokenize(barcodeMatch.brand),
          matchedProductTokens: tokenize(barcodeMatch.name),
          matchedCategoryTokens: [barcodeMatch.category.toLowerCase()]
        }
      };

      if (!conflictingBrand) {
        return {
          status: "resolved",
          confidence: barcodeCandidate.confidence,
          confidenceTier: "high",
          method,
          candidateSlug: barcodeCandidate.slug,
          message: "High confidence match",
          candidates: [barcodeCandidate],
          debug: {
            ambiguityGap: 1,
            conflictFlags,
            reasons: ["Exact unique barcode match"]
          }
        };
      }

      return {
        status: "confirm_needed",
        confidence: barcodeCandidate.confidence,
        confidenceTier: barcodeCandidate.confidenceTier,
        method,
        candidateSlug: barcodeCandidate.slug,
        message: "Barcode matched but we detected a conflicting text hint",
        candidates: [barcodeCandidate],
        debug: {
          ambiguityGap: 1,
          conflictFlags,
          reasons: ["Exact barcode matched, but text hint pointed to a different brand"]
        }
      };
    }
  }

  const textExists = Boolean((input.photoHint ?? "").trim() || (input.query ?? "").trim());
  if (!textExists && !input.barcode) {
    return {
      status: "not_found",
      confidence: 0,
      confidenceTier: "low",
      method,
      message: "No scan signal detected",
      candidates: [],
      debug: { ambiguityGap: 0, conflictFlags: ["No barcode or text hint provided"], reasons: [] }
    };
  }

  const ranked = dedupeCandidates(
    listProducts()
      .map((product) => evaluateCandidate(product, input, method))
      .sort((a, b) => b.confidence - a.confidence)
  );
  const top = ranked[0];
  const second = ranked[1];

  if (!top || top.confidence < CONFIDENCE_THRESHOLDS.low + 0.12) {
    return {
      status: "not_found",
      confidence: 0,
      confidenceTier: "low",
      method,
      message: "We could not confidently identify this product",
      candidates: ranked.slice(0, 3),
      debug: { ambiguityGap: 0, conflictFlags, reasons: ["Insufficient matching signals"] }
    };
  }

  const ambiguityGap = second ? top.confidence - second.confidence : 1;
  const hasStrongConflict = top.featureSummary.strongConflicts.length > 0;
  if (hasStrongConflict) {
    conflictFlags.push(...top.featureSummary.strongConflicts);
  }

  const shouldConfirm = top.confidence < CONFIDENCE_THRESHOLDS.high || ambiguityGap < AMBIGUITY_GAP_THRESHOLD || hasStrongConflict;

  if (shouldConfirm) {
    return {
      status: "confirm_needed",
      confidence: top.confidence,
      confidenceTier: getConfidenceTier(top.confidence),
      method,
      candidateSlug: top.slug,
      message: "We found a few likely matches",
      candidates: ranked.slice(0, 4),
      debug: {
        ambiguityGap,
        conflictFlags,
        reasons: [
          top.reason,
          ambiguityGap < AMBIGUITY_GAP_THRESHOLD ? "Top candidates are close in score" : "",
          hasStrongConflict ? "Conflicting strong features detected" : ""
        ].filter(Boolean)
      }
    };
  }

  return {
    status: "resolved",
    confidence: top.confidence,
    confidenceTier: "high",
    method,
    candidateSlug: top.slug,
    message: "High confidence match",
    candidates: ranked.slice(0, 2),
    debug: {
      ambiguityGap,
      conflictFlags,
      reasons: [top.reason]
    }
  };
}

export function buildScanPayload(slug: string) {
  const product = listProducts().find((item) => item.slug === slug);
  if (!product) return null;

  const score = scoreProduct(product);
  const alternatives = getAlternativeProducts(product);
  const retailers = getRetailerAvailability(product);
  const image = enrichProductImage(product);

  return {
    product: { ...product, image: image.image, numericScore: score.numericScore, grade: score.grade },
    score,
    alternatives,
    retailers,
    pipeline: [
      "identify product",
      "check packaging signals",
      "rank candidate matches",
      "prepare cleaner alternatives"
    ]
  };
}
