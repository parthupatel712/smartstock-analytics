export interface DailyInventoryMetric {
  date: string;

  salesValue: number;
  estimatedProfit: number;

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

  estimatedProfit: number;

  transactionCount: number;
}

export interface CategorySalesMetric {
  department: string;

  category: string;

  unitsSold: number;

  salesValue: number;

  estimatedProfit: number;

  transactionCount: number;
}

export interface AnalyticsPeriodTotals {
  salesValue: number;

  estimatedProfit: number;

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

  salesValueChangePercent:
    number | null;

  salesUnitsChangePercent:
    number | null;

  estimatedProfitChangePercent:
    number | null;

  stockInUnitsChangePercent:
    number | null;

  damageValueChangePercent:
    number | null;
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

  currentEstimatedProfit: number;

  previousEstimatedProfit: number;

  currentStock: number;

  reorderLevel: number;

  needsRestock: boolean;

  changePercent:
    number | null;

  trendType:
    ProductTrendType;
}

/*
 * Detailed per-product/per-day sales data.
 *
 * This is used by the interactive chart
 * when the user filters by category or
 * individual product.
 */
export interface SalesTrendMetric {
  date: string;

  productId: number;

  productName: string;

  brand: string;

  department: string;

  category: string;

  salesValue: number;

  salesUnits: number;

  estimatedProfit: number;
}

export interface InventoryAnalyticsSummary {
  dailyMetrics:
    DailyInventoryMetric[];

  topProducts:
    ProductSalesMetric[];

  topCategories:
    CategorySalesMetric[];

  comparison:
    AnalyticsPeriodComparison;

  productTrends:
    ProductTrend[];

  salesTrendMetrics:
    SalesTrendMetric[];
}