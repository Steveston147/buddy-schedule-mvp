import Link from "next/link";
import { getAuthedUser } from "@/lib/serverAuth";

export default async function HomePage() {
  const user = await getAuthedUser();

  return (
    <main>
      <h1>Buddy Schedule MVP</h1>
      <p>バディが自分に割り当てられた文化体験・日本語講座の日程と集合場所を確認するアプリ</p>

      {!user ? (
        <p>
          <Link href="/login">ログイン</Link>
        </p>
      ) : user.role === "admin" ? (
        <p>
          <Link href="/admin">管理画面へ</Link>
        </p>
      ) : (
        <p>
          <Link href="/buddy">バディ画面へ</Link>
        </p>
      )}
    </main>
  );
}
