export interface InventoryDashboardSummary {
  totalProducts: number;
  totalStockUnits: number;

  totalInventoryCostValue: number;
  totalInventoryRetailValue: number;
  potentialGrossProfit: number;

  lowStockProductCount: number;
  outOfStockProductCount: number;

  recentSalesValue: number;
  recentStockInValue: number;
  recentDamageValue: number;

  recentTransactionCount: number;
}