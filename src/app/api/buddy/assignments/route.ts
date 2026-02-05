export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireUserFromRequest } from "@/lib/serverAuth";
import { jsondb } from "@/lib/jsondb";

export async function GET(req: Request) {
  try {
    const user = await requireUserFromRequest(req);

    if (user.role !== "buddy") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const assignments = jsondb.listAssignmentsForUser(user.id);
    return NextResponse.json({ assignments }, { status: 200 });
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    console.error("[buddy/assignments GET] error:", e);
    return NextResponse.json({ error: "サーバー内部エラー", detail: msg }, { status: 500 });
  }
}
