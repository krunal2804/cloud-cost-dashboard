import { Filters } from '../types/spend';
import { Filter } from 'lucide-react';

interface FilterBarProps {
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
  availableOptions: {
    cloudProviders: string[];
    teams: string[];
    environments: string[];
    months: string[];
  };
}

export function FilterBar({
  filters,
  onFilterChange,
  availableOptions,
}: FilterBarProps) {
  const handleChange = (key: keyof Filters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <h2 className="text-gray-900">Filters</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cloud Provider */}
        <div>
          <label htmlFor="cloud" className="block text-gray-700 mb-2">
            Cloud Provider
          </label>
          <select
            id="cloud"
            value={filters.cloud || 'All'}
            onChange={(e) => handleChange('cloud', e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="All">All Providers</option>
            {availableOptions.cloudProviders.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </div>

        {/* Team */}
        <div>
          <label htmlFor="team" className="block text-gray-700 mb-2">
            Team
          </label>
          <select
            id="team"
            value={filters.team || 'All'}
            onChange={(e) => handleChange('team', e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="All">All Teams</option>
            {availableOptions.teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        {/* Environment */}
        <div>
          <label htmlFor="environment" className="block text-gray-700 mb-2">
            Environment
          </label>
          <select
            id="environment"
            value={filters.environment || 'All'}
            onChange={(e) => handleChange('environment', e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="All">All Environments</option>
            {availableOptions.environments.map((env) => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div>
          <label htmlFor="month" className="block text-gray-700 mb-2">
            Month
          </label>
          <select
            id="month"
            value={filters.month || 'All'}
            onChange={(e) => handleChange('month', e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="All">All Months</option>
            {availableOptions.months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
