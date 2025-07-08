
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
