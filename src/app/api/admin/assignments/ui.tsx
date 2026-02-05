"use client";

import { useEffect, useMemo, useState } from "react";
import { authFetch } from "@/lib/clientSession";

type EventRow = { id: string; title: string; type: "culture" | "japanese"; startAt: string; meetingPlace: string };
type BuddyRow = { id: string; email: string };

export default function AdminAssignmentsClient() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [buddies, setBuddies] = useState<BuddyRow[]>([]);
  const [eventId, setEventId] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  const selectedIds = useMemo(() => Object.entries(selected).filter(([, v]) => v).map(([k]) => k), [selected]);

  async function loadBase() {
    const [er, br] = await Promise.all([authFetch("/api/admin/events"), authFetch("/api/admin/buddies")]);
    const e = await er.json().catch(() => ({}));
    const b = await br.json().catch(() => ({}));
    setEvents(e.events ?? []);
    setBuddies((b.buddies ?? []).map((x: any) => ({ id: x.id, email: x.email })));
    setLoaded(true);
  }

  async function loadAssigned(id: string) {
    const res = await authFetch(`/api/admin/assignments?eventId=${encodeURIComponent(id)}`);
    const data = await res.json().catch(() => ({}));
    const userIds: string[] = data.userIds ?? [];
    const m: Record<string, boolean> = {};
    for (const u of userIds) m[u] = true;
    setSelected(m);
  }

  useEffect(() => {
    loadBase();
  }, []);

  async function onPickEvent(id: string) {
    setEventId(id);
    setSelected({});
    if (id) await loadAssigned(id);
  }

  async function save() {
    if (!eventId) return;
    const res = await authFetch("/api/admin/assignments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventId, userIds: selectedIds })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? "保存に失敗しました");
      return;
    }
    alert("保存しました");
  }

  if (!loaded) return <p>読み込み中...</p>;

  return (
    <section style={{ marginTop: 16, display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6, maxWidth: 520 }}>
        <span>イベントを選択</span>
        <select value={eventId} onChange={(e) => onPickEvent(e.target.value)}>
          <option value="">--選択--</option>
          {events
            .slice()
            .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
            .map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}（{new Date(e.startAt).toLocaleString("ja-JP")}）
              </option>
            ))}
        </select>
      </label>

      {!eventId ? (
        <p>イベントを選ぶと割り当て対象を編集できます。</p>
      ) : (
        <>
          <h2>割り当てるバディ</h2>
          <ul style={{ paddingLeft: 18 }}>
            {buddies.map((b) => (
              <li key={b.id} style={{ marginBottom: 8 }}>
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={!!selected[b.id]}
                    onChange={(e) => setSelected((prev) => ({ ...prev, [b.id]: e.target.checked }))}
                  />
                  <span>{b.email}</span>
                </label>
              </li>
            ))}
          </ul>
          <button onClick={save} style={{ width: 140 }}>
            保存
          </button>
        </>
      )}
    </section>
  );
}
