import { CatalogProduct } from "@/lib/services/product-catalog";

export interface EnrichedImage {
  image: string;
  enrichmentSource: "mock-catalog" | "fallback";
}

export function enrichProductImage(product: CatalogProduct): EnrichedImage {
  if (product.image) {
    return {
      image: product.image,
      enrichmentSource: "mock-catalog"
    };
  }

  return {
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80",
    enrichmentSource: "fallback"
  };
}
