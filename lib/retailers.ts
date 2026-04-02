import { getProductById, getProductBySlug } from "@/lib/products";

export function getRetailersBySlug(slug: string) {
  return getProductBySlug(slug)?.retailerAvailability ?? [];
}

export function getRetailersById(id: string) {
  return getProductById(id)?.retailerAvailability ?? [];
}
