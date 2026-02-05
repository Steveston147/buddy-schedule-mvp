"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/clientSession";

type BuddyRow = { id: string; email: string; role: "admin" | "buddy" };

export default function AdminBuddiesClient() {
  const [buddies, setBuddies] = useState<BuddyRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function refresh() {
    const res = await authFetch("/api/admin/buddies");
    const data = await res.json();
    setBuddies(data.buddies ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function remove(id: string) {
    if (!confirm("削除しますか？")) return;
    const res = await authFetch(`/api/admin/buddies/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? "削除に失敗しました");
      return;
    }
    await refresh();
  }

  if (!loaded) return <p>読み込み中...</p>;

  return (
    <section style={{ marginTop: 16 }}>
      <h2>ユーザー一覧</h2>
      {buddies.length === 0 ? (
        <p>ユーザーがいません。</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {buddies.map((b) => (
            <li key={b.id} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>{b.email}</div>
              <div>role: {b.role}</div>
              {b.role !== "admin" ? (
                <button onClick={() => remove(b.id)} style={{ marginTop: 6 }}>
                  削除
                </button>
              ) : (
                <small style={{ color: "#666" }}>管理者は削除不可</small>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
