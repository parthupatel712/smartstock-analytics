import {
  getAllCloudProducts,
  getCloudProductByBarcode,
} from "../database/cloudProductRepository";

import {
  getDatabase,
} from "../database/database";

import type {
  Product,
} from "../types/product";

export interface CloudProductDownloadResult {
  cloudProducts: number;

  addedLocally: number;

  updatedLocally: number;

  failed: number;
}

async function saveCloudProductToLocal(
  product: Product,
): Promise<
  "added" | "updated"
> {
  const database =
    await getDatabase();

  const existing =
    await database.getFirstAsync<{
      id: number;
    }>(
      `
        SELECT
          id

        FROM products

        WHERE barcode = ?

        LIMIT 1;
      `,
      product.barcode,
    );

  if (
    existing
  ) {
    await database.runAsync(
      `
        UPDATE products

        SET
          name = ?,
          department = ?,
          category = ?,
          brand = ?,
          unit_cost = ?,
          unit_price = ?,
          current_stock = ?,
          reorder_level = ?,
          is_active = ?,
          updated_at = ?

        WHERE barcode = ?;
      `,
      product.name,
      product.department,
      product.category,
      product.brand,
      product.unitCost,
      product.unitPrice,
      product.currentStock,
      product.reorderLevel,
      product.isActive
        ? 1
        : 0,
      product.updatedAt,
      product.barcode,
    );

    return "updated";
  }

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
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      );
    `,
    product.barcode,
    product.name,
    product.department,
    product.category,
    product.brand,
    product.unitCost,
    product.unitPrice,
    product.currentStock,
    product.reorderLevel,
    product.isActive
      ? 1
      : 0,
    product.createdAt,
    product.updatedAt,
  );

  return "added";
}

/*
 * Incremental realtime download.
 *
 * Fetches and updates ONE product
 * instead of downloading the entire
 * products table.
 */
export async function downloadCloudProductToLocalByBarcode(
  barcode: string,
): Promise<boolean> {
  const normalizedBarcode =
    barcode.trim();

  if (
    !normalizedBarcode
  ) {
    return false;
  }

  const product =
    await getCloudProductByBarcode(
      normalizedBarcode,
    );

  if (
    !product
  ) {
    return false;
  }

  await saveCloudProductToLocal(
    product,
  );

  return true;
}

/*
 * Full product download.
 *
 * Keep this for:
 *
 * - startup
 * - pull-to-refresh
 * - Sync Now
 * - recovery/reconciliation
 *
 * Normal realtime updates should use
 * downloadCloudProductToLocalByBarcode().
 */
export async function downloadCloudProductsToLocal(): Promise<
  CloudProductDownloadResult
> {
  const cloudProducts =
    await getAllCloudProducts();

  let addedLocally =
    0;

  let updatedLocally =
    0;

  let failed =
    0;

  for (
    const product of
    cloudProducts
  ) {
    try {
      const result =
        await saveCloudProductToLocal(
          product,
        );

      if (
        result ===
        "updated"
      ) {
        updatedLocally +=
          1;
      } else {
        addedLocally +=
          1;
      }
    } catch (
      error
    ) {
      failed +=
        1;

      console.warn(
        `Could not download product ${product.barcode}:`,
        error,
      );

      /*
       * Do not silently accept a
       * partially synchronized inventory.
       */
      throw error instanceof Error
        ? error
        : new Error(
            `Could not download product ${product.barcode}.`,
          );
    }
  }

  return {
    cloudProducts:
      cloudProducts.length,

    addedLocally,

    updatedLocally,

    failed,
  };
}