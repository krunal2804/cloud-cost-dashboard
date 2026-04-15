import { useState, useEffect } from 'react';
import { SpendRecord, SummaryData, Filters } from '../types/spend';

const API_BASE_URL = 'http://localhost:5000/api';

function normalizeSpendRecord(
  record: Partial<SpendRecord> & Record<string, unknown>,
  index: number,
): SpendRecord {
  const dateValue =
    typeof record.date === 'string' && record.date.trim()
      ? record.date
      : '1970-01-01';

  const cloudProvider =
    typeof record.cloud_provider === 'string' && record.cloud_provider.trim()
      ? record.cloud_provider
      : 'Unknown';

  const service =
    typeof record.service === 'string' && record.service.trim()
      ? record.service
      : 'Unknown';

  const team =
    typeof record.team === 'string' && record.team.trim()
      ? record.team
      : 'Unknown';

  const envSource =
    typeof record.env === 'string'
      ? record.env
      : typeof record.environment === 'string'
        ? record.environment
        : 'Unknown';

  const numericCost =
    typeof record.cost_usd === 'number'
      ? record.cost_usd
      : Number(record.cost_usd ?? 0);

  return {
    id:
      typeof record.id === 'string' && record.id.trim()
        ? record.id
        : `${cloudProvider}-${service}-${dateValue}-${index}`,
    date: dateValue,
    cloud_provider: cloudProvider,
    service,
    team,
    env: envSource.trim() || 'Unknown',
    cost_usd: Number.isFinite(numericCost) ? numericCost : 0,
  };
}

export function useSpendData(filters: Filters, refreshToken = 0) {
  const [spendData, setSpendData] = useState<SpendRecord[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query params
        const params = new URLSearchParams();
        if (filters.cloud && filters.cloud !== 'All') {
          params.append('cloud', filters.cloud);
        }
        if (filters.team && filters.team !== 'All') {
          params.append('team', filters.team);
        }
        if (filters.environment && filters.environment !== 'All') {
          params.append('env', filters.environment);
        }
        if (filters.month && filters.month !== 'All') {
          params.append('month', filters.month);
        }
        params.append('refresh', String(refreshToken));

        const queryString = params.toString();
        const spendUrl = `${API_BASE_URL}/spend${queryString ? `?${queryString}` : ''}`;
        const summaryUrl = `${API_BASE_URL}/summary${queryString ? `?${queryString}` : ''}`;

        // Fetch both endpoints in parallel
        const [spendResponse, summaryResponse] = await Promise.all([
          fetch(spendUrl, { cache: 'no-store' }),
          fetch(summaryUrl, { cache: 'no-store' }),
        ]);

        if (!spendResponse.ok || !summaryResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const spendJson = await spendResponse.json();
        const summaryJson = await summaryResponse.json();

        setSpendData(
          Array.isArray(spendJson)
            ? spendJson.map((record, index) => normalizeSpendRecord(record, index))
            : [],
        );
        setSummary(summaryJson);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setSpendData([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.cloud, filters.team, filters.environment, filters.month, refreshToken]);

  return { spendData, summary, loading, error };
}
