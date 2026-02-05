"use client";

import { useEffect, useMemo, useState } from "react";

type Evt = {
  id: string;
  title: string;
  type: "culture" | "japanese";
  startAt: string;
  meetingPlace: string;
};

type Buddy = { id: string; email: string };

export default function AdminAssignmentsClient({ events, buddies }: { events: Evt[]; buddies: Buddy[] }) {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? "");
  const [assignedUserIds, setAssignedUserIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const selectedEvent = useMemo(() => events.find((e) => e.id === selectedEventId), [events, selectedEventId]);

  useEffect(() => {
    if (!selectedEventId) return;
    (async () => {
      setErr(null);
      const res = await fetch(`/api/admin/assignments?eventId=${encodeURIComponent(selectedEventId)}`);
      const data = await res.json();
      setAssignedUserIds(new Set<string>(data.userIds ?? []));
    })();
  }, [selectedEventId]);

  function toggle(uid: string) {
    setAssignedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  async function save() {
    if (!selectedEventId) return;
    setSaving(true);
    setErr(null);

    const res = await fetch("/api/admin/assignments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventId: selectedEventId,
        userIds: Array.from(assignedUserIds)
      })
    });

    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d?.error ?? "保存に失敗しました");
      return;
    }
  }

  return (
    <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
        <h2>対象イベント</h2>
        <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {new Date(e.startAt).toLocaleString("ja-JP")} / {e.type === "culture" ? "文化体験" : "日本語講座"} / {e.title}
            </option>
          ))}
        </select>

        {selectedEvent ? <p style={{ color: "#666" }}>集合場所: {selectedEvent.meetingPlace}</p> : null}
      </section>

      <section style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
        <h2>バディ割り当て（チェックして保存）</h2>

        {buddies.length === 0 ? (
          <p>バディユーザーがいません。</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {buddies.map((b) => (
              <li key={b.id} style={{ marginBottom: 8 }}>
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="checkbox" checked={assignedUserIds.has(b.id)} onChange={() => toggle(b.id)} />
                  <span>{b.email}</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <button onClick={save} disabled={saving || !selectedEventId}>
          {saving ? "保存中..." : "保存"}
        </button>

        {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
      </section>
    </div>
  );
}
