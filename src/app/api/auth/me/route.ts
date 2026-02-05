export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAuthedUserFromRequest } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const user = await getAuthedUserFromRequest(req);
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user }, { status: 200 });
}
