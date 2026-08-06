import type {
  InventoryTransactionSource,
  InventoryTransactionType,
} from "./inventoryTransaction";

export interface TransactionHistoryItem {
  id: number;
  productId: number;

  productName: string;
  productBrand: string;
  productBarcode: string;
  productDepartment: string;
  productCategory: string;

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