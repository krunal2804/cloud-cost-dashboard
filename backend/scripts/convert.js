const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// File paths
const awsPath = path.join(__dirname, '../data/aws_line_items_12mo.csv');
const gcpPath = path.join(__dirname, '../data/gcp_billing_12mo.csv');
const outputPath = path.join(__dirname, '../data/combined.json');

let finalData = [];

// 🔥 Date Normalizer Function
function normalizeDate(rawDate) {
  if (!rawDate) return null;

  rawDate = rawDate.trim();

  // Case 1: DD-MM-YYYY  (01-01-2025)
  if (/^\d{2}-\d{2}-\d{4}$/.test(rawDate)) {
    const [day, month, year] = rawDate.split('-');
    return `${year}-${month}-${day}`;
  }

  // Case 2: MM/DD/YYYY
  if (rawDate.includes('/')) {
    const [month, day, year] = rawDate.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Case 3: YYYY-M-D → pad zeros
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(rawDate)) {
    const [y, m, d] = rawDate.split('-');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Case 4: Already valid
  if (!isNaN(new Date(rawDate).getTime())) {
    return rawDate;
  }

  return rawDate;
}

// Helper function to convert each CSV file
function parseFile(filePath, provider) {
  return new Promise((resolve) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // extract original date
        let rawDate =
          row.date ||
          row.usage_date ||
          row.UsageDate ||
          row.billing_period ||
          row['Usage Date'] ||
          null;

        // normalize date to safe ISO format
        const normalizedDate = normalizeDate(rawDate);

        rows.push({
          date: normalizedDate,
          cloud_provider: provider,
          service:
            row.service ||
            row.Service ||
            row.product ||
            row['LineItemType'] ||
            'Unknown',
          team: row.team || row.Team || row.department || 'Unknown',
          env: row.env || row.Environment || row.environment || 'Unknown',
          cost_usd: Number(
            row.cost_usd || row.cost || row['cost'] || row.amount || 0,
          ),
        });
      })
      .on('end', () => {
        resolve(rows);
      });
  });
}

// Main conversion
(async () => {
  const awsData = await parseFile(awsPath, 'AWS');
  const gcpData = await parseFile(gcpPath, 'GCP');

  finalData = [...awsData, ...gcpData];

  fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));

  console.log('✔ Conversion complete. combined.json created successfully!');
})();
