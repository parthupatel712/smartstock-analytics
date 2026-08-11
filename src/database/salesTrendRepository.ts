import type {
  SalesTrendCategoryOption,
  SalesTrendPoint,
  SalesTrendProductOption,
} from "../types/salesTrend";

import { getDatabase } from "./database";

interface SalesTrendRow {
  date: string;

  sales_value: number | null;

  items_sold: number | null;

  estimated_profit: number | null;
}

interface CategoryOptionRow {
  department: string;
  category: string;
}

interface ProductOptionRow {
  product_id: number;
  product_name: string;
  brand: string;
  department: string;
  category: string;
}

function mapTrendRow(
  row: SalesTrendRow,
): SalesTrendPoint {
  return {
    date: row.date,

    salesValue:
      row.sales_value ?? 0,

    itemsSold:
      row.items_sold ?? 0,

    estimatedProfit:
      row.estimated_profit ?? 0,
  };
}

export async function getOverallSalesTrend(
  days: number,
): Promise<SalesTrendPoint[]> {
  validateDays(days);

  const database =
    await getDatabase();

  const rows =
    await database.getAllAsync<SalesTrendRow>(
      `
        SELECT
          date(
            transactions.created_at,
            'localtime'
          ) AS date,

          COALESCE(
            SUM(
              transactions.transaction_value
            ),
            0
          ) AS sales_value,

          COALESCE(
            SUM(
              transactions.quantity
            ),
            0
          ) AS items_sold,

          COALESCE(
            SUM(
              (
                transactions.unit_price -
                transactions.unit_cost
              ) *
              transactions.quantity
            ),
            0
          ) AS estimated_profit

        FROM inventory_transactions
          AS transactions

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
          date(
            transactions.created_at,
            'localtime'
          )

        ORDER BY
          date ASC;
      `,
      `-${days} days`,
    );

  return rows.map(
    mapTrendRow,
  );
}

export async function getCategorySalesTrend(
  days: number,
  department: string,
  category: string,
): Promise<SalesTrendPoint[]> {
  validateDays(days);

  if (!department.trim()) {
    throw new Error(
      "Department is required.",
    );
  }

  if (!category.trim()) {
    throw new Error(
      "Category is required.",
    );
  }

  const database =
    await getDatabase();

  const rows =
    await database.getAllAsync<SalesTrendRow>(
      `
        SELECT
          date(
            transactions.created_at,
            'localtime'
          ) AS date,

          COALESCE(
            SUM(
              transactions.transaction_value
            ),
            0
          ) AS sales_value,

          COALESCE(
            SUM(
              transactions.quantity
            ),
            0
          ) AS items_sold,

          COALESCE(
            SUM(
              (
                transactions.unit_price -
                transactions.unit_cost
              ) *
              transactions.quantity
            ),
            0
          ) AS estimated_profit

        FROM inventory_transactions
          AS transactions

        INNER JOIN products
          ON products.id =
            transactions.product_id

        WHERE
          transactions.transaction_type =
            'sale'

          AND products.department = ?

          AND products.category = ?

          AND datetime(
            transactions.created_at
          ) >= datetime(
            'now',
            ?
          )

        GROUP BY
          date(
            transactions.created_at,
            'localtime'
          )

        ORDER BY
          date ASC;
      `,
      department.trim(),
      category.trim(),
      `-${days} days`,
    );

  return rows.map(
    mapTrendRow,
  );
}

export async function getProductSalesTrend(
  days: number,
  productId: number,
): Promise<SalesTrendPoint[]> {
  validateDays(days);

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error(
      "A valid product is required.",
    );
  }

  const database =
    await getDatabase();

  const rows =
    await database.getAllAsync<SalesTrendRow>(
      `
        SELECT
          date(
            transactions.created_at,
            'localtime'
          ) AS date,

          COALESCE(
            SUM(
              transactions.transaction_value
            ),
            0
          ) AS sales_value,

          COALESCE(
            SUM(
              transactions.quantity
            ),
            0
          ) AS items_sold,

          COALESCE(
            SUM(
              (
                transactions.unit_price -
                transactions.unit_cost
              ) *
              transactions.quantity
            ),
            0
          ) AS estimated_profit

        FROM inventory_transactions
          AS transactions

        WHERE
          transactions.transaction_type =
            'sale'

          AND transactions.product_id = ?

          AND datetime(
            transactions.created_at
          ) >= datetime(
            'now',
            ?
          )

        GROUP BY
          date(
            transactions.created_at,
            'localtime'
          )

        ORDER BY
          date ASC;
      `,
      productId,
      `-${days} days`,
    );

  return rows.map(
    mapTrendRow,
  );
}

export async function getSalesTrendCategoryOptions(): Promise<
  SalesTrendCategoryOption[]
> {
  const database =
    await getDatabase();

  const rows =
    await database.getAllAsync<CategoryOptionRow>(
      `
        SELECT DISTINCT
          department,
          category

        FROM products

        WHERE is_active = 1

        ORDER BY
          department COLLATE NOCASE ASC,
          category COLLATE NOCASE ASC;
      `,
    );

  return rows.map(
    (row) => ({
      department:
        row.department,

      category:
        row.category,
    }),
  );
}

export async function getSalesTrendProductOptions(): Promise<
  SalesTrendProductOption[]
> {
  const database =
    await getDatabase();

  const rows =
    await database.getAllAsync<ProductOptionRow>(
      `
        SELECT
          id AS product_id,
          name AS product_name,
          brand,
          department,
          category

        FROM products

        WHERE is_active = 1

        ORDER BY
          name COLLATE NOCASE ASC;
      `,
    );

  return rows.map(
    (row) => ({
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
    }),
  );
}

function validateDays(
  days: number,
): void {
  if (
    !Number.isInteger(days) ||
    days <= 0
  ) {
    throw new Error(
      "Trend period must be a positive whole number.",
    );
  }
}