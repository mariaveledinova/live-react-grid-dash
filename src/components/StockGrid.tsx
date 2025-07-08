
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
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">
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
              <th className="p-4 text-left">
                <Button variant="ghost" onClick={() => handleSort('symbol')} className="font-semibold">
                  Symbol {getSortIcon('symbol')}
                </Button>
              </th>
              <th className="p-4 text-left">
                <Button variant="ghost" onClick={() => handleSort('name')} className="font-semibold">
                  Name {getSortIcon('name')}
                </Button>
              </th>
              <th className="p-4 text-left">
                <Button variant="ghost" onClick={() => handleSort('price')} className="font-semibold">
                  Price {getSortIcon('price')}
                </Button>
              </th>
              <th className="p-4 text-left">
                <Button variant="ghost" onClick={() => handleSort('change')} className="font-semibold">
                  Change {getSortIcon('change')}
                </Button>
              </th>
              <th className="p-4 text-left">
                <Button variant="ghost" onClick={() => handleSort('percentChange')} className="font-semibold">
                  % Change {getSortIcon('percentChange')}
                </Button>
              </th>
              <th className="p-4 text-left">
                <Button variant="ghost" onClick={() => handleSort('volume')} className="font-semibold">
                  Volume {getSortIcon('volume')}
                </Button>
              </th>
              <th className="p-4 text-left">Avg Vol<br/><span className="text-xs text-gray-500">(3 months)</span></th>
              <th className="p-4 text-left">Market Cap<br/><span className="text-xs text-gray-500">(TTM)</span></th>
              <th className="p-4 text-left">
                <Button variant="ghost" onClick={() => handleSort('peRatio')} className="font-semibold">
                  PE Ratio {getSortIcon('peRatio')}
                </Button>
              </th>
              <th className="p-4 text-left">
                <Button variant="ghost" onClick={() => handleSort('oneDayChange')} className="font-semibold">
                  1 Day Chart {getSortIcon('oneDayChange')}
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStocks.map((stock) => (
              <tr key={stock.symbol} className="border-b hover:bg-gray-50 group">
                <td className="p-4">
                  <Checkbox
                    checked={selectedStocks.has(stock.symbol)}
                    onCheckedChange={(checked) => onStockSelect(stock.symbol, checked === true)}
                  />
                </td>
                <td className="p-4 font-mono font-semibold text-blue-600">{stock.symbol}</td>
                <td className="p-4">{stock.name}</td>
                <td className="p-4">
                  <EditableCell stock={stock} field="price" value={stock.price} type="currency" />
                </td>
                <td className="p-4">
                  <EditableCell stock={stock} field="change" value={stock.change} type="currency" />
                </td>
                <td className="p-4">
                  <EditableCell stock={stock} field="percentChange" value={stock.percentChange} type="percentage" />
                </td>
                <td className="p-4">
                  <EditableCell stock={stock} field="volume" value={stock.volume} type="volume" />
                </td>
                <td className="p-4 text-gray-600">{formatValue(stock.avgVolume, 'volume')}</td>
                <td className="p-4 text-gray-600">{formatValue(stock.marketCap, 'volume')}B</td>
                <td className="p-4">
                  <EditableCell stock={stock} field="peRatio" value={stock.peRatio} type="number" />
                </td>
                <td className="p-4">
                  <div className="w-24 h-12">
                    <SparklineChart 
                      data={stock.chartData} 
                      color={stock.change >= 0 ? '#16a34a' : '#dc2626'} 
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
