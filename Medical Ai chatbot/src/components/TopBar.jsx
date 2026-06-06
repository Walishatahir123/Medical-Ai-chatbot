import styles from "./TopBar.module.css";
export default function TopBar({ onDownload }) {
  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <div className={styles.dot} />
        <div>
          <div className={styles.title}>Medical Assistant</div>
          <div className={styles.sub}>FAISS · HuggingFace · Groq LLaMA</div>
        </div>
      </div>
      <div className={styles.right}>
        <span className={styles.badge}>3 PDFs indexed</span>
        <button className={styles.dlBtn} onClick={onDownload}>⬇ Download .docx</button>
      </div>
    </div>
  );
}