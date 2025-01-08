import React, { useState, useEffect } from 'react';
import { TradingChart } from './components/TradingChart';
import { useTrading } from './hooks/useTrading';
import { ArrowUpCircle, ArrowDownCircle, LineChart, Wallet, History, Binary, Bell } from 'lucide-react';
import { TradingPair } from './types/trading';

function Header() {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Binary className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-white">QuantumTrade Pro</h1>
              <p className="text-xs text-gray-400">Advanced Algorithmic Trading</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300">
              <span className="text-green-500">●</span> Market Open
            </div>
            <button className="p-2 hover:bg-gray-700 rounded-full relative">
              <Bell className="w-5 h-5 text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function ErrorNotification({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      {message}
    </div>
  );
}

// Generate historical data for the chart
const generateHistoricalData = () => {
  const data = [];
  let price = 50000;
  const now = new Date();
  
  for (let i = 100; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const volatility = price * 0.02;
    const open = price + (Math.random() - 0.5) * volatility;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = (high + low) / 2;
    
    data.push({
      time: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
    });
    
    price = close;
  }
  
  return data;
};

export default function App() {
  const { portfolio, placeOrder, updatePositionValues } = useTrading();
  const [currentPrice, setCurrentPrice] = useState(50000);
  const [amount, setAmount] = useState(1);
  const [chartData] = useState(() => generateHistoricalData());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPrice = currentPrice * (1 + (Math.random() - 0.5) * 0.002);
      setCurrentPrice(newPrice);
      updatePositionValues({ 'BTC/USD': newPrice });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPrice, updatePositionValues]);

  const handleTrade = (side: 'buy' | 'sell') => {
    try {
      if (amount > 0) {
        placeOrder('market', side, 'BTC/USD', amount, currentPrice);
      } else {
        setError('Invalid amount');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      {error && <ErrorNotification message={error} onClose={() => setError(null)} />}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Summary */}
          <div className="lg:col-span-3 bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Portfolio Value</h2>
                <p className="text-4xl font-bold text-green-500">
                  ${portfolio.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <Wallet className="w-12 h-12 text-green-500" />
            </div>
          </div>

          {/* Chart */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">BTC/USD</h2>
              <LineChart className="w-6 h-6 text-blue-500" />
            </div>
            <TradingChart data={chartData} />
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold">${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Trading Interface */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Trading</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount (BTC)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-gray-700 rounded p-2 text-white"
                  step="0.01"
                  min="0.01"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleTrade('buy')}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 px-4 transition-colors"
                >
                  <ArrowUpCircle className="w-5 h-5" />
                  Buy
                </button>
                <button
                  onClick={() => handleTrade('sell')}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 px-4 transition-colors"
                >
                  <ArrowDownCircle className="w-5 h-5" />
                  Sell
                </button>
              </div>
            </div>

            {/* Position */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Current Position</h3>
              {portfolio.positions.map(position => (
                <div key={position.pair} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span>{position.pair}</span>
                    <span>{position.amount.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span>Avg. Price</span>
                    <span>${position.averagePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span>P&L</span>
                    <span className={position.unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}>
                      ${position.unrealizedPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Trades */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Recent Trades</h3>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {portfolio.trades.slice().reverse().map(trade => (
                  <div key={trade.id} className="bg-gray-700 rounded-lg p-2 text-sm">
                    <div className="flex justify-between">
                      <span className={trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                        {trade.type.toUpperCase()}
                      </span>
                      <span>{trade.amount.toFixed(4)} BTC</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>${trade.price.toLocaleString()}</span>
                      <span>${trade.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}