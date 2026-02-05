"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch, clearSessionToken } from "@/lib/clientSession";

type User = { id: string; role: "admin" | "buddy"; email: string };

export default function AdminHome() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await authFetch("/api/auth/me");
      const data = await res.json().catch(() => ({}));
      const u: User | null = data.user ?? null;

      if (!u) {
        setLoading(false);
        router.replace("/login?next=/admin");
        return;
      }
      if (u.role !== "admin") {
        setLoading(false);
        router.replace("/buddy");
        return;
      }

      setUser(u);
      setLoading(false);
    })();
  }, [router]);

  function logout() {
    clearSessionToken();
    router.replace("/login");
  }

  if (loading) return <p>読み込み中...</p>;
  if (!user) return null;

  return (
    <main>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>管理画面</h1>
          <p style={{ color: "#666" }}>{user.email}</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={logout}>ログアウト</button>
          <Link href="/">ホーム</Link>
        </div>
      </header>

      <ul style={{ paddingLeft: 18, marginTop: 18 }}>
        <li>
          <Link href="/admin/events">イベント管理</Link>
        </li>
        <li>
          <Link href="/admin/buddies">バディユーザー管理</Link>
        </li>
        <li>
          <Link href="/admin/assignments">割り当て管理</Link>
        </li>
      </ul>
    </main>
  );
}
