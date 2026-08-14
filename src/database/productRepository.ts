import type {
  CreateProductInput,
  Product,
} from "../types/product";

import type {
  InventoryFilterState,
  InventorySortOption,
} from "../types/inventoryFilter";

import type {
  UpdateProductInput,
} from "../types/productUpdate";

import {
  getDatabase,
} from "./database";

interface ProductRow {
  id: number;

  barcode: string;

  name: string;

  department:
    Product["department"];

  category:
    Product["category"];

  brand: string;

  unit_cost: number;

  unit_price: number;

  current_stock: number;

  reorder_level: number;

  is_active: number;

  created_at: string;

  updated_at: string;
}

function mapProductRow(
  row: ProductRow,
): Product {
  return {
    id:
      row.id,

    barcode:
      row.barcode,

    name:
      row.name,

    department:
      row.department,

    category:
      row.category,

    brand:
      row.brand,

    unitCost:
      row.unit_cost,

    unitPrice:
      row.unit_price,

    currentStock:
      row.current_stock,

    reorderLevel:
      row.reorder_level,

    isActive:
      row.is_active === 1,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

function normalizeBarcode(
  barcode: string,
): string {
  return barcode.trim();
}

function getInventoryOrderByClause(
  sortBy:
    InventorySortOption,
): string {
  switch (
    sortBy
  ) {
    case "name-desc":
      return `
        name COLLATE NOCASE DESC,
        id ASC
      `;

    case "stock-asc":
      return `
        current_stock ASC,
        name COLLATE NOCASE ASC,
        id ASC
      `;

    case "stock-desc":
      return `
        current_stock DESC,
        name COLLATE NOCASE ASC,
        id ASC
      `;

    case "price-asc":
      return `
        unit_price ASC,
        name COLLATE NOCASE ASC,
        id ASC
      `;

    case "price-desc":
      return `
        unit_price DESC,
        name COLLATE NOCASE ASC,
        id ASC
      `;

    case "name-asc":
    default:
      return `
        name COLLATE NOCASE ASC,
        id ASC
      `;
  }
}

export async function createProduct(
  input:
    CreateProductInput,
): Promise<number> {
  const database =
    await getDatabase();

  const barcode =
    normalizeBarcode(
      input.barcode,
    );

  const name =
    input.name.trim();

  /*
   * Brand is optional.
   *
   * Empty brand is stored as "".
   */
  const brand =
    input.brand.trim();

  const currentStock =
    input.currentStock ??
    0;

  const reorderLevel =
    input.reorderLevel ??
    5;

  const now =
    new Date().toISOString();

  if (
    !barcode
  ) {
    throw new Error(
      "Barcode is required.",
    );
  }

  if (
    !name
  ) {
    throw new Error(
      "Product name is required.",
    );
  }

  if (
    !input.department
  ) {
    throw new Error(
      "Department is required.",
    );
  }

  if (
    !input.category
  ) {
    throw new Error(
      "Category is required.",
    );
  }

  if (
    !Number.isFinite(
      input.unitCost,
    ) ||
    input.unitCost < 0
  ) {
    throw new Error(
      "Unit cost cannot be negative.",
    );
  }

  if (
    !Number.isFinite(
      input.unitPrice,
    ) ||
    input.unitPrice < 0
  ) {
    throw new Error(
      "Unit price cannot be negative.",
    );
  }

  if (
    !Number.isInteger(
      currentStock,
    ) ||
    currentStock < 0
  ) {
    throw new Error(
      "Current stock must be a non-negative whole number.",
    );
  }

  if (
    !Number.isInteger(
      reorderLevel,
    ) ||
    reorderLevel < 0
  ) {
    throw new Error(
      "Reorder level must be a non-negative whole number.",
    );
  }

  const duplicateBarcode =
    await database.getFirstAsync<{
      id: number;
    }>(
      `
        SELECT
          id

        FROM products

        WHERE
          barcode = ?

        LIMIT 1;
      `,
      barcode,
    );

  if (
    duplicateBarcode
  ) {
    throw new Error(
      "Another product already uses this barcode.",
    );
  }

  const result =
    await database.runAsync(
      `
        INSERT INTO products (
          barcode,
          name,
          department,
          category,
          brand,
          unit_cost,
          unit_price,
          current_stock,
          reorder_level,
          is_active,
          created_at,
          updated_at
        )

        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?
        );
      `,
      barcode,
      name,
      input.department,
      input.category,
      brand,
      input.unitCost,
      input.unitPrice,
      currentStock,
      reorderLevel,
      now,
      now,
    );

  return (
    result.lastInsertRowId
  );
}

export async function getAllProducts(): Promise<
  Product[]
> {
  const database =
    await getDatabase();

  const rows =
    await database.getAllAsync<ProductRow>(
      `
        SELECT
          id,
          barcode,
          name,
          department,
          category,
          brand,
          unit_cost,
          unit_price,
          current_stock,
          reorder_level,
          is_active,
          created_at,
          updated_at

        FROM products

        WHERE
          is_active = 1

        ORDER BY
          name COLLATE NOCASE ASC,
          id ASC;
      `,
    );

  return rows.map(
    mapProductRow,
  );
}

/*
 * Database-backed inventory filtering.
 *
 * Search, department filtering,
 * low-stock filtering and sorting
 * now happen inside SQLite instead
 * of repeatedly filtering thousands
 * of products in JavaScript.
 */
export async function getFilteredProducts(
  filters:
    InventoryFilterState,
): Promise<Product[]> {
  const database =
    await getDatabase();

  const conditions:
    string[] = [
      "is_active = 1",
    ];

  const parameters:
    (
      | string
      | number
    )[] = [];

  const normalizedSearch =
    filters.searchQuery
      .trim();

  if (
    normalizedSearch
  ) {
    /*
     * Preserve the existing UX where
     * the search can match anywhere
     * inside:
     *
     * - product name
     * - brand
     * - barcode
     *
     * For ~5,000 products this remains
     * lightweight.
     *
     * If the inventory becomes much
     * larger later, this can be moved
     * to SQLite FTS without changing
     * the UI API.
     */
    const searchPattern =
      `%${normalizedSearch}%`;

    conditions.push(
      `
        (
          name LIKE ?
            COLLATE NOCASE

          OR brand LIKE ?
            COLLATE NOCASE

          OR barcode LIKE ?
            COLLATE NOCASE
        )
      `,
    );

    parameters.push(
      searchPattern,
      searchPattern,
      searchPattern,
    );
  }

  if (
    filters.department !==
    "all"
  ) {
    conditions.push(
      "department = ?",
    );

    parameters.push(
      filters.department,
    );
  }

  if (
    filters.lowStockOnly
  ) {
    conditions.push(
      `
        current_stock <=
          reorder_level
      `,
    );
  }

  /*
   * IMPORTANT:
   *
   * The ORDER BY string does not
   * contain user input.
   *
   * It is selected only from our
   * fixed InventorySortOption union.
   */
  const orderBy =
    getInventoryOrderByClause(
      filters.sortBy,
    );

  const rows =
    await database.getAllAsync<ProductRow>(
      `
        SELECT
          id,
          barcode,
          name,
          department,
          category,
          brand,
          unit_cost,
          unit_price,
          current_stock,
          reorder_level,
          is_active,
          created_at,
          updated_at

        FROM products

        WHERE
          ${conditions.join(
            "\nAND ",
          )}

        ORDER BY
          ${orderBy};
      `,
      ...parameters,
    );

  return rows.map(
    mapProductRow,
  );
}

export async function getProductCount(): Promise<number> {
  const database =
    await getDatabase();

  const result =
    await database.getFirstAsync<{
      total: number;
    }>(
      `
        SELECT
          COUNT(*) AS total

        FROM products

        WHERE
          is_active = 1;
      `,
    );

  return (
    result?.total ??
    0
  );
}

export async function getProductByBarcode(
  barcode:
    string,
): Promise<Product | null> {
  const database =
    await getDatabase();

  const normalizedBarcode =
    normalizeBarcode(
      barcode,
    );

  if (
    !normalizedBarcode
  ) {
    return null;
  }

  const row =
    await database.getFirstAsync<ProductRow>(
      `
        SELECT
          id,
          barcode,
          name,
          department,
          category,
          brand,
          unit_cost,
          unit_price,
          current_stock,
          reorder_level,
          is_active,
          created_at,
          updated_at

        FROM products

        WHERE
          barcode = ?

          AND is_active = 1

        LIMIT 1;
      `,
      normalizedBarcode,
    );

  return row
    ? mapProductRow(
        row,
      )
    : null;
}

export async function updateProduct(
  input:
    UpdateProductInput,
): Promise<void> {
  const database =
    await getDatabase();

  const barcode =
    normalizeBarcode(
      input.barcode,
    );

  const name =
    input.name.trim();

  const brand =
    input.brand.trim();

  if (
    !barcode
  ) {
    throw new Error(
      "Barcode is required.",
    );
  }

  if (
    !name
  ) {
    throw new Error(
      "Product name is required.",
    );
  }

  if (
    !input.department
  ) {
    throw new Error(
      "Department is required.",
    );
  }

  if (
    !input.category
  ) {
    throw new Error(
      "Category is required.",
    );
  }

  if (
    !Number.isFinite(
      input.unitCost,
    ) ||
    input.unitCost < 0
  ) {
    throw new Error(
      "Unit cost must be zero or greater.",
    );
  }

  if (
    !Number.isFinite(
      input.unitPrice,
    ) ||
    input.unitPrice < 0
  ) {
    throw new Error(
      "Selling price must be zero or greater.",
    );
  }

  if (
    !Number.isInteger(
      input.reorderLevel,
    ) ||
    input.reorderLevel < 0
  ) {
    throw new Error(
      "Reorder level must be a whole number of zero or greater.",
    );
  }

  const duplicateBarcode =
    await database.getFirstAsync<{
      id: number;
    }>(
      `
        SELECT
          id

        FROM products

        WHERE
          barcode = ?

          AND id != ?

        LIMIT 1;
      `,
      barcode,
      input.productId,
    );

  if (
    duplicateBarcode
  ) {
    throw new Error(
      "Another product already uses this barcode.",
    );
  }

  const result =
    await database.runAsync(
      `
        UPDATE products

        SET
          barcode = ?,
          name = ?,
          brand = ?,
          department = ?,
          category = ?,
          unit_cost = ?,
          unit_price = ?,
          reorder_level = ?,
          updated_at = ?

        WHERE
          id = ?;
      `,
      barcode,
      name,
      brand,
      input.department,
      input.category,
      input.unitCost,
      input.unitPrice,
      input.reorderLevel,
      new Date().toISOString(),
      input.productId,
    );

  if (
    result.changes ===
    0
  ) {
    throw new Error(
      "Product could not be found.",
    );
  }
}

export async function archiveProduct(
  productId:
    number,
): Promise<void> {
  const database =
    await getDatabase();

  const result =
    await database.runAsync(
      `
        UPDATE products

        SET
          is_active = 0,
          updated_at = ?

        WHERE
          id = ?

          AND is_active = 1;
      `,
      new Date().toISOString(),
      productId,
    );

  if (
    result.changes ===
    0
  ) {
    throw new Error(
      "The product is already archived or could not be found.",
    );
  }
}

export async function restoreProduct(
  productId:
    number,
): Promise<void> {
  const database =
    await getDatabase();

  const result =
    await database.runAsync(
      `
        UPDATE products

        SET
          is_active = 1,
          updated_at = ?

        WHERE
          id = ?

          AND is_active = 0;
      `,
      new Date().toISOString(),
      productId,
    );

  if (
    result.changes ===
    0
  ) {
    throw new Error(
      "The product is already active or could not be found.",
    );
  }
}

export async function getArchivedProducts(): Promise<
  Product[]
> {
  const database =
    await getDatabase();

  const rows =
    await database.getAllAsync<ProductRow>(
      `
        SELECT
          id,
          barcode,
          name,
          department,
          category,
          brand,
          unit_cost,
          unit_price,
          current_stock,
          reorder_level,
          is_active,
          created_at,
          updated_at

        FROM products

        WHERE
          is_active = 0

        ORDER BY
          name COLLATE NOCASE ASC,
          id ASC;
      `,
    );

  return rows.map(
    mapProductRow,
  );
}