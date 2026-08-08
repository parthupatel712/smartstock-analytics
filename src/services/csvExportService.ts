import {
  File,
  Paths,
} from "expo-file-system";

import type {
  InventoryAnalyticsSummary,
} from "../types/inventoryAnalytics";
import type {
  ExportedReport,
  ExportReportType,
} from "../types/exportReport";
import type { Product } from "../types/product";
import type { TransactionHistoryItem } from "../types/transactionHistory";

function escapeCsvValue(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  const escapedText = text.replace(/"/g, '""');

  if (
    escapedText.includes(",") ||
    escapedText.includes('"') ||
    escapedText.includes("\n") ||
    escapedText.includes("\r")
  ) {
    return `"${escapedText}"`;
  }

  return escapedText;
}

function createCsvRow(
  values: Array<
    string | number | null | undefined
  >,
): string {
  return values
    .map(escapeCsvValue)
    .join(",");
}

function createFileName(
  reportType: ExportReportType,
): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  return `smartstock-${reportType}-${timestamp}.csv`;
}

async function writeCsvFile(
  reportType: ExportReportType,
  csvContent: string,
  rowCount: number,
): Promise<ExportedReport> {
  const fileName =
    createFileName(reportType);

  const file = new File(
    Paths.document,
    fileName,
  );

  if (file.exists) {
    file.delete();
  }

  file.create();

  file.write(csvContent);

  return {
    fileName,
    fileUri: file.uri,
    reportType,
    format: "csv",
    rowCount,
    createdAt: new Date().toISOString(),
  };
}

export async function exportInventoryCsv(
  products: Product[],
): Promise<ExportedReport> {
  const header = createCsvRow([
    "Product ID",
    "Barcode",
    "Product Name",
    "Brand",
    "Department",
    "Category",
    "Unit Cost",
    "Unit Price",
    "Current Stock",
    "Reorder Level",
    "Active",
    "Created At",
    "Updated At",
  ]);

  const rows = products.map((product) =>
    createCsvRow([
      product.id,
      product.barcode,
      product.name,
      product.brand,
      product.department,
      product.category,
      product.unitCost,
      product.unitPrice,
      product.currentStock,
      product.reorderLevel,
      product.isActive ? "Yes" : "No",
      product.createdAt,
      product.updatedAt,
    ]),
  );

  const csvContent = [
    header,
    ...rows,
  ].join("\n");

  return writeCsvFile(
    "inventory",
    csvContent,
    products.length,
  );
}

export async function exportTransactionsCsv(
  transactions: TransactionHistoryItem[],
): Promise<ExportedReport> {
  const header = createCsvRow([
    "Transaction ID",
    "Product ID",
    "Product Name",
    "Brand",
    "Barcode",
    "Department",
    "Category",
    "Transaction Type",
    "Quantity",
    "Stock Before",
    "Stock After",
    "Unit Cost",
    "Unit Price",
    "Transaction Value",
    "Source",
    "Notes",
    "Created At",
  ]);

  const rows = transactions.map(
    (transaction) =>
      createCsvRow([
        transaction.id,
        transaction.productId,
        transaction.productName,
        transaction.productBrand,
        transaction.productBarcode,
        transaction.productDepartment,
        transaction.productCategory,
        transaction.transactionType,
        transaction.quantity,
        transaction.stockBefore,
        transaction.stockAfter,
        transaction.unitCost,
        transaction.unitPrice,
        transaction.transactionValue,
        transaction.source,
        transaction.notes,
        transaction.createdAt,
      ]),
  );

  const csvContent = [
    header,
    ...rows,
  ].join("\n");

  return writeCsvFile(
    "transactions",
    csvContent,
    transactions.length,
  );
}

export async function exportAnalyticsCsv(
  analytics: InventoryAnalyticsSummary,
): Promise<ExportedReport> {
  const sections: string[] = [];

  sections.push(
    createCsvRow([
      "Daily Inventory Metrics",
    ]),
  );

  sections.push(
    createCsvRow([
      "Date",
      "Sales Value",
      "Stock In Value",
      "Damage Value",
      "Sales Units",
      "Stock In Units",
      "Damage Units",
      "Transaction Count",
    ]),
  );

  analytics.dailyMetrics.forEach(
    (metric) => {
      sections.push(
        createCsvRow([
          metric.date,
          metric.salesValue,
          metric.stockInValue,
          metric.damageValue,
          metric.salesUnits,
          metric.stockInUnits,
          metric.damageUnits,
          metric.transactionCount,
        ]),
      );
    },
  );

  sections.push("");

  sections.push(
    createCsvRow([
      "Top Products",
    ]),
  );

  sections.push(
    createCsvRow([
      "Product ID",
      "Product Name",
      "Brand",
      "Department",
      "Category",
      "Units Sold",
      "Sales Value",
      "Transaction Count",
    ]),
  );

  analytics.topProducts.forEach(
    (product) => {
      sections.push(
        createCsvRow([
          product.productId,
          product.productName,
          product.brand,
          product.department,
          product.category,
          product.unitsSold,
          product.salesValue,
          product.transactionCount,
        ]),
      );
    },
  );

  sections.push("");

  sections.push(
    createCsvRow([
      "Top Categories",
    ]),
  );

  sections.push(
    createCsvRow([
      "Department",
      "Category",
      "Units Sold",
      "Sales Value",
      "Transaction Count",
    ]),
  );

  analytics.topCategories.forEach(
    (category) => {
      sections.push(
        createCsvRow([
          category.department,
          category.category,
          category.unitsSold,
          category.salesValue,
          category.transactionCount,
        ]),
      );
    },
  );

  const rowCount =
    analytics.dailyMetrics.length +
    analytics.topProducts.length +
    analytics.topCategories.length;

  return writeCsvFile(
    "analytics",
    sections.join("\n"),
    rowCount,
  );
}