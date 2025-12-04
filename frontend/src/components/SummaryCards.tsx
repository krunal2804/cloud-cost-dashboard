import { SpendRecord } from '../types/spend';
import { formatCurrency } from '../utils/formatCurrency';
import { DollarSign, CloudIcon, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
  data: SpendRecord[];
  loading: boolean;
}

export function SummaryCards({ data, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 🧮 Calculate summary dynamically from spend data
  const totalSpend = data.reduce((sum, r) => sum + r.cost_usd, 0);
  const awsSpend = data
    .filter((r) => r.cloud_provider === 'AWS')
    .reduce((sum, r) => sum + r.cost_usd, 0);
  const gcpSpend = data
    .filter((r) => r.cloud_provider === 'GCP')
    .reduce((sum, r) => sum + r.cost_usd, 0);

  const cards = [
    {
      title: 'Total Spend',
      value: totalSpend,
      icon: DollarSign,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'AWS Spend',
      value: awsSpend,
      icon: CloudIcon,
      gradient: 'from-orange-500 to-red-600',
    },
    {
      title: 'GCP Spend',
      value: gcpSpend,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">{card.title}</span>
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-gray-900 font-semibold text-xl">
              {formatCurrency(card.value)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
