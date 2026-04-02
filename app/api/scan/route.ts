import { NextResponse } from "next/server";
import { buildScanPayload, resolveScan } from "@/lib/services/scan-resolver";

export async function POST(req: Request) {
  const body = (await req.json()) as { barcode?: string; photoHint?: string; query?: string; categoryHint?: string };
  const resolution = resolveScan(body);

  if (resolution.status === "not_found") {
    return NextResponse.json({ resolution, mocked: true }, { status: 404 });
  }

  if (resolution.status === "confirm_needed") {
    return NextResponse.json({ resolution, candidates: resolution.candidates, mocked: true }, { status: 202 });
  }

  if (!resolution.candidateSlug) {
    return NextResponse.json({ resolution, error: "Candidate unavailable", mocked: true }, { status: 422 });
  }

  const payload = buildScanPayload(resolution.candidateSlug);
  if (!payload) {
    return NextResponse.json({ resolution, error: "Unable to build scan payload", mocked: true }, { status: 404 });
  }

  return NextResponse.json({ resolution, ...payload, mocked: true });
}
