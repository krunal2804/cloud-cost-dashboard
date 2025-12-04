import { useState } from 'react';
import { SpendRecord } from '../types/spend';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SpendTableProps {
  data: SpendRecord[];
  loading: boolean;
  onRowClick: (record: SpendRecord) => void;
}

type SortKey = 'date' | 'cost_usd';
type SortDirection = 'asc' | 'desc' | null;

export function SpendTable({ data, loading, onRowClick }: SpendTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data];
  if (sortKey && sortDirection) {
    sortedData.sort((a, b) => {
      let aVal, bVal;

      if (sortKey === 'date') {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      } else {
        aVal = a.cost_usd;
        bVal = b.cost_usd;
      }

      if (sortDirection === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  }

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-4 h-4 text-blue-500" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="w-4 h-4 text-blue-500" />;
    }
    return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No records match the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-6 py-3 text-left text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  Date
                  {getSortIcon('date')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-gray-700">
                Cloud Provider
              </th>
              <th className="px-6 py-3 text-left text-gray-700">Service</th>
              <th className="px-6 py-3 text-left text-gray-700">Team</th>
              <th className="px-6 py-3 text-left text-gray-700">Environment</th>
              <th
                className="px-6 py-3 text-right text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                onClick={() => handleSort('cost_usd')}
              >
                <div className="flex items-center justify-end gap-2">
                  Cost
                  {getSortIcon('cost_usd')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((record, index) => (
              <tr
                key={record.id}
                className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
                onClick={() => onRowClick(record)}
              >
                <td className="px-6 py-4 text-gray-900">
                  {formatDate(record.date)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full ${
                      record.cloud_provider === 'AWS'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {record.cloud_provider}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">{record.service}</td>
                <td className="px-6 py-4 text-gray-700">{record.team}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    {record.env}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-900">
                  {formatCurrency(record.cost_usd)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
