function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "0.75rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background:
          "radial-gradient(circle at top, #e0f2fe 0, #f9fafb 45%, #0f172a 100%)",
        color: "#0f172a",
      }}
    >
      <h1 style={{ fontSize: "2.25rem", fontWeight: 700 }}>Almizan Frontend</h1>
      <p style={{ fontSize: "1rem", opacity: 0.8 }}>
        React + TypeScript + Vite is up and running.
      </p>
      <p
        style={{
          fontSize: "0.875rem",
          opacity: 0.7,
          maxWidth: "28rem",
          textAlign: "center",
        }}
      >
        You can now start wiring this page to your backend and PocketBase
        integration.
      </p>
    </div>
  );
}

export default App;
