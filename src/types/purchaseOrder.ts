import type {
  Product,
} from "./product";

export type PurchaseOrderStatus =
  | "draft"
  | "ordered"
  | "partially_received"
  | "received" 
  | "cancelled";

export interface PurchaseOrder {
  id:
    number;

  orderNumber:
    string;

  vendorName:
    string;

  status:
    PurchaseOrderStatus;

  notes:
    string;

  subtotal:
    number;

  tax:
    number;

  total:
    number;

  createdAt:
    string;

  updatedAt:
    string;

  orderedAt:
    string | null;

  receivedAt:
    string | null;

  cancelledAt:
    string | null;
}

export interface PurchaseOrderItem {
  id:
    number;

  orderId:
    number;

  productId:
    number | null;

  barcode:
    string;

  productName:
    string;

  brand:
    string;

  department:
    string;

  category:
    string;

  /*
   * Original quantity ordered.
   */
  quantity:
    number;

  /*
   * Final quantity physically
   * received against this line.
   */
  receivedQuantity:
    number;

  /*
   * quantity - receivedQuantity
   */
  remainingQuantity:
    number;

  unitCost:
    number;

  lineTotal:
    number;

  createdAt:
    string;

  lastReceivedAt:
    string | null;
}

export interface PurchaseOrderWithItems {
  order:
    PurchaseOrder;

  items:
    PurchaseOrderItem[];
}

export interface CreatePurchaseOrderItemInput {
  product:
    Product;

  quantity:
    number;
}

export interface CreatePurchaseOrderInput {
  vendorName:
    string;

  notes?:
    string;

  status:
    "draft" | "ordered";

  tax?:
    number;

  items:
    CreatePurchaseOrderItemInput[];
}

export interface UpdatePurchaseOrderInput {
  orderId:
    number;

  vendorName:
    string;

  notes:
    string;

  tax:
    number;

  items:
    CreatePurchaseOrderItemInput[];
}

/*
 * One reviewed PO line being received.
 *
 * receivedQuantity represents the
 * quantity physically received during
 * this final receiving session.
 */
export interface ReceivePurchaseOrderItemInput {
  orderItemId:
    number;

  receivedQuantity:
    number;

  /*
   * Optional reviewed invoice cost.
   *
   * We preserve the original PO snapshot,
   * but this is useful for transaction
   * history if invoice cost differs.
   */
  unitCost?:
    number | null;
}

export interface ReceivePurchaseOrderInput {
  orderId:
    number;

  items:
    ReceivePurchaseOrderItemInput[];

  /*
   * Optional note describing invoice,
   * shortages, damaged cartons, etc.
   */
  receivingNote?:
    string;
}

export interface ReceivePurchaseOrderResult {
  purchaseOrder:
    PurchaseOrderWithItems;

  receivedUnits:
    number;

  missingUnits:
    number;

  receivedProductCount:
    number;

  missingProductCount:
    number;

  status:
    "received";
}

export interface PurchaseOrderSummary {
  id:
    number;

  orderNumber:
    string;

  vendorName:
    string;

  status:
    PurchaseOrderStatus;

  itemCount:
    number;

  totalUnits:
    number;

  receivedUnits:
    number;

  remainingUnits:
    number;

  remainingValue:
    number;

  subtotal:
    number;

  tax:
    number;

  total:
    number;

  createdAt:
    string;

  orderedAt:
    string | null;
}