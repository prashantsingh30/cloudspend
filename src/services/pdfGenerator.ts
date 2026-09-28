import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense, User, Budget, CurrencyCode } from '../types';
import { formatCurrency, formatDate, CURRENCY_SYMBOLS } from '../utils/formatters';

interface GenerateReportOptions {
  user?: User;
  userName?: string;
  userEmail?: string;
  currency?: CurrencyCode;
  expenses: Expense[];
  budget?: Budget | null;
  periodLabel?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
}

export function generateExpensePdfReport(options: GenerateReportOptions): void {
  const { user, userName, userEmail, currency, expenses, budget, periodLabel, period } = options;

  const displayName = userName || user?.name || 'Account Holder';
  const displayEmail = userEmail || user?.email || '';
  const displayCurrency: CurrencyCode = currency || user?.currency || 'USD';
  const finalPeriodLabel = periodLabel || period || 'Selected Period';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const currencySymbol = CURRENCY_SYMBOLS[displayCurrency] || '$';

  // Calculations
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const transactionCount = expenses.length;
  const avgAmount = transactionCount > 0 ? totalAmount / transactionCount : 0;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // Color definitions (Indigo brand theme)
  const primaryColor: [number, number, number] = [21, 26, 45]; // Primary text (#151A2D)
  const accentColor: [number, number, number] = [81, 69, 229]; // Deep indigo (#5145E5)
  const lightBg: [number, number, number] = [247, 248, 252]; // Page light bg (#F7F8FC)

  // 1. Top Header Bar
  doc.setFillColor(...accentColor);
  doc.rect(0, 0, pageWidth, 20, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CloudSpend', 14, 13);

  // Header Right: Tagline / Report
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Smart Expense Management & Budget Tracking', pageWidth - 14, 13, { align: 'right' });

  // 2. Report Information Meta
  let y = 30;
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Monthly Expense & Financial Report', 14, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const userSubtitle = displayEmail ? `${displayName} (${displayEmail})` : displayName;
  doc.text(`Generated for: ${userSubtitle}`, 14, y);
  doc.text(`Period: ${finalPeriodLabel}`, pageWidth - 14, y, { align: 'right' });

  y += 5;
  const generatedOn = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());
  doc.text(`Generated on: ${generatedOn}`, 14, y);
  doc.text(`Currency: ${displayCurrency} (${currencySymbol})`, pageWidth - 14, y, { align: 'right' });

  // 3. Summary Stat Boxes
  y += 8;
  const boxWidth = (pageWidth - 28 - 9) / 4;
  const boxHeight = 18;

  const statItems = [
    { label: 'Total Spending', value: formatCurrency(totalAmount, displayCurrency) },
    { label: 'Transactions', value: transactionCount.toString() },
    { label: 'Average Expense', value: formatCurrency(avgAmount, displayCurrency) },
    {
      label: 'Monthly Budget',
      value: budget ? formatCurrency(budget.amount, displayCurrency) : 'Not Configured',
    },
  ];

  statItems.forEach((stat, index) => {
    const boxX = 14 + index * (boxWidth + 3);
    doc.setFillColor(...lightBg);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(boxX, y, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(stat.label, boxX + 4, y + 6);

    doc.setFontSize(10.5);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.value, boxX + 4, y + 13);
  });

  y += boxHeight + 8;

  // 4. Category Breakdown Table
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Spending by Category', 14, y);
  y += 3;

  const categoryRows = sortedCategories.map(([cat, amt]) => [
    cat,
    `${((amt / (totalAmount || 1)) * 100).toFixed(1)}%`,
    formatCurrency(amt, displayCurrency),
  ]);

  if (categoryRows.length === 0) {
    categoryRows.push(['No expenses recorded in this period', '0.0%', formatCurrency(0, displayCurrency)]);
  }

  autoTable(doc, {
    startY: y,
    head: [['Category', '% of Total', 'Amount']],
    body: categoryRows,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.2,
      font: 'helvetica',
      textColor: [51, 65, 85],
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      lineColor: [226, 232, 240],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  // Get table end position
  y = (doc as any).lastAutoTable.finalY + 10;

  // 5. Detailed Transactions Table
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Details', 14, y);
  y += 3;

  const transactionRows = expenses.map((e) => [
    formatDate(e.date),
    e.description + (e.notes ? `\nNote: ${e.notes}` : ''),
    e.category,
    e.paymentMethod,
    formatCurrency(e.amount, displayCurrency),
  ]);

  if (transactionRows.length === 0) {
    transactionRows.push(['-', 'No transactions found for the selected timeframe.', '-', '-', formatCurrency(0, displayCurrency)]);
  }

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Description', 'Category', 'Payment Method', 'Amount']],
    body: transactionRows,
    theme: 'striped',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      font: 'helvetica',
      textColor: [51, 65, 85],
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 30 },
      3: { cellWidth: 28 },
      4: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14, bottom: 20 },
    didDrawPage: (data) => {
      // Footer on every page
      const pageStr = `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text('CloudSpend Financial Statement — Generated Client-Side via jsPDF', 14, pageHeight - 8);
      doc.text(pageStr, pageWidth - 14, pageHeight - 8, { align: 'right' });
    },
  });

  // Filename
  const dateStr = new Date().toISOString().slice(0, 7);
  const cleanLabel = finalPeriodLabel.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `CloudSpend_Expense_Report_${cleanLabel || dateStr}.pdf`;

  doc.save(filename);
}
