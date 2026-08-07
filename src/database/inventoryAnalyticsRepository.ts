import type {
  CategorySalesMetric,
  DailyInventoryMetric,
  InventoryAnalyticsSummary,
  ProductSalesMetric,
} from "../types/inventoryAnalytics";

import { getDatabase } from "./database";

interface DailyMetricRow {
  date: string;
  sales_value: number | null;
  stock_in_value: number | null;
  damage_value: number | null;
  sales_units: number | null;
  stock_in_units: number | null;
  damage_units: number | null;
  transaction_count: number | null;
}

interface ProductSalesRow {
  product_id: number;
  product_name: string;
  brand: string;
  department: string;
  category: string;
  units_sold: number | null;
  sales_value: number | null;
  transaction_count: number | null;
}

interface CategorySalesRow {
  department: string;
  category: string;
  units_sold: number | null;
  sales_value: number | null;
  transaction_count: number | null;
}

function mapDailyMetricRow(
  row: DailyMetricRow,
): DailyInventoryMetric {
  return {
    date: row.date,
    salesValue: row.sales_value ?? 0,
    stockInValue: row.stock_in_value ?? 0,
    damageValue: row.damage_value ?? 0,
    salesUnits: row.sales_units ?? 0,
    stockInUnits: row.stock_in_units ?? 0,
    damageUnits: row.damage_units ?? 0,
    transactionCount: row.transaction_count ?? 0,
  };
}

function mapProductSalesRow(
  row: ProductSalesRow,
): ProductSalesMetric {
  return {
    productId: row.product_id,
    productName: row.product_name,
    brand: row.brand,
    department: row.department,
    category: row.category,
    unitsSold: row.units_sold ?? 0,
    salesValue: row.sales_value ?? 0,
    transactionCount: row.transaction_count ?? 0,
  };
}

function mapCategorySalesRow(
  row: CategorySalesRow,
): CategorySalesMetric {
  return {
    department: row.department,
    category: row.category,
    unitsSold: row.units_sold ?? 0,
    salesValue: row.sales_value ?? 0,
    transactionCount: row.transaction_count ?? 0,
  };
}

export async function getInventoryAnalyticsSummary(
  days = 30,
  topLimit = 5,
): Promise<InventoryAnalyticsSummary> {
  if (!Number.isInteger(days) || days <= 0) {
    throw new Error(
      "Analytics period must be a positive whole number.",
    );
  }

  if (!Number.isInteger(topLimit) || topLimit <= 0) {
    throw new Error(
      "Analytics top limit must be a positive whole number.",
    );
  }

  const database = await getDatabase();

  const safeTopLimit = Math.min(topLimit, 50);

  const [
    dailyRows,
    productRows,
    categoryRows,
  ] = await Promise.all([
    database.getAllAsync<DailyMetricRow>(
      `
        SELECT
          date(created_at, 'localtime') AS date,

          COALESCE(
            SUM(
              CASE
                WHEN transaction_type = 'sale'
                THEN transaction_value
                ELSE 0
              END
            ),
            0
          ) AS sales_value,

          COALESCE(
            SUM(
              CASE
                WHEN transaction_type = 'stock_in'
                THEN transaction_value
                ELSE 0
              END
            ),
            0
          ) AS stock_in_value,

          COALESCE(
            SUM(
              CASE
                WHEN transaction_type = 'damage'
                THEN transaction_value
                ELSE 0
              END
            ),
            0
          ) AS damage_value,

          COALESCE(
            SUM(
              CASE
                WHEN transaction_type = 'sale'
                THEN quantity
                ELSE 0
              END
            ),
            0
          ) AS sales_units,

          COALESCE(
            SUM(
              CASE
                WHEN transaction_type = 'stock_in'
                THEN quantity
                ELSE 0
              END
            ),
            0
          ) AS stock_in_units,

          COALESCE(
            SUM(
              CASE
                WHEN transaction_type = 'damage'
                THEN quantity
                ELSE 0
              END
            ),
            0
          ) AS damage_units,

          COUNT(*) AS transaction_count

        FROM inventory_transactions

        WHERE datetime(created_at) >= datetime(
          'now',
          ?
        )

        GROUP BY date(created_at, 'localtime')
        ORDER BY date ASC;
      `,
      `-${days} days`,
    ),

    database.getAllAsync<ProductSalesRow>(
      `
        SELECT
          products.id AS product_id,
          products.name AS product_name,
          products.brand,
          products.department,
          products.category,

          COALESCE(
            SUM(transactions.quantity),
            0
          ) AS units_sold,

          COALESCE(
            SUM(transactions.transaction_value),
            0
          ) AS sales_value,

          COUNT(transactions.id) AS transaction_count

        FROM inventory_transactions AS transactions

        INNER JOIN products
          ON products.id = transactions.product_id

        WHERE
          transactions.transaction_type = 'sale'
          AND datetime(transactions.created_at) >= datetime(
            'now',
            ?
          )

        GROUP BY
          products.id,
          products.name,
          products.brand,
          products.department,
          products.category

        ORDER BY
          sales_value DESC,
          units_sold DESC,
          product_name ASC

        LIMIT ?;
      `,
      `-${days} days`,
      safeTopLimit,
    ),

    database.getAllAsync<CategorySalesRow>(
      `
        SELECT
          products.department,
          products.category,

          COALESCE(
            SUM(transactions.quantity),
            0
          ) AS units_sold,

          COALESCE(
            SUM(transactions.transaction_value),
            0
          ) AS sales_value,

          COUNT(transactions.id) AS transaction_count

        FROM inventory_transactions AS transactions

        INNER JOIN products
          ON products.id = transactions.product_id

        WHERE
          transactions.transaction_type = 'sale'
          AND datetime(transactions.created_at) >= datetime(
            'now',
            ?
          )

        GROUP BY
          products.department,
          products.category

        ORDER BY
          sales_value DESC,
          units_sold DESC,
          products.department ASC,
          products.category ASC

        LIMIT ?;
      `,
      `-${days} days`,
      safeTopLimit,
    ),
  ]);

  return {
    dailyMetrics: dailyRows.map(mapDailyMetricRow),
    topProducts: productRows.map(mapProductSalesRow),
    topCategories: categoryRows.map(
      mapCategorySalesRow,
    ),
  };
}