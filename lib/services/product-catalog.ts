import { products as rawProducts } from "@/data/products";
import { scoreProduct } from "@/lib/scoring";
import { GuardianPreferences, Product } from "@/lib/types";

export interface CatalogProduct extends Product {
  barcode: string;
  numericScore: number;
  grade: ReturnType<typeof scoreProduct>["grade"];
}

const normalizedProducts: CatalogProduct[] = (rawProducts as unknown as Product[]).map((product, index) => {
  const score = scoreProduct(product);
  return {
    ...product,
    barcode: `00000${(index + 1).toString().padStart(6, "0")}`,
    numericScore: score.numericScore,
    grade: score.grade,
    sourceConfidence: product.sourceConfidence ?? 0.92
  };
});

export function listProducts(): CatalogProduct[] {
  return normalizedProducts;
}

export function getProductBySlug(slug: string): CatalogProduct | undefined {
  return normalizedProducts.find((product) => product.slug === slug);
}

export function getProductByBarcode(barcode: string): CatalogProduct | undefined {
  return normalizedProducts.find((product) => product.barcode === barcode);
}

export function searchCatalog(query: string): CatalogProduct[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];
  return normalizedProducts.filter((product) => `${product.name} ${product.brand} ${product.category} ${product.subcategory}`.toLowerCase().includes(normalized));
}

export function getScoredCatalogProduct(slug: string, preferences?: GuardianPreferences) {
  const product = getProductBySlug(slug);
  if (!product) return null;
  const score = scoreProduct(product, preferences);
  return { ...product, numericScore: score.numericScore, grade: score.grade, score };
}
