export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signSession, getSessionCookieName } from "@/lib/auth";
import { jsondb } from "@/lib/jsondb";

function isHttpsRequest(req: Request) {
  const xfProto = req.headers.get("x-forwarded-proto");
  if (xfProto) return xfProto === "https";
  return req.url.startsWith("https://");
}

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "email と password が必要です" }, { status: 400 });
    }

    const user = jsondb.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "メールまたはパスワードが違います" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "メールまたはパスワードが違います" }, { status: 401 });
    }

    const token = await signSession({ sub: user.id, role: user.role, email: user.email });

    const res = NextResponse.json({ ok: true, role: user.role, token });

    // cookie も一応セット（効く環境ならそのまま動く）
    const secure = isHttpsRequest(req);
    res.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      path: "/",
      secure,
      sameSite: secure ? "none" : "lax"
    });

    return res;
  } catch (e: any) {
    console.error("[login] error:", e);
    return NextResponse.json(
      { error: "サーバー内部エラー", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
