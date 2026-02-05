"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch, clearSessionToken } from "@/lib/clientSession";

type User = { id: string; role: "admin" | "buddy"; email: string };
type Assignment = {
  id: string;
  event: {
    title: string;
    type: "culture" | "japanese";
    startAt: string;
    meetingPlace: string;
  };
};

function statusLabel(status: number) {
  if (status === 401) return "未ログイン(401)";
  if (status === 403) return "権限なし(403)";
  if (status === 404) return "APIが見つからない(404)";
  if (status >= 500) return `サーバーエラー(${status})`;
  return `エラー(${status})`;
}

export default function BuddyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) 自分の情報を取得
        const meRes = await authFetch("/api/auth/me");
        let meJson: any = null;
        try {
          meJson = await meRes.json();
        } catch {
          meJson = null;
        }

        if (!meRes.ok) {
          // /api/auth/me が無い・認証NG・サーバエラーなど
          const detail = meJson?.error || meJson?.detail || "";
          const msg = `${statusLabel(meRes.status)}: /api/auth/me ${detail}`.trim();
          if (!cancelled) {
            setError(msg);
            setLoading(false);
          }

          // 401 の時だけログインへ（404/500 は原因表示を優先）
          if (meRes.status === 401) router.replace("/login?next=/buddy");
          return;
        }

        const u: User | null = meJson?.user ?? null;
        if (!u) {
          if (!cancelled) {
            setError("user が null でした（token が保存されていない可能性）");
            setLoading(false);
          }
          router.replace("/login?next=/buddy");
          return;
        }

        // buddy 以外は適切な画面へ
        if (u.role === "admin") {
          router.replace("/admin");
          return;
        }

        if (cancelled) return;
        setUser(u);

        // 2) 割り当て一覧を取得
        const aRes = await authFetch("/api/buddy/assignments");
        let aJson: any = null;
        try {
          aJson = await aRes.json();
        } catch {
          aJson = null;
        }

        if (!aRes.ok) {
          const detail = aJson?.error || aJson?.detail || "";
          const msg = `${statusLabel(aRes.status)}: /api/buddy/assignments ${detail}`.trim();
          if (!cancelled) {
            setAssignments([]);
            setError(msg);
            setLoading(false);
          }

          // 401ならログインへ
          if (aRes.status === 401) router.replace("/login?next=/buddy");
          return;
        }

        const list: Assignment[] = Array.isArray(aJson?.assignments) ? aJson.assignments : [];
        if (!cancelled) {
          setAssignments(list);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(`例外: ${String(e?.message ?? e)}`);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function logout() {
    clearSessionToken();
    router.replace("/login");
  }

  if (loading) return <p>読み込み中...</p>;

  // ここ重要：ログインできてない等の場合に「真っ白」にならないようにする
  if (!user) {
    return (
      <main style={{ display: "grid", gap: 12 }}>
        <h1>バディ画面</h1>
        <p style={{ color: "crimson" }}>
          {error ?? "ユーザー情報が取得できませんでした。"}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => router.replace("/login?next=/buddy")}>ログインへ</button>
          <Link href="/">ホーム</Link>
        </div>
        <details>
          <summary>デバッグのヒント</summary>
          <ul style={{ paddingLeft: 18 }}>
            <li><code>/api/auth/me</code> が 404 なら API ファイルが未作成です</li>
            <li>401 なら token が保存できていない/送れていない可能性があります</li>
            <li>Console/Network で <code>/api/auth/me</code> のレスポンスを確認してください</li>
          </ul>
        </details>
      </main>
    );
  }

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

      {error ? (
        <p style={{ color: "crimson", marginTop: 12 }}>
          {error}
        </p>
      ) : null}

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
