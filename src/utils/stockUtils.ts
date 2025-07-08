
import type { Stock } from '@/types/stock';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const formatVolume = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

export const getChangeColor = (change: number, percentChange: number = 0): string => {
  if (change > 0 || percentChange > 0) return 'text-green-600';
  if (change < 0 || percentChange < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const generateMockChartData = (basePrice: number, volatility: number = 0.05): number[] => {
  const points = 20;
  const data: number[] = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * volatility * basePrice;
    currentPrice += change;
    data.push(Math.max(0, currentPrice));
  }
  
  return data;
};

export const generateMockStockData = (): Stock[] => {
  const mockStocks: Stock[] = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.43,
      change: 2.34,
      percentChange: 1.35,
      volume: 45234567,
      avgVolume: 52000000,
      marketCap: 2800000000000,
      peRatio: 28.4,
      oneDayChange: 1.35,
      chartData: generateMockChartData(175.43),
      sector: 'Technology'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 2750.80,
      change: -15.20,
      percentChange: -0.55,
      volume: 1234567,
      avgVolume: 1500000,
      marketCap: 1800000000000,
      peRatio: 23.1,
      oneDayChange: -0.55,
      chartData: generateMockChartData(2750.80),
      sector: 'Technology'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 342.56,
      change: 5.67,
      percentChange: 1.68,
      volume: 23456789,
      avgVolume: 25000000,
      marketCap: 2600000000000,
      peRatio: 32.8,
      oneDayChange: 1.68,
      chartData: generateMockChartData(342.56),
      sector: 'Technology'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      price: 245.67,
      change: -8.34,
      percentChange: -3.28,
      volume: 89234567,
      avgVolume: 75000000,
      marketCap: 780000000000,
      peRatio: 45.2,
      oneDayChange: -3.28,
      chartData: generateMockChartData(245.67),
      sector: 'Consumer Discretionary'
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com, Inc.',
      price: 3234.12,
      change: 45.67,
      percentChange: 1.43,
      volume: 3456789,
      avgVolume: 4000000,
      marketCap: 1650000000000,
      peRatio: 58.4,
      oneDayChange: 1.43,
      chartData: generateMockChartData(3234.12),
      sector: 'Consumer Discretionary'
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 875.30,
      change: 12.45,
      percentChange: 1.44,
      volume: 35678901,
      avgVolume: 40000000,
      marketCap: 2150000000000,
      peRatio: 65.2,
      oneDayChange: 1.44,
      chartData: generateMockChartData(875.30),
      sector: 'Technology'
    },
    {
      symbol: 'META',
      name: 'Meta Platforms, Inc.',
      price: 487.23,
      change: -3.87,
      percentChange: -0.79,
      volume: 15432109,
      avgVolume: 18000000,
      marketCap: 1230000000000,
      peRatio: 24.8,
      oneDayChange: -0.79,
      chartData: generateMockChartData(487.23),
      sector: 'Technology'
    },
    {
      symbol: 'JPM',
      name: 'JPMorgan Chase & Co.',
      price: 178.90,
      change: 1.23,
      percentChange: 0.69,
      volume: 8765432,
      avgVolume: 12000000,
      marketCap: 520000000000,
      peRatio: 12.5,
      oneDayChange: 0.69,
      chartData: generateMockChartData(178.90),
      sector: 'Finance'
    },
    {
      symbol: 'JNJ',
      name: 'Johnson & Johnson',
      price: 162.45,
      change: 0.78,
      percentChange: 0.48,
      volume: 5432198,
      avgVolume: 8000000,
      marketCap: 430000000000,
      peRatio: 15.3,
      oneDayChange: 0.48,
      chartData: generateMockChartData(162.45),
      sector: 'Healthcare'
    },
    {
      symbol: 'XOM',
      name: 'Exxon Mobil Corporation',
      price: 108.76,
      change: -2.34,
      percentChange: -2.11,
      volume: 12345678,
      avgVolume: 15000000,
      marketCap: 450000000000,
      peRatio: 13.7,
      oneDayChange: -2.11,
      chartData: generateMockChartData(108.76),
      sector: 'Energy'
    }
  ];

  return mockStocks;
};

export const calculateTotalMarketCap = (stocks: Stock[]): number => {
  return stocks.reduce((total, stock) => total + stock.marketCap, 0);
};

export const getTopGainers = (stocks: Stock[], limit: number = 5): Stock[] => {
  return [...stocks]
    .sort((a, b) => b.percentChange - a.percentChange)
    .slice(0, limit);
};

export const getTopLosers = (stocks: Stock[], limit: number = 5): Stock[] => {
  return [...stocks]
    .sort((a, b) => a.percentChange - b.percentChange)
    .slice(0, limit);
};

export const getMostActive = (stocks: Stock[], limit: number = 5): Stock[] => {
  return [...stocks]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);
};
