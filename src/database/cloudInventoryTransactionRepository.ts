import type {
  CloudInventoryTransaction,
} from "../types/cloudInventoryTransaction";

import type {
  InventoryTransaction,
} from "../types/inventoryTransaction";

import { supabase } from "../services/supabase";

interface CloudInventoryTransactionRow {
  id: number;

  product_barcode: string;

  transaction_type:
    InventoryTransaction["transactionType"];

  quantity: number;

  stock_before: number;

  stock_after: number;

  unit_cost: number;

  unit_price: number;

  transaction_value: number;

  source:
    InventoryTransaction["source"];

  notes: string | null;

  created_at: string;
}

function mapCloudTransactionRow(
  row: CloudInventoryTransactionRow,
): CloudInventoryTransaction {
  return {
    id:
      row.id,

    productBarcode:
      row.product_barcode,

    transactionType:
      row.transaction_type,

    quantity:
      row.quantity,

    stockBefore:
      row.stock_before,

    stockAfter:
      row.stock_after,

    unitCost:
      Number(
        row.unit_cost,
      ),

    unitPrice:
      Number(
        row.unit_price,
      ),

    transactionValue:
      Number(
        row.transaction_value,
      ),

    source:
      row.source,

    notes:
      row.notes,

    createdAt:
      row.created_at,
  };
}

export async function getCloudInventoryTransactions(): Promise<
  CloudInventoryTransaction[]
> {
  const {
    data,
    error,
  } = await supabase
    .from(
      "inventory_transactions",
    )
    .select("*")
    .order(
      "created_at",
      {
        ascending:
          true,
      },
    );

  if (error) {
    throw new Error(
      `Could not load cloud transactions: ${error.message}`,
    );
  }

  return (
    (
      data as
        | CloudInventoryTransactionRow[]
        | null
    ) ?? []
  ).map(
    mapCloudTransactionRow,
  );
}