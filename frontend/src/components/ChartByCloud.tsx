import { SpendRecord } from '../types/spend';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { formatCurrency } from '../utils/formatCurrency';
import { BarChart3 } from 'lucide-react';

interface ChartByCloudProps {
  data: SpendRecord[];
  loading: boolean;
}

const COLORS = {
  AWS: '#FF9900',
  GCP: '#4285F4',
};

export function ChartByCloud({ data, loading }: ChartByCloudProps) {
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

  // Aggregate data by cloud provider
  const aggregatedData = data.reduce((acc, record) => {
    const provider = record.cloud_provider;
    if (!acc[provider]) {
      acc[provider] = 0;
    }
    acc[provider] += record.cost_usd;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array
  const chartData = Object.entries(aggregatedData).map(([provider, cost_usd]) => ({
    provider,
    cost_usd: Math.round(cost_usd * 100) / 100,
  }));

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
        <BarChart3 className="w-5 h-5 text-indigo-500" />
        <h2 className="text-gray-900">Spend by Cloud Provider</h2>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="provider"
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
            formatter={(value: number) => [formatCurrency(value), 'Cost']}
          />
          <Legend />
          <Bar dataKey="cost_usd" name="Total Cost" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  COLORS[entry.provider as keyof typeof COLORS] || '#6366f1'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
