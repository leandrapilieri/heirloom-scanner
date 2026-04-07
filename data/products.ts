export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
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
  retailerAvailability: Array<{
    retailer: string;
    price: string;
    inStock: boolean;
    link: string;
  }>;
  shortSummary: string;
  alternativeIds: string[];
  sourceConfidence: number;
  processingLevel: "minimal" | "moderate" | "high";
  score?: number;
  scoreLabel?: string;
  analysis?: string;
  breakdown?: Array<{
    ingredient: string;
    status: "None" | "Low" | "Moderate" | "High";
    statusColor?: string;
  }>;
}

export const products: CatalogProduct[] = [
  {
    id: "p1",
    slug: "jacob-vanilla-chip-protein-bar",
    name: "Vanilla Chip Protein Bar",
    brand: "Jacob",
    category: "Protein Bars",
    subcategory: "bar",
    image: "https://images.unsplash.com/photo-1590080876-b9e1f0d0f0c0?auto=format&fit=crop&w=500&q=80",
    calories: 200,
    addedSugarG: 1,
    totalSugarG: 2,
    fiberG: 10,
    proteinG: 20,
    sodiumMg: 150,
    ingredients: [
      "Grass-fed Whey Protein",
      "Organic Almond Butter",
      "Organic Honey",
      "Vanilla Extract"
    ],
    allergens: ["Milk", "Almonds"],
    additives: [],
    retailerAvailability: [
      { retailer: "Target", price: "$2.49", inStock: true, link: "https://www.target.com" },
      { retailer: "Whole Foods", price: "$2.99", inStock: true, link: "https://www.wholefoodsmarket.com" },
      { retailer: "Amazon", price: "$2.29", inStock: true, link: "https://www.amazon.com" }
    ],
    shortSummary: "Clean protein bar with whole-food ingredients.",
    alternativeIds: ["p2", "p3"],
    sourceConfidence: 0.95,
    processingLevel: "minimal",
    score: 100,
    scoreLabel: "Excellent",
    analysis: "The Vanilla Chip Protein Bar stands out for its clean ingredient list. It uses whole-food sources like grass-fed protein blend, organic almond butter, and organic honey, with no seed oils or processed sugars. The minimal processing, lack of additives, and organic ingredients make this a strong choice for anyone wanting to avoid highly processed snacks.",
    breakdown: [
      { ingredient: "Seed Oils", status: "None", statusColor: "green" },
      { ingredient: "Processing Profile", status: "Low", statusColor: "green" },
      { ingredient: "Added Sugars", status: "None", statusColor: "green" }
    ]
  },
  {
    id: "p2",
    slug: "perfect-bar-peanut-butter-protein",
    name: "Peanut Butter Protein Bar",
    brand: "Perfect Bar",
    category: "Protein Bars",
    subcategory: "bar",
    image: "https://images.unsplash.com/photo-1590080876-b9e1f0d0f0c0?auto=format&fit=crop&w=500&q=80",
    calories: 210,
    addedSugarG: 2,
    totalSugarG: 3,
    fiberG: 9,
    proteinG: 18,
    sodiumMg: 160,
    ingredients: [
      "Peanut Butter",
      "Whey Protein",
      "Honey",
      "Almonds"
    ],
    allergens: ["Peanuts", "Milk"],
    additives: [],
    retailerAvailability: [
      { retailer: "Target", price: "$2.49", inStock: true, link: "https://www.target.com" },
      { retailer: "Whole Foods", price: "$2.99", inStock: true, link: "https://www.wholefoodsmarket.com" },
      { retailer: "Amazon", price: "$2.19", inStock: true, link: "https://www.amazon.com" }
    ],
    shortSummary: "Protein-rich bar with natural peanut butter.",
    alternativeIds: ["p1", "p3"],
    sourceConfidence: 0.93,
    processingLevel: "moderate",
    score: 89,
    scoreLabel: "Excellent",
    breakdown: [
      { ingredient: "Seed Oils", status: "None", statusColor: "green" },
      { ingredient: "Processing Profile", status: "Low", statusColor: "green" },
      { ingredient: "Added Sugars", status: "Low", statusColor: "green" }
    ]
  },
  {
    id: "p3",
    slug: "larabar-peanut-butter-chocolate",
    name: "Larabar Peanut Butter Chocolate",
    brand: "Larabar",
    category: "Protein Bars",
    subcategory: "bar",
    image: "https://images.unsplash.com/photo-1590080876-b9e1f0d0f0c0?auto=format&fit=crop&w=500&q=80",
    calories: 190,
    addedSugarG: 0,
    totalSugarG: 11,
    fiberG: 3,
    proteinG: 7,
    sodiumMg: 50,
    ingredients: [
      "Peanuts",
      "Dates",
      "Cocoa"
    ],
    allergens: ["Peanuts"],
    additives: [],
    retailerAvailability: [
      { retailer: "Target", price: "$1.99", inStock: true, link: "https://www.target.com" },
      { retailer: "Whole Foods", price: "$2.49", inStock: true, link: "https://www.wholefoodsmarket.com" },
      { retailer: "Amazon", price: "$1.79", inStock: true, link: "https://www.amazon.com" }
    ],
    shortSummary: "Simple, minimal ingredient protein bar.",
    alternativeIds: ["p1", "p2"],
    sourceConfidence: 0.91,
    processingLevel: "minimal",
    score: 86,
    scoreLabel: "Excellent",
    breakdown: [
      { ingredient: "Seed Oils", status: "None", statusColor: "green" },
      { ingredient: "Processing Profile", status: "Low", statusColor: "green" },
      { ingredient: "Added Sugars", status: "None", statusColor: "green" }
    ]
  },
  {
    id: "p4",
    slug: "mezcla-organic-chocolate-almond-crunch",
    name: "Organic Chocolate Almond Crunch",
    brand: "Mezcla",
    category: "Protein Bars",
    subcategory: "bar",
    image: "https://images.unsplash.com/photo-1590080876-b9e1f0d0f0c0?auto=format&fit=crop&w=500&q=80",
    calories: 200,
    addedSugarG: 0,
    totalSugarG: 10,
    fiberG: 4,
    proteinG: 8,
    sodiumMg: 40,
    ingredients: [
      "Organic Almonds",
      "Organic Cocoa",
      "Organic Honey",
      "Organic Coconut Oil"
    ],
    allergens: ["Tree nuts"],
    additives: [],
    retailerAvailability: [
      { retailer: "Target", price: "$2.99", inStock: true, link: "https://www.target.com" },
      { retailer: "Whole Foods", price: "$3.49", inStock: true, link: "https://www.wholefoodsmarket.com" },
      { retailer: "Amazon", price: "$2.79", inStock: true, link: "https://www.amazon.com" }
    ],
    shortSummary: "Organic snack bar with clean ingredients.",
    alternativeIds: ["p1", "p2"],
    sourceConfidence: 0.94,
    processingLevel: "minimal",
    score: 100,
    scoreLabel: "Excellent",
    breakdown: [
      { ingredient: "Seed Oils", status: "None", statusColor: "green" },
      { ingredient: "Processing Profile", status: "Low", statusColor: "green" },
      { ingredient: "Added Sugars", status: "None", statusColor: "green" }
    ]
  },
  {
    id: "p5",
    slug: "larabar-lemon-fruit-bar",
    name: "Larabar Lemon Fruit Bar",
    brand: "Larabar",
    category: "Fruit Bars",
    subcategory: "bar",
    image: "https://images.unsplash.com/photo-1590080876-b9e1f0d0f0c0?auto=format&fit=crop&w=500&q=80",
    calories: 180,
    addedSugarG: 0,
    totalSugarG: 12,
    fiberG: 2,
    proteinG: 4,
    sodiumMg: 10,
    ingredients: [
      "Dates",
      "Almonds",
      "Lemon Juice"
    ],
    allergens: ["Tree nuts"],
    additives: [],
    retailerAvailability: [
      { retailer: "Target", price: "$1.99", inStock: true, link: "https://www.target.com" },
      { retailer: "Whole Foods", price: "$2.49", inStock: true, link: "https://www.wholefoodsmarket.com" },
      { retailer: "Amazon", price: "$1.79", inStock: true, link: "https://www.amazon.com" }
    ],
    shortSummary: "Simple fruit and nut bar with no added sugar.",
    alternativeIds: ["p4", "p6"],
    sourceConfidence: 0.92,
    processingLevel: "minimal",
    score: 93,
    scoreLabel: "Excellent",
    breakdown: [
      { ingredient: "Seed Oils", status: "None", statusColor: "green" },
      { ingredient: "Processing Profile", status: "Low", statusColor: "green" },
      { ingredient: "Added Sugars", status: "None", statusColor: "green" }
    ]
  },
  {
    id: "p6",
    slug: "little-orchard-cocoa-creme-minis",
    name: "Little Orchard Cocoa Creme Minis",
    brand: "Little Orchard",
    category: "Kids' Snacks",
    subcategory: "cookie",
    image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=500&q=80",
    calories: 90,
    addedSugarG: 8,
    totalSugarG: 11,
    fiberG: 2,
    proteinG: 3,
    sodiumMg: 190,
    ingredients: [
      "Wheat Flour",
      "Sugar",
      "Palm Oil",
      "Cocoa",
      "Soy Lecithin"
    ],
    allergens: ["Wheat", "Soy"],
    additives: ["Natural Flavor", "Red 40"],
    retailerAvailability: [
      { retailer: "Target", price: "$3.99", inStock: true, link: "https://www.target.com" },
      { retailer: "Whole Foods", price: "$4.49", inStock: false, link: "https://www.wholefoodsmarket.com" },
      { retailer: "Amazon", price: "$2.89", inStock: true, link: "https://www.amazon.com" }
    ],
    shortSummary: "A curated snack option for family grocery runs with balanced tradeoffs.",
    alternativeIds: ["p7", "p8"],
    sourceConfidence: 0.89,
    processingLevel: "high",
    score: 62,
    scoreLabel: "Fair",
    breakdown: [
      { ingredient: "Seed Oils", status: "High", statusColor: "orange" },
      { ingredient: "Processing Profile", status: "High", statusColor: "orange" },
      { ingredient: "Added Sugars", status: "Moderate", statusColor: "yellow" }
    ]
  },
  {
    id: "p7",
    slug: "sprout-and-co-cocoa-creme-minis",
    name: "Sprout & Co Cocoa Creme Minis",
    brand: "Sprout & Co",
    category: "Kids' Snacks",
    subcategory: "cookie",
    image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=500&q=80",
    calories: 85,
    addedSugarG: 4,
    totalSugarG: 8,
    fiberG: 3,
    proteinG: 2,
    sodiumMg: 120,
    ingredients: [
      "Organic Wheat Flour",
      "Organic Cane Sugar",
      "Organic Cocoa Butter",
      "Cocoa"
    ],
    allergens: ["Wheat"],
    additives: [],
    retailerAvailability: [
      { retailer: "Target", price: "$4.49", inStock: true, link: "https://www.target.com" },
      { retailer: "Whole Foods", price: "$4.99", inStock: true, link: "https://www.wholefoodsmarket.com" },
      { retailer: "Amazon", price: "$3.99", inStock: true, link: "https://www.amazon.com" }
    ],
    shortSummary: "Organic alternative with cleaner ingredients.",
    alternativeIds: ["p6", "p8"],
    sourceConfidence: 0.94,
    processingLevel: "moderate",
    score: 82,
    scoreLabel: "Excellent",
    breakdown: [
      { ingredient: "Seed Oils", status: "None", statusColor: "green" },
      { ingredient: "Processing Profile", status: "Low", statusColor: "green" },
      { ingredient: "Added Sugars", status: "Low", statusColor: "green" }
    ]
  },
  {
    id: "p8",
    slug: "annie-organic-chewy-granola-bar",
    name: "Annie's Organic Chewy Granola Bar",
    brand: "Annie's",
    category: "Snacks",
    subcategory: "bar",
    image: "https://images.unsplash.com/photo-1590080876-b9e1f0d0f0c0?auto=format&fit=crop&w=500&q=80",
    calories: 120,
    addedSugarG: 5,
    totalSugarG: 9,
    fiberG: 2,
    proteinG: 2,
    sodiumMg: 100,
    ingredients: [
      "Organic Oats",
      "Organic Cane Sugar",
      "Organic Sunflower Oil",
      "Organic Honey"
    ],
    allergens: [],
    additives: [],
    retailerAvailability: [
      { retailer: "Target", price: "$3.99", inStock: true, link: "https://www.target.com" },
      { retailer: "Whole Foods", price: "$4.49", inStock: true, link: "https://www.wholefoodsmarket.com" },
      { retailer: "Amazon", price: "$3.49", inStock: true, link: "https://www.amazon.com" }
    ],
    shortSummary: "Organic granola bar with simple ingredients.",
    alternativeIds: ["p5", "p9"],
    sourceConfidence: 0.91,
    processingLevel: "moderate",
    score: 78,
    scoreLabel: "Good",
    breakdown: [
      { ingredient: "Seed Oils", status: "Low", statusColor: "green" },
      { ingredient: "Processing Profile", status: "Low", statusColor: "green" },
      { ingredient: "Added Sugars", status: "Moderate", statusColor: "yellow" }
    ]
  },
  {
    id: "p9",
    slug: "nature-valley-oats-honey",
    name: "Nature Valley Oats & Honey",
    brand: "Nature Valley",
    category: "Snacks",
    subcategory: "bar",
    image: "https://images.unsplash.com/photo-1590080876-b9e1f0d0f0c0?auto=format&fit=crop&w=500&q=80",
    calories: 180,
    addedSugarG: 12,
    totalSugarG: 15,
    fiberG: 2,
    proteinG: 4,
    sodiumMg: 200,
    ingredients: [
      "Rolled Oats",
      "Sugar",
      "Honey",
      "Soybean Oil"
    ],
    allergens: [],
    additives: [],
    retailerAvailability: [
      { retailer: "Target", price: "$2.99", inStock: true, link: "https://www.target.com" },
      { retailer: "Whole Foods", price: "$3.49", inStock: true, link: "https://www.wholefoodsmarket.com" },
      { retailer: "Amazon", price: "$2.49", inStock: true, link: "https://www.amazon.com" }
    ],
    shortSummary: "Popular granola bar with moderate sugar content.",
    alternativeIds: ["p8", "p10"],
    sourceConfidence: 0.88,
    processingLevel: "moderate",
    score: 65,
    scoreLabel: "Fair",
    breakdown: [
      { ingredient: "Seed Oils", status: "Moderate", statusColor: "yellow" },
      { ingredient: "Processing Profile", status: "Moderate", statusColor: "yellow" },
      { ingredient: "Added Sugars", status: "High", statusColor: "orange" }
    ]
  },
  {
    id: "p10",
    slug: "clif-bar-chocolate-chip",
    name: "Clif Bar Chocolate Chip",
    brand: "Clif Bar",
    category: "Snacks",
    subcategory: "bar",
    image: "https://images.unsplash.com/photo-1590080876-b9e1f0d0f0c0?auto=format&fit=crop&w=500&q=80",
    calories: 250,
    addedSugarG: 21,
    totalSugarG: 23,
    fiberG: 5,
    proteinG: 9,
    sodiumMg: 250,
    ingredients: [
      "Organic Oats",
      "Organic Cane Sugar",
      "Organic Chocolate Chips",
      "Organic Sunflower Oil"
    ],
    allergens: [],
    additives: [],
    retailerAvailability: [
      { retailer: "Target", price: "$1.99", inStock: true, link: "https://www.target.com" },
      { retailer: "Whole Foods", price: "$2.49", inStock: true, link: "https://www.wholefoodsmarket.com" },
      { retailer: "Amazon", price: "$1.79", inStock: true, link: "https://www.amazon.com" }
    ],
    shortSummary: "Energy bar with organic ingredients.",
    alternativeIds: ["p8", "p9"],
    sourceConfidence: 0.87,
    processingLevel: "moderate",
    score: 72,
    scoreLabel: "Good",
    breakdown: [
      { ingredient: "Seed Oils", status: "Low", statusColor: "green" },
      { ingredient: "Processing Profile", status: "Moderate", statusColor: "yellow" },
      { ingredient: "Added Sugars", status: "High", statusColor: "orange" }
    ]
  }
] as const;
