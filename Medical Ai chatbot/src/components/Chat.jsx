import { useState, useEffect, useRef, useCallback } from "react";
import { chatAPI } from "../api";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import PipelineBar from "./PipelineBar";
import MessageList from "./MessageList";
import InputBar from "./InputBar";
import SessionModal from "./SessionModal";
import HistoryPanel from "./HistoryPanel";
import styles from "./Chat.module.css";

const CRISIS = [/suicid/i, /kill\s*myself/i, /end\s*my\s*life/i, /want\s*to\s*die/i, /self.?harm/i, /hurt\s*myself/i];
const isCrisis = t => CRISIS.some(p => p.test(t));

const SESSION_MINS = 30;

export default function Chat({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pipeStep, setPipeStep] = useState(0);
  const [remaining, setRemaining] = useState(SESSION_MINS * 60);
  const [expired, setExpired] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const sessionId = useRef(`sess_${Date.now()}`);
  const timerRef = useRef(null);

  // ── Session timer ──────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(timerRef.current);
          setExpired(true);
          handleSave();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, [startTimer]);

  // ── Save session ───────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (messages.length === 0) return;
    try {
      await chatAPI.saveSession(sessionId.current, messages);
      alert("Chat saved!");
    } catch { alert("Save failed — check backend."); }
  }, [messages]);

  // ── Load history ───────────────────────────────────────
  const loadHistory = async () => {
    try {
      const res = await chatAPI.getHistory();
      // const res = await chatAPI.download(sessionId.current, messages);
      setHistory(res.data);
    } catch { setHistory([]); }
    setShowHistory(true);
  };

  // ── Download .docx ─────────────────────────────────────
  const handleDownload = async () => {
    try {
      const res = await chatAPI.download(sessionId.current, messages);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `MedicalAI_Chat_${Date.now()}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Download failed — check backend."); }
  };

  // ── Send message ───────────────────────────────────────
  const handleSend = async (text) => {
    if (!text.trim() || loading || expired) return;

    const userMsg = { role: "user", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);

    // Crisis detection — no backend call
    if (isCrisis(text)) {
      setMessages(prev => [...prev, {
        role: "ai", crisis: true,
        text: "It sounds like you're going through a very difficult time. You are not alone.\n\nPlease reach out immediately:\n• Umang Helpline: 0317-4288665\n• Rozan Counseling: 051-2890505\n• Emergency: 115",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: []
      }]);
      return;
    }

    setLoading(true);
    // Animate pipeline
    for (let i = 1; i <= 4; i++) {
      await new Promise(r => setTimeout(r, 400));
      setPipeStep(i);
    }

    try {
      const res = await chatAPI.send(text, sessionId.current);
      setMessages(prev => [...prev, {
        role: "ai",
        text: res.data.answer,
        sources: res.data.sources || [],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "ai", error: true,
        text: "Could not reach the server. Make sure the FastAPI backend is running on port 8000.",
        sources: [], time: ""
      }]);
    } finally {
      setPipeStep(0);
      setLoading(false);
    }
  };

  const handleRenew = () => {
    setExpired(false);
    setRemaining(SESSION_MINS * 60);
    sessionId.current = `sess_${Date.now()}`;
    setMessages([]);
    startTimer();
  };

  return (
    <div className={styles.wrap}>
      <Sidebar
        user={user}
        remaining={remaining}
        onSave={handleSave}
        onHistory={loadHistory}
        onLogout={onLogout}
      />
      <div className={styles.main}>
        <TopBar onDownload={handleDownload} />
        <PipelineBar step={pipeStep} />
        <MessageList messages={messages} user={user} loading={loading} />
        <InputBar onSend={handleSend} disabled={expired || loading} />
      </div>

      {showHistory && (
        <HistoryPanel
          sessions={history}
          onLoad={msgs => { setMessages(msgs); setShowHistory(false); }}
          onClose={() => setShowHistory(false)}
        />
      )}
      {expired && (
        <SessionModal onRenew={handleRenew} onLogout={onLogout} />
      )}
    </div>
  );
}
