import { CatalogProduct } from "@/lib/services/product-catalog";

const requiredRetailers = ["Whole Foods", "Target", "Walmart", "Amazon", "Thrive Market", "Sprouts"];

export function getRetailerAvailability(product: CatalogProduct) {
  const byName = new Map(product.retailerAvailability.map((offer) => [offer.retailer, offer]));

  return requiredRetailers.map((retailer, index) => {
    const found = byName.get(retailer);
    if (found) return found;

    const basePrice = 2.99 + (index % 4) * 0.5;
    return {
      retailer,
      price: `$${basePrice.toFixed(2)}`,
      inStock: index % 3 !== 0,
      link: "#"
    };
  });
}
