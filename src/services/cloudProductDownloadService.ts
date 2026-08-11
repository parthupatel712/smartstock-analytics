import { getAllCloudProducts } from "../database/cloudProductRepository";
import { getDatabase } from "../database/database";

export interface CloudProductDownloadResult {
  cloudProducts: number;
  addedLocally: number;
  updatedLocally: number;
  failed: number;
}

export async function downloadCloudProductsToLocal(): Promise<
  CloudProductDownloadResult
> {
  const cloudProducts =
    await getAllCloudProducts();

  const database =
    await getDatabase();

  let addedLocally = 0;
  let updatedLocally = 0;
  let failed = 0;

  for (const product of cloudProducts) {
    try {
      const existing =
        await database.getFirstAsync<{
          id: number;
        }>(
          `
            SELECT id
            FROM products
            WHERE barcode = ?
            LIMIT 1;
          `,
          product.barcode,
        );

      if (existing) {
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

        updatedLocally += 1;
      } else {
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

        addedLocally += 1;
      }
    } catch (error) {
      failed += 1;

      console.error(
        `Could not download product ${product.barcode}:`,
        error,
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