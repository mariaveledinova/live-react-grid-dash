
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

  // Simulate real-time updates with cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => ({
          ...stock,
          price: Math.max(0.01, stock.price + (Math.random() - 0.5) * 2),
          change: stock.change + (Math.random() - 0.5) * 0.5,
          percentChange: stock.percentChange + (Math.random() - 0.5) * 0.2,
          volume: Math.max(0, stock.volume + Math.floor((Math.random() - 0.5) * 1000000)),
          chartData: [...stock.chartData.slice(1), Math.max(0.01, stock.price + (Math.random() - 0.5) * 5)]
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

  // Keyboard navigation for view mode buttons
  const handleViewModeKeyDown = (event: React.KeyboardEvent, mode: 'list' | 'heatmap' | 'virtualized') => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setViewMode(mode);
    }
  };

  const totalValue = filteredStocks.reduce((sum, stock) => sum + (stock.price * stock.volume / 1000000), 0);
  const gainers = filteredStocks.filter(s => s.change > 0).length;
  const losers = filteredStocks.filter(s => s.change < 0).length;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Skip to main content link for screen readers */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>

        {/* Header with title and stats */}
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Stock Dashboard
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" aria-hidden="true" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-xl font-semibold" aria-label={`Total value: ${totalValue.toFixed(2)} million dollars`}>
                    ${totalValue.toFixed(2)}M
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" aria-hidden="true" />
                <div>
                  <p className="text-sm text-muted-foreground">Gainers</p>
                  <p className="text-xl font-semibold text-green-600" aria-label={`${gainers} stocks gaining`}>
                    {gainers}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" aria-hidden="true" />
                <div>
                  <p className="text-sm text-muted-foreground">Losers</p>
                  <p className="text-xl font-semibold text-red-600" aria-label={`${losers} stocks losing`}>
                    {losers}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </header>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              size="sm" 
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              aria-label="Add new stock to watchlist"
            >
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Add new
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              disabled={selectedStocks.size === 0}
              onClick={handleRemoveSelected}
              className="bg-white border border-gray-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
              aria-label={`Remove ${selectedStocks.size} selected stocks`}
            >
              <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
              Remove ({selectedStocks.size})
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              aria-label="Search stocks by name or symbol"
            />
          </div>
          
          {/* View Mode Controls */}
          <div className="flex items-center gap-2" role="tablist" aria-label="View mode selection">
            <Button 
              size="sm" 
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              onKeyDown={(e) => handleViewModeKeyDown(e, 'list')}
              className="bg-white border border-gray-300 text-gray-700"
              role="tab"
              aria-selected={viewMode === 'list'}
              aria-controls="stock-content"
            >
              Stock List
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'heatmap' ? 'default' : 'outline'}
              onClick={() => setViewMode('heatmap')}
              onKeyDown={(e) => handleViewModeKeyDown(e, 'heatmap')}
              className="bg-white border border-gray-300 text-gray-700"
              role="tab"
              aria-selected={viewMode === 'heatmap'}
              aria-controls="stock-content"
            >
              Heatmap View
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'virtualized' ? 'default' : 'outline'}
              onClick={() => setViewMode('virtualized')}
              onKeyDown={(e) => handleViewModeKeyDown(e, 'virtualized')}
              className="bg-white border border-gray-300 text-gray-700"
              role="tab"
              aria-selected={viewMode === 'virtualized'}
              aria-controls="stock-content"
            >
              Virtualized
            </Button>
          </div>
          
          {/* Sector Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="sector-select" className="text-sm text-gray-600">
              Sector:
            </label>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger 
                id="sector-select"
                className="w-32 h-8 bg-white border-gray-300"
                aria-label="Filter by sector"
              >
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

        {/* Main Content */}
        <main id="main-content" role="main">
          <div 
            id="stock-content"
            role="tabpanel"
            aria-label={`${viewMode} view showing ${filteredStocks.length} stocks`}
          >
            <StockGrid
              stocks={filteredStocks}
              selectedStocks={selectedStocks}
              onStockSelect={handleStockSelect}
              onSelectAll={handleSelectAll}
              onUpdateStock={handleUpdateStock}
              viewMode={viewMode}
            />
          </div>
        </main>

        {/* Status region for screen readers */}
        <div
          role="status"
          aria-live="polite"
          aria-label="Stock data status"
          className="sr-only"
        >
          Showing {filteredStocks.length} stocks, {selectedStocks.size} selected. Data updates every 3 seconds.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
