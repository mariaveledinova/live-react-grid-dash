
import React, { useState } from 'react';
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    if (!sortDirection) return 0;
    
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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const handleEdit = (symbol: string, field: string, currentValue: any) => {
    setEditingCell({ symbol, field });
    setEditValue(currentValue.toString());
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    
    const { symbol, field } = editingCell;
    let value: any = editValue;
    
    // Convert to appropriate type
    if (['price', 'change', 'percentChange', 'peRatio', 'oneDayChange'].includes(field)) {
      value = parseFloat(editValue);
    } else if (['volume', 'marketCap'].includes(field)) {
      value = parseInt(editValue);
    }
    
    onUpdateStock(symbol, { [field]: value });
    setEditingCell(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const formatValue = (value: number, type: 'currency' | 'percentage' | 'number' | 'volume') => {
    switch (type) {
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'volume':
        return value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(0)}K`;
      default:
        return value.toFixed(2);
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const allSelected = stocks.length > 0 && selectedStocks.size === stocks.length;
  const someSelected = selectedStocks.size > 0 && selectedStocks.size < stocks.length;

  const EditableCell = ({ stock, field, value, type }: { stock: Stock; field: string; value: any; type: 'currency' | 'percentage' | 'number' | 'volume' }) => {
    const isEditing = editingCell?.symbol === stock.symbol && editingCell?.field === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 w-20"
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }
    
    return (
      <div 
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
        onClick={() => handleEdit(stock.symbol, field, value)}
      >
        <span className={getChangeColor(typeof value === 'number' && field.includes('change') ? value : 0)}>
          {formatValue(value, type)}
        </span>
        <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left w-12">
                <div className="flex items-center">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => onSelectAll(checked === true)}
                  />
                  {someSelected && !allSelected && (
                    <div className="ml-1 w-2 h-2 bg-blue-500 rounded-sm" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S...
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex flex-col">
                  <span>Price</span>
                  <span className="text-xs text-gray-400 normal-case">(Intraday)</span>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % Chan...
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volume
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex flex-col">
                  <span>Avg Vol</span>
                  <span className="text-xs text-gray-400 normal-case">(3 months)</span>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex flex-col">
                  <span>Market C...</span>
                  <span className="text-xs text-gray-400 normal-case">(TTM)</span>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex flex-col">
                  <span>PE Ratio</span>
                  <span className="text-xs text-gray-400 normal-case">(TTM)</span>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                1 Day C...
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedStocks.map((stock) => (
              <tr key={stock.symbol} className="hover:bg-gray-50 group">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedStocks.has(stock.symbol)}
                    onCheckedChange={(checked) => onStockSelect(stock.symbol, checked === true)}
                  />
                </td>
                <td className="px-4 py-3 font-medium text-blue-600">{stock.symbol}</td>
                <td className="px-4 py-3 text-gray-900">{stock.name}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {formatValue(stock.price, 'currency')}
                </td>
                <td className="px-4 py-3">
                  <span className={getChangeColor(stock.change)}>
                    {formatValue(stock.change, 'currency')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={getChangeColor(stock.percentChange)}>
                    {formatValue(stock.percentChange, 'percentage')}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {formatValue(stock.volume, 'volume')}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatValue(stock.avgVolume, 'volume')}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatValue(stock.marketCap, 'volume')}B
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {stock.peRatio === 0 ? 'N/A' : formatValue(stock.peRatio, 'number')}
                </td>
                <td className="px-4 py-3">
                  <div className="w-32 h-12 bg-gray-50 rounded p-1">
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
    </div>
  );
};
