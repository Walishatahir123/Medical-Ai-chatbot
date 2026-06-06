import { useState, useEffect } from "react";

// ✅ After

const BASE_URL = "https://walisha-medical-ai-backend.hf.space";

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      }).then(r => r.json());
      if (res.token) {
        setLoggedIn(true);
        fetchUsers();
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Could not connect to backend");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/users`).then(r => r.json());
      setUsers(res.users);
      setTotal(res.total);
    } catch {
      setError("Failed to load users");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await fetch(`${BASE_URL}/admin/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  if (!loggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", padding: 40, borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", width: 360 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 32 }}>🏥</div>
            <h2 style={{ margin: "8px 0 4px", color: "#111827" }}>Admin Panel</h2>
            <p style={{ color: "#6b7280", fontSize: 14 }}>MedicalAI Dashboard</p>
          </div>
          <input
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 12, fontSize: 14, boxSizing: "border-box" }}
            placeholder="Admin email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 12, fontSize: 14, boxSizing: "border-box" }}
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
          />
          {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button
            onClick={login}
            disabled={loading}
            style={{ width: "100%", padding: "10px", background: "#1d9e75", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, cursor: "pointer", fontWeight: 600 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      {/* Header */}
      <div style={{ background: "#1d9e75", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>🏥 MedicalAI Admin</div>
        <button
          onClick={() => setLoggedIn(false)}
          style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", padding: "6px 16px", borderRadius: 6, cursor: "pointer" }}
        >
          Logout
        </button>
      </div>

      <div style={{ padding: 32 }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Total Users</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#1d9e75" }}>{total}</div>
          </div>
          <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Active Sessions</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#3b82f6" }}>—</div>
          </div>
          <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>PDFs Indexed</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#f59e0b" }}>3</div>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#111827" }}>Registered Users</h3>
            <button
              onClick={fetchUsers}
              style={{ background: "#f3f4f6", border: "none", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
            >
              🔄 Refresh
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ padding: "12px 24px", textAlign: "left", fontSize: 13, color: "#6b7280", fontWeight: 600 }}>ID</th>
                <th style={{ padding: "12px 24px", textAlign: "left", fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Name</th>
                <th style={{ padding: "12px 24px", textAlign: "left", fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Email</th>
                <th style={{ padding: "12px 24px", textAlign: "left", fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No users registered yet</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "14px 24px", fontSize: 14, color: "#6b7280" }}>#{u.id}</td>
                    <td style={{ padding: "14px 24px", fontSize: 14, color: "#111827", fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: "14px 24px", fontSize: 14, color: "#374151" }}>{u.email}</td>
                    <td style={{ padding: "14px 24px" }}>
                      <button
                        onClick={() => deleteUser(u.id)}
                        style={{ background: "#fee2e2", color: "#ef4444", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
