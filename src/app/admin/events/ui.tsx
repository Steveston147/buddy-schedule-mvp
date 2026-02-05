"use client";

import { useMemo, useState } from "react";

type EventRow = {
  id: string;
  title: string;
  type: "culture" | "japanese";
  startAt: string; // ISO
  meetingPlace: string;
  createdAt: string;
};

export default function AdminEventsClient({ initialEvents }: { initialEvents: EventRow[] }) {
  const [events, setEvents] = useState<EventRow[]>(initialEvents);

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
    const res = await fetch("/api/admin/events");
    const data = await res.json();
    setEvents(data.events);
  }

  async function create() {
    setErr(null);
    const startAt = startAtLocal ? new Date(startAtLocal).toISOString() : "";
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, type, startAt, meetingPlace })
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d?.error ?? "作成に失敗しました");
      return;
    }
    setTitle("");
    setStartAtLocal("");
    setMeetingPlace("");
    await refresh();
  }

  async function update(id: string, patch: Partial<EventRow>) {
    setErr(null);
    const res = await fetch(`/api/admin/events/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d?.error ?? "更新に失敗しました");
      return;
    }
    await refresh();
  }

  async function remove(id: string) {
    setErr(null);
    const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
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
        <h2>イベント作成</h2>

        <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
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
          {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
        </div>
      </section>

      <section>
        <h2>イベント一覧</h2>
        {sorted.length === 0 ? (
          <p>イベントがありません。</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {sorted.map((e) => (
              <li key={e.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "grid", gap: 6, border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <strong>{e.title}</strong>
                    <button onClick={() => remove(e.id)}>削除</button>
                  </div>

                  <div style={{ display: "grid", gap: 6, maxWidth: 640 }}>
                    <label style={{ display: "grid", gap: 4 }}>
                      <span>タイトル</span>
                      <input defaultValue={e.title} onBlur={(ev) => update(e.id, { title: ev.target.value })} />
                    </label>

                    <label style={{ display: "grid", gap: 4 }}>
                      <span>種別</span>
                      <select defaultValue={e.type} onBlur={(ev) => update(e.id, { type: ev.target.value as any })}>
                        <option value="culture">文化体験</option>
                        <option value="japanese">日本語講座</option>
                      </select>
                    </label>

                    <label style={{ display: "grid", gap: 4 }}>
                      <span>開始日時</span>
                      <input
                        type="datetime-local"
                        defaultValue={toDatetimeLocal(e.startAt)}
                        onBlur={(ev) => update(e.id, { startAt: new Date(ev.target.value).toISOString() })}
                      />
                    </label>

                    <label style={{ display: "grid", gap: 4 }}>
                      <span>集合場所</span>
                      <input defaultValue={e.meetingPlace} onBlur={(ev) => update(e.id, { meetingPlace: ev.target.value })} />
                    </label>
                  </div>

                  <div style={{ color: "#666" }}>
                    表示: {new Date(e.startAt).toLocaleString("ja-JP")} / {e.type === "culture" ? "文化体験" : "日本語講座"} / {e.meetingPlace}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
