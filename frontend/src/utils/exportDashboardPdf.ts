import jsPDF from 'jspdf';
import { DataStatus, SpendRecord } from '../types/spend';
import { formatCurrency } from './formatCurrency';

interface ExportOptions {
  data: SpendRecord[];
  dataStatus: DataStatus | null;
  filters: {
    cloud?: string;
    team?: string;
    environment?: string;
    month?: string;
  };
}

function buildTeamSummary(data: SpendRecord[]) {
  const totals = data.reduce(
    (acc, record) => {
      acc[record.team] = (acc[record.team] || 0) + record.cost_usd;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Object.entries(totals)
    .map(([team, cost]) => ({ team, cost }))
    .sort((a, b) => b.cost - a.cost);
}

function summarizeFilters(filters: ExportOptions['filters']) {
  const entries = [
    ['Cloud', filters.cloud || 'All'],
    ['Team', filters.team || 'All'],
    ['Environment', filters.environment || 'All'],
    ['Month', filters.month || 'All'],
  ];

  return entries.map(([label, value]) => `${label}: ${value}`).join(' | ');
}

export async function exportDashboardPdf({
  data,
  dataStatus,
  filters,
}: ExportOptions) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const totalSpend = data.reduce((sum, record) => sum + record.cost_usd, 0);
  const awsSpend = data
    .filter((record) => record.cloud_provider === 'AWS')
    .reduce((sum, record) => sum + record.cost_usd, 0);
  const gcpSpend = data
    .filter((record) => record.cloud_provider === 'GCP')
    .reduce((sum, record) => sum + record.cost_usd, 0);
  const teamSummary = buildTeamSummary(data);

  const marginX = 40;
  let currentY = 48;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('Cloud Spend Viewer Report', marginX, currentY);

  currentY += 22;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Generated on ${new Date().toLocaleString('en-IN')}`, marginX, currentY);

  currentY += 18;
  pdf.text(summarizeFilters(filters), marginX, currentY);

  if (dataStatus) {
    currentY += 18;
    pdf.text(
      `Data source: ${dataStatus.awsDisplayName} and ${dataStatus.gcpDisplayName}`,
      marginX,
      currentY,
    );
  }

  currentY += 28;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Spend Summary', marginX, currentY);

  currentY += 20;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(`Total Spend: ${formatCurrency(totalSpend)}`, marginX, currentY);
  currentY += 16;
  pdf.text(`AWS Spend: ${formatCurrency(awsSpend)}`, marginX, currentY);
  currentY += 16;
  pdf.text(`GCP Spend: ${formatCurrency(gcpSpend)}`, marginX, currentY);
  currentY += 16;
  pdf.text(`Records in current view: ${data.length}`, marginX, currentY);

  currentY += 28;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Team-wise Usage', marginX, currentY);

  currentY += 18;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10.5);

  teamSummary.slice(0, 10).forEach((entry, index) => {
    pdf.text(
      `${index + 1}. ${entry.team}: ${formatCurrency(entry.cost)}`,
      marginX,
      currentY,
    );
    currentY += 15;
  });

  if (teamSummary.length > 10) {
    pdf.addPage();
    currentY = 40;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Additional Team-wise Usage', marginX, currentY);

    currentY += 18;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10.5);

    teamSummary.slice(10).forEach((entry, index) => {
      if (currentY > 780) {
        pdf.addPage();
        currentY = 40;
      }

      pdf.text(
        `${index + 11}. ${entry.team}: ${formatCurrency(entry.cost)}`,
        marginX,
        currentY,
      );
      currentY += 15;
    });
  }

  const blob = pdf.output('blob');
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'cloud-spend-dashboard-report.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
