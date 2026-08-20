import type {
  Product,
} from "./product";

export type ReorderPriority =
  | "out_of_stock"
  | "low_stock";

export interface ReorderItem {
  product:
    Product;

  currentStock:
    number;

  reorderLevel:
    number;

  priority:
    ReorderPriority;
}