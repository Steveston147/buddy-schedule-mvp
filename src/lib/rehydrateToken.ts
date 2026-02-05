"use client";

import { setSessionToken } from "@/lib/clientSession";

/**
 * StackBlitz preview で localStorage が安定しないケースの保険：
 * URL hash (#t=...) から token を復元して localStorage に入れる。
 */
export function rehydrateTokenFromHash(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hash || "";
  if (!h.startsWith("#")) return false;

  const params = new URLSearchParams(h.slice(1));
  const t = params.get("t");
  if (!t) return false;

  try {
    setSessionToken(t);
    // hash を消す（履歴は増やさない）
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    return true;
  } catch {
    return false;
  }
}
