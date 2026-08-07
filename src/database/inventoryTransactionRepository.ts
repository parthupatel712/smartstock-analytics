import type {
  CreateInventoryTransactionInput,
  InventoryTransaction,
  InventoryTransactionType,
} from "../types/inventoryTransaction";
import type { TransactionHistoryItem } from "../types/transactionHistory";
import type { ProductDeliverySummary } from "../types/productDelivery";
import { getDatabase } from "./database";

interface ProductStockRow {
  id: number;
  current_stock: number;
  unit_cost: number;
  unit_price: number;
  is_active: number;
}

interface InventoryTransactionRow {
  id: number;
  product_id: number;
  transaction_type: InventoryTransactionType;
  quantity: number;
  stock_before: number;
  stock_after: number;
  unit_cost: number;
  unit_price: number;
  transaction_value: number;
  source: InventoryTransaction["source"];
  notes: string | null;
  created_at: string;
}

interface TransactionHistoryRow {
  id: number;
  product_id: number;

  product_name: string;
  product_brand: string;
  product_barcode: string;
  product_department: string;
  product_category: string;

  transaction_type: InventoryTransactionType;
  quantity: number;
  stock_before: number;
  stock_after: number;
  unit_cost: number;
  unit_price: number;
  transaction_value: number;
  source: InventoryTransaction["source"];
  notes: string | null;
  created_at: string;
}
interface ProductDeliverySummaryRow {
  transaction_id: number;
  product_id: number;
  quantity_received: number;
  stock_before: number;
  stock_after: number;
  unit_cost: number;
  delivery_value: number;
  source: ProductDeliverySummary["source"];
  notes: string | null;
  received_at: string;
}

function mapTransactionRow(
  row: InventoryTransactionRow,
): InventoryTransaction {
  return {
    id: row.id,
    productId: row.product_id,
    transactionType: row.transaction_type,
    quantity: row.quantity,
    stockBefore: row.stock_before,
    stockAfter: row.stock_after,
    unitCost: row.unit_cost,
    unitPrice: row.unit_price,
    transactionValue: row.transaction_value,
    source: row.source,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function mapTransactionHistoryRow(
  row: TransactionHistoryRow,
): TransactionHistoryItem {
  return {
    id: row.id,
    productId: row.product_id,

    productName: row.product_name,
    productBrand: row.product_brand,
    productBarcode: row.product_barcode,
    productDepartment: row.product_department,
    productCategory: row.product_category,

    transactionType: row.transaction_type,
    quantity: row.quantity,
    stockBefore: row.stock_before,
    stockAfter: row.stock_after,
    unitCost: row.unit_cost,
    unitPrice: row.unit_price,
    transactionValue: row.transaction_value,
    source: row.source,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function validateTransactionInput(
  input: CreateInventoryTransactionInput,
): void {
  if (
    !Number.isInteger(input.productId) ||
    input.productId <= 0
  ) {
    throw new Error("A valid product ID is required.");
  }

  if (
    !Number.isInteger(input.quantity) ||
    input.quantity < 0
  ) {
    throw new Error(
      "Quantity must be a non-negative whole number.",
    );
  }

  if (
    input.transactionType !== "adjustment" &&
    input.quantity === 0
  ) {
    throw new Error(
      "Quantity must be greater than zero for this transaction.",
    );
  }
}

function calculateStockAfter(
  transactionType: InventoryTransactionType,
  stockBefore: number,
  quantity: number,
): number {
  switch (transactionType) {
    case "stock_in":
    case "return":
      return stockBefore + quantity;

    case "sale":
    case "damage":
      return stockBefore - quantity;

    case "adjustment":
      return quantity;

    default: {
      const exhaustiveCheck: never = transactionType;

      throw new Error(
        `Unsupported transaction type: ${exhaustiveCheck}`,
      );
    }
  }
}

function calculateTransactionValue(
  transactionType: InventoryTransactionType,
  quantity: number,
  stockBefore: number,
  stockAfter: number,
  unitCost: number,
  unitPrice: number,
): number {
  switch (transactionType) {
    case "sale":
      return quantity * unitPrice;

    case "stock_in":
    case "return":
    case "damage":
      return quantity * unitCost;

    case "adjustment":
      return (
        Math.abs(stockAfter - stockBefore) * unitCost
      );

    default: {
      const exhaustiveCheck: never = transactionType;

      throw new Error(
        `Unsupported transaction type: ${exhaustiveCheck}`,
      );
    }
  }
}

function mapProductDeliverySummaryRow(
  row: ProductDeliverySummaryRow,
): ProductDeliverySummary {
  return {
    transactionId: row.transaction_id,
    productId: row.product_id,
    quantityReceived: row.quantity_received,
    stockBefore: row.stock_before,
    stockAfter: row.stock_after,
    unitCost: row.unit_cost,
    deliveryValue: row.delivery_value,
    source: row.source,
    notes: row.notes,
    receivedAt: row.received_at,
  };
}

export async function createInventoryTransaction(
  input: CreateInventoryTransactionInput,
): Promise<InventoryTransaction> {
  validateTransactionInput(input);

  const database = await getDatabase();

  let createdTransaction: InventoryTransaction | null =
    null;

  await database.withExclusiveTransactionAsync(
    async (transaction) => {
      const product =
        await transaction.getFirstAsync<ProductStockRow>(
          `
            SELECT
              id,
              current_stock,
              unit_cost,
              unit_price,
              is_active
            FROM products
            WHERE id = ?
            LIMIT 1
          `,
          input.productId,
        );

      if (!product || product.is_active !== 1) {
        throw new Error(
          "The selected product does not exist or is inactive.",
        );
      }

      const stockBefore = product.current_stock;

      const stockAfter = calculateStockAfter(
        input.transactionType,
        stockBefore,
        input.quantity,
      );

      if (stockAfter < 0) {
        throw new Error(
          `Insufficient stock. Only ${stockBefore} units are available.`,
        );
      }

      const transactionValue =
        calculateTransactionValue(
          input.transactionType,
          input.quantity,
          stockBefore,
          stockAfter,
          product.unit_cost,
          product.unit_price,
        );

      const createdAt = new Date().toISOString();
      const source = input.source ?? "manual";
      const notes = input.notes?.trim() || null;

      await transaction.runAsync(
        `
          UPDATE products
          SET
            current_stock = ?,
            updated_at = ?
          WHERE id = ?
        `,
        stockAfter,
        createdAt,
        product.id,
      );

      const insertResult =
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          product.id,
          input.transactionType,
          input.quantity,
          stockBefore,
          stockAfter,
          product.unit_cost,
          product.unit_price,
          transactionValue,
          source,
          notes,
          createdAt,
        );

      const insertedRow =
        await transaction.getFirstAsync<InventoryTransactionRow>(
          `
            SELECT
              id,
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
            FROM inventory_transactions
            WHERE id = ?
            LIMIT 1
          `,
          insertResult.lastInsertRowId,
        );

      if (!insertedRow) {
        throw new Error(
          "The inventory transaction could not be retrieved.",
        );
      }

      createdTransaction =
        mapTransactionRow(insertedRow);
    },
  );

  if (!createdTransaction) {
    throw new Error(
      "The inventory transaction could not be completed.",
    );
  }

  return createdTransaction;
}

export async function getTransactionsForProduct(
  productId: number,
): Promise<InventoryTransaction[]> {
  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error("A valid product ID is required.");
  }

  const database = await getDatabase();

  const rows =
    await database.getAllAsync<InventoryTransactionRow>(
      `
        SELECT
          id,
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
        FROM inventory_transactions
        WHERE product_id = ?
        ORDER BY created_at DESC, id DESC
      `,
      productId,
    );

  return rows.map(mapTransactionRow);
}

export async function getRecentInventoryTransactions(
  limit = 50,
): Promise<InventoryTransaction[]> {
  const database = await getDatabase();

  const safeLimit = Math.max(
    1,
    Math.min(Math.trunc(limit), 500),
  );

  const rows =
    await database.getAllAsync<InventoryTransactionRow>(
      `
        SELECT
          id,
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
        FROM inventory_transactions
        ORDER BY created_at DESC, id DESC
        LIMIT ?
      `,
      safeLimit,
    );

  return rows.map(mapTransactionRow);
}

export async function getTransactionHistoryForProduct(
  productId: number,
): Promise<TransactionHistoryItem[]> {
  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error("A valid product ID is required.");
  }

  const database = await getDatabase();

  const rows =
    await database.getAllAsync<TransactionHistoryRow>(
      `
        SELECT
          transactions.id,
          transactions.product_id,

          products.name AS product_name,
          products.brand AS product_brand,
          products.barcode AS product_barcode,
          products.department AS product_department,
          products.category AS product_category,

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

        FROM inventory_transactions AS transactions

        INNER JOIN products
          ON products.id = transactions.product_id

        WHERE transactions.product_id = ?

        ORDER BY
          transactions.created_at DESC,
          transactions.id DESC
      `,
      productId,
    );

  return rows.map(mapTransactionHistoryRow);
}

export async function getLatestDeliveriesByProduct(): Promise<
  Map<number, ProductDeliverySummary>
> {
  const database = await getDatabase();

  const rows =
    await database.getAllAsync<ProductDeliverySummaryRow>(`
      SELECT
        transactions.id AS transaction_id,
        transactions.product_id,
        transactions.quantity AS quantity_received,
        transactions.stock_before,
        transactions.stock_after,
        transactions.unit_cost,
        transactions.transaction_value AS delivery_value,
        transactions.source,
        transactions.notes,
        transactions.created_at AS received_at

      FROM inventory_transactions AS transactions

      INNER JOIN (
        SELECT
          product_id,
          MAX(id) AS latest_transaction_id
        FROM inventory_transactions
        WHERE transaction_type = 'stock_in'
        GROUP BY product_id
      ) AS latest_deliveries
        ON latest_deliveries.latest_transaction_id =
          transactions.id

      ORDER BY transactions.created_at DESC;
    `);

  const deliveryMap =
    new Map<number, ProductDeliverySummary>();

  rows.forEach((row) => {
    const delivery = mapProductDeliverySummaryRow(row);

    deliveryMap.set(delivery.productId, delivery);
  });

  return deliveryMap;
}