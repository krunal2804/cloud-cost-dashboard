const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const {
  awsPath,
  gcpPath,
  outputPath,
  generateCombinedData,
  getDataStatus,
} = require('./dataPipeline');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

let spendData = [];
const uploadMetadataPath = path.join(
  __dirname,
  'data',
  'upload-metadata.json',
);

function coerceCsvText(value) {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.join('\n');
  }

  if (value && typeof value === 'object' && 'toString' in value) {
    const asString = value.toString();
    return typeof asString === 'string' ? asString : '';
  }

  return '';
}

function validateCsvText(csvText, label) {
  if (!csvText.trim()) {
    throw new Error(`${label} file is empty.`);
  }

  const firstLine = csvText.split(/\r?\n/, 1)[0] || '';
  if (!firstLine.includes(',')) {
    throw new Error(`${label} file does not look like a CSV.`);
  }
}

function readUploadMetadata() {
  try {
    const raw = fs.readFileSync(uploadMetadataPath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      awsDisplayName:
        typeof parsed.awsDisplayName === 'string' ? parsed.awsDisplayName : null,
      gcpDisplayName:
        typeof parsed.gcpDisplayName === 'string' ? parsed.gcpDisplayName : null,
    };
  } catch (err) {
    return {
      awsDisplayName: null,
      gcpDisplayName: null,
    };
  }
}

function writeUploadMetadata(metadata) {
  fs.writeFileSync(uploadMetadataPath, JSON.stringify(metadata, null, 2), 'utf8');
}

function loadData() {
  try {
    const raw = fs.readFileSync(outputPath);
    spendData = JSON.parse(raw);
    console.log('Data loaded successfully:', spendData.length, 'records');
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

loadData();

app.get('/api/spend', (req, res) => {
  let filtered = spendData;
  const { cloud, team, env, month } = req.query;

  if (cloud && cloud !== 'All') {
    filtered = filtered.filter((item) => item.cloud_provider === cloud);
  }
  if (team && team !== 'All') {
    filtered = filtered.filter((item) => item.team === team);
  }
  if (env && env !== 'All') {
    filtered = filtered.filter((item) => item.env === env);
  }
  if (month) {
    filtered = filtered.filter((item) => item.date.startsWith(month));
  }

  res.json(filtered);
});

app.get('/api/summary', (req, res) => {
  let total = 0;
  let aws = 0;
  let gcp = 0;

  spendData.forEach((item) => {
    total += item.cost_usd;
    if (item.cloud_provider === 'AWS') aws += item.cost_usd;
    if (item.cloud_provider === 'GCP') gcp += item.cost_usd;
  });

  res.json({
    total: total.toFixed(2),
    aws: aws.toFixed(2),
    gcp: gcp.toFixed(2),
  });
});

app.get('/api/data/status', (req, res) => {
  try {
    const metadata = readUploadMetadata();
    res.json({
      ...getDataStatus(spendData),
      awsDisplayName: metadata.awsDisplayName || 'aws_line_items_12mo.csv',
      gcpDisplayName: metadata.gcpDisplayName || 'gcp_billing_12mo.csv',
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to read data status',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

app.post('/api/data/upload', async (req, res) => {
  const { awsCsv, gcpCsv, awsFileName, gcpFileName } = req.body;

  if (!awsCsv && !gcpCsv) {
    return res.status(400).json({
      error: 'Provide at least one CSV file to upload.',
    });
  }

  try {
    const existingMetadata = readUploadMetadata();

    if (awsCsv) {
      const normalizedAwsCsv = coerceCsvText(awsCsv);
      validateCsvText(normalizedAwsCsv, 'AWS CSV');
      fs.writeFileSync(awsPath, normalizedAwsCsv, 'utf8');
      existingMetadata.awsDisplayName =
        typeof awsFileName === 'string' && awsFileName.trim()
          ? awsFileName.trim()
          : 'aws_line_items_12mo.csv';
    }
    if (gcpCsv) {
      const normalizedGcpCsv = coerceCsvText(gcpCsv);
      validateCsvText(normalizedGcpCsv, 'GCP CSV');
      fs.writeFileSync(gcpPath, normalizedGcpCsv, 'utf8');
      existingMetadata.gcpDisplayName =
        typeof gcpFileName === 'string' && gcpFileName.trim()
          ? gcpFileName.trim()
          : 'gcp_billing_12mo.csv';
    }

    spendData = await generateCombinedData();
    writeUploadMetadata(existingMetadata);

    res.json({
      message: 'CSV files uploaded and analytics refreshed successfully.',
      status: {
        ...getDataStatus(spendData),
        awsDisplayName:
          existingMetadata.awsDisplayName || 'aws_line_items_12mo.csv',
        gcpDisplayName:
          existingMetadata.gcpDisplayName || 'gcp_billing_12mo.csv',
      },
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to process uploaded CSV files.',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
