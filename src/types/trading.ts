export type OrderType = 'market' | 'limit' | 'stop';
export type TradingPair = 'BTC/USD' | 'ETH/USD' | 'SOL/USD';

export interface Order {
  id: string;
  type: OrderType;
  pair: TradingPair;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: number;
}

export interface Trade {
  id: string;
  orderId: string;
  timestamp: number;
  type: 'buy' | 'sell';
  pair: TradingPair;
  price: number;
  amount: number;
  total: number;
}

export interface Position {
  pair: TradingPair;
  amount: number;
  averagePrice: number;
  unrealizedPnL: number;
}

export interface Portfolio {
  cash: number;
  positions: Position[];
  totalValue: number;
  trades: Trade[];
  orders: Order[];
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  color: string;
}

export interface RiskMetrics {
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  beta: number;
}

export interface BacktestResult {
  trades: Trade[];
  finalPortfolio: Portfolio;
  metrics: RiskMetrics;
  returns: number[];
  drawdowns: number[];
}