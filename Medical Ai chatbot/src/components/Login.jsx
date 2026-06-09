import { useState } from "react";
import { authAPI } from "../api";
import { useGoogleLogin } from "@react-oauth/google";
import styles from "./Login.module.css";

const API_URL = "https://walisha-medical-ai-backend.hf.space";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setSuccess("");

    if (mode === "register" && !name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await authAPI.register(name, email, password);
        setSuccess("Account created! Please sign in.");
        setMode("login");
        setName("");
        setPass("");
      } else {
        const res = await authAPI.login(email, password);
        onLogin(res.data);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || "";
      if (mode === "register" && (detail.toLowerCase().includes("already") || detail.toLowerCase().includes("exists"))) {
        setError("You are already registered. Please sign in instead.");
      } else if (mode === "login" && (detail.toLowerCase().includes("invalid") || detail.toLowerCase().includes("incorrect"))) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(detail || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError("");
      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userInfo = await userInfoRes.json();

        const r = await fetch(`${API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userInfo.email,
            name: userInfo.name,
            google_id: userInfo.sub
          })
        });
        const res = await r.json();

        if (res.token) {
          localStorage.setItem("token", res.token);
          onLogin(res);
        } else {
          setError("Google login failed. Please try again.");
        }
      } catch {
        setError("Google login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google login was cancelled or failed.")
  });

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setSuccess("");
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>✚</div>
          <div>
            <div className={styles.logoText}>MedicalAI</div>
            <div className={styles.logoSub}>Knowledge Assistant</div>
          </div>
        </div>

        <h2 className={styles.title}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h2>
        <p className={styles.sub}>
          {mode === "login" ? "Sign in to your session" : "Register to get started"}
        </p>

        {mode === "register" && (
          <input
            className={styles.inp}
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        )}

        <input
          className={styles.inp}
          placeholder="Email address"
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className={styles.inp}
          placeholder="Password"
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
        />

        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div className={styles.error} style={{ background: "#d1fae5", color: "#065f46", borderColor: "#6ee7b7" }}>
            {success}
          </div>
        )}

        <button className={styles.btn} onClick={submit} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          <span style={{ fontSize: 12, color: "#9ca3af" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        </div>

        <button
          onClick={() => googleLogin()}
          disabled={loading}
          style={{
            width: "100%", padding: "10px",
            border: "1px solid #e5e7eb", borderRadius: 8,
            background: "#fff", color: "#374151",
            fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continue with Google
        </button>

        <p className={styles.switch}>
          {mode === "login" ? "No account? " : "Already registered? "}
          <span className={styles.link} onClick={switchMode}>
            {mode === "login" ? "Register" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
} 
