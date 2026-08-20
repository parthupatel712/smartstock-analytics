import type {
  Product,
} from "./product";

export type InvoiceLineStatus =
  | "matched"
  | "needs_attention"
  | "new_product"
  | "unmatched"
  | "missing_information"
  | "quantity_mismatch"
  | "price_mismatch"
  | "possible_duplicate";

export type InvoiceLineWarningType =
  | "missing_barcode"
  | "missing_name"
  | "missing_quantity"
  | "missing_unit_cost"
  | "missing_line_total"
  | "unknown_product"
  | "possible_product_match"
  | "quantity_differs_from_order"
  | "price_differs_from_order"
  | "ordered_item_missing"
  | "invoice_item_not_ordered"
  | "low_confidence";

export interface InvoiceLineWarning {
  type:
    InvoiceLineWarningType;

  message:
    string;
}

export interface InvoiceImportedLine {
  id:
    string;

  /*
   * Raw value extracted from the
   * invoice / OCR / PDF / Excel.
   */
  rawText:
    string;

  barcode:
    string;

  productName:
    string;

  quantity:
    number | null;

  unitCost:
    number | null;

  lineTotal:
    number | null;

  /*
   * SmartStock inventory match.
   */
  matchedProductId:
    number | null;

  matchedProduct:
    Product | null;

  /*
   * Purchase-order item match.
   *
   * This is important during
   * Receive Order because the same
   * product can theoretically appear
   * on different purchase orders.
   */
  matchedOrderItemId?:
    number | null;

  /*
   * 0 - 1 confidence.
   */
  matchConfidence:
    number;

  status:
    InvoiceLineStatus;

  warnings:
    InvoiceLineWarning[];

  /*
   * Purchase order comparison.
   */
  orderedQuantity:
    number | null;

  previouslyReceivedQuantity:
    number;

  remainingOrderedQuantity:
    number | null;

  /*
   * Quantity the user confirms was
   * physically received THIS time.
   *
   * A value of 0 means:
   *
   * "This item was expected but was
   * not received in this delivery."
   *
   * Inventory must therefore NOT be
   * increased for this line.
   */
  confirmedQuantity:
    number | null;

  confirmedUnitCost:
    number | null;

  /*
   * User explicitly reviewed this row.
   */
  reviewed:
    boolean;
}

export interface InvoiceDocumentInfo {
  vendorName:
    string;

  invoiceNumber:
    string;

  invoiceDate:
    string | null;

  subtotal:
    number | null;

  tax:
    number | null;

  total:
    number | null;
}

export interface InvoiceImportResult {
  document:
    InvoiceDocumentInfo;

  lines:
    InvoiceImportedLine[];

  rawText:
    string;

  confidence:
    number;

  parsedAt:
    string;
}

export interface InvoiceReviewSummary {
  totalLines:
    number;

  matchedLines:
    number;

  needsAttentionLines:
    number;

  newProductLines:
    number;

  unmatchedLines:
    number;

  missingInformationLines:
    number;

  quantityMismatchLines:
    number;

  priceMismatchLines:
    number;

  /*
   * Receiving-specific values.
   */
  totalConfirmedUnits:
    number;

  notReceivedLines:
    number;

  partiallyReceivedLines:
    number;
}