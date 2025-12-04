import { useState, useEffect } from 'react';
import { SpendRecord, SummaryData, Filters } from '../types/spend';

const API_BASE_URL = 'http://localhost:5000/api';

export function useSpendData(filters: Filters) {
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

        const queryString = params.toString();
        const spendUrl = `${API_BASE_URL}/spend${queryString ? `?${queryString}` : ''}`;
        const summaryUrl = `${API_BASE_URL}/summary${queryString ? `?${queryString}` : ''}`;

        // Fetch both endpoints in parallel
        const [spendResponse, summaryResponse] = await Promise.all([
          fetch(spendUrl),
          fetch(summaryUrl),
        ]);

        if (!spendResponse.ok || !summaryResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const spendJson = await spendResponse.json();
        const summaryJson = await summaryResponse.json();

        setSpendData(spendJson);
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
  }, [filters.cloud, filters.team, filters.environment, filters.month]);

  return { spendData, summary, loading, error };
}
