// import { useEffect, useRef } from "react";
// import styles from "./MessageList.module.css";

// export default function MessageList({ messages, user, loading }) {
//   const endRef = useRef(null);
//   useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

//   return (
//     <div className={styles.area}>
//       {messages.length === 0 && (
//         <div className={styles.welcome}>
//           <div className={styles.welcomeTitle}>👋 Hello, {user.name}!</div>
//           <div className={styles.welcomeText}>Your 30-minute session is active. Ask me anything about your indexed medical documents.</div>
//         </div>
//       )}

//       {messages.map((msg, i) => {
//         const isUser = msg.role === "user";
//         return (
//           <div key={i} className={`${styles.row} ${isUser ? styles.userRow : ""}`}>

//             <div className={`${styles.avatar} ${isUser ? styles.userAvatar : styles.aiAvatar}`}>
//               {isUser ? user.name?.charAt(0).toUpperCase() : "AI"}
//             </div>
//             <div className={styles.body}>
//               <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.aiBubble} ${msg.crisis ? styles.crisis : ""} ${msg.error ? styles.errBubble : ""}`}>
//                 {msg.text.split("\n").map((line, j) => <span key={j}>{line}<br /></span>)}
//               </div>
//               {msg.sources?.length > 0 && (
//                 <div className={styles.sources}>
//                   {msg.sources.map((s, j) => <span key={j} className={styles.chip}>📄 {s.source} (p.{s.page})</span>)}
//                   {/* {msg.sources.map((s, j) => <span key={j} className={styles.chip}>📄 {s}</span>)} */}
//                 </div>
//               )}
//               <div className={`${styles.time} ${isUser ? styles.timeRight : ""}`}>{msg.time}</div>
//             </div>
//           </div>
//         );
//       })}

//       {loading && (
//         <div className={styles.row}>
//           <div className={`${styles.avatar} ${styles.aiAvatar}`}>AI</div>
//           <div className={`${styles.bubble} ${styles.aiBubble} ${styles.typing}`}>
//             <span /><span /><span />
//           </div>
//         </div>
//       )}
//       <div ref={endRef} />
//     </div>
//   );
// }

import { useEffect, useRef } from "react";
import styles from "./MessageList.module.css";

export default function MessageList({ messages, user, loading }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  return (
    <div className={styles.area}>
      {messages.length === 0 && (
        <div className={styles.welcome}>
          <div className={styles.welcomeTitle}>👋 Hello, {user.name}!</div>
          <div className={styles.welcomeText}>Your 30-minute session is active. Ask me anything about your indexed medical documents.</div>
        </div>
      )}

      {messages.map((msg, i) => {
        const isUser = msg.role === "user";
        return (
          <div key={i} className={`${styles.row} ${isUser ? styles.userRow : ""}`}>
            <div className={`${styles.avatar} ${isUser ? styles.userAvatar : styles.aiAvatar}`}>
              {isUser ? user.name?.charAt(0).toUpperCase() : "AI"}
            </div>
            <div className={styles.body}>
              <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.aiBubble} ${msg.crisis ? styles.crisis : ""} ${msg.error ? styles.errBubble : ""}`}>
                {msg.text.split("\n").map((line, j) => <span key={j}>{line}<br /></span>)}
              </div>
              <div className={`${styles.time} ${isUser ? styles.timeRight : ""}`}>{msg.time}</div>
            </div>
          </div>
        );
      })}

      {loading && (
        <div className={styles.row}>
          <div className={`${styles.avatar} ${styles.aiAvatar}`}>AI</div>
          <div className={`${styles.bubble} ${styles.aiBubble} ${styles.typing}`}>
            <span /><span /><span />
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}