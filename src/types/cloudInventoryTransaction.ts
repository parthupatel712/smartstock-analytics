import type {
  InventoryTransactionSource,
  InventoryTransactionType,
} from "./inventoryTransaction";

export interface CloudInventoryTransaction {
  id: number;

  productBarcode: string;

  transactionType:
    InventoryTransactionType;

  quantity: number;

  stockBefore: number;

  stockAfter: number;

  unitCost: number;

  unitPrice: number;

  transactionValue: number;

  source:
    InventoryTransactionSource;

  notes: string | null;

  createdAt: string;
}