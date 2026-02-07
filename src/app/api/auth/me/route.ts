export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSessionUserFromCookie } from "@/lib/authCookie";

export async function GET() {
  // ✅ 重要: await を追加
  const user = await getSessionUserFromCookie();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}