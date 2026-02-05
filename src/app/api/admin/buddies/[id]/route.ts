export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/serverAuth";
import { jsondb } from "@/lib/jsondb";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminFromRequest(req);

    const { id } = await ctx.params;
    jsondb.deleteBuddy(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[admin/buddies/:id DELETE] error:", e);
    return NextResponse.json({ error: "サーバー内部エラー", detail: String(e?.message ?? e) }, { status: 500 });
  }
}
