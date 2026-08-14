import type {
  AnalyticsPeriodComparison,
  AnalyticsPeriodTotals,
  CategorySalesMetric,
  DailyInventoryMetric,
  InventoryAnalyticsSummary,
  ProductSalesMetric,
  ProductTrend,
  SalesTrendMetric,
} from "../types/inventoryAnalytics";

import {
  getDatabase,
} from "./database";

interface DailyMetricRow {
  date:
    string;

  sales_value:
    number | null;

  estimated_profit:
    number | null;

  stock_in_value:
    number | null;

  damage_value:
    number | null;

  sales_units:
    number | null;

  stock_in_units:
    number | null;

  damage_units:
    number | null;

  transaction_count:
    number | null;
}

interface ProductSalesRow {
  product_id:
    number;

  product_name:
    string;

  brand:
    string;

  department:
    string;

  category:
    string;

  units_sold:
    number | null;

  sales_value:
    number | null;

  estimated_profit:
    number | null;

  transaction_count:
    number | null;
}

interface CategorySalesRow {
  department:
    string;

  category:
    string;

  units_sold:
    number | null;

  sales_value:
    number | null;

  estimated_profit:
    number | null;

  transaction_count:
    number | null;
}

interface CombinedPeriodTotalsRow {
  current_sales_value:
    number | null;

  current_estimated_profit:
    number | null;

  current_sales_units:
    number | null;

  current_stock_in_value:
    number | null;

  current_stock_in_units:
    number | null;

  current_damage_value:
    number | null;

  current_damage_units:
    number | null;

  current_transaction_count:
    number | null;

  previous_sales_value:
    number | null;

  previous_estimated_profit:
    number | null;

  previous_sales_units:
    number | null;

  previous_stock_in_value:
    number | null;

  previous_stock_in_units:
    number | null;

  previous_damage_value:
    number | null;

  previous_damage_units:
    number | null;

  previous_transaction_count:
    number | null;
}

interface ProductComparisonRow {
  product_id:
    number;

  product_name:
    string;

  brand:
    string;

  department:
    string;

  category:
    string;

  current_stock:
    number;

  reorder_level:
    number;

  current_units_sold:
    number | null;

  current_sales_value:
    number | null;

  current_estimated_profit:
    number | null;

  previous_units_sold:
    number | null;

  previous_sales_value:
    number | null;

  previous_estimated_profit:
    number | null;
}

interface SalesTrendRow {
  date:
    string;

  product_id:
    number;

  product_name:
    string;

  brand:
    string;

  department:
    string;

  category:
    string;

  sales_value:
    number | null;

  sales_units:
    number | null;

  estimated_profit:
    number | null;
}

function getPeriodStartIso(
  days:
    number,
): string {
  return new Date(
    Date.now() -
      days *
        24 *
        60 *
        60 *
        1000,
  ).toISOString();
}

function mapDailyMetricRow(
  row:
    DailyMetricRow,
): DailyInventoryMetric {
  return {
    date:
      row.date,

    salesValue:
      row.sales_value ??
      0,

    estimatedProfit:
      row.estimated_profit ??
      0,

    stockInValue:
      row.stock_in_value ??
      0,

    damageValue:
      row.damage_value ??
      0,

    salesUnits:
      row.sales_units ??
      0,

    stockInUnits:
      row.stock_in_units ??
      0,

    damageUnits:
      row.damage_units ??
      0,

    transactionCount:
      row.transaction_count ??
      0,
  };
}

function mapProductSalesRow(
  row:
    ProductSalesRow,
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
      row.units_sold ??
      0,

    salesValue:
      row.sales_value ??
      0,

    estimatedProfit:
      row.estimated_profit ??
      0,

    transactionCount:
      row.transaction_count ??
      0,
  };
}

function mapCategorySalesRow(
  row:
    CategorySalesRow,
): CategorySalesMetric {
  return {
    department:
      row.department,

    category:
      row.category,

    unitsSold:
      row.units_sold ??
      0,

    salesValue:
      row.sales_value ??
      0,

    estimatedProfit:
      row.estimated_profit ??
      0,

    transactionCount:
      row.transaction_count ??
      0,
  };
}

function mapSalesTrendRow(
  row:
    SalesTrendRow,
): SalesTrendMetric {
  return {
    date:
      row.date,

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

    salesValue:
      row.sales_value ??
      0,

    salesUnits:
      row.sales_units ??
      0,

    estimatedProfit:
      row.estimated_profit ??
      0,
  };
}

function calculatePercentChange(
  current:
    number,

  previous:
    number,
): number | null {
  if (
    previous ===
    0
  ) {
    return current ===
      0
      ? 0
      : null;
  }

  return (
    (
      current -
      previous
    ) /
    previous
  ) * 100;
}

function buildComparison(
  current:
    AnalyticsPeriodTotals,

  previous:
    AnalyticsPeriodTotals,
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
  rows:
    ProductComparisonRow[],
): ProductTrend[] {
  const trends:
    ProductTrend[] =
      [];

  for (
    const row of
    rows
  ) {
    const currentUnits =
      row.current_units_sold ??
      0;

    const previousUnits =
      row.previous_units_sold ??
      0;

    const currentSalesValue =
      row.current_sales_value ??
      0;

    const previousSalesValue =
      row.previous_sales_value ??
      0;

    const currentEstimatedProfit =
      row.current_estimated_profit ??
      0;

    const previousEstimatedProfit =
      row.previous_estimated_profit ??
      0;

    const changePercent =
      calculatePercentChange(
        currentUnits,
        previousUnits,
      );

    const needsRestock =
      row.current_stock <=
      row.reorder_level;

    const baseTrend = {
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

      currentStock:
        row.current_stock,

      reorderLevel:
        row.reorder_level,

      needsRestock,

      changePercent,
    };

    if (
      previousUnits <=
        2 &&
      currentUnits >=
        8
    ) {
      trends.push({
        ...baseTrend,

        trendType:
          "new_strong_seller",
      });

      continue;
    }

    if (
      previousUnits >=
        5 &&
      currentUnits >=
        10 &&
      changePercent !==
        null &&
      changePercent >=
        40
    ) {
      trends.push({
        ...baseTrend,

        trendType:
          "selling_faster",
      });

      continue;
    }

    if (
      previousUnits >=
        10 &&
      changePercent !==
        null &&
      changePercent <=
        -35
    ) {
      trends.push({
        ...baseTrend,

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
      if (
        first.needsRestock !==
        second.needsRestock
      ) {
        return first.needsRestock
          ? -1
          : 1;
      }

      const firstChange =
        Math.abs(
          first.changePercent ??
            0,
        );

      const secondChange =
        Math.abs(
          second.changePercent ??
            0,
        );

      return (
        secondChange -
        firstChange
      );
    },
  );
}

function buildPeriodTotals(
  row:
    CombinedPeriodTotalsRow | null,

  period:
    "current" |
    "previous",
): AnalyticsPeriodTotals {
  if (
    period ===
    "current"
  ) {
    return {
      salesValue:
        row
          ?.current_sales_value ??
        0,

      estimatedProfit:
        row
          ?.current_estimated_profit ??
        0,

      salesUnits:
        row
          ?.current_sales_units ??
        0,

      stockInValue:
        row
          ?.current_stock_in_value ??
        0,

      stockInUnits:
        row
          ?.current_stock_in_units ??
        0,

      damageValue:
        row
          ?.current_damage_value ??
        0,

      damageUnits:
        row
          ?.current_damage_units ??
        0,

      transactionCount:
        row
          ?.current_transaction_count ??
        0,
    };
  }

  return {
    salesValue:
      row
        ?.previous_sales_value ??
      0,

    estimatedProfit:
      row
        ?.previous_estimated_profit ??
      0,

    salesUnits:
      row
        ?.previous_sales_units ??
      0,

    stockInValue:
      row
        ?.previous_stock_in_value ??
      0,

    stockInUnits:
      row
        ?.previous_stock_in_units ??
      0,

    damageValue:
      row
        ?.previous_damage_value ??
      0,

    damageUnits:
      row
        ?.previous_damage_units ??
      0,

    transactionCount:
      row
        ?.previous_transaction_count ??
      0,
  };
}

export async function getInventoryAnalyticsSummary(
  days =
    30,

  topLimit =
    5,
): Promise<InventoryAnalyticsSummary> {
  if (
    !Number.isInteger(
      days,
    ) ||
    days <= 0
  ) {
    throw new Error(
      "Analytics period must be a positive whole number.",
    );
  }

  if (
    !Number.isInteger(
      topLimit,
    ) ||
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
    getPeriodStartIso(
      days,
    );

  const previousStart =
    getPeriodStartIso(
      days *
        2,
    );

  const [
    dailyRows,
    productRows,
    allCategoryRows,
    combinedTotalsRow,
    productComparisonRows,
    salesTrendRows,
  ] =
    await Promise.all([
      /*
       * Daily totals.
       */
      database.getAllAsync<DailyMetricRow>(
        `
          SELECT
            date(
              created_at,
              'localtime'
            )
              AS date,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    transaction_type = 'sale'

                  THEN
                    transaction_value

                  ELSE 0
                END
              ),
              0
            )
              AS sales_value,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    transaction_type = 'sale'

                  THEN
                    (
                      unit_price -
                      unit_cost
                    ) *
                    quantity

                  ELSE 0
                END
              ),
              0
            )
              AS estimated_profit,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    transaction_type = 'stock_in'

                  THEN
                    transaction_value

                  ELSE 0
                END
              ),
              0
            )
              AS stock_in_value,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    transaction_type = 'damage'

                  THEN
                    transaction_value

                  ELSE 0
                END
              ),
              0
            )
              AS damage_value,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    transaction_type = 'sale'

                  THEN
                    quantity

                  ELSE 0
                END
              ),
              0
            )
              AS sales_units,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    transaction_type = 'stock_in'

                  THEN
                    quantity

                  ELSE 0
                END
              ),
              0
            )
              AS stock_in_units,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    transaction_type = 'damage'

                  THEN
                    quantity

                  ELSE 0
                END
              ),
              0
            )
              AS damage_units,

            COUNT(*)
              AS transaction_count

          FROM inventory_transactions

          WHERE
            created_at >= ?

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

      /*
       * Top selling products.
       */
      database.getAllAsync<ProductSalesRow>(
        `
          SELECT
            products.id
              AS product_id,

            products.name
              AS product_name,

            products.brand,

            products.department,

            products.category,

            COALESCE(
              SUM(
                transactions.quantity
              ),
              0
            )
              AS units_sold,

            COALESCE(
              SUM(
                transactions.transaction_value
              ),
              0
            )
              AS sales_value,

            COALESCE(
              SUM(
                (
                  transactions.unit_price -
                  transactions.unit_cost
                ) *
                transactions.quantity
              ),
              0
            )
              AS estimated_profit,

            COUNT(
              transactions.id
            )
              AS transaction_count

          FROM inventory_transactions
            AS transactions

          INNER JOIN products

            ON
              products.id =
                transactions.product_id

          WHERE
            transactions.transaction_type =
              'sale'

            AND
              transactions.created_at >= ?

          GROUP BY
            products.id,
            products.name,
            products.brand,
            products.department,
            products.category

          ORDER BY
            sales_value DESC,
            units_sold DESC,
            product_name COLLATE NOCASE ASC

          LIMIT ?;
        `,
        currentStart,
        safeTopLimit,
      ),

      /*
       * Category metrics are calculated
       * only once.
       *
       * We use the complete result for the
       * category-share chart and slice it
       * in JavaScript for Top Categories.
       */
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
            )
              AS units_sold,

            COALESCE(
              SUM(
                transactions.transaction_value
              ),
              0
            )
              AS sales_value,

            COALESCE(
              SUM(
                (
                  transactions.unit_price -
                  transactions.unit_cost
                ) *
                transactions.quantity
              ),
              0
            )
              AS estimated_profit,

            COUNT(
              transactions.id
            )
              AS transaction_count

          FROM inventory_transactions
            AS transactions

          INNER JOIN products

            ON
              products.id =
                transactions.product_id

          WHERE
            transactions.transaction_type =
              'sale'

            AND
              transactions.created_at >= ?

          GROUP BY
            products.department,
            products.category

          ORDER BY
            sales_value DESC,
            units_sold DESC,
            products.department COLLATE NOCASE ASC,
            products.category COLLATE NOCASE ASC;
        `,
        currentStart,
      ),

      /*
       * Current + previous period totals
       * are calculated in one scan.
       */
      database.getFirstAsync<CombinedPeriodTotalsRow>(
        `
          SELECT
            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND transaction_type = 'sale'

                  THEN
                    transaction_value

                  ELSE 0
                END
              ),
              0
            )
              AS current_sales_value,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND transaction_type = 'sale'

                  THEN
                    (
                      unit_price -
                      unit_cost
                    ) *
                    quantity

                  ELSE 0
                END
              ),
              0
            )
              AS current_estimated_profit,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND transaction_type = 'sale'

                  THEN
                    quantity

                  ELSE 0
                END
              ),
              0
            )
              AS current_sales_units,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND transaction_type = 'stock_in'

                  THEN
                    transaction_value

                  ELSE 0
                END
              ),
              0
            )
              AS current_stock_in_value,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND transaction_type = 'stock_in'

                  THEN
                    quantity

                  ELSE 0
                END
              ),
              0
            )
              AS current_stock_in_units,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND transaction_type = 'damage'

                  THEN
                    transaction_value

                  ELSE 0
                END
              ),
              0
            )
              AS current_damage_value,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND transaction_type = 'damage'

                  THEN
                    quantity

                  ELSE 0
                END
              ),
              0
            )
              AS current_damage_units,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?

                  THEN
                    1

                  ELSE 0
                END
              ),
              0
            )
              AS current_transaction_count,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND created_at < ?
                    AND transaction_type = 'sale'

                  THEN
                    transaction_value

                  ELSE 0
                END
              ),
              0
            )
              AS previous_sales_value,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND created_at < ?
                    AND transaction_type = 'sale'

                  THEN
                    (
                      unit_price -
                      unit_cost
                    ) *
                    quantity

                  ELSE 0
                END
              ),
              0
            )
              AS previous_estimated_profit,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND created_at < ?
                    AND transaction_type = 'sale'

                  THEN
                    quantity

                  ELSE 0
                END
              ),
              0
            )
              AS previous_sales_units,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND created_at < ?
                    AND transaction_type = 'stock_in'

                  THEN
                    transaction_value

                  ELSE 0
                END
              ),
              0
            )
              AS previous_stock_in_value,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND created_at < ?
                    AND transaction_type = 'stock_in'

                  THEN
                    quantity

                  ELSE 0
                END
              ),
              0
            )
              AS previous_stock_in_units,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND created_at < ?
                    AND transaction_type = 'damage'

                  THEN
                    transaction_value

                  ELSE 0
                END
              ),
              0
            )
              AS previous_damage_value,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND created_at < ?
                    AND transaction_type = 'damage'

                  THEN
                    quantity

                  ELSE 0
                END
              ),
              0
            )
              AS previous_damage_units,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    created_at >= ?
                    AND created_at < ?

                  THEN
                    1

                  ELSE 0
                END
              ),
              0
            )
              AS previous_transaction_count

          FROM inventory_transactions

          WHERE
            created_at >= ?;
        `,
        currentStart,
        currentStart,
        currentStart,
        currentStart,
        currentStart,
        currentStart,
        currentStart,
        currentStart,

        previousStart,
        currentStart,

        previousStart,
        currentStart,

        previousStart,
        currentStart,

        previousStart,
        currentStart,

        previousStart,
        currentStart,

        previousStart,
        currentStart,

        previousStart,
        currentStart,

        previousStart,
        currentStart,

        previousStart,
      ),

      /*
       * Product trend comparison.
       *
       * Only SALE transactions from the
       * required two-period range enter
       * the join.
       */
      database.getAllAsync<ProductComparisonRow>(
        `
          SELECT
            products.id
              AS product_id,

            products.name
              AS product_name,

            products.brand,

            products.department,

            products.category,

            products.current_stock,

            products.reorder_level,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    transactions.created_at >= ?

                  THEN
                    transactions.quantity

                  ELSE 0
                END
              ),
              0
            )
              AS current_units_sold,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    transactions.created_at >= ?

                  THEN
                    transactions.transaction_value

                  ELSE 0
                END
              ),
              0
            )
              AS current_sales_value,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    transactions.created_at >= ?

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
            )
              AS current_estimated_profit,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    transactions.created_at < ?

                  THEN
                    transactions.quantity

                  ELSE 0
                END
              ),
              0
            )
              AS previous_units_sold,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    transactions.created_at < ?

                  THEN
                    transactions.transaction_value

                  ELSE 0
                END
              ),
              0
            )
              AS previous_sales_value,

            COALESCE(
              SUM(
                CASE
                  WHEN
                    transactions.created_at < ?

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
            )
              AS previous_estimated_profit

          FROM products

          LEFT JOIN inventory_transactions
            AS transactions

            ON
              products.id =
                transactions.product_id

              AND
                transactions.transaction_type =
                  'sale'

              AND
                transactions.created_at >= ?

          WHERE
            products.is_active =
              1

          GROUP BY
            products.id,
            products.name,
            products.brand,
            products.department,
            products.category,
            products.current_stock,
            products.reorder_level;
        `,
        currentStart,
        currentStart,
        currentStart,

        currentStart,
        currentStart,
        currentStart,

        previousStart,
      ),

      /*
       * Daily per-product sales trend.
       */
      database.getAllAsync<SalesTrendRow>(
        `
          SELECT
            date(
              transactions.created_at,
              'localtime'
            )
              AS date,

            products.id
              AS product_id,

            products.name
              AS product_name,

            products.brand,

            products.department,

            products.category,

            COALESCE(
              SUM(
                transactions.transaction_value
              ),
              0
            )
              AS sales_value,

            COALESCE(
              SUM(
                transactions.quantity
              ),
              0
            )
              AS sales_units,

            COALESCE(
              SUM(
                (
                  transactions.unit_price -
                  transactions.unit_cost
                ) *
                transactions.quantity
              ),
              0
            )
              AS estimated_profit

          FROM inventory_transactions
            AS transactions

          INNER JOIN products

            ON
              products.id =
                transactions.product_id

          WHERE
            transactions.transaction_type =
              'sale'

            AND
              transactions.created_at >= ?

          GROUP BY
            date(
              transactions.created_at,
              'localtime'
            ),
            products.id,
            products.name,
            products.brand,
            products.department,
            products.category

          ORDER BY
            date ASC,
            products.name COLLATE NOCASE ASC;
        `,
        currentStart,
      ),
    ]);

  const currentTotals =
    buildPeriodTotals(
      combinedTotalsRow,
      "current",
    );

  const previousTotals =
    buildPeriodTotals(
      combinedTotalsRow,
      "previous",
    );

  const categoryMetrics =
    allCategoryRows.map(
      mapCategorySalesRow,
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
      categoryMetrics.slice(
        0,
        safeTopLimit,
      ),

    categoryShareMetrics:
      categoryMetrics,

    comparison:
      buildComparison(
        currentTotals,
        previousTotals,
      ),

    productTrends:
      buildProductTrends(
        productComparisonRows,
      ),

    salesTrendMetrics:
      salesTrendRows.map(
        mapSalesTrendRow,
      ),
  };
}