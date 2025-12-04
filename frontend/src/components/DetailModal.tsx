import { SpendRecord } from '../types/spend';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import {
  X,
  Calendar,
  Cloud,
  Package,
  Users,
  Server,
  DollarSign,
} from 'lucide-react';

interface DetailModalProps {
  record: SpendRecord | null;
  onClose: () => void;
}

export function DetailModal({ record, onClose }: DetailModalProps) {
  if (!record) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-gray-900">Spend Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="opacity-90">Total Cost</span>
            </div>
            <div className="text-white">{formatCurrency(record.cost_usd)}</div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Date</span>
              </div>
              <p className="text-gray-900">{formatDate(record.date)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Cloud className="w-4 h-4" />
                <span>Cloud Provider</span>
              </div>
              <div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full ${
                    record.cloud_provider === 'AWS'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {record.cloud_provider}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Package className="w-4 h-4" />
                <span>Service</span>
              </div>
              <p className="text-gray-900">{record.service}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Users className="w-4 h-4" />
                <span>Team</span>
              </div>
              <p className="text-gray-900">{record.team}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Server className="w-4 h-4" />
                <span>Environment</span>
              </div>
              <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                {record.environment}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">
              This is{' '}
              <span className="font-medium">
                {record.cloud_provider} {record.service}
              </span>{' '}
              spend from the <span className="font-medium">{record.team}</span>{' '}
              team in <span className="font-medium">{record.environment}</span>{' '}
              environment.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
