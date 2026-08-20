import type {
  InvoiceImportedLine,
  InvoiceImportResult,
  InvoiceLineWarning,
} from "../types/invoiceImport";

import type {
  ImportDocument,
} from "../types/importDocument";

import type {
  PurchaseOrderItem,
  PurchaseOrderWithItems,
} from "../types/purchaseOrder";

import type {
  Product,
} from "../types/product";

function createLineId(
  item:
    PurchaseOrderItem,

  index:
    number,
): string {
  return `invoice-${item.id}-${index}-${Date.now()}`;
}

function isManualReceivingDocument(
  document:
    ImportDocument,
): boolean {
  return (
    document.uri ===
      "manual://receiving"
  );
}

function createWarnings(
  item:
    PurchaseOrderItem,
): InvoiceLineWarning[] {
  const warnings:
    InvoiceLineWarning[] = [];

  if (
    !item.barcode.trim()
  ) {
    warnings.push({
      type:
        "missing_barcode",

      message:
        "The invoice or purchase-order item does not contain a barcode.",
    });
  }

  if (
    !item.productName.trim()
  ) {
    warnings.push({
      type:
        "missing_name",

      message:
        "Product name is missing.",
    });
  }

  return warnings;
}

function findProduct(
  item:
    PurchaseOrderItem,

  products:
    Product[],
): Product | null {
  if (
    item.productId !==
    null
  ) {
    const byId =
      products.find(
        (
          product,
        ) =>
          product.id ===
          item.productId,
      );

    if (
      byId
    ) {
      return byId;
    }
  }

  const barcode =
    item.barcode.trim();

  if (
    barcode
  ) {
    const byBarcode =
      products.find(
        (
          product,
        ) =>
          product.barcode ===
          barcode,
      );

    if (
      byBarcode
    ) {
      return byBarcode;
    }
  }

  return null;
}

/*
 * MANUAL RECEIVING
 *
 * This is NOT OCR.
 *
 * Every PO item is loaded directly
 * from the purchase order.
 *
 * Nothing artificial is changed:
 *
 * - no fake shortage
 * - no fake quantity mismatch
 * - no OCR confidence simulation
 *
 * The user can then manually change:
 *
 * 10 -> 10 received
 * 10 -> 5 received
 * 10 -> 0 received
 */
function createManualLine(
  item:
    PurchaseOrderItem,

  index:
    number,

  products:
    Product[],
): InvoiceImportedLine {
  const matchedProduct =
    findProduct(
      item,
      products,
    );

  /*
   * Always use the outstanding quantity
   * rather than the original quantity.
   *
   * Example:
   *
   * Ordered: 10
   * Previously received: 4
   * Manual review starts at: 6
   */
  const remainingQuantity =
    Math.max(
      item.remainingQuantity,
      0,
    );

  const warnings:
    InvoiceLineWarning[] = [];

  let status:
    InvoiceImportedLine["status"] =
      "matched";

  /*
   * This is not an OCR warning.
   *
   * It is a genuine inventory-integrity
   * problem, so it should still be shown.
   */
  if (
    !matchedProduct
  ) {
    status =
      "unmatched";

    warnings.push({
      type:
        "unknown_product",

      message:
        "This purchase-order item is no longer connected to an active SmartStock product.",
    });
  }

  /*
   * A missing product name is also a
   * real data problem rather than an OCR
   * confidence problem.
   */
  if (
    !item.productName.trim()
  ) {
    status =
      "missing_information";

    warnings.push({
      type:
        "missing_name",

      message:
        "Product name is missing.",
    });
  }

  return {
    id:
      createLineId(
        item,
        index,
      ),

    rawText:
      "",

    barcode:
      item.barcode,

    productName:
      item.productName,

    quantity:
      remainingQuantity,

    unitCost:
      item.unitCost,

    lineTotal:
      remainingQuantity *
      item.unitCost,

    /*
     * Exact PO-line connection.
     *
     * This is the safest way for the
     * receiving service to know which
     * purchase_order_items row to update.
     */
    matchedOrderItemId:
      item.id,

    matchedProductId:
      matchedProduct?.id ??
      null,

    matchedProduct,

    /*
     * Manual mode does not actually
     * have OCR confidence.
     *
     * We keep 1 internally because the
     * current type requires a numeric
     * confidence value.
     *
     * InvoiceReview will later display
     * "Manual Entry" instead of 100%.
     */
    matchConfidence:
      matchedProduct
        ? 1
        : 0,

    status,

    warnings,

    orderedQuantity:
      item.quantity,

    previouslyReceivedQuantity:
      item.receivedQuantity,

    remainingOrderedQuantity:
      remainingQuantity,

    /*
     * Manual receiving begins with the
     * quantity SmartStock still expects.
     *
     * User can change this to any value
     * between 0 and remainingQuantity.
     */
    confirmedQuantity:
      remainingQuantity,

    confirmedUnitCost:
      item.unitCost,

    reviewed:
      false,
  };
}

/*
 * TEMPORARY MOCK OCR LINE
 *
 * Camera / image / PDF still use this
 * path until real OCR is implemented.
 */
function createMockOcrLine(
  item:
    PurchaseOrderItem,

  index:
    number,

  products:
    Product[],
): InvoiceImportedLine {
  const matchedProduct =
    findProduct(
      item,
      products,
    );

  const warnings =
    createWarnings(
      item,
    );

  const remainingQuantity =
    Math.max(
      item.remainingQuantity,
      0,
    );

  /*
   * TEMPORARY TEST BEHAVIOUR
   *
   * Every fourth line intentionally
   * appears one unit short.
   *
   * This is ONLY for testing the
   * invoice/OCR warning interface.
   *
   * Manual Review does NOT use this.
   */
  const shouldCreateShortage =
    index >
      0 &&
    index %
      3 ===
      0 &&
    remainingQuantity >
      1;

  const detectedQuantity =
    shouldCreateShortage
      ? remainingQuantity -
        1
      : remainingQuantity;

  if (
    detectedQuantity !==
    remainingQuantity
  ) {
    warnings.push({
      type:
        "quantity_differs_from_order",

      message:
        `Purchase order still expects ${remainingQuantity} units, but the test invoice detected ${detectedQuantity}.`,
    });
  }

  let status:
    InvoiceImportedLine["status"] =
      "matched";

  if (
    !matchedProduct
  ) {
    status =
      "unmatched";

    warnings.push({
      type:
        "unknown_product",

      message:
        "This item could not be matched to an active SmartStock product.",
    });
  } else if (
    detectedQuantity !==
    remainingQuantity
  ) {
    status =
      "quantity_mismatch";
  } else if (
    warnings.length >
    0
  ) {
    status =
      "needs_attention";
  }

  return {
    id:
      createLineId(
        item,
        index,
      ),

    rawText:
      `${item.productName} ${item.barcode} ${detectedQuantity} ${item.unitCost}`,

    barcode:
      item.barcode,

    productName:
      item.productName,

    quantity:
      detectedQuantity,

    unitCost:
      item.unitCost,

    lineTotal:
      detectedQuantity *
      item.unitCost,

    matchedOrderItemId:
      item.id,

    matchedProductId:
      matchedProduct?.id ??
      null,

    matchedProduct,

    matchConfidence:
      matchedProduct
        ? item.barcode.trim()
          ? 1
          : 0.85
        : 0,

    status,

    warnings,

    orderedQuantity:
      item.quantity,

    previouslyReceivedQuantity:
      item.receivedQuantity,

    remainingOrderedQuantity:
      remainingQuantity,

    confirmedQuantity:
      detectedQuantity,

    confirmedUnitCost:
      item.unitCost,

    reviewed:
      false,
  };
}

function calculateSubtotal(
  lines:
    InvoiceImportedLine[],
): number {
  return lines.reduce(
    (
      total,
      line,
    ) =>
      total +
      (
        line.lineTotal ??
        0
      ),
    0,
  );
}

function createManualImportResult(
  purchaseOrder:
    PurchaseOrderWithItems,

  document:
    ImportDocument,

  products:
    Product[],
): InvoiceImportResult {
  const lines =
    purchaseOrder.items.map(
      (
        item,
        index,
      ) =>
        createManualLine(
          item,
          index,
          products,
        ),
    );

  const subtotal =
    calculateSubtotal(
      lines,
    );

  return {
    document: {
      vendorName:
        purchaseOrder.order.vendorName,

      /*
       * There is no invoice number in
       * manual receiving unless the user
       * later enters one.
       */
      invoiceNumber:
        "",

      invoiceDate:
        new Date().toISOString(),

      subtotal,

      tax:
        purchaseOrder.order.tax,

      total:
        subtotal +
        purchaseOrder.order.tax,
    },

    lines,

    /*
     * No OCR text exists in manual mode.
     *
     * We retain a small marker because it
     * can be useful while debugging.
     */
    rawText:
      `Manual receiving review: ${document.name}`,

    /*
     * This value should NOT be displayed
     * as OCR confidence in manual mode.
     */
    confidence:
      1,

    parsedAt:
      new Date().toISOString(),
  };
}

function createMockOcrImportResult(
  purchaseOrder:
    PurchaseOrderWithItems,

  document:
    ImportDocument,

  products:
    Product[],
): InvoiceImportResult {
  const lines =
    purchaseOrder.items.map(
      (
        item,
        index,
      ) =>
        createMockOcrLine(
          item,
          index,
          products,
        ),
    );

  const subtotal =
    calculateSubtotal(
      lines,
    );

  return {
    document: {
      vendorName:
        purchaseOrder.order.vendorName,

      invoiceNumber:
        `TEST-${purchaseOrder.order.orderNumber}`,

      invoiceDate:
        new Date().toISOString(),

      subtotal,

      tax:
        purchaseOrder.order.tax,

      total:
        subtotal +
        purchaseOrder.order.tax,
    },

    lines,

    rawText:
      `Temporary parsed document: ${document.name}`,

    /*
     * TEMPORARY fake OCR confidence.
     *
     * This remains intentionally visible
     * for camera / image / PDF testing
     * until real OCR replaces this parser.
     */
    confidence:
      0.94,

    parsedAt:
      new Date().toISOString(),
  };
}

export async function createMockInvoiceImportResult(
  purchaseOrder:
    PurchaseOrderWithItems,

  document:
    ImportDocument,

  products:
    Product[],
): Promise<InvoiceImportResult> {
  /*
   * Keep an asynchronous boundary just
   * like the future real parser.
   */
  await new Promise<void>(
    (
      resolve,
    ) => {
      setTimeout(
        resolve,
        350,
      );
    },
  );

  /*
   * Manual Receiving
   *
   * This bypasses all mock OCR behavior.
   */
  if (
    isManualReceivingDocument(
      document,
    )
  ) {
    return createManualImportResult(
      purchaseOrder,
      document,
      products,
    );
  }

  /*
   * Camera / image / PDF
   *
   * Still temporary mock parsing until
   * we implement the real OCR/parser.
   */
  return createMockOcrImportResult(
    purchaseOrder,
    document,
    products,
  );
}