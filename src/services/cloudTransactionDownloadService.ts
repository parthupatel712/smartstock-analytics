import {
  getCloudInventoryTransactionById,
  getCloudInventoryTransactions,
} from "../database/cloudInventoryTransactionRepository";

import {
  getDatabase,
} from "../database/database";

import type {
  CloudInventoryTransaction,
} from "../types/cloudInventoryTransaction";

export interface CloudTransactionDownloadResult {
  cloudTransactions:
    number;

  addedLocally:
    number;

  alreadyExists:
    number;

  skippedMissingProduct:
    number;

  failed:
    number;
}

interface LocalProductLookup {
  id:
    number;

  barcode:
    string;
}

interface ResolvedCloudTransaction {
  localProductId:
    number;

  cloudTransaction:
    CloudInventoryTransaction;
}

interface ExistingTransactionCandidate {
  id:
    number;

  created_at:
    string;
}

/*
 * Determine whether two timestamps
 * represent the exact same moment.
 *
 * This is safer than comparing the raw
 * strings because SQLite and Supabase
 * can represent UTC differently:
 *
 * 2026-08-14T12:00:00.000Z
 *
 * versus
 *
 * 2026-08-14T12:00:00.000+00:00
 */
function timestampsMatch(
  first:
    string,

  second:
    string,
): boolean {
  const firstTimestamp =
    new Date(
      first,
    ).getTime();

  const secondTimestamp =
    new Date(
      second,
    ).getTime();

  /*
   * If both values are valid dates,
   * compare the actual instant.
   */
  if (
    !Number.isNaN(
      firstTimestamp,
    ) &&
    !Number.isNaN(
      secondTimestamp,
    )
  ) {
    return (
      firstTimestamp ===
      secondTimestamp
    );
  }

  /*
   * Fallback only if a timestamp
   * cannot be parsed.
   */
  return (
    first ===
    second
  );
}

/*
 * Save ONE cloud transaction locally.
 *
 * Used by:
 *
 * - incremental Realtime
 * - full additive cloud download
 */
async function saveCloudTransactionToLocal(
  cloudTransaction:
    CloudInventoryTransaction,
): Promise<
  "added" | "existing"
> {
  const database =
    await getDatabase();

  /*
   * Cloud transactions identify the
   * product using barcode because local
   * SQLite product IDs differ between
   * devices.
   */
  const localProduct =
    await database.getFirstAsync<{
      id:
        number;
    }>(
      `
        SELECT
          id

        FROM products

        WHERE barcode = ?

        LIMIT 1;
      `,
      cloudTransaction.productBarcode,
    );

  if (
    !localProduct
  ) {
    throw new Error(
      `Product ${cloudTransaction.productBarcode} does not exist locally.`,
    );
  }

  /*
   * Find possible copies of this
   * transaction.
   *
   * IMPORTANT:
   *
   * We intentionally DO NOT compare
   * created_at as raw SQL text here.
   *
   * Supabase/PostgreSQL can normalize
   * the timestamp representation even
   * though it still represents exactly
   * the same instant.
   */
  const candidates =
    await database.getAllAsync<ExistingTransactionCandidate>(
      `
        SELECT
          id,
          created_at

        FROM inventory_transactions

        WHERE
          product_id = ?

          AND transaction_type = ?

          AND quantity = ?

          AND stock_before = ?

          AND stock_after = ?;
      `,
      localProduct.id,
      cloudTransaction.transactionType,
      cloudTransaction.quantity,
      cloudTransaction.stockBefore,
      cloudTransaction.stockAfter,
    );

  /*
   * Compare timestamps semantically,
   * not as raw strings.
   *
   * This prevents the originating
   * device from inserting its own
   * transaction again when Realtime
   * sends the cloud INSERT event back.
   */
  const existingTransaction =
    candidates.find(
      (
        candidate,
      ) =>
        timestampsMatch(
          candidate.created_at,
          cloudTransaction.createdAt,
        ),
    );

  if (
    existingTransaction
  ) {
    return "existing";
  }

  /*
   * This transaction genuinely does
   * not exist locally.
   *
   * Insert the history record only.
   *
   * We DO NOT modify current_stock here.
   *
   * Product stock comes from the
   * products Realtime UPDATE event.
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

  return "added";
}

/*
 * Incremental Realtime transaction
 * download.
 *
 * Only ONE Supabase transaction is
 * downloaded.
 */
export async function downloadCloudTransactionToLocalById(
  id:
    number,
): Promise<boolean> {
  const cloudTransaction =
    await getCloudInventoryTransactionById(
      id,
    );

  if (
    !cloudTransaction
  ) {
    return false;
  }

  await saveCloudTransactionToLocal(
    cloudTransaction,
  );

  return true;
}

/*
 * Additive full download.
 *
 * Used by startup/pull recovery.
 *
 * Existing transactions are preserved
 * and missing cloud transactions are
 * inserted.
 */
export async function downloadCloudTransactionsToLocal(): Promise<
  CloudTransactionDownloadResult
> {
  const cloudTransactions =
    await getCloudInventoryTransactions();

  let addedLocally =
    0;

  let alreadyExists =
    0;

  let skippedMissingProduct =
    0;

  let failed =
    0;

  for (
    const cloudTransaction of
    cloudTransactions
  ) {
    try {
      const result =
        await saveCloudTransactionToLocal(
          cloudTransaction,
        );

      if (
        result ===
        "existing"
      ) {
        alreadyExists +=
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

      const message =
        error instanceof Error
          ? error.message
          : "";

      if (
        message.startsWith(
          "Product ",
        ) &&
        message.includes(
          " does not exist locally.",
        )
      ) {
        skippedMissingProduct +=
          1;

        console.warn(
          message,
        );

        continue;
      }

      console.warn(
        `Could not download cloud transaction for ${cloudTransaction.productBarcode}:`,
        error,
      );

      throw error instanceof Error
        ? error
        : new Error(
            `Could not download cloud transaction for ${cloudTransaction.productBarcode}.`,
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

/*
 * Full canonical reconciliation.
 *
 * Used by Sync Now as the recovery
 * mechanism.
 *
 * This intentionally replaces local
 * transaction history with the exact
 * Supabase transaction history.
 */
export async function reconcileLocalTransactionsFromCloud(): Promise<{
  cloudTransactions:
    number;

  rebuiltLocally:
    number;
}> {
  const cloudTransactions =
    await getCloudInventoryTransactions();

  const database =
    await getDatabase();

  const localProducts =
    await database.getAllAsync<LocalProductLookup>(
      `
        SELECT
          id,
          barcode

        FROM products;
      `,
    );

  const productIdByBarcode =
    new Map<
      string,
      number
    >();

  for (
    const product of
    localProducts
  ) {
    productIdByBarcode.set(
      product.barcode,
      product.id,
    );
  }

  const resolvedTransactions:
    ResolvedCloudTransaction[] =
      [];

  for (
    const cloudTransaction of
    cloudTransactions
  ) {
    const localProductId =
      productIdByBarcode.get(
        cloudTransaction.productBarcode,
      );

    if (
      !localProductId
    ) {
      throw new Error(
        `Cannot reconcile transaction history because product ${cloudTransaction.productBarcode} does not exist locally.`,
      );
    }

    resolvedTransactions.push({
      localProductId,

      cloudTransaction,
    });
  }

  /*
   * Atomic replacement.
   *
   * If an insert fails, SQLite rolls
   * everything back instead of leaving
   * partially rebuilt history.
   */
  await database.withExclusiveTransactionAsync(
    async (
      transaction,
    ) => {
      await transaction.runAsync(
        `
          DELETE FROM inventory_transactions;
        `,
      );

      for (
        const item of
        resolvedTransactions
      ) {
        const cloudTransaction =
          item.cloudTransaction;

        await transaction.runAsync(
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
          item.localProductId,
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
      }
    },
  );

  return {
    cloudTransactions:
      cloudTransactions.length,

    rebuiltLocally:
      resolvedTransactions.length,
  };
}