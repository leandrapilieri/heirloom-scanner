import { getProductById, getProductBySlug } from "@/lib/products";
import { scoreProduct } from "@/lib/scoring";
import { Product } from "@/lib/types";

export function getAlternativesForSlug(slug: string): Array<Product & { score: ReturnType<typeof scoreProduct> }> {
  const source = getProductBySlug(slug);
  if (!source) return [];

  return source.alternativeIds
    .map((id) => getProductById(id))
    .filter((item): item is Product => Boolean(item))
    .map((product) => ({ ...product, score: scoreProduct(product) }))
    .sort((a, b) => b.score.numericScore - a.score.numericScore);
}
