"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch, clearSessionToken } from "@/lib/clientSession";
import { rehydrateTokenFromHash } from "@/lib/rehydrateToken";

type User = { id: string; role: "admin" | "buddy"; email: string };

export default function AdminHome() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ StackBlitz対策：URL hash から token を復元
    rehydrateTokenFromHash();

    (async () => {
      try {
        const res = await authFetch("/api/auth/me");
        const data = await res.json().catch(() => ({}));
        const u: User | null = data.user ?? null;

        if (!u) {
          clearSessionToken();
          router.replace("/login?next=/admin");
          return;
        }
        if (u.role !== "admin") {
          router.replace("/buddy");
          return;
        }

        setUser(u);
      } catch {
        clearSessionToken();
        router.replace("/login?next=/admin");
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
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>Admin</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Signed in as</div>
          <div style={{ fontWeight: 600 }}>{user.email}</div>
        </div>
        <button onClick={logout} style={{ marginLeft: "auto" }}>
          Logout
        </button>
      </div>

      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/admin/events">Events</Link>
        <Link href="/admin/buddies">Buddies</Link>
        <Link href="/admin/assignments">Assignments</Link>
      </nav>
    </main>
  );
}
