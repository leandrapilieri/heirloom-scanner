import { NextResponse } from "next/server";
import { getProductById } from "@/lib/products";
import { scoreProduct } from "@/lib/scoring";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product, score: scoreProduct(product), mocked: true });
}
