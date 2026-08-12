import { getDatabase } from "../database/database";
import { supabase } from "./supabase";

interface LocalTransactionSyncRow {
  transaction_id: number;

  product_barcode: string;

  transaction_type:
    | "stock_in"
    | "sale"
    | "return"
    | "damage"
    | "adjustment";

  quantity: number;

  stock_before: number;

  stock_after: number;

  unit_cost: number;

  unit_price: number;

  transaction_value: number;

  source:
    | "manual"
    | "camera"
    | "bluetooth"
    | "usb"
    | "esp32";

  notes: string | null;

  created_at: string;
}

export interface TransactionSyncResult {
  totalLocalTransactions: number;

  uploadedOrMatched: number;

  failed: number;
}

export async function syncLocalTransactionsToCloud(): Promise<
  TransactionSyncResult
> {
  const database =
    await getDatabase();

  const localTransactions =
    await database.getAllAsync<LocalTransactionSyncRow>(
      `
        SELECT
          transactions.id AS transaction_id,

          products.barcode AS product_barcode,

          transactions.transaction_type,

          transactions.quantity,

          transactions.stock_before,

          transactions.stock_after,

          transactions.unit_cost,

          transactions.unit_price,

          transactions.transaction_value,

          transactions.source,

          transactions.notes,

          transactions.created_at

        FROM inventory_transactions
          AS transactions

        INNER JOIN products
          ON products.id =
            transactions.product_id

        ORDER BY
          transactions.created_at ASC,
          transactions.id ASC;
      `,
    );

  if (
    localTransactions.length === 0
  ) {
    return {
      totalLocalTransactions: 0,

      uploadedOrMatched: 0,

      failed: 0,
    };
  }

  const rows =
    localTransactions.map(
      (transaction) => ({
        product_barcode:
          transaction.product_barcode,

        transaction_type:
          transaction.transaction_type,

        quantity:
          transaction.quantity,

        stock_before:
          transaction.stock_before,

        stock_after:
          transaction.stock_after,

        unit_cost:
          transaction.unit_cost,

        unit_price:
          transaction.unit_price,

        transaction_value:
          transaction.transaction_value,

        source:
          transaction.source,

        notes:
          transaction.notes,

        created_at:
          transaction.created_at,
      }),
    );

  const {
    error,
  } = await supabase
    .from(
      "inventory_transactions",
    )
    .upsert(
      rows,
      {
        onConflict:
          "product_barcode,transaction_type,quantity,stock_before,stock_after,created_at",

        ignoreDuplicates:
          true,
      },
    );

  if (error) {
    console.error(
      "Could not sync transactions:",
      error,
    );

    return {
      totalLocalTransactions:
        localTransactions.length,

      uploadedOrMatched:
        0,

      failed:
        localTransactions.length,
    };
  }

  return {
    totalLocalTransactions:
      localTransactions.length,

    uploadedOrMatched:
      localTransactions.length,

    failed:
      0,
  };
}