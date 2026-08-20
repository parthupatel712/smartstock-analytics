import type {
  Product,
} from "./product";

export interface OrderDraftItem {
  product:
    Product;

  quantity:
    number;
}

export interface OrderDraftSummary {
  totalProducts:
    number;

  totalUnits:
    number;

  estimatedCost:
    number;
}