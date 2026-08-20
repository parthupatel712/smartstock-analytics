import {
  File,
  Paths,
} from "expo-file-system";

import * as XLSX from "xlsx";

import type {
  InventoryAnalyticsSummary,
} from "../types/inventoryAnalytics";

import type {
  ExportedReport,
  ExportReportType,
} from "../types/exportReport";

import type {
  Product,
} from "../types/product";

import type {
  PurchaseOrderWithItems,
} from "../types/purchaseOrder";

import type {
  TransactionHistoryItem,
} from "../types/transactionHistory";

function createFileName(
  reportType:
    ExportReportType,
): string {
  const timestamp =
    new Date()
      .toISOString()
      .replace(
        /[:.]/g,
        "-",
      );

  return `smartstock-${reportType}-${timestamp}.xlsx`;
}

function writeWorkbook(
  workbook:
    XLSX.WorkBook,

  reportType:
    ExportReportType,

  rowCount:
    number,

  customFileName?:
    string,
): ExportedReport {
  const fileName =
    customFileName ??
    createFileName(
      reportType,
    );

  const file =
    new File(
      Paths.document,
      fileName,
    );

  if (
    file.exists
  ) {
    file.delete();
  }

  file.create();

  const workbookBytes =
    XLSX.write(
      workbook,
      {
        type:
          "array",

        bookType:
          "xlsx",
      },
    ) as ArrayBuffer;

  file.write(
    new Uint8Array(
      workbookBytes,
    ),
  );

  return {
    fileName,

    fileUri:
      file.uri,

    reportType,

    format:
      "xlsx",

    rowCount,

    createdAt:
      new Date().toISOString(),
  };
}

function setColumnWidths(
  worksheet:
    XLSX.WorkSheet,

  widths:
    number[],
): void {
  worksheet["!cols"] =
    widths.map(
      (
        width,
      ) => ({
        wch:
          width,
      }),
    );
}

export async function exportInventoryExcel(
  products:
    Product[],
): Promise<ExportedReport> {
  const rows =
    products.map(
      (
        product,
      ) => ({
        "Product ID":
          product.id,

        Barcode:
          product.barcode,

        "Product Name":
          product.name,

        Brand:
          product.brand,

        Department:
          product.department,

        Category:
          product.category,

        "Unit Cost":
          product.unitCost,

        "Unit Price":
          product.unitPrice,

        "Current Stock":
          product.currentStock,

        "Reorder Level":
          product.reorderLevel,

        Active:
          product.isActive
            ? "Yes"
            : "No",

        "Created At":
          product.createdAt,

        "Updated At":
          product.updatedAt,
      }),
    );

  const worksheet =
    XLSX.utils.json_to_sheet(
      rows,
    );

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
  transactions:
    TransactionHistoryItem[],
): Promise<ExportedReport> {
  const rows =
    transactions.map(
      (
        transaction,
      ) => ({
        "Transaction ID":
          transaction.id,

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
          transaction.notes ??
          "",

        "Created At":
          transaction.createdAt,
      }),
    );

  const worksheet =
    XLSX.utils.json_to_sheet(
      rows,
    );

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
  analytics:
    InventoryAnalyticsSummary,
): Promise<ExportedReport> {
  const workbook =
    XLSX.utils.book_new();

  const dailyRows =
    analytics.dailyMetrics.map(
      (
        metric,
      ) => ({
        Date:
          metric.date,

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
      (
        product,
        index,
      ) => ({
        Rank:
          index +
          1,

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
      (
        category,
        index,
      ) => ({
        Rank:
          index +
          1,

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

export async function exportPurchaseOrderExcel(
  purchaseOrder:
    PurchaseOrderWithItems,
): Promise<ExportedReport> {
  const {
    order,
    items,
  } =
    purchaseOrder;

  const workbook =
    XLSX.utils.book_new();

  const isReceived =
    order.status ===
    "received";

  const totalUnits =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.quantity,
      0,
    );

  const totalReceivedUnits =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.receivedQuantity,
      0,
    );

  const totalMissingUnits =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        Math.max(
          item.quantity -
            item.receivedQuantity,
          0,
        ),
      0,
    );

  const receivedSubtotal =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.receivedQuantity *
          item.unitCost,
      0,
    );

  const notReceivedValue =
    Math.max(
      order.subtotal -
        receivedSubtotal,
      0,
    );

  const receivedTax =
    isReceived &&
    order.subtotal >
      0
      ? order.tax *
        (
          receivedSubtotal /
          order.subtotal
        )
      : order.tax;

  const receivedTotal =
    receivedSubtotal +
    receivedTax;

  const fullyReceived =
    isReceived &&
    totalMissingUnits ===
      0;

  /*
   * Sheet 1:
   * Purchase-order and receiving summary.
   */
  const summaryRows = [
    {
      Field:
        "Purchase Order",

      Value:
        order.orderNumber,
    },

    {
      Field:
        "Vendor / Supplier",

      Value:
        order.vendorName.trim()
          ? order.vendorName
          : "Not specified",
    },

    {
      Field:
        "Status",

      Value:
        order.status ===
        "received"
          ? "Received"
          : order.status,
    },

    {
      Field:
        "Delivery Result",

      Value:
        isReceived
          ? fullyReceived
            ? "Fully Received"
            : "Received with Missing Items"
          : "",
    },

    {
      Field:
        "Created At",

      Value:
        order.createdAt,
    },

    {
      Field:
        "Ordered At",

      Value:
        order.orderedAt ??
        "",
    },

    {
      Field:
        "Received At",

      Value:
        order.receivedAt ??
        "",
    },

    {
      Field:
        "Cancelled At",

      Value:
        order.cancelledAt ??
        "",
    },

    {
      Field:
        "Product Count",

      Value:
        items.length,
    },

    {
      Field:
        "Ordered Units",

      Value:
        totalUnits,
    },

    {
      Field:
        "Received Units",

      Value:
        isReceived
          ? totalReceivedUnits
          : "",
    },

    {
      Field:
        "Missing Units",

      Value:
        isReceived
          ? totalMissingUnits
          : "",
    },

    {
      Field:
        "Original Subtotal",

      Value:
        order.subtotal,
    },

    {
      Field:
        "Not Received Value",

      Value:
        isReceived
          ? notReceivedValue
          : "",
    },

    {
      Field:
        "Received Subtotal",

      Value:
        isReceived
          ? receivedSubtotal
          : "",
    },

    {
      Field:
        isReceived
          ? "Estimated Received Tax"
          : "Tax",

      Value:
        isReceived
          ? receivedTax
          : order.tax,
    },

    {
      Field:
        "Original Order Total",

      Value:
        order.total,
    },

    {
      Field:
        "Received Total",

      Value:
        isReceived
          ? receivedTotal
          : "",
    },

    {
      Field:
        "Notes",

      Value:
        order.notes,
    },
  ];

  const summaryWorksheet =
    XLSX.utils.json_to_sheet(
      summaryRows,
    );

  setColumnWidths(
    summaryWorksheet,
    [
      28,
      52,
    ],
  );

  XLSX.utils.book_append_sheet(
    workbook,
    summaryWorksheet,
    "Order Summary",
  );

  /*
   * Sheet 2:
   *
   * Preserve the original PO snapshot,
   * while also showing what was
   * physically received.
   */
  const itemRows =
    items.map(
      (
        item,
        index,
      ) => {
        const missingQuantity =
          Math.max(
            item.quantity -
              item.receivedQuantity,
            0,
          );

        const receivedValue =
          item.receivedQuantity *
          item.unitCost;

        const missingValue =
          missingQuantity *
          item.unitCost;

        let receivingResult =
          "";

        if (
          isReceived
        ) {
          if (
            missingQuantity ===
            0
          ) {
            receivingResult =
              "Fully Received";
          } else if (
            item.receivedQuantity ===
            0
          ) {
            receivingResult =
              "Not Delivered";
          } else {
            receivingResult =
              "Short";
          }
        }

        return {
          "#":
            index +
            1,

          "Order Item ID":
            item.id,

          "Product ID":
            item.productId ??
            "",

          Barcode:
            item.barcode,

          "Product Name":
            item.productName,

          Brand:
            item.brand,

          Department:
            item.department,

          Category:
            item.category,

          "Ordered Quantity":
            item.quantity,

          "Received Quantity":
            isReceived
              ? item.receivedQuantity
              : "",

          "Missing Quantity":
            isReceived
              ? missingQuantity
              : "",

          "Unit Cost":
            item.unitCost,

          "Original Line Total":
            item.lineTotal,

          "Received Value":
            isReceived
              ? receivedValue
              : "",

          "Not Received Value":
            isReceived
              ? missingValue
              : "",

          "Receiving Result":
            receivingResult,

          "Created At":
            item.createdAt,

          "Last Received At":
            item.lastReceivedAt ??
            "",
        };
      },
    );

  const itemsWorksheet =
    XLSX.utils.json_to_sheet(
      itemRows,
    );

  setColumnWidths(
    itemsWorksheet,
    [
      6,
      15,
      12,
      20,
      30,
      20,
      24,
      22,
      18,
      18,
      18,
      14,
      18,
      18,
      20,
      22,
      24,
      24,
    ],
  );

  XLSX.utils.book_append_sheet(
    workbook,
    itemsWorksheet,
    "Order Items",
  );

  /*
   * Sheet 3:
   * Receiving exceptions.
   *
   * Only create this sheet when the
   * completed delivery has shortages.
   */
  if (
    isReceived &&
    totalMissingUnits >
      0
  ) {
    const exceptionRows =
      items
        .filter(
          (
            item,
          ) =>
            item.receivedQuantity <
            item.quantity,
        )
        .map(
          (
            item,
            index,
          ) => {
            const missingQuantity =
              Math.max(
                item.quantity -
                  item.receivedQuantity,
                0,
              );

            return {
              "#":
                index +
                1,

              Barcode:
                item.barcode,

              Product:
                item.productName,

              Brand:
                item.brand,

              "Ordered Quantity":
                item.quantity,

              "Received Quantity":
                item.receivedQuantity,

              "Missing Quantity":
                missingQuantity,

              "Unit Cost":
                item.unitCost,

              "Not Received Value":
                missingQuantity *
                item.unitCost,

              Result:
                item.receivedQuantity ===
                0
                  ? "Not Delivered"
                  : "Short",

              "Last Received At":
                item.lastReceivedAt ??
                order.receivedAt ??
                "",
            };
          },
        );

    const exceptionWorksheet =
      XLSX.utils.json_to_sheet(
        exceptionRows,
      );

    setColumnWidths(
      exceptionWorksheet,
      [
        6,
        20,
        30,
        20,
        18,
        18,
        18,
        14,
        20,
        18,
        24,
      ],
    );

    XLSX.utils.book_append_sheet(
      workbook,
      exceptionWorksheet,
      "Receiving Exceptions",
    );
  }

  const safeOrderNumber =
    order.orderNumber.replace(
      /[^a-zA-Z0-9-_]/g,
      "-",
    );

  return writeWorkbook(
    workbook,

    "purchase-order",

    items.length,

    `${safeOrderNumber}.xlsx`,
  );
}