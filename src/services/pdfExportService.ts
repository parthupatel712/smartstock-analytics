import * as Print from "expo-print";

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

function escapeHtml(
  value:
    unknown,
): string {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return "";
  }

  return String(
    value,
  )
    .replace(
      /&/g,
      "&amp;",
    )
    .replace(
      /</g,
      "&lt;",
    )
    .replace(
      />/g,
      "&gt;",
    )
    .replace(
      /"/g,
      "&quot;",
    )
    .replace(
      /'/g,
      "&#039;",
    );
}

function formatCurrency(
  value:
    number,
): string {
  return new Intl.NumberFormat(
    "en-CA",
    {
      style:
        "currency",

      currency:
        "CAD",

      maximumFractionDigits:
        2,
    },
  ).format(
    value,
  );
}

function formatDateTime(
  value:
    string,
): string {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-CA",
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    },
  );
}

function createDocumentStyles():
  string {
  return `
    <style>
      @page {
        margin: 28px;
      }

      * {
        box-sizing: border-box;
      }

      body {
        font-family: Helvetica, Arial, sans-serif;
        color: #1f2937;
        font-size: 11px;
        line-height: 1.45;
      }

      h1 {
        margin: 0;
        font-size: 24px;
        color: #111827;
      }

      h2 {
        margin-top: 24px;
        margin-bottom: 9px;
        font-size: 16px;
        color: #111827;
      }

      .subtitle {
        margin-top: 5px;
        color: #6b7280;
      }

      .meta {
        margin-top: 14px;
        color: #6b7280;
      }

      .summary-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
      }

      .summary-card {
        width: 48%;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        background: #f9fafb;
      }

      .summary-label {
        font-size: 10px;
        text-transform: uppercase;
        color: #6b7280;
      }

      .summary-value {
        margin-top: 4px;
        font-size: 18px;
        font-weight: 700;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }

      th {
        background: #111827;
        color: #ffffff;
        text-align: left;
        padding: 7px;
        font-size: 9px;
      }

      td {
        border-bottom: 1px solid #e5e7eb;
        padding: 7px;
        vertical-align: top;
        font-size: 9px;
      }

      tr:nth-child(even) td {
        background: #f9fafb;
      }

      .positive {
        color: #15803d;
        font-weight: 700;
      }

      .negative {
        color: #b42318;
        font-weight: 700;
      }

      .purchase-order-header {
        margin-top: 20px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 15px;
      }

      .purchase-order-top-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .purchase-order-vendor {
        margin-top: 4px;
        font-size: 15px;
        font-weight: 700;
        color: #111827;
      }

      .purchase-order-status {
        padding: 5px 9px;
        border-radius: 999px;
        background: #f3f4f6;
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .purchase-order-details {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
      }

      .purchase-order-detail {
        margin-top: 4px;
      }

      .right {
        text-align: right;
      }

      .product-secondary {
        margin-top: 2px;
        color: #6b7280;
        font-size: 8px;
      }

      .totals-container {
        width: 320px;
        margin-top: 22px;
        margin-left: auto;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 14px;
      }

      .totals-section-title {
        margin-bottom: 11px;
        font-size: 11px;
        font-weight: 700;
        color: #111827;
      }

      .totals-row {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 8px;
      }

      .totals-row span:first-child {
        color: #6b7280;
      }

      .totals-divider {
        height: 1px;
        margin: 10px 0 12px;
        background: #e5e7eb;
      }

      .totals-final {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid #e5e7eb;
        font-size: 15px;
        font-weight: 700;
      }

      .delivery-result {
        margin-top: 12px;
        border-radius: 7px;
        padding: 9px 10px;
        background: #f0fdf4;
        color: #166534;
        font-size: 9px;
        font-weight: 700;
      }

      .delivery-result-warning {
        background: #fffbeb;
        color: #92400e;
      }

      .notes-card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        background: #f9fafb;
        white-space: pre-wrap;
      }

      .footer {
        margin-top: 28px;
        padding-top: 10px;
        border-top: 1px solid #e5e7eb;
        color: #9ca3af;
        font-size: 9px;
      }
    </style>
  `;
}

function createHtmlDocument(
  title:
    string,

  body:
    string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        ${createDocumentStyles()}
      </head>

      <body>
        <h1>
          ${escapeHtml(
            title,
          )}
        </h1>

        <div class="subtitle">
          SmartStock Analytics
        </div>

        <div class="meta">
          Generated:
          ${escapeHtml(
            new Date().toLocaleString(
              "en-CA",
            ),
          )}
        </div>

        ${body}

        <div class="footer">
          Generated by SmartStock Analytics
        </div>
      </body>
    </html>
  `;
}

async function generatePdf(
  reportType:
    ExportReportType,

  html:
    string,

  rowCount:
    number,

  customFileName?:
    string,
): Promise<ExportedReport> {
  const result =
    await Print.printToFileAsync({
      html,
    });

  return {
    fileName:
      customFileName ??
      `smartstock-${reportType}-${Date.now()}.pdf`,

    fileUri:
      result.uri,

    reportType,

    format:
      "pdf",

    rowCount,

    createdAt:
      new Date().toISOString(),
  };
}

export async function exportInventoryPdf(
  products:
    Product[],
): Promise<ExportedReport> {
  const totalUnits =
    products.reduce(
      (
        total,
        product,
      ) =>
        total +
        product.currentStock,
      0,
    );

  const totalCost =
    products.reduce(
      (
        total,
        product,
      ) =>
        total +
        product.currentStock *
          product.unitCost,
      0,
    );

  const totalRetail =
    products.reduce(
      (
        total,
        product,
      ) =>
        total +
        product.currentStock *
          product.unitPrice,
      0,
    );

  const lowStockCount =
    products.filter(
      (
        product,
      ) =>
        product.currentStock <=
        product.reorderLevel,
    ).length;

  const tableRows =
    products
      .map(
        (
          product,
        ) => `
          <tr>
            <td>
              ${escapeHtml(
                product.name,
              )}
            </td>

            <td>
              ${escapeHtml(
                product.brand,
              )}
            </td>

            <td>
              ${escapeHtml(
                product.category,
              )}
            </td>

            <td>
              ${escapeHtml(
                product.barcode,
              )}
            </td>

            <td>
              ${product.currentStock}
            </td>

            <td>
              ${product.reorderLevel}
            </td>

            <td>
              ${formatCurrency(
                product.unitCost,
              )}
            </td>

            <td>
              ${formatCurrency(
                product.unitPrice,
              )}
            </td>
          </tr>
        `,
      )
      .join(
        "",
      );

  const body = `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-label">
          Products
        </div>

        <div class="summary-value">
          ${products.length}
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-label">
          Stock Units
        </div>

        <div class="summary-value">
          ${totalUnits}
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-label">
          Inventory Cost
        </div>

        <div class="summary-value">
          ${formatCurrency(
            totalCost,
          )}
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-label">
          Retail Value
        </div>

        <div class="summary-value">
          ${formatCurrency(
            totalRetail,
          )}
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-label">
          Low Stock Products
        </div>

        <div class="summary-value">
          ${lowStockCount}
        </div>
      </div>
    </div>

    <h2>
      Inventory
    </h2>

    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Brand</th>
          <th>Category</th>
          <th>Barcode</th>
          <th>Stock</th>
          <th>Reorder</th>
          <th>Cost</th>
          <th>Price</th>
        </tr>
      </thead>

      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  return generatePdf(
    "inventory",

    createHtmlDocument(
      "Inventory Report",
      body,
    ),

    products.length,
  );
}

export async function exportTransactionsPdf(
  transactions:
    TransactionHistoryItem[],
): Promise<ExportedReport> {
  const tableRows =
    transactions
      .map(
        (
          transaction,
        ) => {
          const stockChange =
            transaction.stockAfter -
            transaction.stockBefore;

          const stockClass =
            stockChange >=
            0
              ? "positive"
              : "negative";

          return `
            <tr>
              <td>
                ${escapeHtml(
                  transaction.productName,
                )}
              </td>

              <td>
                ${escapeHtml(
                  transaction.transactionType,
                )}
              </td>

              <td>
                ${transaction.quantity}
              </td>

              <td class="${stockClass}">
                ${transaction.stockBefore}
                →
                ${transaction.stockAfter}
              </td>

              <td>
                ${formatCurrency(
                  transaction.transactionValue,
                )}
              </td>

              <td>
                ${escapeHtml(
                  transaction.source,
                )}
              </td>

              <td>
                ${escapeHtml(
                  transaction.notes ??
                    "",
                )}
              </td>

              <td>
                ${escapeHtml(
                  formatDateTime(
                    transaction.createdAt,
                  ),
                )}
              </td>
            </tr>
          `;
        },
      )
      .join(
        "",
      );

  const body = `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-label">
          Transactions
        </div>

        <div class="summary-value">
          ${transactions.length}
        </div>
      </div>
    </div>

    <h2>
      Transaction History
    </h2>

    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Type</th>
          <th>Qty</th>
          <th>Stock</th>
          <th>Value</th>
          <th>Source</th>
          <th>Notes</th>
          <th>Date</th>
        </tr>
      </thead>

      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  return generatePdf(
    "transactions",

    createHtmlDocument(
      "Inventory Transaction Report",
      body,
    ),

    transactions.length,
  );
}

export async function exportAnalyticsPdf(
  analytics:
    InventoryAnalyticsSummary,
): Promise<ExportedReport> {
  const totalSales =
    analytics.dailyMetrics.reduce(
      (
        total,
        metric,
      ) =>
        total +
        metric.salesValue,
      0,
    );

  const totalStockIn =
    analytics.dailyMetrics.reduce(
      (
        total,
        metric,
      ) =>
        total +
        metric.stockInValue,
      0,
    );

  const totalDamage =
    analytics.dailyMetrics.reduce(
      (
        total,
        metric,
      ) =>
        total +
        metric.damageValue,
      0,
    );

  const dailyRows =
    analytics.dailyMetrics
      .map(
        (
          metric,
        ) => `
          <tr>
            <td>
              ${escapeHtml(
                metric.date,
              )}
            </td>

            <td>
              ${formatCurrency(
                metric.salesValue,
              )}
            </td>

            <td>
              ${metric.salesUnits}
            </td>

            <td>
              ${formatCurrency(
                metric.stockInValue,
              )}
            </td>

            <td>
              ${metric.stockInUnits}
            </td>

            <td>
              ${formatCurrency(
                metric.damageValue,
              )}
            </td>

            <td>
              ${metric.damageUnits}
            </td>
          </tr>
        `,
      )
      .join(
        "",
      );

  const productRows =
    analytics.topProducts
      .map(
        (
          product,
          index,
        ) => `
          <tr>
            <td>
              ${index + 1}
            </td>

            <td>
              ${escapeHtml(
                product.productName,
              )}
            </td>

            <td>
              ${escapeHtml(
                product.brand,
              )}
            </td>

            <td>
              ${product.unitsSold}
            </td>

            <td>
              ${formatCurrency(
                product.salesValue,
              )}
            </td>
          </tr>
        `,
      )
      .join(
        "",
      );

  const categoryRows =
    analytics.topCategories
      .map(
        (
          category,
          index,
        ) => `
          <tr>
            <td>
              ${index + 1}
            </td>

            <td>
              ${escapeHtml(
                category.department,
              )}
            </td>

            <td>
              ${escapeHtml(
                category.category,
              )}
            </td>

            <td>
              ${category.unitsSold}
            </td>

            <td>
              ${formatCurrency(
                category.salesValue,
              )}
            </td>
          </tr>
        `,
      )
      .join(
        "",
      );

  const body = `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-label">
          Sales Value
        </div>

        <div class="summary-value">
          ${formatCurrency(
            totalSales,
          )}
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-label">
          Stock Received
        </div>

        <div class="summary-value">
          ${formatCurrency(
            totalStockIn,
          )}
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-label">
          Damaged Inventory
        </div>

        <div class="summary-value">
          ${formatCurrency(
            totalDamage,
          )}
        </div>
      </div>
    </div>

    <h2>
      Daily Analytics
    </h2>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Sales</th>
          <th>Sold Units</th>
          <th>Stock In</th>
          <th>Received</th>
          <th>Damage</th>
          <th>Damaged Units</th>
        </tr>
      </thead>

      <tbody>
        ${dailyRows}
      </tbody>
    </table>

    <h2>
      Top Products
    </h2>

    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Product</th>
          <th>Brand</th>
          <th>Units Sold</th>
          <th>Sales</th>
        </tr>
      </thead>

      <tbody>
        ${productRows}
      </tbody>
    </table>

    <h2>
      Top Categories
    </h2>

    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Department</th>
          <th>Category</th>
          <th>Units Sold</th>
          <th>Sales</th>
        </tr>
      </thead>

      <tbody>
        ${categoryRows}
      </tbody>
    </table>
  `;

  const rowCount =
    analytics.dailyMetrics.length +
    analytics.topProducts.length +
    analytics.topCategories.length;

  return generatePdf(
    "analytics",

    createHtmlDocument(
      "Analytics Report",
      body,
    ),

    rowCount,
  );
}

export async function exportPurchaseOrderPdf(
  purchaseOrder:
    PurchaseOrderWithItems,
): Promise<ExportedReport> {
  const {
    order,
    items,
  } =
    purchaseOrder;

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

  const fullyReceived =
    isReceived &&
    totalMissingUnits ===
      0;

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
    items.reduce(
      (
        total,
        item,
      ) => {
        const missingQuantity =
          Math.max(
            item.quantity -
              item.receivedQuantity,
            0,
          );

        return (
          total +
          missingQuantity *
            item.unitCost
        );
      },
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

  const statusLabel =
    order.status ===
    "partially_received"
      ? "Partially Received"
      : order.status
          .charAt(
            0,
          )
          .toUpperCase() +
        order.status.slice(
          1,
        );

  const orderDate =
    order.orderedAt ??
    order.createdAt;

  const tableRows =
    items
      .map(
        (
          item,
        ) => {
          const missingQuantity =
            Math.max(
              item.quantity -
                item.receivedQuantity,
              0,
            );

          const receivedLineValue =
            item.receivedQuantity *
            item.unitCost;

          const receivingStatus =
            !isReceived
              ? ""
              : missingQuantity ===
                  0
                ? "Fully Received"
                : item.receivedQuantity ===
                    0
                  ? "Not Delivered"
                  : "Short";

          if (
            isReceived
          ) {
            return `
              <tr>
                <td>
                  ${escapeHtml(
                    item.productName,
                  )}

                  ${
                    item.brand.trim()
                      ? `
                        <div class="product-secondary">
                          ${escapeHtml(
                            item.brand,
                          )}
                        </div>
                      `
                      : ""
                  }

                  <div class="product-secondary">
                    ${escapeHtml(
                      item.barcode.trim()
                        ? item.barcode
                        : "Barcode not available",
                    )}
                  </div>
                </td>

                <td>
                  ${escapeHtml(
                    item.department,
                  )}

                  <div class="product-secondary">
                    ${escapeHtml(
                      item.category,
                    )}
                  </div>
                </td>

                <td class="right">
                  ${item.quantity}
                </td>

                <td class="right positive">
                  ${item.receivedQuantity}
                </td>

                <td class="right ${
                  missingQuantity >
                  0
                    ? "negative"
                    : ""
                }">
                  ${missingQuantity}
                </td>

                <td class="right">
                  ${formatCurrency(
                    item.unitCost,
                  )}
                </td>

                <td class="right">
                  <strong>
                    ${formatCurrency(
                      receivedLineValue,
                    )}
                  </strong>
                </td>

                <td class="${
                  missingQuantity >
                  0
                    ? "negative"
                    : "positive"
                }">
                  ${escapeHtml(
                    receivingStatus,
                  )}
                </td>
              </tr>
            `;
          }

          return `
            <tr>
              <td>
                ${escapeHtml(
                  item.productName,
                )}

                ${
                  item.brand.trim()
                    ? `
                      <div class="product-secondary">
                        ${escapeHtml(
                          item.brand,
                        )}
                      </div>
                    `
                    : ""
                }
              </td>

              <td>
                ${escapeHtml(
                  item.barcode.trim()
                    ? item.barcode
                    : "Not available",
                )}
              </td>

              <td>
                ${escapeHtml(
                  item.department,
                )}
              </td>

              <td>
                ${escapeHtml(
                  item.category,
                )}
              </td>

              <td class="right">
                ${item.quantity}
              </td>

              <td class="right">
                ${formatCurrency(
                  item.unitCost,
                )}
              </td>

              <td class="right">
                <strong>
                  ${formatCurrency(
                    item.lineTotal,
                  )}
                </strong>
              </td>
            </tr>
          `;
        },
      )
      .join(
        "",
      );

  const body = `
    <div class="purchase-order-header">
      <div class="purchase-order-top-row">
        <div>
          <div class="summary-label">
            Vendor / Supplier
          </div>

          <div class="purchase-order-vendor">
            ${escapeHtml(
              order.vendorName.trim()
                ? order.vendorName
                : "Not specified",
            )}
          </div>
        </div>

        <div class="purchase-order-status">
          ${escapeHtml(
            statusLabel,
          )}
        </div>
      </div>

      <div class="purchase-order-details">
        <div class="purchase-order-detail">
          <strong>
            Order Date:
          </strong>

          ${escapeHtml(
            formatDateTime(
              orderDate,
            ),
          )}
        </div>

        ${
          order.receivedAt
            ? `
              <div class="purchase-order-detail">
                <strong>
                  Received Date:
                </strong>

                ${escapeHtml(
                  formatDateTime(
                    order.receivedAt,
                  ),
                )}
              </div>
            `
            : ""
        }
      </div>
    </div>

    ${
      !isReceived
        ? `
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-label">
                Products
              </div>

              <div class="summary-value">
                ${items.length}
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-label">
                Units
              </div>

              <div class="summary-value">
                ${totalUnits}
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-label">
                Subtotal
              </div>

              <div class="summary-value">
                ${formatCurrency(
                  order.subtotal,
                )}
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-label">
                Order Total
              </div>

              <div class="summary-value">
                ${formatCurrency(
                  order.total,
                )}
              </div>
            </div>
          </div>
        `
        : ""
    }

    <h2>
      ${
        isReceived
          ? "Received Products"
          : "Order Items"
      }
    </h2>

    ${
      isReceived
        ? `
          <table>
            <thead>
              <tr>
                <th>
                  Product
                </th>

                <th>
                  Category
                </th>

                <th class="right">
                  Ordered
                </th>

                <th class="right">
                  Received
                </th>

                <th class="right">
                  Missing
                </th>

                <th class="right">
                  Unit Cost
                </th>

                <th class="right">
                  Received Value
                </th>

                <th>
                  Result
                </th>
              </tr>
            </thead>

            <tbody>
              ${tableRows}
            </tbody>
          </table>
        `
        : `
          <table>
            <thead>
              <tr>
                <th>
                  Product
                </th>

                <th>
                  Barcode
                </th>

                <th>
                  Department
                </th>

                <th>
                  Category
                </th>

                <th class="right">
                  Qty
                </th>

                <th class="right">
                  Unit Cost
                </th>

                <th class="right">
                  Line Total
                </th>
              </tr>
            </thead>

            <tbody>
              ${tableRows}
            </tbody>
          </table>
        `
    }

    ${
      isReceived
        ? `
          <div class="totals-container">
            <div class="totals-section-title">
              Receiving & Financial Summary
            </div>

            <div class="totals-row">
              <span>
                Ordered Units
              </span>

              <strong>
                ${totalUnits}
              </strong>
            </div>

            <div class="totals-row">
              <span>
                Received Units
              </span>

              <strong class="positive">
                ${totalReceivedUnits}
              </strong>
            </div>

            <div class="totals-row">
              <span>
                Missing Units
              </span>

              <strong class="${
                totalMissingUnits >
                0
                  ? "negative"
                  : "positive"
              }">
                ${totalMissingUnits}
              </strong>
            </div>

            <div class="totals-divider">
            </div>

            <div class="totals-row">
              <span>
                Original Subtotal
              </span>

              <strong>
                ${formatCurrency(
                  order.subtotal,
                )}
              </strong>
            </div>

            <div class="totals-row">
              <span>
                Not Received Value
              </span>

              <strong class="${
                notReceivedValue >
                0
                  ? "negative"
                  : ""
              }">
                ${formatCurrency(
                  notReceivedValue,
                )}
              </strong>
            </div>

            <div class="totals-row">
              <span>
                Received Subtotal
              </span>

              <strong class="positive">
                ${formatCurrency(
                  receivedSubtotal,
                )}
              </strong>
            </div>

            <div class="totals-row">
              <span>
                Estimated Received Tax
              </span>

              <strong>
                ${formatCurrency(
                  receivedTax,
                )}
              </strong>
            </div>

            <div class="totals-row">
              <span>
                Original Order Total
              </span>

              <strong>
                ${formatCurrency(
                  order.total,
                )}
              </strong>
            </div>

            <div class="totals-final">
              <span>
                Received Total
              </span>

              <span class="positive">
                ${formatCurrency(
                  receivedTotal,
                )}
              </span>
            </div>
          </div>
        `
        : `
          <div class="totals-container">
            <div class="totals-row">
              <span>
                Subtotal
              </span>

              <strong>
                ${formatCurrency(
                  order.subtotal,
                )}
              </strong>
            </div>

            <div class="totals-row">
              <span>
                Tax
              </span>

              <strong>
                ${formatCurrency(
                  order.tax,
                )}
              </strong>
            </div>

            <div class="totals-final">
              <span>
                Total
              </span>

              <span>
                ${formatCurrency(
                  order.total,
                )}
              </span>
            </div>
          </div>
        `
    }

    ${
      isReceived &&
      totalMissingUnits >
        0
        ? `
        <br>
          <h2>
            Receiving Exceptions
          </h2>
        </br>
          <div class="notes-card">
            This purchase order was completed with delivery shortages.

            Ordered Units:
            ${totalUnits}

            Received Units:
            ${totalReceivedUnits}

            Missing Units:
            ${totalMissingUnits}

            Missing merchandise value:
            ${formatCurrency(
              notReceivedValue,
            )}

            Missing products were not added to physical inventory.
          </div>
        `
        : ""
    }

    ${
      order.notes.trim()
        ? `
          <h2>
            Notes
          </h2>

          <div class="notes-card">
            ${escapeHtml(
              order.notes,
            )}
          </div>
        `
        : ""
    }
  `;

  const safeOrderNumber =
    order.orderNumber.replace(
      /[^a-zA-Z0-9-_]/g,
      "-",
    );

  return generatePdf(
    "purchase-order",

    createHtmlDocument(
      `Purchase Order ${order.orderNumber}`,
      body,
    ),

    items.length,

    `${safeOrderNumber}.pdf`,
  );
}