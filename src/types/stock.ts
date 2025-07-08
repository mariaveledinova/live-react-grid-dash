
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  peRatio: number;
  oneDayChange: number;
  sector: string;
  chartData: number[];
}
