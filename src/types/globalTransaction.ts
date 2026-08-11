export type GlobalTransactionType =
  | "sale"
  | "stock_in"
  | "damage"
  | "return"
  | "adjustment";

export interface GlobalTransaction {
  transactionId: number;

  productId: number;

  productName: string;

  productBrand: string;

  department: string;

  category: string;

  barcode: string;

  transactionType: GlobalTransactionType;

  quantity: number;

  stockBefore: number;

  stockAfter: number;

  unitCost: number;

  unitPrice: number;

  transactionValue: number;

  notes: string | null;

  source:
    | "manual"
    | "camera"
    | "bluetooth"
    | "usb"
    | "esp32";

  createdAt: string;
}