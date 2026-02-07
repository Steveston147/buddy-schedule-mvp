export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { jsondb } from "@/lib/jsondb";
import { setSessionCookie } from "@/lib/authCookie";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").toLowerCase().trim();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = jsondb.getUserByEmail(email);
    if (!user) return NextResponse.json({ error: "Invalid login" }, { status: 401 });

    const ok = bcrypt.compareSync(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Invalid login" }, { status: 401 });

    // ✅ 重要: await を追加してください
    await setSessionCookie({ id: user.id, email: user.email, role: user.role });

    return NextResponse.json({ ok: true, role: user.role }, { status: 200 });
  } catch (e) {
    console.error("[auth/login] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}