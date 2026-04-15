const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const dataDir = path.join(__dirname, 'data');
const awsPath = path.join(dataDir, 'aws_line_items_12mo.csv');
const gcpPath = path.join(dataDir, 'gcp_billing_12mo.csv');
const outputPath = path.join(dataDir, 'combined.json');

function normalizeDate(rawDate) {
  if (!rawDate) return null;

  rawDate = rawDate.trim();

  if (/^\d{2}-\d{2}-\d{4}$/.test(rawDate)) {
    const [day, month, year] = rawDate.split('-');
    return `${year}-${month}-${day}`;
  }

  if (rawDate.includes('/')) {
    const [month, day, year] = rawDate.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(rawDate)) {
    const [year, month, day] = rawDate.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  if (!Number.isNaN(new Date(rawDate).getTime())) {
    return rawDate;
  }

  return rawDate;
}

function parseFile(filePath, provider) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const rawDate =
          row.date ||
          row.usage_date ||
          row.UsageDate ||
          row.billing_period ||
          row['Usage Date'] ||
          null;

        rows.push({
          date: normalizeDate(rawDate),
          cloud_provider: provider,
          service:
            row.service ||
            row.Service ||
            row.product ||
            row.LineItemType ||
            'Unknown',
          team: row.team || row.Team || row.department || 'Unknown',
          env:
            row.env ||
            row.Environment ||
            row.environment ||
            row.EnvironmentName ||
            'Unknown',
          cost_usd: Number(
            row.cost_usd || row.cost || row.Cost || row.amount || 0,
          ),
        });
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function generateCombinedData() {
  const awsData = await parseFile(awsPath, 'AWS');
  const gcpData = await parseFile(gcpPath, 'GCP');
  const finalData = [...awsData, ...gcpData];

  fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
  return finalData;
}

function getDataStatus(records = []) {
  const awsStats = fs.statSync(awsPath);
  const gcpStats = fs.statSync(gcpPath);
  const combinedStats = fs.statSync(outputPath);

  return {
    records: records.length,
    awsFile: path.basename(awsPath),
    gcpFile: path.basename(gcpPath),
    combinedFile: path.basename(outputPath),
    updatedAt: combinedStats.mtime.toISOString(),
    awsUpdatedAt: awsStats.mtime.toISOString(),
    gcpUpdatedAt: gcpStats.mtime.toISOString(),
  };
}

module.exports = {
  awsPath,
  gcpPath,
  outputPath,
  generateCombinedData,
  getDataStatus,
};
