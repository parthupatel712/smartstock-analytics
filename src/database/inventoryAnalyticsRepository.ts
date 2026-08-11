import type {
  AnalyticsPeriodComparison,
  AnalyticsPeriodTotals,
  CategorySalesMetric,
  DailyInventoryMetric,
  InventoryAnalyticsSummary,
  ProductSalesMetric,
  ProductTrend,
} from "../types/inventoryAnalytics";

import { getDatabase } from "./database";

interface DailyMetricRow {
  date: string;

  sales_value: number | null;
  estimated_profit: number | null;

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

  estimated_profit: number | null;

  transaction_count: number | null;
}

interface CategorySalesRow {
  department: string;

  category: string;

  units_sold: number | null;

  sales_value: number | null;

  estimated_profit: number | null;

  transaction_count: number | null;
}

interface PeriodTotalsRow {
  sales_value: number | null;

  estimated_profit: number | null;

  sales_units: number | null;

  stock_in_value: number | null;

  stock_in_units: number | null;

  damage_value: number | null;

  damage_units: number | null;

  transaction_count: number | null;
}

interface ProductComparisonRow {
  product_id: number;

  product_name: string;

  brand: string;

  department: string;

  category: string;

  current_units_sold: number | null;

  current_sales_value: number | null;

  current_estimated_profit: number | null;

  previous_units_sold: number | null;

  previous_sales_value: number | null;

  previous_estimated_profit: number | null;
}

function mapDailyMetricRow(
  row: DailyMetricRow,
): DailyInventoryMetric {
  return {
    date: row.date,

    salesValue:
      row.sales_value ?? 0,

    estimatedProfit:
      row.estimated_profit ?? 0,

    stockInValue:
      row.stock_in_value ?? 0,

    damageValue:
      row.damage_value ?? 0,

    salesUnits:
      row.sales_units ?? 0,

    stockInUnits:
      row.stock_in_units ?? 0,

    damageUnits:
      row.damage_units ?? 0,

    transactionCount:
      row.transaction_count ?? 0,
  };
}

function mapProductSalesRow(
  row: ProductSalesRow,
): ProductSalesMetric {
  return {
    productId:
      row.product_id,

    productName:
      row.product_name,

    brand:
      row.brand,

    department:
      row.department,

    category:
      row.category,

    unitsSold:
      row.units_sold ?? 0,

    salesValue:
      row.sales_value ?? 0,

    estimatedProfit:
      row.estimated_profit ?? 0,

    transactionCount:
      row.transaction_count ?? 0,
  };
}

function mapCategorySalesRow(
  row: CategorySalesRow,
): CategorySalesMetric {
  return {
    department:
      row.department,

    category:
      row.category,

    unitsSold:
      row.units_sold ?? 0,

    salesValue:
      row.sales_value ?? 0,

    estimatedProfit:
      row.estimated_profit ?? 0,

    transactionCount:
      row.transaction_count ?? 0,
  };
}

function mapPeriodTotalsRow(
  row: PeriodTotalsRow | null,
): AnalyticsPeriodTotals {
  return {
    salesValue:
      row?.sales_value ?? 0,

    estimatedProfit:
      row?.estimated_profit ?? 0,

    salesUnits:
      row?.sales_units ?? 0,

    stockInValue:
      row?.stock_in_value ?? 0,

    stockInUnits:
      row?.stock_in_units ?? 0,

    damageValue:
      row?.damage_value ?? 0,

    damageUnits:
      row?.damage_units ?? 0,

    transactionCount:
      row?.transaction_count ?? 0,
  };
}

function calculatePercentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return current === 0
      ? 0
      : null;
  }

  return (
    ((current - previous) /
      previous) *
    100
  );
}

function buildComparison(
  current: AnalyticsPeriodTotals,
  previous: AnalyticsPeriodTotals,
): AnalyticsPeriodComparison {
  return {
    current,

    previous,

    salesValueChangePercent:
      calculatePercentChange(
        current.salesValue,
        previous.salesValue,
      ),

    salesUnitsChangePercent:
      calculatePercentChange(
        current.salesUnits,
        previous.salesUnits,
      ),

    estimatedProfitChangePercent:
      calculatePercentChange(
        current.estimatedProfit,
        previous.estimatedProfit,
      ),

    stockInUnitsChangePercent:
      calculatePercentChange(
        current.stockInUnits,
        previous.stockInUnits,
      ),

    damageValueChangePercent:
      calculatePercentChange(
        current.damageValue,
        previous.damageValue,
      ),
  };
}

function buildProductTrends(
  rows: ProductComparisonRow[],
): ProductTrend[] {
  const trends: ProductTrend[] = [];

  for (const row of rows) {
    const currentUnits =
      row.current_units_sold ?? 0;

    const previousUnits =
      row.previous_units_sold ?? 0;

    const currentSalesValue =
      row.current_sales_value ?? 0;

    const previousSalesValue =
      row.previous_sales_value ?? 0;

    const currentEstimatedProfit =
      row.current_estimated_profit ?? 0;

    const previousEstimatedProfit =
      row.previous_estimated_profit ?? 0;

    const changePercent =
      calculatePercentChange(
        currentUnits,
        previousUnits,
      );

    /*
     * New strong seller:
     * almost no sales before,
     * meaningful sales now.
     */
    if (
      previousUnits <= 2 &&
      currentUnits >= 8
    ) {
      trends.push({
        productId:
          row.product_id,

        productName:
          row.product_name,

        brand:
          row.brand,

        department:
          row.department,

        category:
          row.category,

        currentUnitsSold:
          currentUnits,

        previousUnitsSold:
          previousUnits,

        currentSalesValue,

        previousSalesValue,

        currentEstimatedProfit,

        previousEstimatedProfit,

        changePercent,

        trendType:
          "new_strong_seller",
      });

      continue;
    }

    /*
     * Selling much faster.
     *
     * We require enough volume
     * so small changes do not
     * create misleading alerts.
     */
    if (
      previousUnits >= 5 &&
      currentUnits >= 10 &&
      changePercent !== null &&
      changePercent >= 40
    ) {
      trends.push({
        productId:
          row.product_id,

        productName:
          row.product_name,

        brand:
          row.brand,

        department:
          row.department,

        category:
          row.category,

        currentUnitsSold:
          currentUnits,

        previousUnitsSold:
          previousUnits,

        currentSalesValue,

        previousSalesValue,

        currentEstimatedProfit,

        previousEstimatedProfit,

        changePercent,

        trendType:
          "selling_faster",
      });

      continue;
    }

    /*
     * Sales dropped sharply.
     */
    if (
      previousUnits >= 10 &&
      changePercent !== null &&
      changePercent <= -35
    ) {
      trends.push({
        productId:
          row.product_id,

        productName:
          row.product_name,

        brand:
          row.brand,

        department:
          row.department,

        category:
          row.category,

        currentUnitsSold:
          currentUnits,

        previousUnitsSold:
          previousUnits,

        currentSalesValue,

        previousSalesValue,

        currentEstimatedProfit,

        previousEstimatedProfit,

        changePercent,

        trendType:
          "sales_dropped",
      });
    }
  }

  return trends.sort(
    (
      first,
      second,
    ) => {
      const firstChange =
        Math.abs(
          first.changePercent ?? 0,
        );

      const secondChange =
        Math.abs(
          second.changePercent ?? 0,
        );

      return (
        secondChange -
        firstChange
      );
    },
  );
}

export async function getInventoryAnalyticsSummary(
  days = 30,
  topLimit = 5,
): Promise<InventoryAnalyticsSummary> {
  if (
    !Number.isInteger(days) ||
    days <= 0
  ) {
    throw new Error(
      "Analytics period must be a positive whole number.",
    );
  }

  if (
    !Number.isInteger(topLimit) ||
    topLimit <= 0
  ) {
    throw new Error(
      "Analytics top limit must be a positive whole number.",
    );
  }

  const database =
    await getDatabase();

  const safeTopLimit =
    Math.min(
      topLimit,
      50,
    );

  const currentStart =
    `-${days} days`;

  const previousStart =
    `-${days * 2} days`;

  const previousEnd =
    `-${days} days`;

  const [
    dailyRows,
    productRows,
    categoryRows,
    currentTotalsRow,
    previousTotalsRow,
    productComparisonRows,
  ] = await Promise.all([
    database.getAllAsync<DailyMetricRow>(
      `
        SELECT
          date(
            created_at,
            'localtime'
          ) AS date,

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
                WHEN transaction_type = 'sale'
                THEN
                  (
                    unit_price -
                    unit_cost
                  ) * quantity
                ELSE 0
              END
            ),
            0
          ) AS estimated_profit,

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

        WHERE datetime(
          created_at
        ) >= datetime(
          'now',
          ?
        )

        GROUP BY
          date(
            created_at,
            'localtime'
          )

        ORDER BY
          date ASC;
      `,
      currentStart,
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
            SUM(
              transactions.quantity
            ),
            0
          ) AS units_sold,

          COALESCE(
            SUM(
              transactions.transaction_value
            ),
            0
          ) AS sales_value,

          COALESCE(
            SUM(
              (
                transactions.unit_price -
                transactions.unit_cost
              ) *
              transactions.quantity
            ),
            0
          ) AS estimated_profit,

          COUNT(
            transactions.id
          ) AS transaction_count

        FROM inventory_transactions
          AS transactions

        INNER JOIN products
          ON products.id =
            transactions.product_id

        WHERE
          transactions.transaction_type =
            'sale'

          AND datetime(
            transactions.created_at
          ) >= datetime(
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
      currentStart,
      safeTopLimit,
    ),

    database.getAllAsync<CategorySalesRow>(
      `
        SELECT
          products.department,

          products.category,

          COALESCE(
            SUM(
              transactions.quantity
            ),
            0
          ) AS units_sold,

          COALESCE(
            SUM(
              transactions.transaction_value
            ),
            0
          ) AS sales_value,

          COALESCE(
            SUM(
              (
                transactions.unit_price -
                transactions.unit_cost
              ) *
              transactions.quantity
            ),
            0
          ) AS estimated_profit,

          COUNT(
            transactions.id
          ) AS transaction_count

        FROM inventory_transactions
          AS transactions

        INNER JOIN products
          ON products.id =
            transactions.product_id

        WHERE
          transactions.transaction_type =
            'sale'

          AND datetime(
            transactions.created_at
          ) >= datetime(
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
      currentStart,
      safeTopLimit,
    ),

    database.getFirstAsync<PeriodTotalsRow>(
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
          ) AS sales_value,

          COALESCE(
            SUM(
              CASE
                WHEN transaction_type = 'sale'
                THEN
                  (
                    unit_price -
                    unit_cost
                  ) * quantity
                ELSE 0
              END
            ),
            0
          ) AS estimated_profit,

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
                THEN transaction_value
                ELSE 0
              END
            ),
            0
          ) AS stock_in_value,

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
                THEN transaction_value
                ELSE 0
              END
            ),
            0
          ) AS damage_value,

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

        WHERE datetime(
          created_at
        ) >= datetime(
          'now',
          ?
        );
      `,
      currentStart,
    ),

    database.getFirstAsync<PeriodTotalsRow>(
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
          ) AS sales_value,

          COALESCE(
            SUM(
              CASE
                WHEN transaction_type = 'sale'
                THEN
                  (
                    unit_price -
                    unit_cost
                  ) * quantity
                ELSE 0
              END
            ),
            0
          ) AS estimated_profit,

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
                THEN transaction_value
                ELSE 0
              END
            ),
            0
          ) AS stock_in_value,

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
                THEN transaction_value
                ELSE 0
              END
            ),
            0
          ) AS damage_value,

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

        WHERE
          datetime(
            created_at
          ) >= datetime(
            'now',
            ?
          )

          AND datetime(
            created_at
          ) < datetime(
            'now',
            ?
          );
      `,
      previousStart,
      previousEnd,
    ),

    database.getAllAsync<ProductComparisonRow>(
      `
        SELECT
          products.id AS product_id,

          products.name AS product_name,

          products.brand,

          products.department,

          products.category,

          COALESCE(
            SUM(
              CASE
                WHEN
                  transactions.transaction_type =
                    'sale'

                  AND datetime(
                    transactions.created_at
                  ) >= datetime(
                    'now',
                    ?
                  )

                THEN
                  transactions.quantity

                ELSE 0
              END
            ),
            0
          ) AS current_units_sold,

          COALESCE(
            SUM(
              CASE
                WHEN
                  transactions.transaction_type =
                    'sale'

                  AND datetime(
                    transactions.created_at
                  ) >= datetime(
                    'now',
                    ?
                  )

                THEN
                  transactions.transaction_value

                ELSE 0
              END
            ),
            0
          ) AS current_sales_value,

          COALESCE(
            SUM(
              CASE
                WHEN
                  transactions.transaction_type =
                    'sale'

                  AND datetime(
                    transactions.created_at
                  ) >= datetime(
                    'now',
                    ?
                  )

                THEN
                  (
                    transactions.unit_price -
                    transactions.unit_cost
                  ) *
                  transactions.quantity

                ELSE 0
              END
            ),
            0
          ) AS current_estimated_profit,

          COALESCE(
            SUM(
              CASE
                WHEN
                  transactions.transaction_type =
                    'sale'

                  AND datetime(
                    transactions.created_at
                  ) >= datetime(
                    'now',
                    ?
                  )

                  AND datetime(
                    transactions.created_at
                  ) < datetime(
                    'now',
                    ?
                  )

                THEN
                  transactions.quantity

                ELSE 0
              END
            ),
            0
          ) AS previous_units_sold,

          COALESCE(
            SUM(
              CASE
                WHEN
                  transactions.transaction_type =
                    'sale'

                  AND datetime(
                    transactions.created_at
                  ) >= datetime(
                    'now',
                    ?
                  )

                  AND datetime(
                    transactions.created_at
                  ) < datetime(
                    'now',
                    ?
                  )

                THEN
                  transactions.transaction_value

                ELSE 0
              END
            ),
            0
          ) AS previous_sales_value,

          COALESCE(
            SUM(
              CASE
                WHEN
                  transactions.transaction_type =
                    'sale'

                  AND datetime(
                    transactions.created_at
                  ) >= datetime(
                    'now',
                    ?
                  )

                  AND datetime(
                    transactions.created_at
                  ) < datetime(
                    'now',
                    ?
                  )

                THEN
                  (
                    transactions.unit_price -
                    transactions.unit_cost
                  ) *
                  transactions.quantity

                ELSE 0
              END
            ),
            0
          ) AS previous_estimated_profit

        FROM products

        LEFT JOIN inventory_transactions
          AS transactions

          ON products.id =
            transactions.product_id

          AND datetime(
            transactions.created_at
          ) >= datetime(
            'now',
            ?
          )

        GROUP BY
          products.id,
          products.name,
          products.brand,
          products.department,
          products.category;
      `,
      currentStart,
      currentStart,
      currentStart,

      previousStart,
      previousEnd,

      previousStart,
      previousEnd,

      previousStart,
      previousEnd,

      previousStart,
    ),
  ]);

  const currentTotals =
    mapPeriodTotalsRow(
      currentTotalsRow,
    );

  const previousTotals =
    mapPeriodTotalsRow(
      previousTotalsRow,
    );

  return {
    dailyMetrics:
      dailyRows.map(
        mapDailyMetricRow,
      ),

    topProducts:
      productRows.map(
        mapProductSalesRow,
      ),

    topCategories:
      categoryRows.map(
        mapCategorySalesRow,
      ),

    comparison:
      buildComparison(
        currentTotals,
        previousTotals,
      ),

    productTrends:
      buildProductTrends(
        productComparisonRows,
      ),
  };
}