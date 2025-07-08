
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { StockGrid } from './StockGrid';
import { generateMockStockData } from '../utils/stockUtils';
import type { Stock } from '../types/stock';

const Dashboard = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('Technology');
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
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
              <Plus className="h-4 w-4 mr-2" />
              Add new
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              disabled={selectedStocks.size === 0}
              onClick={handleRemoveSelected}
              className="bg-white border border-gray-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="bg-white border border-gray-300 text-gray-700"
            >
              Stock List
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'heatmap' ? 'default' : 'outline'}
              onClick={() => setViewMode('heatmap')}
              className="bg-white border border-gray-300 text-gray-700"
            >
              Heatmap View
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'virtualized' ? 'default' : 'outline'}
              onClick={() => setViewMode('virtualized')}
              className="bg-white border border-gray-300 text-gray-700"
            >
              Virtualized
            </Button>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Sector:</span>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-32 h-8 bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
