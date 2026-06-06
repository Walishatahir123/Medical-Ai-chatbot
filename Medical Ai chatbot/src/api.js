
const BASE_URL = "http://localhost:8000";  // FastAPI / Django / etc.🔁 Change this to your backend URL

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem("token");

const headers = (extra = {}) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
  ...extra,
});

const handleRes = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { response: { data: err } };
  }
  return { data: await res.json() };
};

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authAPI = {
  // Login.jsx: authAPI.login(email, password) → res.data = { token, name, email, uid }
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await handleRes(res);
    // Save token automatically
    if (result.data.token) localStorage.setItem("token", result.data.token);
    return result;
  },

  // Login.jsx: authAPI.register(name, email, password)
  register: async (name, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return handleRes(res);
  },

  logout: async () => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: headers(),
      });
    } finally {
      localStorage.removeItem("token");
    }
  },
};

// ─── Chat API ─────────────────────────────────────────────────────────────────

export const chatAPI = {
  // Chat.jsx: chatAPI.send(text, sessionId) → res.data = { answer, sources }
  send: async (message, sessionId) => {
    const res = await fetch(`${BASE_URL}/chat/send`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ message, session_id: sessionId }),
    });
    return handleRes(res);
  },

  // Chat.jsx: chatAPI.saveSession(sessionId, messages)
  saveSession: async (sessionId, messages) => {
    const res = await fetch(`${BASE_URL}/chat/save`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ session_id: sessionId, messages }),
    });
    return handleRes(res);
  },

  // Chat.jsx: chatAPI.getHistory() → res.data = [ { id, title, messages, created_at } ]
  getHistory: async () => {
    const res = await fetch(`${BASE_URL}/chat/history`, {
      headers: headers(),
    });
    return handleRes(res);
  },

  // Chat.jsx: chatAPI.download(sessionId) → res.data = blob (docx file)
  // download: async (sessionId) => {
  //   const res = await fetch(`${BASE_URL}/chat/download/${sessionId}`, {
  //     headers: {
  //       Authorization: `Bearer ${getToken()}`,
  //     },
  //   });
  //   if (!res.ok) throw { response: { data: {} } };
  //   return { data: await res.arrayBuffer() };
  // },
  download: async (sessionId, messages = []) => {
    const res = await fetch(`${BASE_URL}/chat/download/${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw { response: { data: {} } };
    return { data: await res.arrayBuffer() };
  },
}