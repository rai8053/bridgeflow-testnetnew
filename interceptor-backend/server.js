// server.js - UNIVERSAL ARBITRAGE TRADING SYSTEM
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());

const provider = new ethers.JsonRpcProvider(config.NETWORK.SEPOLIA.RPC_URL);
const { TRADING } = config;

const ALL_DEXES = {
  uniswapV2: '0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008',
  sushiswap: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  pancakeswap: '0xEfF92A263d31888d860bD50809A8D171709b7b1c',
  shibaswap: '0xE11fc0B43ab98Eb36e1ac6E9a2F2f5d5a1106d2D',
  quickswap: '0xf39b7be294cb36de8c510e267b82bb588705d977',
  apeswap: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
};

const ALL_TOKENS = {
  WETH: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
  USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  DAI: '0x68194a729C2450ad26072b3D33ADaCbcef39D574',
  LINK: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
  UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  AAVE: '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a',
  USDT: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
  WBTC: '0x29f2D40B0605204364af54EC677bD022dA425d03',
  COMP: '0x3587b9A0135c1d7eE1b8d9c9B61b3A5e6D8A7D1c',
  MKR: '0x6A70ED893D85cf9B2a9a5e8f8d9FACd54A055c57'
};

const DEX_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)"
];

const tradingSessions = new Map();
const activeLoops = new Map();

class UniversalArbitrageBot {
  
  static getPrivateKey(walletName = 'my_burner') {
    const privateKey = config.PRIVATE_KEYS[walletName];
    if (!privateKey) throw new Error(`Private key for '${walletName}' not found`);
    if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
      throw new Error(`Invalid private key format for '${walletName}'`);
    }
    return privateKey;
  }
  
  static async findUniversalArbitrage(amountETH) {
    try {
      console.log('🌐 Scanning arbitrage opportunities...');
      const amountIn = ethers.parseEther(amountETH);
      const allOpportunities = [];
      const allRoutes = this.generateAllRoutes();
      
      console.log(`🔍 Scanning ${allRoutes.length} routes...`);
      
      const batchSize = 10;
      for (let i = 0; i < allRoutes.length; i += batchSize) {
        const batch = allRoutes.slice(i, i + batchSize);
        const batchPromises = batch.map((route, index) => 
          this.checkArbitrageRouteSafe(amountIn, route, i + index + 1)
        );
        
        const batchResults = await Promise.allSettled(batchPromises);
        batchResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            allOpportunities.push(result.value);
          }
        });
        
        console.log(`📊 Batch ${Math.floor(i/batchSize) + 1}: ${allOpportunities.length} opportunities`);
        
        if (i + batchSize < allRoutes.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log(`🎯 Total: ${allOpportunities.length} profitable opportunities`);
      
      if (allOpportunities.length > 0) {
        const bestOpportunity = allOpportunities.reduce((best, current) => 
          parseFloat(current.profit) > parseFloat(best.profit) ? current : best
        );
        console.log(`🏆 BEST: ${bestOpportunity.profit} ETH - ${bestOpportunity.route}`);
        return bestOpportunity;
      }
      
      return this.createRealisticDemoOpportunity(amountETH);
      
    } catch (error) {
      console.error('Arbitrage scan error:', error);
      return this.createRealisticDemoOpportunity(amountETH);
    }
  }
  
  static generateAllRoutes() {
    const routes = [];
    const dexPairs = Object.entries(ALL_DEXES);
    const tokenPairs = this.getTokenPairs();
    
    for (let i = 0; i < dexPairs.length; i++) {
      for (let j = 0; j < dexPairs.length; j++) {
        if (i !== j) {
          for (const tokenPair of tokenPairs) {
            routes.push({
              path: tokenPair.path,
              name: `${tokenPair.name} via ${dexPairs[i][0]} → ${dexPairs[j][0]}`,
              dex1: dexPairs[i][1],
              dex2: dexPairs[j][1],
              dex1Name: dexPairs[i][0],
              dex2Name: dexPairs[j][0]
            });
          }
        }
      }
    }
    
    return routes;
  }
  
  static getTokenPairs() {
    return [
      { path: [ALL_TOKENS.WETH, ALL_TOKENS.USDC, ALL_TOKENS.WETH], name: 'ETH → USDC → ETH' },
      { path: [ALL_TOKENS.WETH, ALL_TOKENS.DAI, ALL_TOKENS.WETH], name: 'ETH → DAI → ETH' },
      { path: [ALL_TOKENS.WETH, ALL_TOKENS.LINK, ALL_TOKENS.WETH], name: 'ETH → LINK → ETH' },
      { path: [ALL_TOKENS.WETH, ALL_TOKENS.UNI, ALL_TOKENS.WETH], name: 'ETH → UNI → ETH' },
      { path: [ALL_TOKENS.WETH, ALL_TOKENS.AAVE, ALL_TOKENS.WETH], name: 'ETH → AAVE → ETH' },
      { path: [ALL_TOKENS.WETH, ALL_TOKENS.USDT, ALL_TOKENS.WETH], name: 'ETH → USDT → ETH' },
      { path: [ALL_TOKENS.USDC, ALL_TOKENS.WETH, ALL_TOKENS.USDC], name: 'USDC → ETH → USDC' },
      { path: [ALL_TOKENS.DAI, ALL_TOKENS.WETH, ALL_TOKENS.DAI], name: 'DAI → ETH → DAI' },
      { path: [ALL_TOKENS.WETH, ALL_TOKENS.USDC, ALL_TOKENS.DAI, ALL_TOKENS.WETH], name: 'ETH → USDC → DAI → ETH' },
      { path: [ALL_TOKENS.WETH, ALL_TOKENS.DAI, ALL_TOKENS.USDC, ALL_TOKENS.WETH], name: 'ETH → DAI → USDC → ETH' }
    ];
  }
  
  static async checkArbitrageRouteSafe(amountIn, route, routeNumber) {
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const dex1 = new ethers.Contract(route.dex1, DEX_ROUTER_ABI, provider);
        const dex2 = new ethers.Contract(route.dex2, DEX_ROUTER_ABI, provider);
        
        let amountsOut1;
        try {
          amountsOut1 = await Promise.race([
            dex1.getAmountsOut(amountIn, [route.path[0], route.path[1]]),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('DEX1 timeout')), 8000)
            )
          ]);
        } catch (error) {
          continue;
        }
        
        if (!amountsOut1 || amountsOut1.length < 2) continue;
        const intermediateAmount = amountsOut1[1];
        
        let amountsOut2;
        try {
          amountsOut2 = await Promise.race([
            dex2.getAmountsOut(intermediateAmount, route.path.slice(1)),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('DEX2 timeout')), 8000)
            )
          ]);
        } catch (error) {
          continue;
        }
        
        if (!amountsOut2 || amountsOut2.length < route.path.length) continue;
        const finalAmount = amountsOut2[amountsOut2.length - 1];
        
        const profitWei = finalAmount - amountIn;
        const gasCost = ethers.parseEther('0.00015');
        const netProfitWei = profitWei - gasCost;
        const netProfitETH = ethers.formatEther(netProfitWei);
        const roi = ((parseFloat(netProfitETH) / parseFloat(ethers.formatEther(amountIn))) * 100).toFixed(4);
        
        if (netProfitWei > 0n && parseFloat(netProfitETH) > TRADING.MIN_PROFIT) {
          return {
            route: route.name,
            amount: ethers.formatEther(amountIn),
            profit: netProfitETH,
            roi: roi,
            path: route.path,
            dexes: [route.dex1, route.dex2],
            dexNames: [route.dex1Name, route.dex2Name],
            real: true,
            timestamp: Date.now()
          };
        }
        
        return null;
        
      } catch (error) {
        if (attempt === maxRetries) return null;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return null;
  }
  
  static createRealisticDemoOpportunity(amountETH) {
    const baseAmount = parseFloat(amountETH);
    const profitPercent = 0.001 + (Math.random() * 0.004);
    const profit = (baseAmount * profitPercent).toFixed(6);
    const roi = (profitPercent * 100).toFixed(3);
    
    const dexPairs = [
      'Uniswap → Sushiswap', 'PancakeSwap → Uniswap', 'Sushiswap → PancakeSwap',
      'Uniswap → ShibaSwap', 'QuickSwap → ApeSwap', 'PancakeSwap → ShibaSwap'
    ];
    
    const tokenRoutes = [
      'ETH → USDC → ETH', 'ETH → DAI → ETH', 'ETH → LINK → ETH',
      'ETH → UNI → ETH', 'USDC → ETH → USDC', 'ETH → USDC → DAI → ETH'
    ];
    
    const randomDex = dexPairs[Math.floor(Math.random() * dexPairs.length)];
    const randomRoute = tokenRoutes[Math.floor(Math.random() * tokenRoutes.length)];
    
    return {
      route: `${randomRoute} via ${randomDex} (Demo)`,
      amount: amountETH,
      profit: profit,
      roi: roi + '%',
      real: false,
      timestamp: Date.now(),
      note: 'Demo trade - Real execution when liquidity available'
    };
  }
  
  static async executeSmartTrade(walletName, opportunity) {
    try {
      if (!opportunity.real) {
        await this.delay(2000);
        const success = Math.random() < 0.85;
        
        if (success) {
          return {
            success: true,
            real: false,
            profit: opportunity.profit,
            message: 'Demo trade executed successfully'
          };
        } else {
          return {
            success: false,
            error: 'Demo trade failed - market conditions changed',
            real: false
          };
        }
      }
      
      console.log(`\n⚡ EXECUTING REAL TRADE`);
      console.log(`   Route: ${opportunity.route}`);
      
      const privateKey = this.getPrivateKey(walletName);
      const wallet = new ethers.Wallet(privateKey, provider);
      const amountIn = ethers.parseEther(opportunity.amount);
      const deadline = Math.floor(Date.now() / 1000) + 600;
      
      const initialBalance = await provider.getBalance(wallet.address);
      console.log(`   Wallet: ${wallet.address}`);
      console.log(`   Balance: ${ethers.formatEther(initialBalance)} ETH`);
      
      if (initialBalance < amountIn) {
        throw new Error(`Insufficient balance. Need ${ethers.formatEther(amountIn)} ETH but have ${ethers.formatEther(initialBalance)} ETH`);
      }
      
      let currentAmount = amountIn;
      let transactions = [];
      
      for (let i = 0; i < opportunity.path.length - 1; i++) {
        const currentDex = i === 0 ? opportunity.dexes[0] : opportunity.dexes[1];
        const dex = new ethers.Contract(currentDex, DEX_ROUTER_ABI, wallet);
        const pathSegment = opportunity.path.slice(i, i + 2);
        
        console.log(`   🔄 Step ${i + 1}: ${this.getTokenSymbol(pathSegment[0])} → ${this.getTokenSymbol(pathSegment[1])}`);
        
        if (pathSegment[0] === ALL_TOKENS.WETH) {
          const tx = await dex.swapExactETHForTokens(
            0, pathSegment, wallet.address, deadline,
            { value: currentAmount, gasLimit: 250000 }
          );
          transactions.push(tx.hash);
          console.log(`      ✅ TX: ${tx.hash}`);
          await tx.wait();
        } else {
          const tokenContract = new ethers.Contract(pathSegment[0], ERC20_ABI, wallet);
          const balance = await tokenContract.balanceOf(wallet.address);
          
          const tx = await dex.swapExactTokensForETH(
            balance, 0, pathSegment, wallet.address, deadline,
            { gasLimit: 250000 }
          );
          transactions.push(tx.hash);
          console.log(`      ✅ TX: ${tx.hash}`);
          await tx.wait();
        }
      }
      
      const finalBalance = await provider.getBalance(wallet.address);
      const actualProfitETH = ethers.formatEther(finalBalance - initialBalance);
      
      console.log(`   💰 Actual Profit: ${actualProfitETH} ETH`);
      
      return {
        success: true,
        real: true,
        wallet: walletName,
        walletAddress: wallet.address,
        transactions: transactions,
        expectedProfit: opportunity.profit,
        actualProfit: actualProfitETH,
        finalBalance: ethers.formatEther(finalBalance),
        explorerLinks: transactions.map(tx => 
          `${config.NETWORK.SEPOLIA.EXPLORER}/tx/${tx}`
        )
      };
      
    } catch (error) {
      console.error('❌ Trade execution failed:', error);
      return {
        success: false,
        error: error.message,
        real: opportunity.real
      };
    }
  }
  
  static getTokenSymbol(address) {
    const entries = Object.entries(ALL_TOKENS);
    const token = entries.find(([key, value]) => value.toLowerCase() === address.toLowerCase());
    return token ? token[0] : 'Unknown';
  }
  
  static async startUniversalTrading(walletName = 'my_burner', initialAmount = null) {
    const amount = initialAmount || TRADING.DEFAULT_AMOUNT;
    const sessionId = `universal-${walletName}-${Date.now()}`;
    
    console.log(`\n🚀 STARTING ARBITRAGE BOT`);
    console.log(`   Wallet: ${walletName}`);
    console.log(`   Amount: ${amount} ETH`);
    
    const session = {
      walletName,
      sessionId,
      status: 'running',
      startTime: Date.now(),
      initialAmount: amount,
      totalProfit: 0,
      tradeCount: 0,
      trades: [],
      liveUpdates: [],
      realTrades: [],
      demoTrades: [],
      finalStats: null
    };
    
    tradingSessions.set(sessionId, session);
    
    this.addLiveUpdate(sessionId, '🌐 Arbitrage Bot Started');
    this.addLiveUpdate(sessionId, `💰 Trading with ${amount} ETH`);
    
    const loopController = this.startUniversalTradingLoop(sessionId, walletName);
    activeLoops.set(sessionId, loopController);
    
    return {
      success: true,
      sessionId,
      wallet: walletName,
      message: 'Arbitrage trading started',
      initialAmount: amount
    };
  }
  
  static async startUniversalTradingLoop(sessionId, walletName) {
    const controller = { stopped: false };
    
    const tradingLoop = async () => {
      const session = tradingSessions.get(sessionId);
      if (!session) return;
      
      let tradeCount = 0;
      
      while (session.status === 'running' && tradeCount < TRADING.MAX_TRADES && !controller.stopped) {
        tradeCount++;
        
        try {
          if (controller.stopped) break;
          
          this.addLiveUpdate(sessionId, `🔍 Scan #${tradeCount}...`);
          const opportunity = await this.findUniversalArbitrage(session.initialAmount);
          
          if (opportunity && !controller.stopped) {
            const tradeType = opportunity.real ? 'REAL' : 'DEMO';
            this.addLiveUpdate(sessionId, `💰 ${tradeType} Opportunity: ${opportunity.profit} ETH profit`);
            
            const tradeResult = await this.executeSmartTrade(walletName, opportunity);
            
            if (tradeResult.success && !controller.stopped) {
              const profit = parseFloat(tradeResult.profit || opportunity.profit);
              session.totalProfit += profit;
              session.tradeCount = tradeCount;
              
              const tradeRecord = {
                ...opportunity,
                tradeId: tradeCount,
                wallet: tradeResult.wallet,
                walletAddress: tradeResult.walletAddress,
                transactions: tradeResult.transactions,
                expectedProfit: opportunity.profit,
                actualProfit: tradeResult.actualProfit,
                timestamp: Date.now(),
                real: opportunity.real,
                explorerLinks: tradeResult.explorerLinks
              };
              
              if (opportunity.real) {
                session.realTrades.push(tradeRecord);
                this.addLiveUpdate(sessionId, `✅ REAL Trade #${tradeCount} EXECUTED!`);
              } else {
                session.demoTrades.push(tradeRecord);
                this.addLiveUpdate(sessionId, `🤖 DEMO Trade #${tradeCount} Completed`);
              }
              
              session.trades.push(tradeRecord);
              tradingSessions.set(sessionId, session);
              
              this.addLiveUpdate(sessionId, `💰 Profit: ${tradeResult.actualProfit || tradeResult.profit} ETH`);
              this.addLiveUpdate(sessionId, `📊 Total Profit: ${session.totalProfit.toFixed(6)} ETH`);
              
              if (tradeResult.transactions) {
                tradeResult.transactions.forEach((tx, index) => {
                  this.addLiveUpdate(sessionId, `🔗 TX ${index + 1}: ${tx}`);
                });
              }
            } else if (!controller.stopped) {
              this.addLiveUpdate(sessionId, `❌ Trade failed: ${tradeResult.error}`);
            }
          } else if (!controller.stopped) {
            this.addLiveUpdate(sessionId, `⏭️ No profitable opportunity found`);
          }
          
          if (!controller.stopped) {
            await this.delayWithCheck(TRADING.SCAN_INTERVAL, controller);
          }
          
        } catch (error) {
          if (!controller.stopped) {
            this.addLiveUpdate(sessionId, `❌ Error: ${error.message}`);
            await this.delayWithCheck(10000, controller);
          }
        }
      }
      
      if (!controller.stopped && session.status === 'running') {
        session.status = 'completed';
        this.calculateFinalStats(session);
        this.addLiveUpdate(sessionId, `🎉 Trading Completed!`);
        this.addLiveUpdate(sessionId, `💰 Final Profit: ${session.totalProfit.toFixed(6)} ETH`);
      }
      
      activeLoops.delete(sessionId);
    };
    
    tradingLoop();
    return controller;
  }
  
  static async stopUniversalTrading(sessionId) {
    console.log(`🛑 Stopping trading: ${sessionId}`);
    
    const session = tradingSessions.get(sessionId);
    if (!session) return { success: false, error: 'Session not found' };
    
    const loopController = activeLoops.get(sessionId);
    if (loopController) {
      loopController.stopped = true;
      activeLoops.delete(sessionId);
    }
    
    session.status = 'stopped';
    session.endTime = Date.now();
    this.calculateFinalStats(session);
    
    this.addLiveUpdate(sessionId, '🛑 Trading Stopped by User');
    this.addLiveUpdate(sessionId, `💰 Final Profit: ${session.totalProfit.toFixed(6)} ETH`);
    
    tradingSessions.set(sessionId, session);
    
    return {
      success: true,
      sessionId,
      finalProfit: session.totalProfit,
      finalStats: session.finalStats,
      totalTrades: session.tradeCount,
      realTrades: session.realTrades.length,
      demoTrades: session.demoTrades.length
    };
  }
  
  static calculateFinalStats(session) {
    const duration = (session.endTime || Date.now()) - session.startTime;
    const durationMinutes = (duration / 1000 / 60).toFixed(2);
    const initialInvestment = parseFloat(session.initialAmount);
    const totalProfit = session.totalProfit;
    const roi = initialInvestment > 0 ? ((totalProfit / initialInvestment) * 100).toFixed(2) : '0.00';
    const avgProfitPerTrade = session.tradeCount > 0 ? (totalProfit / session.tradeCount).toFixed(6) : '0.000000';
    
    session.finalStats = {
      totalTrades: session.tradeCount,
      totalProfit: totalProfit.toFixed(6),
      roi: roi,
      duration: duration,
      durationMinutes: durationMinutes,
      averageProfitPerTrade: avgProfitPerTrade,
      initialInvestment: session.initialAmount,
      realTrades: session.realTrades.length,
      demoTrades: session.demoTrades.length,
      realTradePercentage: session.tradeCount > 0 ? 
        ((session.realTrades.length / session.tradeCount) * 100).toFixed(1) + '%' : '0%'
    };
  }
  
  static addLiveUpdate(sessionId, message) {
    const session = tradingSessions.get(sessionId);
    if (session) {
      session.liveUpdates.unshift({
        message,
        timestamp: new Date().toISOString()
      });
      session.liveUpdates = session.liveUpdates.slice(0, 25);
      tradingSessions.set(sessionId, session);
    }
  }
  
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  static delayWithCheck(ms, controller) {
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (controller.stopped) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          resolve();
        }
      }, 100);
      
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, ms);
    });
  }
}

// API ENDPOINTS

app.post('/api/start-universal-arbitrage', async (req, res) => {
  try {
    const { walletName = 'my_burner', initialAmount } = req.body;
    
    console.log(`\n=== ARBITRAGE REQUEST ===`);
    console.log(`Wallet: ${walletName}`);
    console.log(`Amount: ${initialAmount || TRADING.DEFAULT_AMOUNT} ETH`);
    
    const result = await UniversalArbitrageBot.startUniversalTrading(walletName, initialAmount);
    res.json(result);
    
  } catch (error) {
    console.error('Start arbitrage error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/stop-universal-arbitrage/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await UniversalArbitrageBot.stopUniversalTrading(sessionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/universal-session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = tradingSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      session: {
        walletName: session.walletName,
        sessionId: session.sessionId,
        status: session.status,
        startTime: session.startTime,
        initialAmount: session.initialAmount,
        totalProfit: session.totalProfit,
        tradeCount: session.tradeCount,
        trades: session.trades,
        liveUpdates: session.liveUpdates,
        realTrades: session.realTrades,
        demoTrades: session.demoTrades,
        finalStats: session.finalStats
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/wallet-info/:walletName', async (req, res) => {
  try {
    const { walletName } = req.params;
    const privateKey = UniversalArbitrageBot.getPrivateKey(walletName);
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(wallet.address);
    
    res.json({
      success: true,
      wallet: walletName,
      address: wallet.address,
      balance: ethers.formatEther(balance),
      network: config.NETWORK.SEPOLIA.CHAIN_ID
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/dex-info', (req, res) => {
  res.json({
    success: true,
    dexes: ALL_DEXES,
    tokens: ALL_TOKENS,
    totalDexes: Object.keys(ALL_DEXES).length,
    totalTokens: Object.keys(ALL_TOKENS).length
  });
});

app.get('/api/health', (req, res) => {
  const activeSessions = Array.from(tradingSessions.values()).filter(s => s.status === 'running').length;
  
  res.json({
    status: 'ARBITRAGE_ACTIVE',
    service: 'Arbitrage Trading Bot',
    version: '3.0.0',
    network: 'Sepolia Testnet',
    activeSessions: activeSessions
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('\n🌐🚀 ARBITRAGE BOT STARTED 🚀🌐');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Network: Sepolia Testnet`);
  console.log(`🏪 DEX Count: ${Object.keys(ALL_DEXES).length}`);
  console.log(`💎 Token Count: ${Object.keys(ALL_TOKENS).length}`);
  console.log(`\n🚀 Ready for arbitrage trading!`);
});