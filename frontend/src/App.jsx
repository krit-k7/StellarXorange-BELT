import WalletButton from "./components/WalletButton";
import { useState } from "react";

import CreateBill from "./components/CreateBill";
import BillStatus from "./components/BillStatus";
import PayShare from "./components/PayShare";

function App() {
  const [page, setPage] = useState("home");
  const [currentBill, setCurrentBill] = useState(null);


  const goHome = () => {
    setPage("home");
  };


  const goToCreate = () => {
    setPage("create");
  };


  const goToStatus = (bill) => {
    setCurrentBill(bill);
    setPage("status");
  };


  const goToPay = (bill) => {
    setCurrentBill(bill);
    setPage("pay");
  };



  return (

    <div className="app">


      {/* NAVBAR */}


      <nav className="navbar">


        <button
          className="logo"
          onClick={goHome}
        >

          💸 Stellar Split

        </button>


        <WalletButton />


      </nav>






      <main className="container">



        {/* HOME PAGE */}


        {page === "home" && (


          <section className="hero">



            <div className="badge">

              ⚡ Powered by Stellar Network

            </div>





            <h1>

              Smart Bill Splitting
              
              <span> On Blockchain</span>

            </h1>





            <p>

              Split expenses, collect payments and settle
              instantly with secure Stellar smart contracts.

            </p>






            <div className="btn-row">



              <button
                className="btn-primary"
                onClick={goToCreate}
              >

                🚀 Create Bill

              </button>





              <button

                className="btn-outline"


                onClick={() =>

                  goToPay({

                    id:1,

                    title:"Demo Bill",

                    total:1000,

                    perShare:500,

                    participants:2,

                    paid:0,

                  })

                }

              >

                💳 Demo Payment

              </button>



            </div>







            <div className="cards">



              <div className="card">


                <div className="card-icon">

                  🧾

                </div>


                <h3>

                  Create

                </h3>


                <p>

                  Create a bill and automatically divide
                  payments among friends.

                </p>


              </div>







              <div className="card">


                <div className="card-icon">

                  🔗

                </div>



                <h3>

                  Share

                </h3>



                <p>

                  Share payment requests securely using
                  blockchain powered links.

                </p>



              </div>








              <div className="card">


                <div className="card-icon">

                  ⚡

                </div>



                <h3>

                  Settle

                </h3>



                <p>

                  Receive fast and transparent settlements
                  on Stellar network.

                </p>


              </div>



            </div>




          </section>

        )}









        {/* CREATE BILL PAGE */}


        {page === "create" && (


          <div className="form-page">


            <CreateBill

              onBack={goHome}

              onCreated={goToStatus}

            />


          </div>


        )}









        {/* STATUS PAGE */}


        {page === "status" && (


          <div className="bill-page">


            <BillStatus


              bill={currentBill}


              onBack={goHome}


              onPay={goToPay}


            />


          </div>


        )}








        {/* PAYMENT PAGE */}



        {page === "pay" && (



          <div className="bill-page payment-box">



            <PayShare


              bill={currentBill}


              onBack={goHome}


              onPaid={goToStatus}


            />



          </div>


        )}







      </main>


    </div>


  );

}



export default App;
