# 🧩 Blockchain-Based Credential Verification System

## 📘 About the Project

This project is a **Blockchain-based Credential Verification System** that enables secure verification of academic credentials using Ethereum smart contracts.  
It leverages **Smart Contracts (Solidity)**, **Truffle**, **Ganache**, and **MetaMask** for blockchain operations, and a **React + Vite frontend** for user interaction.

### 🎯 Key Features

- Decentralized storage of credential verification data.
- Multi-university approval system (requires at least 2 university approvals by default).
- Easy integration with MetaMask wallet.
- Local blockchain deployment using Ganache.
- Frontend and backend integration for end-to-end testing.

---

## 🧰 Tech Stack

| Layer                  | Technology                          |
| ---------------------- | ----------------------------------- |
| **Smart Contract**     | Solidity                            |
| **Blockchain Network** | Ganache (Ethereum local blockchain) |
| **Framework**          | Truffle                             |
| **Frontend**           | React + Vite                        |
| **Wallet**             | MetaMask                            |
| **Backend**            | Node.js / Express                   |

---

## 🚀 Setup Instructions

### 1. Start Ganache

- Open **Ganache** and start your workspace.
- Ensure the RPC Server URL is:
  http://127.0.0.1:7545

### 2. Connect MetaMask

- Open **MetaMask** → **Add Network** manually:
- **Network Name:** Ganache Local
- **New RPC URL:** `http://127.0.0.1:7545`
- **Chain ID:** `1337` (or Ganache default)
- **Currency Symbol:** ETH
- Import one of your **Ganache accounts** using its **private key**.

---

### 3. Install Backend Dependencies

In the **root project folder**, run:

```bash
npm install
```

### 4. Deploy Smart Contracts

Use Truffle to compile and deploy contracts to Ganache:

```bash
truffle migrate --reset
```

### 5. Start Backend Server

Run the backend in the root folder:

```bash
npm run dev
```

By default, the app runs at:
http://localhost:5000

### 6. Setup Frontend

Go to the frontend folder and install dependencies:

```bash
cd dau-frontend
npm install

```

### 7. Run Frontend

Start the frontend application:

```bash
npm run dev

```

By default, the app runs at:
http://localhost:5173
