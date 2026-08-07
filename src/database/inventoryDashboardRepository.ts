import type { InventoryDashboardSummary } from "../types/inventoryDashboard";

import { getDatabase } from "./database";

interface ProductDashboardRow {
  total_products: number | null;
  total_stock_units: number | null;
  total_inventory_cost_value: number | null;
  total_inventory_retail_value: number | null;
  low_stock_product_count: number | null;
  out_of_stock_product_count: number | null;
}

interface TransactionDashboardRow {
  recent_sales_value: number | null;
  recent_stock_in_value: number | null;
  recent_damage_value: number | null;
  recent_transaction_count: number | null;
}

const DEFAULT_RECENT_DAYS = 30;

export async function getInventoryDashboardSummary(
  recentDays = DEFAULT_RECENT_DAYS,
): Promise<InventoryDashboardSummary> {
  if (!Number.isInteger(recentDays) || recentDays <= 0) {
    throw new Error(
      "Recent dashboard period must be a positive whole number.",
    );
  }

  const database = await getDatabase();

  const productSummary =
    await database.getFirstAsync<ProductDashboardRow>(`
      SELECT
        COUNT(*) AS total_products,

        COALESCE(
          SUM(current_stock),
          0
        ) AS total_stock_units,

        COALESCE(
          SUM(current_stock * unit_cost),
          0
        ) AS total_inventory_cost_value,

        COALESCE(
          SUM(current_stock * unit_price),
          0
        ) AS total_inventory_retail_value,

        COALESCE(
          SUM(
            CASE
              WHEN current_stock > 0
                AND current_stock <= reorder_level
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS low_stock_product_count,

        COALESCE(
          SUM(
            CASE
              WHEN current_stock = 0
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS out_of_stock_product_count

      FROM products
      WHERE is_active = 1;
    `);

  const transactionSummary =
    await database.getFirstAsync<TransactionDashboardRow>(
      `
        SELECT
          COALESCE(
            SUM(
              CASE
                WHEN transaction_type = 'sale'
                THEN transaction_value
                ELSE 0
              END
            ),
            0
          ) AS recent_sales_value,

          COALESCE(
            SUM(
              CASE
                WHEN transaction_type = 'stock_in'
                THEN transaction_value
                ELSE 0
              END
            ),
            0
          ) AS recent_stock_in_value,

          COALESCE(
            SUM(
              CASE
                WHEN transaction_type = 'damage'
                THEN transaction_value
                ELSE 0
              END
            ),
            0
          ) AS recent_damage_value,

          COUNT(*) AS recent_transaction_count

        FROM inventory_transactions

        WHERE datetime(created_at) >= datetime(
          'now',
          ?
        );
      `,
      `-${recentDays} days`,
    );

  const totalInventoryCostValue =
    productSummary?.total_inventory_cost_value ?? 0;

  const totalInventoryRetailValue =
    productSummary?.total_inventory_retail_value ?? 0;

  return {
    totalProducts:
      productSummary?.total_products ?? 0,

    totalStockUnits:
      productSummary?.total_stock_units ?? 0,

    totalInventoryCostValue,

    totalInventoryRetailValue,

    potentialGrossProfit:
      totalInventoryRetailValue -
      totalInventoryCostValue,

    lowStockProductCount:
      productSummary?.low_stock_product_count ?? 0,

    outOfStockProductCount:
      productSummary?.out_of_stock_product_count ?? 0,

    recentSalesValue:
      transactionSummary?.recent_sales_value ?? 0,

    recentStockInValue:
      transactionSummary?.recent_stock_in_value ?? 0,

    recentDamageValue:
      transactionSummary?.recent_damage_value ?? 0,

    recentTransactionCount:
      transactionSummary?.recent_transaction_count ?? 0,
  };
}