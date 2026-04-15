import { useState } from 'react';
import { CheckCircle2, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { DataStatus } from '../types/spend';

const API_BASE_URL = 'http://localhost:5000/api';

interface DataUploadPanelProps {
  onRefresh: () => Promise<void> | void;
}

export function DataUploadPanel({ onRefresh }: DataUploadPanelProps) {
  const [awsFile, setAwsFile] = useState<File | null>(null);
  const [gcpFile, setGcpFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleUpload() {
    if (!awsFile && !gcpFile) {
      setError('Please choose at least one CSV file.');
      return;
    }

    if (awsFile && !awsFile.name.toLowerCase().endsWith('.csv')) {
      setError('AWS file must be a CSV.');
      return;
    }

    if (gcpFile && !gcpFile.name.toLowerCase().endsWith('.csv')) {
      setError('GCP file must be a CSV.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload: {
        awsCsv?: string;
        gcpCsv?: string;
        awsFileName?: string;
        gcpFileName?: string;
      } = {};

      if (awsFile) {
        payload.awsCsv = await awsFile.text();
        payload.awsFileName = awsFile.name;
      }

      if (gcpFile) {
        payload.gcpCsv = await gcpFile.text();
        payload.gcpFileName = gcpFile.name;
      }

      const response = await fetch(`${API_BASE_URL}/data/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = (await response.json()) as {
        error?: string;
        message?: string;
        status?: DataStatus;
      };

      if (!response.ok) {
        throw new Error(json.error || 'Upload failed.');
      }

      setAwsFile(null);
      setGcpFile(null);
      setSuccessMessage(json.message || 'Upload completed successfully.');
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Upload Billing Data</h2>
        <p className="text-gray-600">
          Choose AWS and GCP CSV files, upload them, and go back to the dashboard
          to see the latest data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 p-4">
          <label htmlFor="aws-upload" className="block text-gray-900 mb-2">
            AWS CSV
          </label>
          <Input
            id="aws-upload"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setAwsFile(file);
            }}
          />
          <p className="text-sm text-gray-500 mt-2">
            {awsFile ? awsFile.name : 'No file selected'}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <label htmlFor="gcp-upload" className="block text-gray-900 mb-2">
            GCP CSV
          </label>
          <Input
            id="gcp-upload"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setGcpFile(file);
            }}
          />
          <p className="text-sm text-gray-500 mt-2">
            {gcpFile ? gcpFile.name : 'No file selected'}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Upload & Reprocess'}
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}
    </section>
  );
}
