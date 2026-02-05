"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/clientSession";
import AdminEventsClient from "./ui";

export default function AdminEventsPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await authFetch("/api/auth/me");
      const data = await res.json().catch(() => ({}));
      const u = data.user;
      if (!u) return router.replace("/login?next=/admin/events");
      if (u.role !== "admin") return router.replace("/buddy");
    })();
  }, [router]);

  return (
    <main>
      <h1>イベント管理</h1>
      <p>
        <Link href="/admin">← 管理トップ</Link>
      </p>
      <AdminEventsClient />
    </main>
  );
}
