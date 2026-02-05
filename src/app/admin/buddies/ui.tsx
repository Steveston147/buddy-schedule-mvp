"use client";

import { useState } from "react";

type BuddyRow = { id: string; email: string; role: "buddy" | "admin" };

export default function AdminBuddiesClient({ initialBuddies }: { initialBuddies: BuddyRow[] }) {
  const [buddies, setBuddies] = useState<BuddyRow[]>(initialBuddies);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/admin/buddies");
    const data = await res.json();
    setBuddies(data.buddies);
  }

  async function create() {
    setErr(null);
    const res = await fetch("/api/admin/buddies", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d?.error ?? "作成に失敗しました");
      return;
    }
    setEmail("");
    setPassword("");
    await refresh();
  }

  async function remove(id: string) {
    setErr(null);
    const res = await fetch(`/api/admin/buddies/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d?.error ?? "削除に失敗しました");
      return;
    }
    await refresh();
  }

  return (
    <div style={{ display: "grid", gap: 18, marginTop: 14 }}>
      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
        <h2>バディ作成</h2>

        <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span>メール</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label style={{ display: "grid", gap: 4 }}>
            <span>初期パスワード</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </label>

          <button onClick={create}>作成</button>
          {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
        </div>
      </section>

      <section>
        <h2>バディ一覧</h2>
        {buddies.length === 0 ? (
          <p>バディがいません。</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {buddies.map((b) => (
              <li key={b.id} style={{ marginBottom: 10 }}>
                <span>{b.email}</span>{" "}
                <button onClick={() => remove(b.id)} style={{ marginLeft: 10 }}>
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
