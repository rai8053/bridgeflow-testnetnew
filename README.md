# 🚀 BridgeFlow Testnet – Universal Multi-DEX Arbitrage Trading System
A complete real-time arbitrage engine and analytics dashboard built for the **Ethereum Sepolia Testnet**, capable of scanning multiple decentralized exchanges, detecting profitable price differences, and executing automated trades – all through a powerful, modern UI.

---

## 🌐 Overview

BridgeFlow consists of:

- ⚙️ **Backend Arbitrage Engine** (Node.js)
- 💻 **Frontend Dashboard** (React + Vite)
- 🔗 **Web3 Wallet Integration** (MetaMask)
- 📡 **DEX Price Scanners** (Uniswap, SushiSwap, PancakeSwap, etc.)
- 📊 **Real-Time Analytics**
- 🤖 **Auto-Execution Trading Mode**

This system is designed for **testnet experimentation**, learning MEV/arbitrage strategies, and simulating real DEX operations safely.

---

## 🖥️ Features

### 🔄 Multi-DEX Price Scanning
- Monitors prices across 6+ DEXs  
- Supports V2 + V3 pools  
- Detects cross-DEX price gaps  
- Identifies triangular arbitrage routes  

### ⚙️ Backend Trading Engine
- Gas-optimized trade execution  
- Slippage protection  
- Auto mode + manual mode  
- Real-time logging  
- Profit calculation after gas  

### 💹 Dashboard & Analytics
- Total profit & trade count  
- Wallet balance (Sepolia)  
- Bot status (IDLE / RUNNING)  
- Arbitrage alerts  
- Token pairs monitoring  

### 🔐 Security
- Non-custodial wallet usage  
- Private keys stored locally through environment variables  
- Testnet environment only  
- Gas estimation checks  

---

## 📦 Project Folder Structure

```
bridgeflow-testnetnew/
│
├── backend/
│   ├── server.js
│   ├── services/
│   ├── arbitrage/
│   ├── config/
│   ├── logs/
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

# 🔧 1. Install System Dependencies

### Update system (Linux recommended)
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs
node -v
```

### Install Git
```bash
sudo apt install git -y
git --version
```

---

# 📥 2. Clone the Repository

```bash
git clone https://github.com/rai8053/bridgeflow-testnetnew.git
cd bridgeflow-testnetnew
```

---

# ⚙️ 3. Backend Setup (Arbitrage Engine)

### Enter backend directory:
```bash
cd backend
```

### Install required packages:
```bash
npm install
```

### Create environment file:
```bash
nano .env
```

Paste and modify:

```env
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=YOUR_PRIVATE_KEY
WALLET_ADDRESS=YOUR_PUBLIC_ADDRESS
SLIPPAGE=0.5
AUTO_TRADE=true
GAS_STRATEGY=fast
```

Save → (CTRL + X → Y → ENTER)

### Start backend:
```bash
npm start
```

Expected output:
```
✔ Connected to Sepolia
✔ Scanning DEX pools...
✔ Waiting for arbitrage opportunities...
```

---

# 💻 4. Frontend Setup (Dashboard UI)

### Enter frontend:
```bash
cd ../frontend
```

### Install dependencies:
```bash
npm install
```

### Start dashboard:
```bash
npm run dev
```

Dashboard will run at:

👉 **http://localhost:3000**

---

# 📊 5. Dashboard Overview

Your dashboard displays:

- Total Profit  
- Total Trades  
- Bot Running Status  
- Trading Balance  
- DEX scanner output  
- Arbitrage signals  
- Wallet info (Sepolia ETH)  
- Live metrics  

```
[  Dashboard Preview Removed: User Requested  ]
```

---

# 🔄 6. Supported DEXs (Sepolia)

| Exchange | Version | Status |
|----------|---------|--------|
| Uniswap | V2 + V3 | ✅ Active |
| Sushiswap | V2 | ✅ Active |
| PancakeSwap | V2 | ✅ Active |
| ShibaSwap | V1 | ✅ Active |
| QuickSwap | V2 | ✅ Active |
| ApeSwap | V2 | ✅ Active |

---

# 🪙 7. Supported Token Pairs

### Major Tokens
- WETH  
- USDC  
- DAI  
- USDT  
- WBTC  

### DeFi Tokens
- LINK  
- UNI  
- AAVE  
- COMP  
- MKR  

---

# 🚀 8. Production Mode (Optional)

You can run backend in PM2:

```bash
npm install pm2 -g
pm2 start server.js --name bridgeflow
pm2 logs bridgeflow
```

---

# 👨‍💻 9. Developer Commands

### Backend
```bash
npm start
npm run lint
npm run test
```

### Frontend
```bash
npm run dev
npm run build
npm run preview
```

---

# ⚠️ 10. Troubleshooting

### ❌ MetaMask Not Connecting  
- Enable Sepolia in networks  
- Refresh webpage  
- Clear browser cache  

### ❌ Backend Not Starting  
- Check `.env`  
- Ensure RPC URL is valid  
- Wallet must have Sepolia ETH  

### ❌ No Arbitrage Signals  
- Low volatility  
- Try again later  
- Increase `SLIPPAGE` to 1.0  

---

# 📘 11. License

This project is under the **MIT License**.

---

# 🙋 Support
For issues, create a GitHub issue here:  
https://github.com/rai8053/bridgeflow-testnetnew/issues

Developed by **Raihan Hazra (rai8053)**  
