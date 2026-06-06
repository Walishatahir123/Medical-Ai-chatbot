import styles from "./HistoryPanel.module.css";
export default function HistoryPanel({ sessions, onLoad, onClose }) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span>Saved sessions</span>
        <button onClick={onClose}>✕</button>
      </div>
      {sessions.length === 0
        ? <div className={styles.empty}>No saved sessions yet.</div>
        : sessions.map((s, i) => (
          <div key={i} className={styles.item} onClick={() => onLoad(s.messages)}>
            <div className={styles.title}>Session {sessions.length - i}</div>
            <div className={styles.meta}>{s.date} · {s.messages?.length} messages</div>
            <div className={styles.preview}>{s.messages?.[0]?.text?.slice(0, 60)}...</div>
          </div>
        ))
      }
    </div>
  );
}