import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/services/product-catalog";
import { getRetailerAvailability } from "@/lib/services/retailer-engine";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return NextResponse.json({ error: "Not found", mocked: true }, { status: 404 });

  return NextResponse.json({ productSlug: slug, retailers: getRetailerAvailability(product), mocked: true });
}
