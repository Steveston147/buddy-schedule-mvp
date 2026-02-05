"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setSessionToken } from "@/lib/clientSession";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = useMemo(() => params.get("next") ?? "", [params]);

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin1234");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    let res: Response;
    try {
      res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
    } catch {
      setLoading(false);
      setErr("ネットワークエラーが発生しました");
      return;
    }

    setLoading(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data?.error ?? "ログインに失敗しました");
      return;
    }

    if (data?.token) setSessionToken(String(data.token));

    if (nextPath) router.push(nextPath);
    else router.push(data.role === "admin" ? "/admin" : "/buddy");
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 360 }}>
      <label style={{ display: "grid", gap: 4 }}>
        <span>メール</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>パスワード</span>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
      </label>

      <button disabled={loading} type="submit">
        {loading ? "ログイン中..." : "ログイン"}
      </button>

      {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
    </form>
  );
}
