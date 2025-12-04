const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Load combined JSON data
const dataPath = path.join(__dirname, 'data/combined.json');
let spendData = [];

function loadData() {
  try {
    const raw = fs.readFileSync(dataPath);
    spendData = JSON.parse(raw);
    console.log('✔ Data loaded successfully:', spendData.length, 'records');
  } catch (err) {
    console.error('❌ Error loading data:', err);
  }
}

loadData();

/* ===========================
   API ROUTES
=========================== */

// Route 1: Get spend data
app.get('/api/spend', (req, res) => {
  let filtered = spendData;

  const { cloud, team, env, month } = req.query;

  if (cloud && cloud !== 'All') {
    filtered = filtered.filter((i) => i.cloud_provider === cloud);
  }
  if (team && team !== 'All') {
    filtered = filtered.filter((i) => i.team === team);
  }
  if (env && env !== 'All') {
    filtered = filtered.filter((i) => i.env === env);
  }
  if (month) {
    filtered = filtered.filter((i) => i.date.startsWith(month));
  }

  res.json(filtered);
});

// Route 2: Summary endpoint
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

/* ===========================
   SERVE FRONTEND BUILD
=========================== */

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// SPA fallback for React Router (Express 5 compatible)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

/* ===========================
   START SERVER
=========================== */

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
