# 💸 Stellar Split

> **Split bills on the blockchain. No more chasing friends for money.**

[![Stellar](https://img.shields.io/badge/Built%20on-Stellar-7c3aed?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart%20Contract-Soroban-a78bfa?style=for-the-badge)](https://soroban.stellar.org)
[![React](https://img.shields.io/badge/Frontend-React-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Rust](https://img.shields.io/badge/Contract-Rust-f74c00?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![CI](https://github.com/SarthakKshirsagar01/stellar-split-app/actions/workflows/test.yml/badge.svg)](https://github.com/SarthakKshirsagar01/stellar-split-app/actions/workflows/test.yml)

---

## 🌐 Live Demo

🔗 **[https://stellar-split-app.vercel.app](https://stellar-split-app.vercel.app)**

## 🎥 Demo Video

▶️ **[Watch 1-minute Demo](https://www.loom.com/share/da0a8f0a4f0245fd8bdf1cb5eec963f0)**

---

## 📸 Screenshots

| Home Page                       | Create Bill                         | Bill Status                         | Pay Share                     |
| ------------------------------- | ----------------------------------- | ----------------------------------- | ----------------------------- |
| ![Home](./screenshots/home.png) | ![Create](./screenshots/create.png) | ![Status](./screenshots/status.png) | ![Pay](./screenshots/pay.png) |

### 📱 Mobile View

![Mobile](./screenshots/mobile.png)

---

## 🎯 What is Stellar Split?

Stellar Split is a decentralized bill-splitting dApp built on the **Stellar blockchain** using **Soroban smart contracts**.

The problem it solves:

> You go out with friends. One person pays. Then starts the endless chase — _"bhai send kar na"_ — that never gets resolved.

With Stellar Split:

- ✅ Create a bill on-chain in seconds
- ✅ Connect Freighter wallet and sign real transactions
- ✅ Everyone pays their exact share in XLM
- ✅ Funds release automatically when all paid
- ✅ **Zero trust required. Zero chasing needed.**

---

## ✨ Features

| Feature                 | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| 📝 **Create Bill**      | Set title, total amount, and number of participants  |
| 🧮 **Auto Split**       | Per-share amount calculated and shown instantly      |
| 🔗 **Shareable**        | Share bill link with your group                      |
| 👀 **Live Status**      | See who has paid and who hasn't in real time         |
| 🔐 **Freighter Wallet** | Connect wallet, view balance, sign real transactions |
| 💜 **Pay Share**        | Pay your portion directly with Freighter wallet      |
| ✅ **Auto Release**     | Funds release to creator when everyone has paid      |
| 🚫 **Fraud Proof**      | Smart contract prevents double payments              |
| 🪙 **SPLIT Token**      | Custom token deployed on Stellar testnet             |
| ♻️ **Cancel & Refund**  | Creator can cancel bill and refund everyone          |

---

## 🏗️ Tech Stack

| Layer              | Technology             |
| ------------------ | ---------------------- |
| **Smart Contract** | Rust + Soroban SDK v21 |
| **Blockchain**     | Stellar Testnet        |
| **Frontend**       | React.js + Vite        |
| **Wallet**         | Freighter Wallet v6    |
| **Styling**        | Custom CSS             |
| **Deployment**     | Vercel                 |
| **Testing**        | Soroban Test Framework |
| **CI/CD**          | GitHub Actions         |

---

## 📁 Project Structure

```
stellar-split/
│
├── contracts/
│   ├── hello-world/
│   │   ├── Cargo.toml              # Contract dependencies
│   │   └── src/
│   │       └── lib.rs              # Soroban split bill contract + tests
│   └── split-token/
│       ├── Cargo.toml              # Token contract dependencies
│       └── src/
│           └── lib.rs              # Custom SPLIT token contract + tests
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateBill.jsx      # Bill creation form
│   │   │   ├── BillStatus.jsx      # Payment status tracker
│   │   │   ├── PayShare.jsx        # Pay your share screen
│   │   │   └── WalletButton.jsx    # Freighter wallet connect button
│   │   ├── hooks/
│   │   │   └── useWallet.js        # Freighter wallet hook
│   │   ├── lib/
│   │   │   ├── contract.js         # Soroban contract integration
│   │   │   └── stellar.js          # Stellar transaction helpers
│   │   ├── App.jsx                 # Main app with routing
│   │   ├── index.css               # Global styles
│   │   └── main.jsx                # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── .github/
│   └── workflows/
│       └── test.yml                # CI/CD pipeline
├── screenshots/                    # Project screenshots
├── Cargo.toml                      # Workspace config
└── README.md
```

---

## 📜 Smart Contract

The Soroban contract (`lib.rs`) has **7 core functions**:

```rust
// Create a new bill
pub fn create_bill(env, creator, total_amount, participants, token) -> u64

// Pay your share — real XLM transfer
pub fn pay_share(env, bill_id, payer)

// Auto release funds when all paid
pub fn release_funds(env, bill_id) -> bool

// Cancel bill and refund everyone
pub fn cancel_bill(env, bill_id, caller)

// Get bill details and status
pub fn get_bill(env, bill_id) -> Bill

// Check if a specific address has paid
pub fn has_paid(env, bill_id, participant) -> bool

// Get total collected so far
pub fn get_collected(env, bill_id) -> i128
```

---

## 🔄 Inter-Contract Calls

This contract makes inter-contract calls to the Stellar token contract for real XLM transfers:

- **Token Contract**: Native XLM / Stellar Asset Contract
- **Call**: `token::Client::transfer()`
- **When**: Every time a participant pays their share
- **Auto Release**: Contract sends full amount to creator when all participants have paid

---

## 🔐 Freighter Wallet Integration

Users can connect their Freighter wallet to:

- View their Stellar wallet address
- Check their XLM balance in real time
- Sign and submit real transactions on Stellar Testnet
- View transaction confirmation on Stellar Explorer

---

## 📡 Deployed Contracts

### Split Bill Contract

| Network               | Testnet                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Contract ID**       | `CB5C5K372KUJQJYNISD5MSE76FMVLPJYQK5RVTZDM3SUK6JJFAMJLYL3`                                                                            |
| **Transaction**       | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/b197da03670c0b2ef0942be6128b1fa6a4e9cfd027cc1b4960b5a6e41fd3e29c) |
| **Contract Explorer** | [View on Stellar Lab](https://lab.stellar.org/r/testnet/contract/CB5C5K372KUJQJYNISD5MSE76FMVLPJYQK5RVTZDM3SUK6JJFAMJLYL3)            |
| **Wasm Hash**         | `69ba2ce96955683b7179fa4b05a598e02c87a999dfb1626a01e83bee95438e9c`                                                                    |

### 🪙 SPLIT Token Contract

| Network               | Testnet                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Token Address**     | `CCZJEXXXA6WSZSTVJVFXOY2TVMSFE4L5KFWUST363EFH4VZ2FTJO7IPA`                                                                            |
| **Token Name**        | Split Token                                                                                                                           |
| **Token Symbol**      | SPLIT                                                                                                                                 |
| **Decimals**          | 7                                                                                                                                     |
| **Transaction**       | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/5586af76ee46a2f53d170e7af38cbd84a38562a366a6329502486f0b5077d266) |
| **Contract Explorer** | [View on Stellar Lab](https://lab.stellar.org/r/testnet/contract/CCZJEXXXA6WSZSTVJVFXOY2TVMSFE4L5KFWUST363EFH4VZ2FTJO7IPA)            |
| **Wasm Hash**         | `170db76d45a5f9bc5eb25095d9152a3d9f3d129b192cbc136f63d7996a677a7c`                                                                    |

---

## 🧪 Tests

**9 tests total — all passing:**

### Split Bill Contract (5 tests)

| Test                              | Description                                    |
| --------------------------------- | ---------------------------------------------- |
| `test_create_bill`                | Bill created with correct amount and per-share |
| `test_pay_share_transfers_tokens` | Real XLM transfers on payment                  |
| `test_auto_release_when_all_paid` | Funds auto-release when all paid               |
| `test_cancel_and_refund`          | Creator can cancel and refund everyone         |
| `test_cannot_pay_twice`           | Contract rejects duplicate payments            |

### SPLIT Token Contract (4 tests)

| Test                       | Description                            |
| -------------------------- | -------------------------------------- |
| `test_initialize_and_mint` | Token initialized and minted correctly |
| `test_transfer`            | Token transfers work correctly         |
| `test_burn`                | Token burning works correctly          |
| `test_token_metadata`      | Token symbol, name, decimals correct   |

### ✅ Test Output

```
running 5 tests
test test::test_create_bill ... ok
test test::test_pay_share_transfers_tokens ... ok
test test::test_auto_release_when_all_paid ... ok
test test::test_cancel_and_refund ... ok
test test::test_cannot_pay_twice - should panic ... ok
test result: ok. 5 passed; 0 failed

running 4 tests
test test::test_initialize_and_mint ... ok
test test::test_transfer ... ok
test test::test_burn ... ok
test test::test_token_metadata ... ok
test result: ok. 4 passed; 0 failed
```

> 📸 **Screenshot:**
> ![Test Output](./screenshots/test-output.png)

---

## ⚙️ CI/CD Pipeline

[![CI Status](https://github.com/SarthakKshirsagar01/stellar-split-app/actions/workflows/test.yml/badge.svg)](https://github.com/SarthakKshirsagar01/stellar-split-app/actions/workflows/test.yml)

Pipeline runs automatically on every push:

- ✅ Split Bill Contract — 5 tests
- ✅ Split Token Contract — 4 tests
- ✅ Frontend Build

![CI Screenshot](<./screenshots/ci-screenshot.png(2)>)
![CI Screenshot](./screenshots/ci-screenshot.png)

---

## 🚀 Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli)
- [Node.js](https://nodejs.org/) v18+
- [Freighter Wallet](https://freighter.app/)

### 1. Clone the repository

```bash
git clone https://github.com/SarthakKshirsagar01/stellar-split-app.git
cd stellar-split-app
```

### 2. Run smart contract tests

```bash
cd contracts/hello-world
cargo test --lib

cd ../split-token
cargo test --lib
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎮 How to Use

**Step 1 — Connect Wallet**

- Click "Connect Wallet" in the navbar
- Approve connection in Freighter popup
- Your wallet address and XLM balance will show

**Step 2 — Create a Bill**

- Click "Create a Bill"
- Enter title, total amount in XLM, number of people
- Click "Create Bill" — transaction signed via Freighter

**Step 3 — Share with Friends**

- Share the bill link with your group

**Step 4 — Friends Pay Their Share**

- Friends connect their Freighter wallet
- Click "Pay Share" — Freighter popup opens
- Approve transaction — real XLM moves on chain

**Step 5 — Automatic Release**

- Once everyone pays, funds automatically go to creator
- View transaction on Stellar Explorer

---

## 🔐 Security Features

- **Non-custodial** — funds go directly on-chain, never held by us
- **Duplicate payment protection** — contract rejects if you try to pay twice
- **Participant validation** — only listed participants can pay
- **Cancel & Refund** — creator can cancel and everyone gets refunded
- **Immutable records** — all payments recorded permanently on Stellar

---

## 🗺️ Roadmap

| Level          | Feature                                                          | Status |
| -------------- | ---------------------------------------------------------------- | ------ |
| ✅ **Level 3** | Core bill splitting dApp with tests                              |
| ✅ **Level 4** | Real XLM transfers, CI/CD, mobile, SPLIT token, Freighter wallet |

---

## 👨‍💻 Author

**Sarthak Kshirsagar**

- GitHub: [@SarthakKshirsagar01](https://github.com/SarthakKshirsagar01)
- Built for:(https://risein.com)
  Built for: Stellar Journey to Mastery — Level 3 & Level 4

---

## 📄 License

MIT License — feel free to use and build on this project.

---

<div align="center">

**Built with 💜 on Stellar Blockchain**

</div>
