import { useState, useMemo } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { FilterBar } from './components/FilterBar';
import { SummaryCards } from './components/SummaryCards';
import { SpendTable } from './components/SpendTable';
import { ChartMonthly } from './components/ChartMonthly';
import { ChartByCloud } from './components/ChartByCloud';
import { ChartByTeam } from './components/ChartByTeam';
import { DetailModal } from './components/DetailModal';
import { useSpendData } from './hooks/useSpendData';
import { Filters, SpendRecord } from './types/spend';

export default function App() {
  const [filters, setFilters] = useState<Filters>({
    cloud: 'All',
    team: 'All',
    environment: 'All',
    month: 'All',
  });

  const [selectedRecord, setSelectedRecord] = useState<SpendRecord | null>(
    null,
  );

  const { spendData, summary, loading, error } = useSpendData(filters);

  // Extract unique values for filter dropdowns
  const availableOptions = useMemo(() => {
    const cloudProviders = Array.from(
      new Set(spendData.map((r) => r.cloud_provider)),
    ).sort();
    const teams = Array.from(new Set(spendData.map((r) => r.team))).sort();
    const environments = Array.from(
      new Set(spendData.map((r) => r.env)),
    ).sort();

    // Generate months from the data
    const months = Array.from(
      new Set(
        spendData.map((r) => {
          const date = new Date(r.date);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            '0',
          )}`;
        }),
      ),
    )
      .sort()
      .reverse();

    return {
      cloudProviders,
      teams,
      environments,
      months,
    };
  }, [spendData]);

  const handleRowClick = (record: SpendRecord) => {
    setSelectedRecord(record);
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
  };

  return (
    <DashboardLayout>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">Error loading data: {error}</p>
          <p className="text-red-600 mt-2">
            Please ensure the backend is running at http://localhost:5000
          </p>
        </div>
      )}

      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        availableOptions={availableOptions}
      />

      <SummaryCards data={spendData} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartMonthly data={spendData} loading={loading} />
        <ChartByCloud data={spendData} loading={loading} />
      </div>

      <div className="mb-6">
        <ChartByTeam data={spendData} loading={loading} />
      </div>

      <div className="mb-6">
        <h2 className="text-gray-900 mb-4">Detailed Spend Records</h2>
        <SpendTable
          data={spendData}
          loading={loading}
          onRowClick={handleRowClick}
        />
      </div>

      <DetailModal record={selectedRecord} onClose={handleCloseModal} />
    </DashboardLayout>
  );
}
