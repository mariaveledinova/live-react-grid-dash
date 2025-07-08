
import type { Stock } from '../types/stock';

const stockData = [
  { symbol: 'SNAP', name: 'Snap Inc.', sector: 'Technology' },
  { symbol: 'TWTR', name: 'Twitter, Inc.', sector: 'Technology' },
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'CSCO', name: 'Cisco Systems, Inc.', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', sector: 'Technology' },
];

export const generateMockStockData = (): Stock[] => {
  return stockData.map(stock => {
    const basePrice = Math.random() * 300 + 20;
    const change = (Math.random() - 0.5) * 10;
    const percentChange = (change / basePrice) * 100;
    
    // Generate chart data (20 points)
    const chartData = Array.from({ length: 20 }, (_, i) => {
      return basePrice + Math.sin(i * 0.3) * 10 + (Math.random() - 0.5) * 15;
    });

    return {
      symbol: stock.symbol,
      name: stock.name,
      price: basePrice,
      change,
      percentChange,
      volume: Math.floor(Math.random() * 100000000) + 1000000,
      avgVolume: Math.floor(Math.random() * 50000000) + 5000000,
      marketCap: Math.floor(Math.random() * 2000) + 100,
      peRatio: Math.random() * 50 + 5,
      oneDayChange: change,
      sector: stock.sector,
      chartData
    };
  });
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

export const formatCurrency = (num: number): string => {
  return `$${num.toFixed(2)}`;
};

export const formatPercentage = (num: number): string => {
  return `${num.toFixed(2)}%`;
};

export const formatVolume = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  return `${(num / 1000).toFixed(0)}K`;
};
