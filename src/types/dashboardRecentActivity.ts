export type DashboardActivityType =
  | "sale"
  | "stock_in"
  | "damage"
  | "return"
  | "physical_count";

export interface DashboardRecentActivity {
  transactionId: number;
  productId: number;

  productName: string;
  productBrand: string;

  transactionType: DashboardActivityType;

  quantity: number;

  stockBefore: number;
  stockAfter: number;

  unitCost: number;
  unitPrice: number;
  transactionValue: number;

  notes: string | null;

  createdAt: string;
}