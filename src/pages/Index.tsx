
import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { StockGrid } from '@/components/StockGrid';
import type { Stock } from '@/types/stock';

// Mock data for demonstration
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
    chartData: [170, 172, 174, 171, 175, 173, 175.43],
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
    chartData: [2780, 2770, 2760, 2755, 2745, 2748, 2750.80],
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
    chartData: [335, 338, 340, 342, 341, 343, 342.56],
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
    chartData: [260, 255, 250, 248, 252, 249, 245.67],
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
    chartData: [3180, 3200, 3220, 3210, 3225, 3240, 3234.12],
    sector: 'Consumer Discretionary'
  }
];

const Index = () => {
  const [stocks, setStocks] = useState<Stock[]>(mockStocks);
  const [selectedStocks, setSelectedStocks] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'heatmap' | 'virtualized'>('list');
  const [isLoading, setIsLoading] = useState(false);

  const sectors = useMemo(() => {
    const uniqueSectors = Array.from(new Set(stocks.map(stock => stock.sector)));
    return uniqueSectors;
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stock.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = sectorFilter === 'all' || stock.sector === sectorFilter;
      return matchesSearch && matchesSector;
    });
  }, [stocks, searchTerm, sectorFilter]);

  const handleStockSelect = useCallback((symbol: string, checked: boolean) => {
    setSelectedStocks(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(symbol);
      } else {
        newSet.delete(symbol);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedStocks(new Set(filteredStocks.map(stock => stock.symbol)));
    } else {
      setSelectedStocks(new Set());
    }
  }, [filteredStocks]);

  const handleUpdateStock = useCallback((symbol: string, updates: Partial<Stock>) => {
    setStocks(prev => prev.map(stock => 
      stock.symbol === symbol ? { ...stock, ...updates } : stock
    ));
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  const handleExport = useCallback(() => {
    const selectedData = stocks.filter(stock => selectedStocks.has(stock.symbol));
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Symbol,Name,Price,Change,% Change,Volume\n" +
      selectedData.map(stock => 
        `${stock.symbol},${stock.name},${stock.price},${stock.change},${stock.percentChange},${stock.volume}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stocks_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [stocks, selectedStocks]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Dashboard</h1>
            <p className="text-gray-600 mt-1">Live market data and analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleRefresh} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleExport}
              disabled={selectedStocks.size === 0}
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export ({selectedStocks.size})
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search stocks by symbol or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Active filters */}
          {(searchTerm || sectorFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {sectorFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Sector: {sectorFilter}
                  <button 
                    onClick={() => setSectorFilter('all')}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </Card>

        {/* Stock Grid */}
        <StockGrid
          stocks={filteredStocks}
          selectedStocks={selectedStocks}
          onStockSelect={handleStockSelect}
          onSelectAll={handleSelectAll}
          onUpdateStock={handleUpdateStock}
          viewMode={viewMode}
        />

        {/* Summary */}
        <Card className="p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredStocks.length}</p>
              <p className="text-sm text-gray-600">Total Stocks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {filteredStocks.filter(s => s.change > 0).length}
              </p>
              <p className="text-sm text-gray-600">Gainers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {filteredStocks.filter(s => s.change < 0).length}
              </p>
              <p className="text-sm text-gray-600">Losers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{selectedStocks.size}</p>
              <p className="text-sm text-gray-600">Selected</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
