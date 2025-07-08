
import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit2, Check, X } from 'lucide-react';
import { SparklineChart } from './SparklineChart';
import type { Stock } from '../types/stock';

interface StockGridProps {
  stocks: Stock[];
  selectedStocks: Set<string>;
  onStockSelect: (symbol: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateStock: (symbol: string, updates: Partial<Stock>) => void;
  viewMode: 'list' | 'heatmap' | 'virtualized';
}

type SortField = 'symbol' | 'name' | 'price' | 'change' | 'percentChange' | 'volume' | 'marketCap' | 'peRatio' | 'oneDayChange';
type SortDirection = 'asc' | 'desc' | null;

export const StockGrid: React.FC<StockGridProps> = ({
  stocks,
  selectedStocks,
  onStockSelect,
  onSelectAll,
  onUpdateStock,
  viewMode
}) => {
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingCell, setEditingCell] = useState<{ symbol: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const sortedStocks = useMemo(() => {
    if (!sortDirection) return stocks;
    
    return [...stocks].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [stocks, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const handleEdit = useCallback((symbol: string, field: string, currentValue: any) => {
    setEditingCell({ symbol, field });
    setEditValue(currentValue.toString());
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingCell) return;
    
    const { symbol, field } = editingCell;
    let value: any = editValue;
    
    // Convert to appropriate type with validation
    if (['price', 'change', 'percentChange', 'peRatio', 'oneDayChange'].includes(field)) {
      const numValue = parseFloat(editValue);
      if (isNaN(numValue)) return; // Don't save invalid numbers
      value = Math.max(0, numValue); // Ensure positive values for price
    } else if (['volume', 'marketCap'].includes(field)) {
      const numValue = parseInt(editValue);
      if (isNaN(numValue)) return; // Don't save invalid numbers
      value = Math.max(0, numValue); // Ensure positive values
    }
    
    onUpdateStock(symbol, { [field]: value });
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, onUpdateStock]);

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  const formatValue = useCallback((value: number, type: 'currency' | 'percentage' | 'number' | 'volume') => {
    if (isNaN(value) || !isFinite(value)) return 'N/A';
    
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'volume':
        if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toString();
      default:
        return value.toFixed(2);
    }
  }, []);

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const allSelected = stocks.length > 0 && selectedStocks.size === stocks.length;
  const someSelected = selectedStocks.size > 0 && selectedStocks.size < stocks.length;

  // Keyboard navigation for editable cells
  const handleEditKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSaveEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancelEdit();
    }
  };

  const EditableCell = ({ stock, field, value, type }: { stock: Stock; field: string; value: any; type: 'currency' | 'percentage' | 'number' | 'volume' }) => {
    const isEditing = editingCell?.symbol === stock.symbol && editingCell?.field === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2" role="group" aria-label={`Editing ${field} for ${stock.symbol}`}>
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            className="h-8 w-20"
            autoFocus
            aria-label={`Edit ${field} value`}
            type="number"
            step="any"
          />
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleSaveEdit}
            aria-label="Save changes"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleCancelEdit}
            aria-label="Cancel editing"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }
    
    return (
      <button 
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded text-left w-full group focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => handleEdit(stock.symbol, field, value)}
        aria-label={`Edit ${field}: ${formatValue(value, type)} for ${stock.symbol}`}
        tabIndex={0}
      >
        <span className={getChangeColor(typeof value === 'number' && field.includes('change') ? value : 0)}>
          {formatValue(value, type)}
        </span>
        <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 group-focus:opacity-100" aria-hidden="true" />
      </button>
    );
  };

  const SortableHeader = ({ field, children, className = "" }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      <button
        className="flex items-center gap-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
        onClick={() => handleSort(field)}
        aria-label={`Sort by ${field} ${sortField === field ? (sortDirection === 'asc' ? 'descending' : sortDirection === 'desc' ? 'unsorted' : 'ascending') : 'ascending'}`}
      >
        {children}
        {getSortIcon(field)}
      </button>
    </th>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" role="table" aria-label="Stock data table">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left w-12" scope="col">
                <div className="flex items-center">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => onSelectAll(checked === true)}
                    aria-label={`Select all stocks. Currently ${allSelected ? 'all selected' : someSelected ? 'some selected' : 'none selected'}`}
                  />
                  {someSelected && !allSelected && (
                    <div className="ml-1 w-2 h-2 bg-blue-500 rounded-sm" aria-hidden="true" />
                  )}
                </div>
              </th>
              <SortableHeader field="symbol">Symbol</SortableHeader>
              <SortableHeader field="name">Name</SortableHeader>
              <SortableHeader field="price">
                <div className="flex flex-col">
                  <span>Price</span>
                  <span className="text-xs text-gray-400 normal-case">(Intraday)</span>
                </div>
              </SortableHeader>
              <SortableHeader field="change">Change</SortableHeader>
              <SortableHeader field="percentChange">% Change</SortableHeader>
              <SortableHeader field="volume">Volume</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                <div className="flex flex-col">
                  <span>Avg Vol</span>
                  <span className="text-xs text-gray-400 normal-case">(3 months)</span>
                </div>
              </th>
              <SortableHeader field="marketCap">
                <div className="flex flex-col">
                  <span>Market Cap</span>
                  <span className="text-xs text-gray-400 normal-case">(TTM)</span>
                </div>
              </SortableHeader>
              <SortableHeader field="peRatio">
                <div className="flex flex-col">
                  <span>PE Ratio</span>
                  <span className="text-xs text-gray-400 normal-case">(TTM)</span>
                </div>
              </SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                1 Day Chart
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedStocks.map((stock, index) => (
              <tr 
                key={stock.symbol} 
                className="hover:bg-gray-50 group focus-within:bg-gray-50"
                role="row"
                aria-rowindex={index + 2}
              >
                <td className="px-4 py-3" role="gridcell">
                  <Checkbox
                    checked={selectedStocks.has(stock.symbol)}
                    onCheckedChange={(checked) => onStockSelect(stock.symbol, checked === true)}
                    aria-label={`Select ${stock.symbol} ${stock.name}`}
                  />
                </td>
                <td className="px-4 py-3 font-medium text-blue-600" role="gridcell">
                  <span tabIndex={0} className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
                    {stock.symbol}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-900" role="gridcell">
                  <span tabIndex={0} className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
                    {stock.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium" role="gridcell">
                  <EditableCell stock={stock} field="price" value={stock.price} type="currency" />
                </td>
                <td className="px-4 py-3" role="gridcell">
                  <EditableCell stock={stock} field="change" value={stock.change} type="currency" />
                </td>
                <td className="px-4 py-3" role="gridcell">
                  <EditableCell stock={stock} field="percentChange" value={stock.percentChange} type="percentage" />
                </td>
                <td className="px-4 py-3 text-gray-900" role="gridcell">
                  <EditableCell stock={stock} field="volume" value={stock.volume} type="volume" />
                </td>
                <td className="px-4 py-3 text-gray-600" role="gridcell">
                  <span tabIndex={0} className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
                    {formatValue(stock.avgVolume, 'volume')}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600" role="gridcell">
                  <EditableCell stock={stock} field="marketCap" value={stock.marketCap} type="volume" />
                </td>
                <td className="px-4 py-3 text-gray-900" role="gridcell">
                  <EditableCell stock={stock} field="peRatio" value={stock.peRatio} type="number" />
                </td>
                <td className="px-4 py-3" role="gridcell">
                  <div 
                    className="w-32 h-12 bg-gray-50 rounded p-1 focus-within:ring-2 focus-within:ring-blue-500"
                    tabIndex={0}
                    role="img"
                    aria-label={`1-day price chart for ${stock.symbol}. Current trend: ${stock.change >= 0 ? 'positive' : 'negative'}`}
                  >
                    <SparklineChart 
                      data={stock.chartData} 
                      color={stock.change >= 0 ? '#16a34a' : '#dc2626'} 
                      width={120}
                      height={40}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedStocks.length === 0 && (
        <div className="text-center py-8 text-gray-500" role="status">
          No stocks found matching your search criteria.
        </div>
      )}
    </div>
  );
};
