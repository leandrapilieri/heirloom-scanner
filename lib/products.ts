import { products } from "@/data/products";
import { scoreProduct } from "@/lib/scoring";
import { GuardianPreferences, Product } from "@/lib/types";

const allProducts = products as unknown as Product[];

export function getAllProducts(): Product[] {
  return allProducts;
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((product) => product.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return allProducts.find((product) => product.id === id);
}

export function searchProducts(query: string): Product[] {
  const normalized = query.toLowerCase();
  return allProducts.filter((product) => `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(normalized));
}

export function getScoredProduct(slug: string, preferences?: GuardianPreferences) {
  const product = getProductBySlug(slug);
  if (!product) return null;
  return { ...product, score: scoreProduct(product, preferences) };
}

export function getRecentScans(): Product[] {
  return allProducts.slice(0, 8);
}

export function getPantryFavorites(): Product[] {
  return allProducts.slice(2, 14);
}
