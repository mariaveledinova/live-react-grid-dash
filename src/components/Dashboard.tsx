
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { StockGrid } from './StockGrid';
import { generateMockStockData } from '../utils/stockUtils';
import type { Stock } from '../types/stock';

const Dashboard = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'heatmap' | 'virtualized'>('list');

  // Initialize with mock data
  useEffect(() => {
    const initialStocks = generateMockStockData();
    setStocks(initialStocks);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => ({
          ...stock,
          price: stock.price + (Math.random() - 0.5) * 2,
          change: stock.change + (Math.random() - 0.5) * 0.5,
          percentChange: stock.percentChange + (Math.random() - 0.5) * 0.2,
          volume: stock.volume + Math.floor((Math.random() - 0.5) * 1000000),
          chartData: [...stock.chartData.slice(1), stock.price + (Math.random() - 0.5) * 5]
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const sectors = ['All', 'Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer'];

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const handleStockSelect = (symbol: string, checked: boolean) => {
    const newSelected = new Set(selectedStocks);
    if (checked) {
      newSelected.add(symbol);
    } else {
      newSelected.delete(symbol);
    }
    setSelectedStocks(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStocks(new Set(filteredStocks.map(s => s.symbol)));
    } else {
      setSelectedStocks(new Set());
    }
  };

  const handleRemoveSelected = () => {
    setStocks(prev => prev.filter(stock => !selectedStocks.has(stock.symbol)));
    setSelectedStocks(new Set());
  };

  const handleUpdateStock = (symbol: string, updates: Partial<Stock>) => {
    setStocks(prev => prev.map(stock => 
      stock.symbol === symbol ? { ...stock, ...updates } : stock
    ));
  };

  const totalValue = filteredStocks.reduce((sum, stock) => sum + (stock.price * stock.volume / 1000000), 0);
  const gainers = filteredStocks.filter(s => s.change > 0).length;
  const losers = filteredStocks.filter(s => s.change < 0).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time market monitoring and analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
              {gainers} Gainers
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <TrendingDown className="h-4 w-4 mr-1 text-red-600" />
              {losers} Losers
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              Total: ${totalValue.toFixed(1)}B
            </Badge>
          </div>
        </div>

        {/* Controls */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add new
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                disabled={selectedStocks.size === 0}
                onClick={handleRemoveSelected}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove ({selectedStocks.size})
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                Stock List
              </Button>
              <Button 
                size="sm" 
                variant={viewMode === 'heatmap' ? 'default' : 'outline'}
                onClick={() => setViewMode('heatmap')}
              >
                Heatmap View
              </Button>
              <Button 
                size="sm" 
                variant={viewMode === 'virtualized' ? 'default' : 'outline'}
                onClick={() => setViewMode('virtualized')}
              >
                Virtualized
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Sector" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>
                    Sector: {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
      </div>
    </div>
  );
};

export default Dashboard;
