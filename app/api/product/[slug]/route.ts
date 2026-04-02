import { NextResponse } from "next/server";
import { getScoredCatalogProduct } from "@/lib/services/product-catalog";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = getScoredCatalogProduct(slug);
  if (!result) return NextResponse.json({ error: "Not found", mocked: true }, { status: 404 });
  return NextResponse.json({ product: result, mocked: true });
}
