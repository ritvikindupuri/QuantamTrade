import { useState, useCallback } from 'react';
import { Trade, Portfolio, Position, Order, OrderType, TradingPair } from '../types/trading';
import Decimal from 'decimal.js';

const initialPortfolio: Portfolio = {
  cash: 100000,
  positions: [],
  totalValue: 100000,
  trades: [],
  orders: []
};

export function useTrading() {
  const [portfolio, setPortfolio] = useState<Portfolio>(initialPortfolio);

  const placeOrder = useCallback((
    type: OrderType,
    side: 'buy' | 'sell',
    pair: TradingPair,
    amount: number,
    price: number
  ) => {
    const total = new Decimal(price).times(amount).toNumber();

    setPortfolio(prev => {
      // Check if we can execute the order
      if (side === 'buy' && total > prev.cash) {
        console.error('Insufficient funds');
        return prev;
      }

      if (side === 'sell') {
        const position = prev.positions.find(p => p.pair === pair);
        if (!position || position.amount < amount) {
          console.error('Insufficient position');
          return prev;
        }
      }

      // Create the trade
      const trade: Trade = {
        id: Math.random().toString(36).substr(2, 9),
        orderId: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        type: side,
        pair,
        price,
        amount,
        total
      };

      // Update cash
      const newCash = side === 'buy' 
        ? prev.cash - total
        : prev.cash + total;

      // Update positions
      let newPositions = [...prev.positions];
      if (side === 'buy') {
        const existingPosition = prev.positions.find(p => p.pair === pair);
        if (existingPosition) {
          const newAmount = existingPosition.amount + amount;
          const newAvgPrice = ((existingPosition.averagePrice * existingPosition.amount) + (price * amount)) / newAmount;
          newPositions = prev.positions.map(p =>
            p.pair === pair ? { ...p, amount: newAmount, averagePrice: newAvgPrice } : p
          );
        } else {
          newPositions.push({
            pair,
            amount,
            averagePrice: price,
            unrealizedPnL: 0
          });
        }
      } else {
        const position = prev.positions.find(p => p.pair === pair)!;
        const newAmount = position.amount - amount;
        if (newAmount > 0) {
          newPositions = prev.positions.map(p =>
            p.pair === pair ? { ...p, amount: newAmount } : p
          );
        } else {
          newPositions = prev.positions.filter(p => p.pair !== pair);
        }
      }

      return {
        ...prev,
        cash: newCash,
        positions: newPositions,
        trades: [...prev.trades, trade],
        totalValue: newCash + newPositions.reduce((sum, pos) => sum + (pos.amount * price), 0)
      };
    });
  }, []);

  const updatePositionValues = useCallback((currentPrices: Record<TradingPair, number>) => {
    setPortfolio(prev => {
      const newPositions = prev.positions.map(position => {
        const currentPrice = currentPrices[position.pair];
        if (!currentPrice) return position;

        const unrealizedPnL = new Decimal(currentPrice)
          .minus(position.averagePrice)
          .times(position.amount)
          .toNumber();

        return { ...position, unrealizedPnL };
      });

      const totalValue = new Decimal(prev.cash)
        .plus(newPositions.reduce((sum, pos) => 
          sum + (currentPrices[pos.pair] || 0) * pos.amount, 
          0
        ))
        .toNumber();

      return { ...prev, positions: newPositions, totalValue };
    });
  }, []);

  return {
    portfolio,
    placeOrder,
    updatePositionValues
  };
}