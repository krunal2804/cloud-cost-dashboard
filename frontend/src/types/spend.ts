export interface SpendRecord {
  id: string;
  date: string;
  cloud_provider: string;
  service: string;
  team: string;
  environment: string;
  cost: number;
}

export interface SummaryData {
  total_spend: number;
  aws_spend: number;
  gcp_spend: number;
}

export interface Filters {
  cloud?: string;
  team?: string;
  environment?: string;
  month?: string;
}
