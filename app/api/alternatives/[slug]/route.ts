import { NextResponse } from "next/server";
import { getAlternativeProducts } from "@/lib/services/alternative-engine";
import { getProductBySlug } from "@/lib/services/product-catalog";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return NextResponse.json({ error: "Not found", mocked: true }, { status: 404 });

  return NextResponse.json({
    productSlug: slug,
    alternatives: getAlternativeProducts(product),
    mocked: true
  });
}
