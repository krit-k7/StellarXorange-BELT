export default function BillStatus({ bill, onBack, onPay }) {
  if (!bill) return null;
  const paidCount = bill.paid || 0;
  const remaining = bill.participants - paidCount;
  const progress = (paidCount / bill.participants) * 100;

  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>
      <p className="page-title">{bill.title || "Bill Status"}</p>
      <p className="page-sub">Bill #{bill.id}</p>
      <div className="form-box">
        <div className="stats">
          <div className="stat">
            <span>Total</span>
            <strong>{bill.total} XLM</strong>
          </div>
          <div className="stat">
            <span>Per Share</span>
            <strong className="purple">{bill.perShare} XLM</strong>
          </div>
          <div className="stat">
            <span>People</span>
            <strong>{bill.participants}</strong>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-labels">
            <span>{paidCount} paid</span>
            <span>{remaining} remaining</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {remaining === 0 ? (
          <div className="alert-green">✅ All paid! Funds released.</div>
        ) : (
          <div className="alert-yellow">
            ⏳ Waiting for {remaining} more payment(s)
          </div>
        )}
        <button className="btn-outline-purple" onClick={() => onPay(bill)}>
          Pay My Share
        </button>
      </div>
    </div>
  );
}
