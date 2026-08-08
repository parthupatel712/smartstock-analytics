import {
  File,
  Paths,
} from "expo-file-system";
import * as XLSX from "xlsx";

import type { InventoryAnalyticsSummary } from "../types/inventoryAnalytics";
import type {
  ExportedReport,
  ExportReportType,
} from "../types/exportReport";
import type { Product } from "../types/product";
import type { TransactionHistoryItem } from "../types/transactionHistory";

function createFileName(
  reportType: ExportReportType,
): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  return `smartstock-${reportType}-${timestamp}.xlsx`;
}

function writeWorkbook(
  workbook: XLSX.WorkBook,
  reportType: ExportReportType,
  rowCount: number,
): ExportedReport {
  const fileName = createFileName(reportType);

  const file = new File(
    Paths.document,
    fileName,
  );

  if (file.exists) {
    file.delete();
  }

  file.create();

  const workbookBytes = XLSX.write(
    workbook,
    {
      type: "array",
      bookType: "xlsx",
    },
  ) as ArrayBuffer;

  file.write(
    new Uint8Array(workbookBytes),
  );

  return {
    fileName,
    fileUri: file.uri,
    reportType,
    format: "xlsx",
    rowCount,
    createdAt: new Date().toISOString(),
  };
}

function setColumnWidths(
  worksheet: XLSX.WorkSheet,
  widths: number[],
): void {
  worksheet["!cols"] = widths.map(
    (width) => ({
      wch: width,
    }),
  );
}

export async function exportInventoryExcel(
  products: Product[],
): Promise<ExportedReport> {
  const rows = products.map((product) => ({
    "Product ID": product.id,
    Barcode: product.barcode,
    "Product Name": product.name,
    Brand: product.brand,
    Department: product.department,
    Category: product.category,

    "Unit Cost": product.unitCost,
    "Unit Price": product.unitPrice,

    "Current Stock": product.currentStock,
    "Reorder Level": product.reorderLevel,

    Active: product.isActive
      ? "Yes"
      : "No",

    "Created At": product.createdAt,
    "Updated At": product.updatedAt,
  }));

  const worksheet =
    XLSX.utils.json_to_sheet(rows);

  setColumnWidths(
    worksheet,
    [
      12,
      18,
      28,
      20,
      24,
      22,
      12,
      12,
      14,
      14,
      10,
      24,
      24,
    ],
  );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Inventory",
  );

  return writeWorkbook(
    workbook,
    "inventory",
    products.length,
  );
}

export async function exportTransactionsExcel(
  transactions: TransactionHistoryItem[],
): Promise<ExportedReport> {
  const rows = transactions.map(
    (transaction) => ({
      "Transaction ID": transaction.id,

      "Product ID":
        transaction.productId,

      "Product Name":
        transaction.productName,

      Brand:
        transaction.productBrand,

      Barcode:
        transaction.productBarcode,

      Department:
        transaction.productDepartment,

      Category:
        transaction.productCategory,

      "Transaction Type":
        transaction.transactionType,

      Quantity:
        transaction.quantity,

      "Stock Before":
        transaction.stockBefore,

      "Stock After":
        transaction.stockAfter,

      "Unit Cost":
        transaction.unitCost,

      "Unit Price":
        transaction.unitPrice,

      "Transaction Value":
        transaction.transactionValue,

      Source:
        transaction.source,

      Notes:
        transaction.notes ?? "",

      "Created At":
        transaction.createdAt,
    }),
  );

  const worksheet =
    XLSX.utils.json_to_sheet(rows);

  setColumnWidths(
    worksheet,
    [
      16,
      12,
      28,
      20,
      18,
      24,
      22,
      18,
      12,
      14,
      14,
      12,
      12,
      18,
      16,
      32,
      24,
    ],
  );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Transactions",
  );

  return writeWorkbook(
    workbook,
    "transactions",
    transactions.length,
  );
}

export async function exportAnalyticsExcel(
  analytics: InventoryAnalyticsSummary,
): Promise<ExportedReport> {
  const workbook =
    XLSX.utils.book_new();

  const dailyRows =
    analytics.dailyMetrics.map(
      (metric) => ({
        Date: metric.date,

        "Sales Value":
          metric.salesValue,

        "Stock In Value":
          metric.stockInValue,

        "Damage Value":
          metric.damageValue,

        "Sales Units":
          metric.salesUnits,

        "Stock In Units":
          metric.stockInUnits,

        "Damage Units":
          metric.damageUnits,

        "Transaction Count":
          metric.transactionCount,
      }),
    );

  const dailyWorksheet =
    XLSX.utils.json_to_sheet(
      dailyRows,
    );

  setColumnWidths(
    dailyWorksheet,
    [
      14,
      16,
      18,
      16,
      14,
      16,
      14,
      18,
    ],
  );

  XLSX.utils.book_append_sheet(
    workbook,
    dailyWorksheet,
    "Daily Analytics",
  );

  const productRows =
    analytics.topProducts.map(
      (product, index) => ({
        Rank: index + 1,

        "Product ID":
          product.productId,

        "Product Name":
          product.productName,

        Brand:
          product.brand,

        Department:
          product.department,

        Category:
          product.category,

        "Units Sold":
          product.unitsSold,

        "Sales Value":
          product.salesValue,

        "Transaction Count":
          product.transactionCount,
      }),
    );

  const productWorksheet =
    XLSX.utils.json_to_sheet(
      productRows,
    );

  setColumnWidths(
    productWorksheet,
    [
      8,
      12,
      28,
      20,
      24,
      22,
      14,
      16,
      18,
    ],
  );

  XLSX.utils.book_append_sheet(
    workbook,
    productWorksheet,
    "Top Products",
  );

  const categoryRows =
    analytics.topCategories.map(
      (category, index) => ({
        Rank: index + 1,

        Department:
          category.department,

        Category:
          category.category,

        "Units Sold":
          category.unitsSold,

        "Sales Value":
          category.salesValue,

        "Transaction Count":
          category.transactionCount,
      }),
    );

  const categoryWorksheet =
    XLSX.utils.json_to_sheet(
      categoryRows,
    );

  setColumnWidths(
    categoryWorksheet,
    [
      8,
      24,
      22,
      14,
      16,
      18,
    ],
  );

  XLSX.utils.book_append_sheet(
    workbook,
    categoryWorksheet,
    "Categories",
  );

  const rowCount =
    analytics.dailyMetrics.length +
    analytics.topProducts.length +
    analytics.topCategories.length;

  return writeWorkbook(
    workbook,
    "analytics",
    rowCount,
  );
}