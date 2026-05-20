export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07070f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <div
        style={{
          fontSize: "48px",
          fontWeight: "700",
          color: "white",
          letterSpacing: "-1px",
          textShadow:
            "0 0 20px rgba(124,58,237,0.9), 0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(124,58,237,0.2)",
        }}
      >
        KINETIX
      </div>

      <div
        style={{
          fontSize: "16px",
          color: "#a1a1aa",
        }}
      >
        Your Second Brain. Built for Builders.
      </div>

      <div
        style={{
          fontSize: "13px",
          color: "#52525b",
        }}
      >
        The AI that actually knows you.
      </div>
    </div>
  );
}
