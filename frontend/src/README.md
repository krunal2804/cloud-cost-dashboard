# K&Co. Cloud Spend Viewer Dashboard

A modern, production-quality SaaS dashboard for monitoring and analyzing cloud costs across AWS and GCP.

## Features

- **Real-time Data Filtering**: Filter by cloud provider, team, environment, and month
- **Summary Cards**: Quick overview of total spend, AWS spend, and GCP spend
- **Interactive Charts**:
  - Daily spend trend line chart
  - Spend by cloud provider bar chart
  - Spend by team pie chart
- **Sortable Data Table**: Click column headers to sort by date or cost
- **Detailed Records**: Click any row to view full spend details in a modal
- **Loading & Empty States**: Skeleton loaders and helpful messages
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Prerequisites

Backend API server running at `http://localhost:5000` with the following endpoints:
- `GET /api/spend?cloud=AWS&team=Core&env=prod&month=2024-01`
- `GET /api/summary?cloud=AWS&team=Core&env=prod&month=2024-01`

## Getting Started

1. Ensure your backend is running at http://localhost:5000
2. The frontend will automatically fetch data from the API
3. Use the filter bar to narrow down your spend analysis
4. Click on table rows to view detailed information
5. Click chart legends to toggle data series

## Component Structure

```
src/
├── components/
│   ├── DashboardLayout.tsx    # Main layout with header
│   ├── FilterBar.tsx           # Filter controls
│   ├── SummaryCards.tsx        # Summary statistics cards
│   ├── SpendTable.tsx          # Sortable data table
│   ├── ChartMonthly.tsx        # Daily spend line chart
│   ├── ChartByCloud.tsx        # Cloud provider bar chart
│   ├── ChartByTeam.tsx         # Team distribution pie chart
│   └── DetailModal.tsx         # Record detail modal
├── hooks/
│   └── useSpendData.ts         # Custom hook for API calls
├── types/
│   └── spend.ts                # TypeScript interfaces
├── utils/
│   └── formatCurrency.ts       # Formatting utilities
└── App.tsx                     # Main application component
```

## Technologies Used

- **React** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Fetch API** for HTTP requests

## API Query Parameters

All filters are optional:
- `cloud`: AWS | GCP
- `team`: Team name
- `env`: prod | staging | dev
- `month`: YYYY-MM format (e.g., 2024-01)

Example: `/api/spend?cloud=AWS&team=Core&env=prod&month=2024-01`
