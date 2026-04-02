export type Grade = "A+" | "A" | "B" | "C" | "D";

export interface RetailerOffer {
  retailer: string;
  price: string;
  inStock: boolean;
  link: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  barcode?: string;
  image: string;
  calories: number;
  addedSugarG: number;
  totalSugarG: number;
  fiberG: number;
  proteinG: number;
  sodiumMg: number;
  ingredients: string[];
  allergens: string[];
  additives: string[];
  retailerAvailability: RetailerOffer[];
  shortSummary: string;
  alternativeIds: string[];
  sourceConfidence: number;
  numericScore?: number;
  grade?: Grade;
  processingLevel: "minimal" | "moderate" | "high";
}

export interface GuardianPreferences {
  nutFree: boolean;
  dairyFree: boolean;
  lowSugar: boolean;
  organicOnly: boolean;
  glutenAware: boolean;
  dyeFree: boolean;
  seedOilAware: boolean;
  toddlerFriendly: boolean;
  proteinFocused: boolean;
  noArtificialSweeteners: boolean;
}

export interface ScoreResult {
  numericScore: number;
  grade: Grade;
  explanation: string;
  topReasons: string[];
  standardsBadges: string[];
  ingredientFlags: string[];
  allergenFlags: string[];
}
