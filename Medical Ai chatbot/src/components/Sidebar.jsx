import styles from "./Sidebar.module.css";

function fmt(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function Sidebar({ user, remaining, onSave, onHistory, onLogout }) {
  const color = remaining < 120 ? "#e24b4a" : remaining < 300 ? "#ef9f27" : "#1d9e75";

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>✚</div>
        <div>
        </div>
      </div>

      <div className={styles.section}>Navigation</div>
      <div className={`${styles.item} ${styles.active}`}>💬 Chat</div>
      {/* <div className={styles.item}>📄 Documents</div>
      <div className={styles.item}>🗄 Knowledge Base</div> */}

      <div className={styles.section}>Session</div>
      <div className={styles.timer}>
        <span>⏱ Time left</span>
        <span style={{ color, fontWeight: 600 }}>{fmt(remaining)}</span>
      </div>
      <div className={styles.item} onClick={onHistory}>🕐 Chat History</div>
      <div className={styles.item} onClick={onSave}>💾 Save Chat</div>

      <div className={styles.spacer} />
      <div className={styles.item} onClick={onLogout}>🚪 Logout</div>
      <div className={styles.user}>
        <div className={styles.avatar}>{user.name?.charAt(0).toUpperCase()}</div>
        <div>
          <div className={styles.name}>{user.name}</div>
          <div className={styles.email}>{user.email}</div>
        </div>
      </div>
    </div>
  );
}