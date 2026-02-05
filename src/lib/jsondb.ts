import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";

export type Role = "admin" | "buddy";
export type EventType = "culture" | "japanese";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
};

export type Event = {
  id: string;
  title: string;
  type: EventType;
  startAt: string; // ISO
  meetingPlace: string;
  createdAt: string;
};

export type Assignment = {
  id: string;
  userId: string;
  eventId: string;
};

type DBShape = {
  users: User[];
  events: Event[];
  assignments: Assignment[];
};

// ✅ Hidden(.data) をやめて、通常フォルダ data に保存する
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

// ✅ どうしても書き込めない環境用（最後の保険）
let memoryDB: DBShape | null = null;

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}
function nowISO() {
  return new Date().toISOString();
}

function ensureDirSafe() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

function readDB(): DBShape {
  // fs がダメならメモリDBへ
  if (!ensureDirSafe()) {
    if (!memoryDB) memoryDB = { users: [], events: [], assignments: [] };
    return memoryDB;
  }

  try {
    if (!fs.existsSync(DB_PATH)) {
      const init: DBShape = { users: [], events: [], assignments: [] };
      fs.writeFileSync(DB_PATH, JSON.stringify(init, null, 2), "utf-8");
      return init;
    }
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as DBShape;
  } catch {
    // ここで落ちるとログインも死ぬので、最悪メモリへ退避
    if (!memoryDB) memoryDB = { users: [], events: [], assignments: [] };
    return memoryDB;
  }
}

function writeDB(db: DBShape) {
  // fsがダメならメモリ保持だけ
  if (!ensureDirSafe()) {
    memoryDB = db;
    return;
  }

  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch {
    memoryDB = db;
  }
}

function ensureAdmin(db: DBShape) {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin1234";

  const exists = db.users.find((u) => u.email === email);
  if (exists) return;

  const passwordHash = bcrypt.hashSync(password, 10);
  db.users.push({
    id: uid("u"),
    email,
    passwordHash,
    role: "admin",
    createdAt: nowISO()
  });
  writeDB(db);
}

export const jsondb = {
  getUserByEmail(email: string) {
    const db = readDB();
    ensureAdmin(db);
    return db.users.find((u) => u.email === email.toLowerCase()) ?? null;
  },

  getUserById(id: string) {
    const db = readDB();
    ensureAdmin(db);
    return db.users.find((u) => u.id === id) ?? null;
  },

  listBuddies() {
    const db = readDB();
    ensureAdmin(db);
    return db.users
      .filter((u) => u.role === "buddy")
      .sort((a, b) => a.email.localeCompare(b.email));
  },

  createBuddy(email: string, password: string) {
    const db = readDB();
    ensureAdmin(db);

    const norm = email.toLowerCase();
    if (db.users.some((u) => u.email === norm)) throw new Error("EMAIL_EXISTS");

    const passwordHash = bcrypt.hashSync(password, 10);
    const u: User = { id: uid("u"), email: norm, passwordHash, role: "buddy", createdAt: nowISO() };
    db.users.push(u);
    writeDB(db);
    return u;
  },

  deleteBuddy(id: string) {
    const db = readDB();
    ensureAdmin(db);

    const u = db.users.find((x) => x.id === id);
    if (!u) return;
    if (u.role !== "buddy") throw new Error("CANNOT_DELETE_ADMIN");

    db.users = db.users.filter((x) => x.id !== id);
    db.assignments = db.assignments.filter((a) => a.userId !== id);
    writeDB(db);
  },

  listEvents() {
    const db = readDB();
    ensureAdmin(db);
    return [...db.events].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
  },

  createEvent(input: Omit<Event, "id" | "createdAt">) {
    const db = readDB();
    ensureAdmin(db);
    const e: Event = { ...input, id: uid("e"), createdAt: nowISO() };
    db.events.push(e);
    writeDB(db);
    return e;
  },

  updateEvent(id: string, patch: Partial<Omit<Event, "id" | "createdAt">>) {
    const db = readDB();
    ensureAdmin(db);
    const idx = db.events.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("NOT_FOUND");
    db.events[idx] = { ...db.events[idx], ...patch };
    writeDB(db);
    return db.events[idx];
  },

  deleteEvent(id: string) {
    const db = readDB();
    ensureAdmin(db);
    db.events = db.events.filter((x) => x.id !== id);
    db.assignments = db.assignments.filter((a) => a.eventId !== id);
    writeDB(db);
  },

  getAssignedUserIds(eventId: string) {
    const db = readDB();
    ensureAdmin(db);
    return db.assignments.filter((a) => a.eventId === eventId).map((a) => a.userId);
  },

  setAssignmentsForEvent(eventId: string, userIds: string[]) {
    const db = readDB();
    ensureAdmin(db);

    db.assignments = db.assignments.filter((a) => a.eventId !== eventId);
    for (const uid_ of userIds) {
      db.assignments.push({ id: uid("a"), eventId, userId: uid_ });
    }
    writeDB(db);
  },

  // ✅ 互換：既存ルートが setAssignments(eventId, userIds) を呼ぶケースに対応
  setAssignments(eventId: string, userIds: string[]) {
    return this.setAssignmentsForEvent(eventId, userIds);
  },

  listAssignmentsForUser(userId: string) {
    const db = readDB();
    ensureAdmin(db);

    const byEventId = new Map(db.events.map((e) => [e.id, e] as const));
    const rows = db.assignments
      .filter((a) => a.userId === userId)
      .map((a) => ({ id: a.id, event: byEventId.get(a.eventId) }))
      .filter((x): x is { id: string; event: Event } => Boolean(x.event));

    rows.sort((a, b) => new Date(a.event.startAt).getTime() - new Date(b.event.startAt).getTime());
    return rows;
  }
};