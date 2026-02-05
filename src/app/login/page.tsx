import LoginForm from "./ui";

export default function LoginPage() {
  return (
    <main>
      <h1>ログイン</h1>
      <LoginForm />
      <p style={{ marginTop: 12, color: "#666" }}>
        seed済み admin: <code>admin@example.com</code> / <code>admin1234</code>
      </p>
    </main>
  );
}
