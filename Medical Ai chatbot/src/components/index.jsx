import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#46b358", color: "#fff", fontFamily: "sans-serif" }}>
      <p>Loading...</p>
    </div>
  );
}
