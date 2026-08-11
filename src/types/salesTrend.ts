export type SalesTrendMetric =
  | "sales"
  | "items"
  | "estimated_profit";

export type SalesTrendView =
  | "all"
  | "category"
  | "product";

export interface SalesTrendPoint {
  date: string;

  salesValue: number;

  itemsSold: number;

  estimatedProfit: number;
}

export interface SalesTrendCategoryOption {
  department: string;
  category: string;
}

export interface SalesTrendProductOption {
  productId: number;
  productName: string;
  brand: string;
  department: string;
  category: string;
}