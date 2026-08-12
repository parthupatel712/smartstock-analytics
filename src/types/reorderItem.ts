import type {
  Product,
} from "./product";

export type ReorderPriority =
  | "out_of_stock"
  | "critical"
  | "low_stock";

export interface ReorderItem {
  product:
    Product;

  currentStock:
    number;

  reorderLevel:
    number;

  targetStock:
    number;

  suggestedReorderQuantity:
    number;

  priority:
    ReorderPriority;
}