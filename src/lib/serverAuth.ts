import { cookies } from "next/headers";
import { getSessionCookieName, verifySession } from "./auth";

export type AuthedUser = {
  id: string;
  role: "admin" | "buddy";
  email: string;
};

function tokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth && auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  const x = req.headers.get("x-session");
  if (x) return x.trim();
  return null;
}

// API Route Handler 用（Request を受け取れる）
export async function getAuthedUserFromRequest(req: Request): Promise<AuthedUser | null> {
  const bearer = tokenFromRequest(req);
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(getSessionCookieName())?.value;

  const token = bearer || cookieToken;
  if (!token) return null;

  try {
    const session = await verifySession(token);
    return { id: session.sub, role: session.role, email: session.email };
  } catch {
    return null;
  }
}

export async function requireUserFromRequest(req: Request) {
  const user = await getAuthedUserFromRequest(req);
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdminFromRequest(req: Request) {
  const user = await requireUserFromRequest(req);
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

// server component 用（cookie 前提のまま残す）
export async function getAuthedUser(): Promise<AuthedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (!token) return null;

  try {
    const session = await verifySession(token);
    return { id: session.sub, role: session.role, email: session.email };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getAuthedUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}
