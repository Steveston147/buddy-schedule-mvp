export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/serverAuth";
import { jsondb } from "@/lib/jsondb";

export async function GET(req: Request) {
  try {
    await requireAdminFromRequest(req);
    const buddies = jsondb.listBuddies().map((b) => ({ id: b.id, email: b.email, role: b.role }));
    return NextResponse.json({ buddies });
  } catch (e: any) {
    console.error("[admin/buddies GET] error:", e);
    return NextResponse.json({ error: "サーバー内部エラー", detail: String(e?.message ?? e) }, { status: 500 });
  }
}
