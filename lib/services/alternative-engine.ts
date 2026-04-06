import { scoreProduct } from "@/lib/scoring";
import { GuardianPreferences } from "@/lib/types";
import { CatalogProduct, listProducts } from "@/lib/services/product-catalog";

function recommendationScore(product: CatalogProduct, preferences?: GuardianPreferences) {
  const score = scoreProduct(product, preferences);
  const sugarBonus = Math.max(0, 8 - product.addedSugarG) * 1.4;
  const fiberBonus = product.fiberG * 2;
  const additivePenalty = product.additives.length * 3;
  return score.numericScore + sugarBonus + fiberBonus - additivePenalty;
}

export function getAlternativeProducts(source: CatalogProduct, preferences?: GuardianPreferences, limit = 3): CatalogProduct[] {
  const candidates = listProducts().filter(
    (product) =>
      product.id !== source.id &&
      product.slug !== source.slug &&
      product.category === source.category &&
      product.subcategory === source.subcategory
  );

  if (!candidates.length) {
    return listProducts()
      .filter((product) => product.id !== source.id && product.slug !== source.slug && product.category === source.category)
      .sort((a, b) => recommendationScore(b, preferences) - recommendationScore(a, preferences))
      .slice(0, limit);
  }

  return candidates.sort((a, b) => recommendationScore(b, preferences) - recommendationScore(a, preferences)).slice(0, limit);
}
