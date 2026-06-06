import styles from "./SessionModal.module.css";
export default function SessionModal({ onRenew, onLogout }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.icon}>⏰</div>
        <h3>Session expired</h3>
        <p>Your 30-minute session has ended. Your chat was saved automatically.</p>
        <div className={styles.btns}>
          <button className={styles.primary} onClick={onRenew}>Renew session</button>
          <button className={styles.secondary} onClick={onLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}