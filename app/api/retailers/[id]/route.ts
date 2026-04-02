import { NextResponse } from "next/server";
import { getRetailersById } from "@/lib/retailers";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ productId: id, retailers: getRetailersById(id), mocked: true });
}
