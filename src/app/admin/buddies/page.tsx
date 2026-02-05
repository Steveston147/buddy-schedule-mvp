"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch, clearSessionToken } from "@/lib/clientSession";

type User = { id: string; role: "admin" | "buddy"; email: string };
type Assignment = {
  id: string;
  event: { title: string; type: "culture" | "japanese"; startAt: string; meetingPlace: string };
};

export default function BuddyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const meRes = await authFetch("/api/auth/me");
      const me = await meRes.json().catch(() => ({}));
      const u: User | null = me.user ?? null;
      if (!u) {
        setLoading(false);
        return router.replace("/login?next=/buddy");
      }
      setUser(u);

      const aRes = await authFetch("/api/buddy/assignments");
      const a = await aRes.json().catch(() => ({}));
      setAssignments(a.assignments ?? []);
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
          <h1>バディ画面</h1>
          <p style={{ color: "#666" }}>{user.email}</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={logout}>ログアウト</button>
          <Link href="/">ホーム</Link>
        </div>
      </header>

      <h2 style={{ marginTop: 20 }}>自分に割り当てられたイベント（近い順）</h2>

      {assignments.length === 0 ? (
        <p>割り当てられたイベントがありません。</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {assignments.map((a) => (
            <li key={a.id} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700 }}>{a.event.title}</div>
              <div>種別: {a.event.type === "culture" ? "文化体験" : "日本語講座"}</div>
              <div>日時: {new Date(a.event.startAt).toLocaleString("ja-JP")}</div>
              <div>集合場所: {a.event.meetingPlace}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
