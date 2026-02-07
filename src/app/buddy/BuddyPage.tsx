"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch, clearSessionToken } from "@/lib/clientSession";
import { rehydrateTokenFromHash } from "@/lib/rehydrateToken";
import { User, Assignment } from "./page";


export default function BuddyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // ✅ StackBlitz対策：URL hash から token を復元
    rehydrateTokenFromHash();

    (async () => {
      try {
        // 1) 誰としてログインしてるか確認
        const meRes = await authFetch("/api/auth/me");
        const meData = await meRes.json().catch(() => ({}));
        const u: User | null = meData.user ?? null;

        if (!u) {
          clearSessionToken();
          router.replace("/login?next=/buddy");
          return;
        }

        // adminなら admin へ（buddy画面には入れない）
        if (u.role === "admin") {
          router.replace("/admin");
          return;
        }

        setUser(u);

        // 2) その buddy のアサイン一覧を取得
        const aRes = await authFetch("/api/buddy/assignments");
        const aData = await aRes.json().catch(() => ({}));

        if (!aRes.ok) {
          const msg = aData?.error ?? "Failed to load assignments";
          setErr(`${msg}`);
          setAssignments([]);
          setLoading(false);
          return;
        }

        setAssignments(Array.isArray(aData.assignments) ? aData.assignments : []);
        setErr(null);
      } catch {
        clearSessionToken();
        router.replace("/login?next=/buddy");
        return;
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  function logout() {
    clearSessionToken();
    router.replace("/login");
  }

  if (loading) return <p style={{ padding: 16 }}>Loading...</p>;
  if (!user) return null;

  return (
    <main style={{ padding: 16, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Buddy</h1>
        <button onClick={logout} style={{ marginLeft: "auto" }}>
          Logout
        </button>
      </div>

      <div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>Signed in as</div>
        <div style={{ fontWeight: 600 }}>{user.email}</div>
      </div>

      {err ? (
        <p style={{ color: "crimson", background: "#fff3f3", padding: 10, whiteSpace: "pre-wrap" }}>
          {err}
        </p>
      ) : null}

      <section style={{ display: "grid", gap: 10 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Your assignments</h2>

        {assignments.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No assignments yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            {assignments.map((a) => (
              <li
                key={a.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 12,
                  display: "grid",
                  gap: 4,
                }}
              >
                <div style={{ fontWeight: 700 }}>{a.event.title}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  Type: {a.event.type} / Start: {new Date(a.event.startAt).toLocaleString()}
                </div>
                <div style={{ fontSize: 12 }}>Meeting place: {a.event.meetingPlace}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/login">Login</Link>
      </nav>
    </main>
  );
}
