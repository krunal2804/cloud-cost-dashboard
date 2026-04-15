import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { FilterBar } from './components/FilterBar';
import { SummaryCards } from './components/SummaryCards';
import { SpendTable } from './components/SpendTable';
import { ChartMonthly } from './components/ChartMonthly';
import { ChartByCloud } from './components/ChartByCloud';
import { ChartByTeam } from './components/ChartByTeam';
import { DetailModal } from './components/DetailModal';
import { DataUploadPanel } from './components/DataUploadPanel';
import { Button } from './components/ui/button';
import { useSpendData } from './hooks/useSpendData';
import { DataStatus, Filters, SpendRecord } from './types/spend';
import { ArrowLeft, Download, Upload } from 'lucide-react';
import { exportDashboardPdf } from './utils/exportDashboardPdf';

type AppPage = 'dashboard' | 'upload';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [refreshToken, setRefreshToken] = useState(0);
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    cloud: 'All',
    team: 'All',
    environment: 'All',
    month: 'All',
  });

  const [selectedRecord, setSelectedRecord] = useState<SpendRecord | null>(
    null,
  );

  const { spendData, summary, loading, error } = useSpendData(
    filters,
    refreshToken,
  );

  useEffect(() => {
    async function loadDataStatus() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/data/status?refresh=${refreshToken}`,
          { cache: 'no-store' },
        );
        if (!response.ok) {
          throw new Error('Unable to load data status.');
        }

        const json = (await response.json()) as DataStatus;
        setDataStatus(json);
      } catch (err) {
        setDataStatus(null);
      }
    }

    loadDataStatus();
  }, [refreshToken]);

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

  const handleDataRefresh = async () => {
    setRefreshToken((current) => current + 1);
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      await exportDashboardPdf({
        data: spendData,
        dataStatus,
        filters,
      });
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : 'Unable to generate the PDF.',
      );
    } finally {
      setIsExporting(false);
    }
  };

  const headerAction =
    currentPage === 'dashboard' ? (
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadPdf}
          disabled={loading || isExporting || spendData.length === 0}
          className="bg-white"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Downloading...' : 'Download PDF'}
        </Button>
        <Button
          type="button"
          onClick={() => setCurrentPage('upload')}
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          <Upload className="w-4 h-4" />
          Upload Data
        </Button>
      </div>
    ) : (
      <Button
        type="button"
        variant="outline"
        onClick={() => setCurrentPage('dashboard')}
        className="bg-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>
    );

  return (
    <DashboardLayout headerAction={headerAction}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">Error loading data: {error}</p>
          <p className="text-red-600 mt-2">
            Please ensure the backend is running at http://localhost:5000
          </p>
        </div>
      )}

      {exportError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">PDF export failed: {exportError}</p>
        </div>
      )}

      {currentPage === 'upload' ? (
        <div className="max-w-5xl">
          <div className="mb-6">
            <h2 className="text-gray-900 mb-2">Upload and Refresh Billing Data</h2>
            <p className="text-gray-600">
              Use this page to replace AWS and GCP billing CSV files, rebuild the
              combined dataset, and refresh analytics in the dashboard.
            </p>
          </div>

          <DataUploadPanel onRefresh={handleDataRefresh} />
        </div>
      ) : (
        <>
          {dataStatus && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Current data source</p>
              <p className="text-gray-900">
                Data from <span className="font-medium">{dataStatus.awsDisplayName}</span>{' '}
                and <span className="font-medium">{dataStatus.gcpDisplayName}</span>
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
        </>
      )}
    </DashboardLayout>
  );
}
