"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/clientSession";
import AdminAssignmentsClient from "./ui";

export default function AdminAssignmentsPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await authFetch("/api/auth/me");
      const data = await res.json().catch(() => ({}));
      const u = data.user;
      if (!u) return router.replace("/login?next=/admin/assignments");
      if (u.role !== "admin") return router.replace("/buddy");
    })();
  }, [router]);

  return (
    <main>
      <h1>割り当て管理</h1>
      <p>
        <Link href="/admin">← 管理トップ</Link>
      </p>
      <AdminAssignmentsClient />
    </main>
  );
}
