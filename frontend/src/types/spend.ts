export interface SpendRecord {
  id: string;
  date: string;
  cloud_provider: string;
  service: string;
  team: string;
  env: string;
  cost_usd: number;
}

export interface SummaryData {
  total: string;
  aws: string;
  gcp: string;
}

export interface Filters {
  cloud?: string;
  team?: string;
  environment?: string;
  month?: string;
}

export interface DataStatus {
  records: number;
  awsFile: string;
  gcpFile: string;
  awsDisplayName: string;
  gcpDisplayName: string;
  combinedFile: string;
  updatedAt: string;
  awsUpdatedAt: string;
  gcpUpdatedAt: string;
}
