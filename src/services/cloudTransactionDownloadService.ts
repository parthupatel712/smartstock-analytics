import { getCloudInventoryTransactions } from "../database/cloudInventoryTransactionRepository";
import { getDatabase } from "../database/database";

export interface CloudTransactionDownloadResult {
  cloudTransactions: number;
  addedLocally: number;
  alreadyExists: number;
  skippedMissingProduct: number;
  failed: number;
}

export async function downloadCloudTransactionsToLocal(): Promise<
  CloudTransactionDownloadResult
> {
  const cloudTransactions =
    await getCloudInventoryTransactions();

  const database =
    await getDatabase();

  let addedLocally = 0;
  let alreadyExists = 0;
  let skippedMissingProduct = 0;
  let failed = 0;

  for (const cloudTransaction of cloudTransactions) {
    try {
      /*
       * Cloud transactions use barcode because
       * local SQLite product IDs can differ
       * between devices.
       */
      const localProduct =
        await database.getFirstAsync<{
          id: number;
        }>(
          `
            SELECT id
            FROM products
            WHERE barcode = ?
            LIMIT 1;
          `,
          cloudTransaction.productBarcode,
        );

      if (!localProduct) {
        skippedMissingProduct += 1;

        console.warn(
          `Skipping cloud transaction because product ${cloudTransaction.productBarcode} does not exist locally.`,
        );

        continue;
      }

      /*
       * Prevent the same cloud transaction
       * from being downloaded more than once.
       *
       * We intentionally do not compare the
       * local transaction ID because IDs differ
       * across devices.
       */
      const existingTransaction =
        await database.getFirstAsync<{
          id: number;
        }>(
          `
            SELECT id
            FROM inventory_transactions
            WHERE
              product_id = ?
              AND transaction_type = ?
              AND quantity = ?
              AND stock_before = ?
              AND stock_after = ?
              AND created_at = ?
            LIMIT 1;
          `,
          localProduct.id,
          cloudTransaction.transactionType,
          cloudTransaction.quantity,
          cloudTransaction.stockBefore,
          cloudTransaction.stockAfter,
          cloudTransaction.createdAt,
        );

      if (existingTransaction) {
        alreadyExists += 1;
        continue;
      }

      /*
       * IMPORTANT:
       *
       * We insert the history record only.
       *
       * We do NOT update products.current_stock
       * here because cloud product synchronization
       * already downloads the latest stock value.
       *
       * Updating stock again here would apply
       * the same movement twice.
       */
      await database.runAsync(
        `
          INSERT INTO inventory_transactions (
            product_id,
            transaction_type,
            quantity,
            stock_before,
            stock_after,
            unit_cost,
            unit_price,
            transaction_value,
            source,
            notes,
            created_at
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          );
        `,
        localProduct.id,
        cloudTransaction.transactionType,
        cloudTransaction.quantity,
        cloudTransaction.stockBefore,
        cloudTransaction.stockAfter,
        cloudTransaction.unitCost,
        cloudTransaction.unitPrice,
        cloudTransaction.transactionValue,
        cloudTransaction.source,
        cloudTransaction.notes,
        cloudTransaction.createdAt,
      );

      addedLocally += 1;
    } catch (error) {
      failed += 1;

      console.error(
        `Could not download cloud transaction for ${cloudTransaction.productBarcode}:`,
        error,
      );
    }
  }

  return {
    cloudTransactions:
      cloudTransactions.length,

    addedLocally,

    alreadyExists,

    skippedMissingProduct,

    failed,
  };
}