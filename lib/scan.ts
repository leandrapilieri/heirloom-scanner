import { getAllProducts, searchProducts } from "@/lib/products";

export function identifyProduct(input: string) {
  const query = input.trim();
  if (!query) return null;

  const results = searchProducts(query);
  return results[0] ?? getAllProducts()[0];
}
