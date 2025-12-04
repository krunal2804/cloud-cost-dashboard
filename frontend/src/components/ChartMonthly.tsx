import { SpendRecord } from '../types/spend';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../utils/formatCurrency';
import { TrendingUp } from 'lucide-react';

interface ChartMonthlyProps {
  data: SpendRecord[];
  loading: boolean;
}

export function ChartMonthly({ data, loading }: ChartMonthlyProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  // Aggregate data by date
  const aggregatedData = data.reduce((acc, record) => {
    const date = record.date.split('T')[0]; // Get just the date part
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += record.cost_usd;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array and sort by date
  const chartData = Object.entries(aggregatedData)
    .map(([date, cost_usd]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date,
      cost_usd: Math.round(cost_usd * 100) / 100,
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No data available for chart.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        <h2 className="text-gray-900">Daily Spend Trend</h2>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            formatter={(value: number) => [formatCurrency(value), 'cost_usd']}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="cost_usd" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Daily cost_usd"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
