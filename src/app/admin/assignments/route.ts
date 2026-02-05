export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireUserFromRequest } from "@/lib/serverAuth";
import { jsondb } from "@/lib/jsondb";

export async function GET(req: Request) {
  try {
    const user = await requireUserFromRequest(req);
    const assignments = jsondb.listAssignmentsForUser(user.id);
    return NextResponse.json({ assignments });
  } catch (e: any) {
    console.error("[buddy/assignments GET] error:", e);
    return NextResponse.json({ error: "サーバー内部エラー", detail: String(e?.message ?? e) }, { status: 500 });
  }
}
