export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/serverAuth";
import { jsondb } from "@/lib/jsondb";

export async function GET(req: Request) {
  try {
    await requireAdminFromRequest(req);
    return NextResponse.json({ events: jsondb.listEvents() });
  } catch (e: any) {
    console.error("[admin/events GET] error:", e);
    return NextResponse.json({ error: "サーバー内部エラー", detail: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminFromRequest(req);

    const body = (await req.json().catch(() => ({}))) as any;
    const title = String(body.title ?? "").trim();
    const type = body.type === "japanese" ? "japanese" : "culture";
    const startAt = String(body.startAt ?? "");
    const meetingPlace = String(body.meetingPlace ?? "").trim();

    if (!title || !startAt || !meetingPlace) {
      return NextResponse.json({ error: "タイトル/開始日時/集合場所は必須です" }, { status: 400 });
    }

    const d = new Date(startAt);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "開始日時が不正です" }, { status: 400 });
    }

    const e = jsondb.createEvent({ title, type, startAt: d.toISOString(), meetingPlace });
    return NextResponse.json({ event: e });
  } catch (e: any) {
    console.error("[admin/events POST] error:", e);
    return NextResponse.json({ error: "サーバー内部エラー", detail: String(e?.message ?? e) }, { status: 500 });
  }
}
