
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"email" | "admin">("email");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(
        mode === "admin"
          ? { username, password }
          : { email, password }
      );
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card stack" onSubmit={onSubmit}>
        <div className="brand">College CMS</div>
        <h2>Login</h2>
        <p>Sign in to continue to your dashboard.</p>
        <div className="row gap-sm" style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            className={mode === "email" ? "btn" : "btn btn-ghost"}
            onClick={() => setMode("email")}
          >
            Email
          </button>
          <button
            type="button"
            className={mode === "admin" ? "btn" : "btn btn-ghost"}
            onClick={() => setMode("admin")}
          >
            Admin username
          </button>
        </div>
        {mode === "admin" ? (
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
        ) : (
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        )}
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Login"}
        </button>
        <p>
          New student? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
