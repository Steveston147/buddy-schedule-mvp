"use client";

export function clearSessionToken() {
  // 互換のため残す（何もしない）
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  // ✅ Cookie を送るだけ
  return fetch(input, { ...init, credentials: "include" });
}
