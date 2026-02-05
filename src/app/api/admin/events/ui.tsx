"use client";

import { useEffect, useMemo, useState } from "react";
import { authFetch } from "@/lib/clientSession";

type EventRow = {
  id: string;
  title: string;
  type: "culture" | "japanese";
  startAt: string; // ISO
  meetingPlace: string;
  createdAt: string;
};

export default function AdminEventsClient() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventRow["type"]>("culture");
  const [startAtLocal, setStartAtLocal] = useState(""); // datetime-local
  const [meetingPlace, setMeetingPlace] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...events].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
    [events]
  );

  async function refresh() {
    const res = await authFetch("/api/admin/events");
    const data = await res.json();
    setEvents(data.events ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function create() {
    setErr(null);
    const startAt = startAtLocal ? new Date(startAtLocal).toISOString() : "";
    const res = await authFetch("/api/admin/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, type, startAt, meetingPlace })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data?.error ?? "作成に失敗しました");
      return;
    }
    setTitle("");
    setStartAtLocal("");
    setMeetingPlace("");
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("削除しますか？")) return;
    const res = await authFetch(`/api/admin/events/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? "削除に失敗しました");
      return;
    }
    await refresh();
  }

  if (!loaded) return <p>読み込み中...</p>;

  return (
    <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
      <section style={{ border: "1px solid #ddd", padding: 12 }}>
        <h2>新規作成</h2>
        {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
        <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span>タイトル</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <label style={{ display: "grid", gap: 4 }}>
            <span>種別</span>
            <select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="culture">文化体験</option>
              <option value="japanese">日本語講座</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 4 }}>
            <span>開始日時</span>
            <input type="datetime-local" value={startAtLocal} onChange={(e) => setStartAtLocal(e.target.value)} />
          </label>

          <label style={{ display: "grid", gap: 4 }}>
            <span>集合場所</span>
            <input value={meetingPlace} onChange={(e) => setMeetingPlace(e.target.value)} />
          </label>

          <button onClick={create}>作成</button>
        </div>
      </section>

      <section>
        <h2>一覧</h2>
        {sorted.length === 0 ? (
          <p>イベントがありません。</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {sorted.map((e) => (
              <li key={e.id} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700 }}>{e.title}</div>
                <div>種別: {e.type === "culture" ? "文化体験" : "日本語講座"}</div>
                <div>日時: {new Date(e.startAt).toLocaleString("ja-JP")}</div>
                <div>集合場所: {e.meetingPlace}</div>
                <button onClick={() => remove(e.id)} style={{ marginTop: 6 }}>
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
