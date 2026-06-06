import { useState } from "react";
import styles from "./InputBar.module.css";

const SUGGESTIONS = ["Dosage info", "Contraindications", "Side effects", "Drug interactions"];

export default function InputBar({ onSend, disabled }) {
  const [input, setInput] = useState("");

  const send = () => { if (input.trim()) { onSend(input.trim()); setInput(""); } };

  return (
    <div className={styles.wrap}>
      <div className={styles.sugs}>
        {SUGGESTIONS.map(s => (
          <button key={s} className={styles.sug} onClick={() => onSend(s)} disabled={disabled}>{s}</button>
        ))}
      </div>
      <div className={styles.row}>
        <textarea className={styles.box} value={input} rows={1}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={disabled ? "Session expired — renew to continue" : "Ask about your medical documents..."}
          disabled={disabled} />
        <button className={styles.btn} onClick={send} disabled={disabled || !input.trim()}>➤</button>
      </div>
      <div className={styles.disc}>🛡 For informational purposes only. Always consult a qualified physician.</div>
    </div>
  );
}