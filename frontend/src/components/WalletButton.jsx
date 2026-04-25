import useWallet from "../hooks/useWallet";

export default function WalletButton() {
  const {
    walletAddress,
    isInstalled,
    loading,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  if (walletAddress) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            background: "#1f2937",
            border: "1px solid #374151",
            color: "#a78bfa",
            padding: "6px 14px",
            borderRadius: "10px",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          {walletAddress.slice(0, 5)}...{walletAddress.slice(-5)}
        </span>
        <button
          onClick={disconnectWallet}
          style={{
            background: "none",
            border: "1px solid #374151",
            color: "#6b7280",
            padding: "6px 12px",
            borderRadius: "10px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (!isInstalled) {
    return (
      <a
        href="https://freighter.app"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: "none",
          border: "1px solid #7c3aed",
          color: "#a78bfa",
          padding: "8px 16px",
          borderRadius: "10px",
          fontSize: "13px",
          textDecoration: "none",
        }}
      >
        Install Freighter
      </a>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={loading}
      style={{
        background: "#7c3aed",
        border: "none",
        color: "white",
        padding: "8px 20px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
      }}
    >
      {loading ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
