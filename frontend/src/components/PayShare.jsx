import { useState, useEffect } from "react";
import useWallet from "../hooks/useWallet";
import { sendPayment, getBalance } from "../lib/stellar";

const CREATOR_ADDRESS =
  "GDHWXGMJVAYCHUWDATDMANHES3IFQOI2I5DNI7I43DZILSKSECBMQFOH";

export default function PayShare({ bill, onBack, onPaid }) {
  const { walletAddress, isInstalled, connectWallet, loading } = useWallet();
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (walletAddress) {
      getBalance(walletAddress).then(setBalance);
    }
  }, [walletAddress]);

  if (!bill) return null;

  const handlePay = async () => {
    if (!walletAddress) return;
    setPaying(true);
    setError(null);
    const amountXLM = bill.perShare.toString();
    const result = await sendPayment(walletAddress, CREATOR_ADDRESS, amountXLM);
    if (result.success) {
      setTxHash(result.hash);
      setDone(true);
      setTimeout(() => onPaid({ ...bill, paid: (bill.paid || 0) + 1 }), 2000);
    } else {
      setError(result.error);
    }
    setPaying(false);
  };

  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>
      <p className="page-title">Pay Your Share</p>
      <p className="page-sub">Bill #{bill.id}</p>
      <div className="form-box">
        <div className="share-box">
          <p>Your share</p>
          <h2>{bill.perShare} XLM</h2>
        </div>
        {done ? (
          <div className="success-box">
            <div className="icon">✅</div>
            <h3>Payment Successful!</h3>
            <p>Transaction confirmed on Stellar</p>
            {txHash && (
              <a
                href={"https://stellar.expert/explorer/testnet/tx/" + txHash}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#a78bfa",
                  fontSize: "12px",
                  marginTop: "8px",
                  display: "block",
                }}
              >
                View on Stellar Explorer →
              </a>
            )}
          </div>
        ) : (
          <div>
            {!walletAddress ? (
              <div>
                <p
                  style={{
                    color: "#9ca3af",
                    fontSize: "14px",
                    marginBottom: "16px",
                    textAlign: "center",
                  }}
                >
                  Connect your Stellar wallet to pay
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
                    Install Freighter Wallet
                  </a>
                ) : (
                  <button
                    className="btn-full"
                    onClick={connectWallet}
                    disabled={loading}
                  >
                    {loading ? "Connecting..." : "Connect Freighter Wallet"}
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div
                  style={{
                    background: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    marginBottom: "20px",
                  }}
                >
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    Connected wallet
                  </p>
                  <p
                    style={{
                      color: "#a78bfa",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      wordBreak: "break-all",
                    }}
                  >
                    {walletAddress}
                  </p>
                  {balance && (
                    <p
                      style={{
                        color: "#4ade80",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      Balance: {balance} XLM
                    </p>
                  )}
                </div>
                {error && (
                  <div
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid #ef4444",
                      borderRadius: "12px",
                      padding: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <p style={{ color: "#ef4444", fontSize: "13px" }}>
                      Error: {error}
                    </p>
                  </div>
                )}
                <button
                  className="btn-full"
                  onClick={handlePay}
                  disabled={paying}
                >
                  {paying
                    ? "Waiting for Freighter approval..."
                    : "Pay " + bill.perShare + " XLM"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
