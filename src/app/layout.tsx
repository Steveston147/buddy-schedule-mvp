import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buddy Schedule MVP",
  description: "Buddy can see assigned events (culture/japanese) with time & meeting place."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", margin: 0 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>{children}</div>
      </body>
    </html>
  );
}
