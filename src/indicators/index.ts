import { SMA, RSI, MACD } from 'technicalindicators';

export function calculateSMA(data: number[], period: number): number[] {
  const sma = new SMA({ period, values: data });
  return sma.getResult();
}

export function calculateRSI(data: number[], period: number = 14): number[] {
  const rsi = new RSI({ period, values: data });
  return rsi.getResult();
}

export function calculateMACD(data: number[]): any {
  const macd = new MACD({
    values: data,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });
  return macd.getResult();
}

export function calculateVolatility(data: number[], period: number = 20): number {
  const returns = data.slice(1).map((price, i) => 
    Math.log(price / data[i])
  );
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance * 252); // Annualized volatility
}

export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const excessReturns = returns.map(r => r - (riskFreeRate / 252));
  const stdDev = Math.sqrt(
    excessReturns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / excessReturns.length
  );
  
  return Math.sqrt(252) * (meanReturn - riskFreeRate / 252) / stdDev;
}

export function calculateDrawdown(data: number[]): number {
  let maxDrawdown = 0;
  let peak = data[0];
  
  for (const price of data) {
    if (price > peak) {
      peak = price;
    }
    const drawdown = (peak - price) / peak;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }
  
  return maxDrawdown;
}