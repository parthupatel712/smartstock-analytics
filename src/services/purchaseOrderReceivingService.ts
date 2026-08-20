import type {
  InvoiceImportedLine,
  InvoiceImportResult,
} from "../types/invoiceImport";

import type {
  PurchaseOrderItem,
  PurchaseOrderWithItems,
} from "../types/purchaseOrder";

import {
  getDatabase,
} from "../database/database";

export interface PurchaseOrderReceivingResult {
  orderId:
    number;

  orderNumber:
    string;

  receivedProductCount:
    number;

  receivedUnits:
    number;

  zeroReceivedProductCount:
    number;

  partialProductCount:
    number;

  orderedSubtotal:
    number;

  receivedSubtotal:
    number;

  shortageValue:
    number;

  completedAt:
    string;
}

interface ProductStockRow {
  id:
    number;

  current_stock:
    number;

  unit_cost:
    number;

  unit_price:
    number;
}

interface ReceivingLine {
  orderItem:
    PurchaseOrderItem;

  invoiceLine:
    InvoiceImportedLine;

  quantityReceived:
    number;

  unitCost:
    number;
}

function findOrderItemForInvoiceLine(
  line:
    InvoiceImportedLine,

  purchaseOrder:
    PurchaseOrderWithItems,
): PurchaseOrderItem | null {
  if (
    line.matchedOrderItemId !==
      null &&
    line.matchedOrderItemId !==
      undefined
  ) {
    const item =
      purchaseOrder.items.find(
        (
          orderItem,
        ) =>
          orderItem.id ===
          line.matchedOrderItemId,
      );

    if (
      item
    ) {
      return item;
    }
  }

  if (
    line.matchedProductId !==
      null
  ) {
    const item =
      purchaseOrder.items.find(
        (
          orderItem,
        ) =>
          orderItem.productId ===
          line.matchedProductId,
      );

    if (
      item
    ) {
      return item;
    }
  }

  const barcode =
    line.barcode.trim();

  if (
    barcode
  ) {
    const item =
      purchaseOrder.items.find(
        (
          orderItem,
        ) =>
          orderItem.barcode.trim() ===
          barcode,
      );

    if (
      item
    ) {
      return item;
    }
  }

  return null;
}

function validateInvoiceReview(
  invoiceResult:
    InvoiceImportResult,
): void {
  if (
    invoiceResult.lines.length ===
    0
  ) {
    throw new Error(
      "There are no reviewed products to receive.",
    );
  }

  for (
    const line
    of invoiceResult.lines
  ) {
    if (
      !line.reviewed
    ) {
      throw new Error(
        `Review ${line.productName || "every product"} before receiving this order.`,
      );
    }

    if (
      line.confirmedQuantity ===
      null
    ) {
      throw new Error(
        `Enter the received quantity for ${line.productName || "one of the products"}.`,
      );
    }

    if (
      !Number.isInteger(
        line.confirmedQuantity,
      ) ||
      line.confirmedQuantity <
        0
    ) {
      throw new Error(
        `Received quantity for ${line.productName || "a product"} must be 0 or a positive whole number.`,
      );
    }

    if (
      line.confirmedUnitCost !==
        null &&
      (
        !Number.isFinite(
          line.confirmedUnitCost,
        ) ||
        line.confirmedUnitCost <
          0
      )
    ) {
      throw new Error(
        `Unit cost for ${line.productName || "a product"} is invalid.`,
      );
    }
  }
}

function buildReceivingLines(
  purchaseOrder:
    PurchaseOrderWithItems,

  invoiceResult:
    InvoiceImportResult,
): ReceivingLine[] {
  const result:
    ReceivingLine[] = [];

  const usedOrderItemIds =
    new Set<number>();

  for (
    const invoiceLine
    of invoiceResult.lines
  ) {
    const orderItem =
      findOrderItemForInvoiceLine(
        invoiceLine,
        purchaseOrder,
      );

    if (
      !orderItem
    ) {
      continue;
    }

    if (
      usedOrderItemIds.has(
        orderItem.id,
      )
    ) {
      throw new Error(
        `${orderItem.productName} appears multiple times in this delivery review.`,
      );
    }

    usedOrderItemIds.add(
      orderItem.id,
    );

    const quantityReceived =
      invoiceLine.confirmedQuantity ??
      0;

    const remainingQuantity =
      Math.max(
        orderItem.quantity -
          orderItem.receivedQuantity,
        0,
      );

    if (
      quantityReceived >
      remainingQuantity
    ) {
      throw new Error(
        `${orderItem.productName}: ${quantityReceived} units were entered, but only ${remainingQuantity} units remain on this purchase order.`,
      );
    }

    const confirmedCost =
      invoiceLine.confirmedUnitCost;

    const unitCost =
      confirmedCost !==
        null &&
      Number.isFinite(
        confirmedCost,
      ) &&
      confirmedCost >=
        0
        ? confirmedCost
        : orderItem.unitCost;

    result.push({
      orderItem,
      invoiceLine,
      quantityReceived,
      unitCost,
    });
  }

  return result;
}

function createReceivingHistoryNote(
  purchaseOrder:
    PurchaseOrderWithItems,

  finalReceivedByItemId:
    Map<
      number,
      number
    >,
): string {
  const shortageLines =
    purchaseOrder.items
      .map(
        (
          item,
        ) => {
          const received =
            finalReceivedByItemId.get(
              item.id,
            ) ??
            item.receivedQuantity;

          const missing =
            Math.max(
              item.quantity -
                received,
              0,
            );

          if (
            missing ===
            0
          ) {
            return null;
          }

          return `${item.productName}: ordered ${item.quantity}, received ${received}, missing ${missing}`;
        },
      )
      .filter(
        (
          value,
        ): value is string =>
          value !==
          null,
      );

  if (
    shortageLines.length ===
    0
  ) {
    return "";
  }

  return [
    "Delivery completed with shortages:",
    ...shortageLines,
  ].join(
    "\n",
  );
}

export async function receivePurchaseOrder(
  purchaseOrder:
    PurchaseOrderWithItems,

  invoiceResult:
    InvoiceImportResult,
): Promise<PurchaseOrderReceivingResult> {
  if (
    purchaseOrder.order.status !==
      "ordered" &&
    purchaseOrder.order.status !==
      "partially_received"
  ) {
    throw new Error(
      "Only an active placed purchase order can be received.",
    );
  }

  validateInvoiceReview(
    invoiceResult,
  );

  const receivingLines =
    buildReceivingLines(
      purchaseOrder,
      invoiceResult,
    );

  if (
    receivingLines.length ===
    0
  ) {
    throw new Error(
      "No reviewed products could be matched to this purchase order.",
    );
  }

  const database =
    await getDatabase();

  const now =
    new Date().toISOString();

  let receivedProductCount =
    0;

  let receivedUnits =
    0;

  let zeroReceivedProductCount =
    0;

  let partialProductCount =
    0;

  let receivedSubtotal =
    0;

  const orderedSubtotal =
    purchaseOrder.items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.unitCost *
          item.quantity,
      0,
    );

  const finalReceivedByItemId =
    new Map<
      number,
      number
    >();

  purchaseOrder.items.forEach(
    (
      item,
    ) => {
      finalReceivedByItemId.set(
        item.id,
        item.receivedQuantity,
      );
    },
  );

  await database.execAsync(
    "BEGIN TRANSACTION;",
  );

  try {
    for (
      const receivingLine
      of receivingLines
    ) {
      const {
        orderItem,
        quantityReceived,
        unitCost,
      } =
        receivingLine;

      const remainingBefore =
        Math.max(
          orderItem.quantity -
            orderItem.receivedQuantity,
          0,
        );

      const finalReceivedQuantity =
        orderItem.receivedQuantity +
        quantityReceived;

      finalReceivedByItemId.set(
        orderItem.id,
        finalReceivedQuantity,
      );

      if (
        quantityReceived <
        remainingBefore &&
        quantityReceived >
        0
      ) {
        partialProductCount +=
          1;
      }

      if (
        quantityReceived ===
        0 &&
        remainingBefore >
        0
      ) {
        zeroReceivedProductCount +=
          1;
      }

      if (
        orderItem.productId ===
        null
      ) {
        throw new Error(
          `${orderItem.productName} is no longer connected to an inventory product.`,
        );
      }

      const product =
        await database.getFirstAsync<ProductStockRow>(
          `
            SELECT
              id,
              current_stock,
              unit_cost,
              unit_price

            FROM products

            WHERE
              id = ?

              AND is_active = 1

            LIMIT 1;
          `,
          orderItem.productId,
        );

      if (
        !product
      ) {
        throw new Error(
          `${orderItem.productName} could not be found in active inventory.`,
        );
      }

      const stockBefore =
        product.current_stock;

      const stockAfter =
        stockBefore +
        quantityReceived;

      const transactionValue =
        quantityReceived *
        unitCost;

      receivedSubtotal +=
        transactionValue;

      /*
       * Positive quantity:
       * update physical stock and latest cost.
       *
       * Zero quantity:
       * stock remains unchanged.
       */
      if (
        quantityReceived >
        0
      ) {
        await database.runAsync(
          `
            UPDATE products

            SET
              current_stock = ?,
              unit_cost = ?,
              updated_at = ?

            WHERE
              id = ?;
          `,
          stockAfter,
          unitCost,
          now,
          product.id,
        );
      }

      /*
       * IMPORTANT:
       *
       * We create a history record even when
       * quantityReceived is 0.
       *
       * This allows Product Card / Recent
       * Activity / History to show:
       *
       * Stock received
       * 0 items
       * Aug 18, 2026
       */
      await database.runAsync(
        `
          INSERT INTO inventory_transactions (
            product_id,
            transaction_type,
            quantity,
            stock_before,
            stock_after,
            unit_cost,
            unit_price,
            transaction_value,
            source,
            notes,
            created_at
          )

          VALUES (
            ?,
            'stock_in',
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'manual',
            ?,
            ?
          );
        `,
        product.id,
        quantityReceived,
        stockBefore,
        stockAfter,
        unitCost,
        product.unit_price,
        transactionValue,
        quantityReceived ===
          0
          ? `Purchase order received: ${purchaseOrder.order.orderNumber} · Item not delivered`
          : `Purchase order received: ${purchaseOrder.order.orderNumber}${
              purchaseOrder.order.vendorName.trim()
                ? ` · ${purchaseOrder.order.vendorName.trim()}`
                : ""
            }`,
        now,
      );

      /*
       * Only positive received quantity
       * increases cumulative PO receipt.
       *
       * A 0 receipt still remains visible
       * through inventory transaction history
       * and the final PO shortage.
       */
      if (
        quantityReceived >
        0
      ) {
        await database.runAsync(
          `
            UPDATE purchase_order_items

            SET
              received_quantity =
                received_quantity + ?,

              last_received_at = ?

            WHERE
              id = ?;
          `,
          quantityReceived,
          now,
          orderItem.id,
        );

        receivedProductCount +=
          1;

        receivedUnits +=
          quantityReceived;
      } else {
        await database.runAsync(
          `
            UPDATE purchase_order_items

            SET
              last_received_at = ?

            WHERE
              id = ?;
          `,
          now,
          orderItem.id,
        );
      }
    }

    const shortageValue =
      Math.max(
        orderedSubtotal -
          receivedSubtotal,
        0,
      );

    const shortageNote =
      createReceivingHistoryNote(
        purchaseOrder,
        finalReceivedByItemId,
      );

    const existingNotes =
      purchaseOrder.order.notes.trim();

    const financialSummary = [
      `Ordered subtotal: ${orderedSubtotal.toFixed(
        2,
      )}`,
      `Received subtotal: ${receivedSubtotal.toFixed(
        2,
      )}`,
      `Not received value: ${shortageValue.toFixed(
        2,
      )}`,
    ].join(
      "\n",
    );

    const nextNotes =
      [
        existingNotes,
        shortageNote,
        financialSummary,
      ]
        .filter(
          Boolean,
        )
        .join(
          "\n",
        );

    await database.runAsync(
      `
        UPDATE purchase_orders

        SET
          status = 'received',
          notes = ?,
          received_at = ?,
          updated_at = ?

        WHERE
          id = ?;
      `,
      nextNotes,
      now,
      now,
      purchaseOrder.order.id,
    );

    await database.execAsync(
      "COMMIT;",
    );

    return {
      orderId:
        purchaseOrder.order.id,

      orderNumber:
        purchaseOrder.order.orderNumber,

      receivedProductCount,

      receivedUnits,

      zeroReceivedProductCount,

      partialProductCount,

      orderedSubtotal,

      receivedSubtotal,

      shortageValue,

      completedAt:
        now,
    };
  } catch (
    error
  ) {
    try {
      await database.execAsync(
        "ROLLBACK;",
      );
    } catch (
      rollbackError
    ) {
      console.error(
        "Could not rollback purchase-order receiving:",
        rollbackError,
      );
    }

    throw error;
  }
}