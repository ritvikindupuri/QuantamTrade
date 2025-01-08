import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface TradingChartProps {
  data: Array<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
}

export function TradingChart({ data }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#334155' },
        horzLines: { color: '#334155' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    candlestickSeries.setData(data);
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div ref={chartContainerRef} className="w-full h-[400px] bg-gray-900 rounded-lg" />
  );
}