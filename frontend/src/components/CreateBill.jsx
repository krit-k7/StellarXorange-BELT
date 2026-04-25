import { useState } from "react";
import useWallet from "../hooks/useWallet";
import { createBillOnChain } from "../lib/contract";

export default function CreateBill({ onBack, onCreated }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [participants, setParticipants] = useState(2);
  const [loading, setLoading] = useState(false);
  const {
    walletAddress,
    connectWallet,
    isInstalled,
    loading: walletLoading,
  } = useWallet();

  const handleCreate = async () => {
    if (!title || !amount) return;
    if (!walletAddress) {
      alert("Please connect your Freighter wallet first!");
      return;
    }
    setLoading(true);
    const result = await createBillOnChain(walletAddress, parseInt(amount), [
      walletAddress,
    ]);
    if (result.success) {
      const bill = {
        id: Math.floor(Math.random() * 1000),
        title,
        total: parseInt(amount),
        perShare: Math.floor(parseInt(amount) / participants),
        participants,
        paid: 0,
        txHash: result.hash,
      };
      onCreated(bill);
    } else {
      alert("Error creating bill: " + result.error);
    }
    setLoading(false);
  };

  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>
      <p className="page-title">Create a Bill</p>
      <p className="page-sub">Fill in the details and share with your group</p>
      <div className="form-box">
        {!walletAddress && (
          <div
            style={{
              marginBottom: "20px",
              padding: "16px",
              background: "#1f2937",
              borderRadius: "12px",
              border: "1px solid #374151",
            }}
          >
            <p
              style={{
                color: "#9ca3af",
                fontSize: "13px",
                marginBottom: "10px",
              }}
            >
              Connect wallet to create bill on Stellar
            </p>
            {!isInstalled ? (
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-full"
                style={{
                  display: "block",
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                Install Freighter
              </a>
            ) : (
              <button
                className="btn-full"
                onClick={connectWallet}
                disabled={walletLoading}
              >
                {walletLoading ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        )}

        {walletAddress && (
          <div
            style={{
              marginBottom: "20px",
              padding: "10px 14px",
              background: "#1f2937",
              borderRadius: "10px",
              border: "1px solid #374151",
            }}
          >
            <p
              style={{
                color: "#6b7280",
                fontSize: "11px",
                marginBottom: "2px",
              }}
            >
              Connected
            </p>
            <p
              style={{
                color: "#a78bfa",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
            >
              {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
            </p>
          </div>
        )}

        <div className="field">
          <label>Bill Title</label>
          <input
            type="text"
            placeholder="Dinner at Pizza Hut"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Total Amount (XLM)</label>
          <input
            type="number"
            placeholder="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Number of People</label>
          <input
            type="number"
            min="2"
            max="10"
            value={participants}
            onChange={(e) => setParticipants(parseInt(e.target.value))}
          />
        </div>

        {amount && participants && (
          <div className="preview">
            <p>Each person pays</p>
            <h2>{Math.floor(parseInt(amount) / participants)} XLM</h2>
          </div>
        )}

        <button
          className="btn-full"
          onClick={handleCreate}
          disabled={loading || !title || !amount || !walletAddress}
        >
          {loading ? "Creating on Stellar..." : "Create Bill"}
        </button>
      </div>
    </div>
  );
}
