// config.js - SECURE CONFIGURATION
module.exports = {
  // 🔐 PRIVATE KEYS - NEVER COMMIT TO GIT!
  PRIVATE_KEYS: {
    'my_burner': 'your private key here'
  },
  
  // Network Configuration
  NETWORK: {
    SEPOLIA: {
      RPC_URL: 'https://ethereum-sepolia-rpc.publicnode.com',
      CHAIN_ID: 11155111,
      EXPLORER: 'https://sepolia.etherscan.io'
    }
  },
  
  // Trading Configuration
  TRADING: {
    DEFAULT_AMOUNT: '0.001',
    MAX_TRADES: 15,
    MIN_PROFIT: 0.00001,
    SCAN_INTERVAL: 25000
  }
};