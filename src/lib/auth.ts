import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  sub: string; // userId
  role: "admin" | "buddy";
  email: string;
};

const COOKIE_NAME = "session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET ?? "dev_secret_change_me";
  return new TextEncoder().encode(secret);
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

export async function signSession(payload: SessionPayload) {
  const key = getSecretKey();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifySession(token: string) {
  const key = getSecretKey();
  const { payload } = await jwtVerify(token, key);
  return payload as unknown as SessionPayload & { exp: number; iat: number };
}
