# 🚀 BridgeFlow Testnet – Universal Multi-DEX Arbitrage Trading System

BridgeFlow is a **full-stack arbitrage simulation platform** built for the  
**Ethereum Sepolia Testnet**. It includes:

- ⚙️ A Node.js **backend arbitrage engine**
- 💻 A React + Vite **frontend dashboard**
- 🔗 MetaMask **Web3 wallet integration**
- 📡 Live **Uniswap V2/V3 price scanning**
- 🤖 Optional **auto-trading simulation mode**
- 📊 Real-time analytics: profits, trades, signals

> ⚠️ **Important:**  
> This project is for **learning, testing and simulation only**.  
> It does **NOT** guarantee real profits and runs on the **testnet only**.

---

# ⭐ Features

### 🔄 Multi-DEX Price Scanner
- Uniswap V2 & V3 router scanning  
- `getAmountsOut()` live price comparison  
- Cross-DEX arbitrage detection  
- Triangular route analysis  

### ⚙️ Trading Engine
- Auto-mode and manual simulation  
- Gas estimation  
- Slippage protection  
- BigInt profit calculation  
- Testnet-safe execution  

### 📊 Dashboard (Frontend)
- Wallet balance display  
- Bot status  
- Profit & trade counter  
- Arbitrage signals  
- Live price feeds  
- Dark/light UI (if enabled)

### 🔐 Security
- Non-custodial MetaMask connection  
- Private key stored only in `.env` (backend)  
- Testnet-only flow  

---

# 📁 Project Structure

```
bridgeflow-testnetnew/
│
├── interceptor-backend/         # Backend Arbitrage Engine
│   ├── server.js
│   ├── config.js
│   ├── .env.example
│   └── package.json
│
├── interceptor-frontend/        # React Dashboard UI
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── package.json
```

---

# ⚡ Quickstart (3 Commands)

```bash
git clone https://github.com/rai8053/bridgeflow-testnetnew
cd bridgeflow-testnetnew/interceptor-backend && npm install && npm start
cd ../interceptor-frontend && npm install && npm run dev
```

Your dashboard will be available at:

👉 **http://localhost:3000**

Backend runs at:

👉 **http://localhost:3001**

---

# 🔧 Backend Setup (Arbitrage Engine)

### 1️⃣ Enter backend folder
```bash
cd interceptor-backend
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Create your `.env` file
```bash
nano .env
```

Paste this:

```env
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0xYOUR_TESTNET_PRIVATE_KEY
WALLET_ADDRESS=YOUR_PUBLIC_WALLET
SLIPPAGE=0.5
AUTO_TRADE=true
GAS_STRATEGY=fast
PORT=3001
```

⚠️ Use a **testnet wallet only**.

### 4️⃣ Start backend
```bash
npm start
```

Expected logs:
```
✔ Connected to Sepolia
✔ Scanning Uniswap pools...
✔ Waiting for arbitrage opportunities...
```

---

# 💻 Frontend Setup (Dashboard UI)

### 1️⃣ Enter frontend folder
```bash
cd interceptor-frontend
```

### 2️⃣ Install frontend dependencies
```bash
npm install
```

### 3️⃣ Start dev server
```bash
npm run dev
```

Frontend will launch at:

👉 http://localhost:3000

---

# 🔗 Web3 Setup (MetaMask + Ethers.js)

## 🦊 Install MetaMask
Download from:  
https://metamask.io

---

## 🌐 Add Sepolia Testnet to MetaMask

Go to **Networks → Add Network → Add manually**:

```
Network Name: Sepolia
RPC URL: https://rpc.sepolia.org
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer: https://sepolia.etherscan.io
```

Save it.

---

## 🪙 Get Sepolia Testnet ETH  
Needed for simulated gas usage.

Faucets:

- https://sepoliafaucet.com  
- https://www.alchemy.com/faucets/ethereum-sepolia  

---

# 📦 Web3 Installation (Frontend)

Inside `interceptor-frontend` run:

### Install ethers.js
```bash
npm install ethers
```

### (Optional) Wallet detection
```bash
npm install @metamask/detect-provider
```

### (Optional) Wagmi + Viem
```bash
npm install wagmi viem
```

---

# 🔌 Wallet Connection Example (React)

```javascript
import { ethers } from "ethers";

async function connectWallet() {
  if (!window.ethereum) {
    alert("Install MetaMask!");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  console.log("Connected:", accounts[0]);
}
```

Button example:

```jsx
<button onClick={connectWallet}>Connect Wallet</button>
```

---

# 📡 Force Switch to Sepolia (JS)

```javascript
await window.ethereum.request({
  method: "wallet_switchEthereumChain",
  params: [{ chainId: "0xaa36a7" }]  // Hex for 11155111
});
```

---

# 📦 Environment Variables Summary

| Variable | Description |
|---------|-------------|
| `RPC_URL` | Sepolia RPC endpoint |
| `PRIVATE_KEY` | Testnet private key |
| `WALLET_ADDRESS` | Public address |
| `SLIPPAGE` | Allowed price impact |
| `AUTO_TRADE` | true/false simulation |
| `GAS_STRATEGY` | fast / medium / slow |
| `PORT` | Backend port |

---

# 🧩 Supported DEXes (Sepolia Verified)

| Exchange | Version | Status |
|----------|---------|--------|
| Uniswap | V2 | ✅ Active |
| Uniswap | V3 | ✅ Active |

> ⚠️ Note: PancakeSwap, QuickSwap, ApeSwap, ShibaSwap **are NOT deployed** on Sepolia.  
> Do not include them unless YOU deploy custom routers.

---

# 🪙 Supported Tokens (Sepolia Testnet)

- WETH  
- USDC  
- DAI  
- LINK  
- UNI  

You must update your router + token addresses accordingly in your backend config.

---

# 🏗 Architecture Diagram

```
[ React Dashboard ]  <---->  [ Node.js Arbitrage Backend ]
         |                             |
  MetaMask Wallet                 Ethers.js Provider
         |                             |
         v                             v
     User Actions   <---->   Sepolia RPC Node  <---->  Uniswap V2/V3 Routers
```

---

# 🧰 Developer Commands

### Backend
```bash
npm start
npm test
npm run lint
```

### Frontend
```bash
npm run dev
npm run build
npm run preview
```

---

# ⚠️ Troubleshooting

### ❌ MetaMask Not Connecting
- Check browser permissions  
- Make sure you're on Sepolia  
- Clear cache  

### ❌ Backend Not Starting
- Invalid `.env`  
- Wrong RPC URL  
- Missing token/router addresses  

### ❌ No Arbitrage Found
- Testnet has low volatility  
- Try increasing `SLIPPAGE` to `1.0`  
- Try again later  

---

# 📘 License
This project is licensed under the **MIT License**.

---

# 🙋 Support
Open an issue here:

👉 https://github.com/rai8053/bridgeflow-testnetnew/issues

Developed by **Raihan Hazra (rai8053)**  
