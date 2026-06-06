import styles from "./PipelineBar.module.css";
const STEPS = ["Question embedding", "Semantic search", "LLM ranking", "Answer ready"];
export default function PipelineBar({ step }) {
  return (
    <div className={styles.bar}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const cls = step === n ? styles.active : step > n ? styles.done : styles.idle;
        return (
          <span key={label} className={styles.step}>
            <span className={`${styles.dot} ${cls}`}>{step > n ? "✓" : n}</span>
            <span className={styles.label}>{label}</span>
            {i < 3 && <span className={styles.arr}>›</span>}
          </span>
        );
      })}
    </div>
  );
}