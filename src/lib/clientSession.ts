"use client";

const KEY = "sessionToken";

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setSessionToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, token);
}

export function clearSessionToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getSessionToken();
  const headers = new Headers(init.headers);

  if (token) headers.set("authorization", `Bearer ${token}`);

  return fetch(input, { ...init, headers, credentials: "include" });
}
