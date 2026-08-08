export interface DailyInventoryMetric {
  date: string;
  salesValue: number;
  stockInValue: number;
  damageValue: number;
  salesUnits: number;
  stockInUnits: number;
  damageUnits: number;
  transactionCount: number;
}

export interface ProductSalesMetric {
  productId: number;
  productName: string;
  brand: string;
  department: string;
  category: string;

  unitsSold: number;
  salesValue: number;
  transactionCount: number;
}

export interface CategorySalesMetric {
  department: string;
  category: string;

  unitsSold: number;
  salesValue: number;
  transactionCount: number;
}

export interface InventoryAnalyticsSummary {
  dailyMetrics: DailyInventoryMetric[];
  topProducts: ProductSalesMetric[];
  topCategories: CategorySalesMetric[];
}