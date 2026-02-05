export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/serverAuth";
import { jsondb } from "@/lib/jsondb";

export async function GET(req: Request) {
  try {
    await requireAdminFromRequest(req);

    const url = new URL(req.url);
    const eventId = url.searchParams.get("eventId") ?? "";
    if (!eventId) return NextResponse.json({ error: "eventId が必要です" }, { status: 400 });

    return NextResponse.json({ userIds: jsondb.getAssignedUserIds(eventId) });
  } catch (e: any) {
    console.error("[admin/assignments GET] error:", e);
    return NextResponse.json({ error: "サーバー内部エラー", detail: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminFromRequest(req);

    const body = (await req.json().catch(() => ({}))) as any;
    const eventId = String(body.eventId ?? "");
    const userIds = Array.isArray(body.userIds) ? body.userIds.map(String) : [];

    if (!eventId) return NextResponse.json({ error: "eventId が必要です" }, { status: 400 });

    jsondb.setAssignments(eventId, userIds);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[admin/assignments POST] error:", e);
    return NextResponse.json({ error: "サーバー内部エラー", detail: String(e?.message ?? e) }, { status: 500 });
  }
}
