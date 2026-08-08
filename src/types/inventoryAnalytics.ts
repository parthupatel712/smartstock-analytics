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

export interface AnalyticsPeriodTotals {
  salesValue: number;

  salesUnits: number;

  stockInValue: number;

  stockInUnits: number;

  damageValue: number;

  damageUnits: number;

  transactionCount: number;
}

export interface AnalyticsPeriodComparison {
  current: AnalyticsPeriodTotals;

  previous: AnalyticsPeriodTotals;

  salesValueChangePercent: number | null;

  salesUnitsChangePercent: number | null;

  stockInUnitsChangePercent: number | null;

  damageValueChangePercent: number | null;
}

export type ProductTrendType =
  | "selling_faster"
  | "sales_dropped"
  | "new_strong_seller";

export interface ProductTrend {
  productId: number;

  productName: string;

  brand: string;

  department: string;

  category: string;

  currentUnitsSold: number;

  previousUnitsSold: number;

  currentSalesValue: number;

  previousSalesValue: number;

  changePercent: number | null;

  trendType: ProductTrendType;
}

export interface InventoryAnalyticsSummary {
  dailyMetrics: DailyInventoryMetric[];

  topProducts: ProductSalesMetric[];

  topCategories: CategorySalesMetric[];

  comparison: AnalyticsPeriodComparison;

  productTrends: ProductTrend[];
}