import WalletButton from "./components/WalletButton";
import useWallet from "./hooks/useWallet";
import { useState } from "react";
import CreateBill from "./components/CreateBill";
import BillStatus from "./components/BillStatus";
import PayShare from "./components/PayShare";

function App() {
  const [page, setPage] = useState("home");
  const [currentBill, setCurrentBill] = useState(null);

  const goToCreate = () => setPage("create");
  const goToStatus = (bill) => {
    setCurrentBill(bill);
    setPage("status");
  };
  const goToPay = (bill) => {
    setCurrentBill(bill);
    setPage("pay");
  };
  const goHome = () => setPage("home");

  return (
    <div>
      <nav className="navbar">
        <button className="logo" onClick={goHome}>
          💸 Stellar Split
        </button>
        <WalletButton />
      </nav>

      <div className="container">
        {page === "home" && (
          <div className="hero">
            <h1>
              Split Bills on <span>Blockchain</span>
            </h1>
            <p>
              No more chasing friends for money. Everyone pays their share on
              Stellar. Automatic. Trustless.
            </p>
            <div className="btn-row">
              <button className="btn-primary" onClick={goToCreate}>
                Create a Bill
              </button>
              <button
                className="btn-outline"
                onClick={() =>
                  goToPay({
                    id: 1,
                    title: "Demo Bill",
                    total: 1000,
                    perShare: 500,
                    participants: 2,
                    paid: 0,
                  })
                }
              >
                Pay My Share
              </button>
            </div>
            <div className="cards">
              <div className="card">
                <div className="card-icon">📝</div>
                <h3>Create</h3>
                <p>Enter total amount and add your friends</p>
              </div>
              <div className="card">
                <div className="card-icon">🔗</div>
                <h3>Share</h3>
                <p>Send the bill link to your group</p>
              </div>
              <div className="card">
                <div className="card-icon">✅</div>
                <h3>Collect</h3>
                <p>Everyone pays, you get the full amount</p>
              </div>
            </div>
          </div>
        )}
        {page === "create" && (
          <CreateBill onBack={goHome} onCreated={goToStatus} />
        )}
        {page === "status" && (
          <BillStatus bill={currentBill} onBack={goHome} onPay={goToPay} />
        )}
        {page === "pay" && (
          <PayShare bill={currentBill} onBack={goHome} onPaid={goToStatus} />
        )}
      </div>
    </div>
  );
}

export default App;
