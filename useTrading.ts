import { useState } from 'react';
import { TradingPair } from '../types/trading';

export const useTrading = () => {
  const [portfolio, setPortfolio] = useState({
    balance: 100000,
    positions: [] as { pair: TradingPair; amount: number; averagePrice: number; unrealizedPnL: number }[],
    trades: [] as { id: string; type: 'buy' | 'sell'; pair: TradingPair; amount: number; price: number; total: number }[],
    totalValue: 100000,
  });

  const placeOrder = (orderType: 'market', side: 'buy' | 'sell', pair: TradingPair, amount: number, price: number) => {
    console.log(`Placing ${side} order for ${amount} ${pair} at $${price}`);
    console.log('Current portfolio:', portfolio);
  
    if (side === 'buy') {
      const totalCost = amount * price;
      if (portfolio.balance >= totalCost) {
        setPortfolio(prev => ({
          ...prev,
          balance: prev.balance - totalCost,
        }));
        const existingPosition = portfolio.positions.find(p => p.pair === pair);
        if (existingPosition) {
          const newAmount = existingPosition.amount + amount;
          const newAveragePrice = (existingPosition.averagePrice * existingPosition.amount + price * amount) / newAmount;
          setPortfolio(prev => ({
            ...prev,
            positions: prev.positions.map(p =>
              p.pair === pair
                ? { ...p, amount: newAmount, averagePrice: newAveragePrice }
                : p
            ),
          }));
        } else {
          setPortfolio(prev => ({
            ...prev,
            positions: [...prev.positions, { pair, amount, averagePrice: price, unrealizedPnL: 0 }],
          }));
        }
        setPortfolio(prev => ({
          ...prev,
          trades: [...prev.trades, { id: String(Date.now()), type: 'buy', pair, amount, price, total: totalCost }],
        }));
      } else {
        console.error('Insufficient balance to buy');
      }
    } else if (side === 'sell') {
      const position = portfolio.positions.find(p => p.pair === pair);
      console.log('Position to sell:', position);
  
      if (position && position.amount >= amount) {
        const totalValue = amount * price;
        setPortfolio(prev => ({
          ...prev,
          balance: prev.balance + totalValue,
        }));
        const newAmount = position.amount - amount;
        if (newAmount > 0) {
          setPortfolio(prev => ({
            ...prev,
            positions: prev.positions.map(p =>
              p.pair === pair
                ? { ...p, amount: newAmount }
                : p
            ),
          }));
        } else {
          setPortfolio(prev => ({
            ...prev,
            positions: prev.positions.filter(p => p.pair !== pair),
          }));
        }
        setPortfolio(prev => ({
          ...prev,
          trades: [...prev.trades, { id: String(Date.now()), type: 'sell', pair, amount, price, total: totalValue }],
        }));
      } else {
        console.error('Insufficient amount to sell');
      }
    }
  };

  const updatePositionValues = (prices: Record<TradingPair, number>) => {
    setPortfolio(prev => {
      const updatedPositions = prev.positions.map(position => {
        const currentPrice = prices[position.pair];
        const unrealizedPnL = (currentPrice - position.averagePrice) * position.amount;
        return { ...position, unrealizedPnL };
      });
      const totalValue = updatedPositions.reduce((sum, position) => sum + position.unrealizedPnL, prev.balance);
      return { ...prev, positions: updatedPositions, totalValue };
    });
  };

  return { portfolio, placeOrder, updatePositionValues };
};