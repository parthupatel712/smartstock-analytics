export type InventoryTransactionType =
  | "stock_in"
  | "sale"
  | "return"
  | "damage"
  | "adjustment";

export type InventoryTransactionSource =
  | "manual"
  | "camera"
  | "bluetooth"
  | "usb"
  | "esp32";

export interface InventoryTransaction {
  id: number;
  productId: number;
  transactionType: InventoryTransactionType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  unitCost: number;
  unitPrice: number;
  transactionValue: number;
  source: InventoryTransactionSource;
  notes: string | null;
  createdAt: string;
}

export interface CreateInventoryTransactionInput {
  productId: number;
  transactionType: InventoryTransactionType;
  quantity: number;
  source?: InventoryTransactionSource;
  notes?: string;
}