import { cookies } from "next/headers";

export const COOKIE_NAME = "bs_session";

export type Role = "admin" | "buddy";
export type SessionUser = { id: string; email: string; role: Role };

function b64urlEncode(str: string) {
  return Buffer.from(str, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
function b64urlDecode(str: string) {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const b64 = (str + pad).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64").toString("utf-8");
}

function sign(payload: string) {
  const secret = process.env.AUTH_SECRET ?? "dev_secret_change_me";
  const crypto = require("node:crypto") as typeof import("node:crypto");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

// ▼ async を追加
export async function setSessionCookie(user: SessionUser) {
  const payloadObj = { ...user, v: 1, iat: Date.now() };
  const payload = b64urlEncode(JSON.stringify(payloadObj));
  const sig = sign(payload);
  const value = `${payload}.${sig}`;

  // ▼ await cookies() に変更
  (await cookies()).set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, 
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// ▼ async を追加
export async function clearSessionCookie() {
  // ▼ await cookies() に変更
  (await cookies()).set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0,
  });
}

// ▼ async を追加し、戻り値を Promise<...> に変更
export async function getSessionUserFromCookie(): Promise<SessionUser | null> {
  // ▼ await cookies() に変更
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  if (sign(payload) !== sig) return null;

  try {
    const obj = JSON.parse(b64urlDecode(payload));
    if (!obj?.id || !obj?.email || !obj?.role) return null;
    return { id: String(obj.id), email: String(obj.email), role: obj.role as Role };
  } catch {
    return null;
  }
}