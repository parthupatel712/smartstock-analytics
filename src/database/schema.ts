import type {
  SQLiteDatabase,
} from "expo-sqlite";

import {
  getDatabase,
} from "./database";

interface TableColumn {
  cid:
    number;

  name:
    string;

  type:
    string;

  notnull:
    number;

  dflt_value:
    string | null;

  pk:
    number;
}

interface TableSqlRow {
  sql:
    string | null;
}

async function columnExists(
  database:
    SQLiteDatabase,

  tableName:
    string,

  columnName:
    string,
): Promise<boolean> {
  const columns =
    await database.getAllAsync<TableColumn>(
      `PRAGMA table_info(${tableName});`,
    );

  return columns.some(
    (
      column,
    ) =>
      column.name ===
      columnName,
  );
}

async function migrateProductsTable(
  database:
    SQLiteDatabase,
): Promise<void> {
  const hasDepartment =
    await columnExists(
      database,
      "products",
      "department",
    );

  if (
    !hasDepartment
  ) {
    await database.execAsync(`
      ALTER TABLE products
      ADD COLUMN department TEXT NOT NULL DEFAULT 'Other';
    `);
  }

  const hasBrand =
    await columnExists(
      database,
      "products",
      "brand",
    );

  if (
    !hasBrand
  ) {
    await database.execAsync(`
      ALTER TABLE products
      ADD COLUMN brand TEXT NOT NULL DEFAULT 'Generic';
    `);
  }

  await database.execAsync(`
    UPDATE products

    SET
      department = CASE
        WHEN name = 'Sparkling Water 500 mL'
          THEN 'Beverages'

        WHEN name IN (
          'Potato Chips',
          'Chocolate Bar'
        )
          THEN 'Snacks & Confectionery'

        ELSE department
      END,

      category = CASE
        WHEN name = 'Sparkling Water 500 mL'
          THEN 'Water'

        WHEN name = 'Potato Chips'
          THEN 'Chips'

        WHEN name = 'Chocolate Bar'
          THEN 'Chocolate'

        ELSE category
      END

    WHERE brand = 'Generic';
  `);
}

async function createProductIndexes(
  database:
    SQLiteDatabase,
): Promise<void> {
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_products_barcode
      ON products(barcode);

    CREATE INDEX IF NOT EXISTS idx_products_name
      ON products(name);

    CREATE INDEX IF NOT EXISTS idx_products_department
      ON products(department);

    CREATE INDEX IF NOT EXISTS idx_products_category
      ON products(category);

    CREATE INDEX IF NOT EXISTS idx_products_brand
      ON products(brand);

    CREATE INDEX IF NOT EXISTS idx_products_active
      ON products(is_active);

    CREATE INDEX IF NOT EXISTS idx_products_active_department
      ON products(
        is_active,
        department
      );

    CREATE INDEX IF NOT EXISTS idx_products_active_stock
      ON products(
        is_active,
        current_stock,
        reorder_level
      );

    CREATE INDEX IF NOT EXISTS idx_products_active_name
      ON products(
        is_active,
        name
      );

    CREATE INDEX IF NOT EXISTS idx_products_updated_at
      ON products(updated_at);
  `);
}

async function createInventoryTransactionTable(
  database:
    SQLiteDatabase,
): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      product_id INTEGER NOT NULL,

      transaction_type TEXT NOT NULL
        CHECK (
          transaction_type IN (
            'stock_in',
            'sale',
            'return',
            'damage',
            'adjustment'
          )
        ),

      quantity INTEGER NOT NULL
        CHECK (quantity >= 0),

      stock_before INTEGER NOT NULL
        CHECK (stock_before >= 0),

      stock_after INTEGER NOT NULL
        CHECK (stock_after >= 0),

      unit_cost REAL NOT NULL
        CHECK (unit_cost >= 0),

      unit_price REAL NOT NULL
        CHECK (unit_price >= 0),

      transaction_value REAL NOT NULL
        CHECK (transaction_value >= 0),

      source TEXT NOT NULL DEFAULT 'manual'
        CHECK (
          source IN (
            'manual',
            'camera',
            'bluetooth',
            'usb',
            'esp32'
          )
        ),

      notes TEXT,

      created_at TEXT NOT NULL,

      FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
    );
  `);
}

async function createInventoryTransactionIndexes(
  database:
    SQLiteDatabase,
): Promise<void> {
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_product_id
      ON inventory_transactions(product_id);

    CREATE INDEX IF NOT EXISTS idx_transactions_type
      ON inventory_transactions(transaction_type);

    CREATE INDEX IF NOT EXISTS idx_transactions_created_at
      ON inventory_transactions(created_at);

    CREATE INDEX IF NOT EXISTS idx_transactions_product_created
      ON inventory_transactions(
        product_id,
        created_at
      );

    CREATE INDEX IF NOT EXISTS idx_transactions_type_created
      ON inventory_transactions(
        transaction_type,
        created_at
      );

    CREATE INDEX IF NOT EXISTS idx_transactions_product_type_created
      ON inventory_transactions(
        product_id,
        transaction_type,
        created_at
      );

    CREATE INDEX IF NOT EXISTS idx_transactions_created_id
      ON inventory_transactions(
        created_at,
        id
      );

    CREATE INDEX IF NOT EXISTS idx_transactions_product_type_id
      ON inventory_transactions(
        product_id,
        transaction_type,
        id
      );
  `);
}

async function createPurchaseOrderTable(
  database:
    SQLiteDatabase,
): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      order_number TEXT NOT NULL UNIQUE,

      vendor_name TEXT NOT NULL DEFAULT '',

      status TEXT NOT NULL
        CHECK (
          status IN (
            'draft',
            'ordered',
            'partially_received',
            'received',
            'cancelled'
          )
        ),

      notes TEXT NOT NULL DEFAULT '',

      subtotal REAL NOT NULL DEFAULT 0
        CHECK (subtotal >= 0),

      tax REAL NOT NULL DEFAULT 0
        CHECK (tax >= 0),

      total REAL NOT NULL DEFAULT 0
        CHECK (total >= 0),

      created_at TEXT NOT NULL,

      updated_at TEXT NOT NULL,

      ordered_at TEXT,

      received_at TEXT,

      cancelled_at TEXT
    );
  `);
}

/*
 * SQLite cannot modify an existing
 * CHECK constraint directly.
 *
 * Rebuild old purchase_orders tables
 * when the newest status is missing.
 */
async function migratePurchaseOrderStatus(
  database:
    SQLiteDatabase,
): Promise<void> {
  const row =
    await database.getFirstAsync<TableSqlRow>(
      `
        SELECT
          sql

        FROM sqlite_master

        WHERE
          type = 'table'

          AND name = 'purchase_orders'

        LIMIT 1;
      `,
    );

  const tableSql =
    row?.sql ??
    "";

  if (
    !tableSql ||
    tableSql.includes(
      "partially_received",
    )
  ) {
    return;
  }

  await database.execAsync(`
    PRAGMA foreign_keys = OFF;
  `);

  try {
    await database.execAsync(`
      BEGIN TRANSACTION;

      CREATE TABLE purchase_orders_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        order_number TEXT NOT NULL UNIQUE,

        vendor_name TEXT NOT NULL DEFAULT '',

        status TEXT NOT NULL
          CHECK (
            status IN (
              'draft',
              'ordered',
              'partially_received',
              'received',
              'received_with_exceptions',
              'cancelled'
            )
          ),

        notes TEXT NOT NULL DEFAULT '',

        subtotal REAL NOT NULL DEFAULT 0
          CHECK (subtotal >= 0),

        tax REAL NOT NULL DEFAULT 0
          CHECK (tax >= 0),

        total REAL NOT NULL DEFAULT 0
          CHECK (total >= 0),

        created_at TEXT NOT NULL,

        updated_at TEXT NOT NULL,

        ordered_at TEXT,

        received_at TEXT,

        cancelled_at TEXT
      );

      INSERT INTO purchase_orders_new (
        id,
        order_number,
        vendor_name,
        status,
        notes,
        subtotal,
        tax,
        total,
        created_at,
        updated_at,
        ordered_at,
        received_at,
        cancelled_at
      )

      SELECT
        id,
        order_number,
        vendor_name,
        status,
        notes,
        subtotal,
        tax,
        total,
        created_at,
        updated_at,
        ordered_at,
        received_at,
        cancelled_at

      FROM purchase_orders;

      DROP TABLE purchase_orders;

      ALTER TABLE purchase_orders_new
      RENAME TO purchase_orders;

      COMMIT;
    `);
  } catch (
    error
  ) {
    try {
      await database.execAsync(`
        ROLLBACK;
      `);
    } catch {
      /*
       * Keep original migration error.
       */
    }

    throw error;
  } finally {
    await database.execAsync(`
      PRAGMA foreign_keys = ON;
    `);
  }
}

async function createPurchaseOrderItemsTable(
  database:
    SQLiteDatabase,
): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      order_id INTEGER NOT NULL,

      product_id INTEGER,

      barcode TEXT NOT NULL DEFAULT '',

      product_name TEXT NOT NULL,

      brand TEXT NOT NULL DEFAULT '',

      department TEXT NOT NULL DEFAULT '',

      category TEXT NOT NULL DEFAULT '',

      quantity INTEGER NOT NULL
        CHECK (quantity > 0),

      received_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (received_quantity >= 0),

      unit_cost REAL NOT NULL
        CHECK (unit_cost >= 0),

      line_total REAL NOT NULL
        CHECK (line_total >= 0),

      created_at TEXT NOT NULL,

      last_received_at TEXT,

      FOREIGN KEY (order_id)
        REFERENCES purchase_orders(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

      FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
    );
  `);
}

async function migratePurchaseOrderItemsTable(
  database:
    SQLiteDatabase,
): Promise<void> {
  const hasReceivedQuantity =
    await columnExists(
      database,
      "purchase_order_items",
      "received_quantity",
    );

  if (
    !hasReceivedQuantity
  ) {
    await database.execAsync(`
      ALTER TABLE purchase_order_items

      ADD COLUMN received_quantity
        INTEGER NOT NULL DEFAULT 0

        CHECK (
          received_quantity >= 0
        );
    `);
  }

  const hasLastReceivedAt =
    await columnExists(
      database,
      "purchase_order_items",
      "last_received_at",
    );

  if (
    !hasLastReceivedAt
  ) {
    await database.execAsync(`
      ALTER TABLE purchase_order_items
      ADD COLUMN last_received_at TEXT;
    `);
  }

  await database.execAsync(`
    UPDATE purchase_order_items

    SET received_quantity = 0

    WHERE
      received_quantity IS NULL

      OR received_quantity < 0;
  `);

  await database.execAsync(`
    UPDATE purchase_order_items

    SET received_quantity = quantity

    WHERE
      received_quantity > quantity;
  `);
}

async function createPurchaseOrderIndexes(
  database:
    SQLiteDatabase,
): Promise<void> {
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_number
      ON purchase_orders(order_number);

    CREATE INDEX IF NOT EXISTS idx_purchase_orders_status
      ON purchase_orders(status);

    CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor
      ON purchase_orders(vendor_name);

    CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at
      ON purchase_orders(created_at);

    CREATE INDEX IF NOT EXISTS idx_purchase_orders_ordered_at
      ON purchase_orders(ordered_at);

    CREATE INDEX IF NOT EXISTS idx_purchase_orders_status_created
      ON purchase_orders(
        status,
        created_at
      );

    CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_created
      ON purchase_orders(
        vendor_name,
        created_at
      );

    CREATE INDEX IF NOT EXISTS idx_purchase_orders_updated_at
      ON purchase_orders(updated_at);

    CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order_id
      ON purchase_order_items(order_id);

    CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_id
      ON purchase_order_items(product_id);

    CREATE INDEX IF NOT EXISTS idx_purchase_order_items_barcode
      ON purchase_order_items(barcode);

    CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order_product
      ON purchase_order_items(
        order_id,
        product_id
      );

    CREATE INDEX IF NOT EXISTS idx_purchase_order_items_receiving
      ON purchase_order_items(
        order_id,
        received_quantity,
        quantity
      );

    CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_receiving
      ON purchase_order_items(
        product_id,
        received_quantity,
        quantity
      );
  `);
}

export async function initializeDatabase():
  Promise<void> {
  const database =
    await getDatabase();

  /*
   * V1 PRODUCTS
   */
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      barcode TEXT NOT NULL UNIQUE,

      name TEXT NOT NULL,

      department TEXT NOT NULL DEFAULT 'Other',

      category TEXT NOT NULL,

      brand TEXT NOT NULL DEFAULT 'Generic',

      unit_cost REAL NOT NULL DEFAULT 0
        CHECK (unit_cost >= 0),

      unit_price REAL NOT NULL DEFAULT 0
        CHECK (unit_price >= 0),

      current_stock INTEGER NOT NULL DEFAULT 0
        CHECK (current_stock >= 0),

      reorder_level INTEGER NOT NULL DEFAULT 5
        CHECK (reorder_level >= 0),

      is_active INTEGER NOT NULL DEFAULT 1
        CHECK (is_active IN (0, 1)),

      created_at TEXT NOT NULL,

      updated_at TEXT NOT NULL
    );
  `);

  await migrateProductsTable(
    database,
  );

  await createProductIndexes(
    database,
  );

  /*
   * V1 TRANSACTIONS
   */
  await createInventoryTransactionTable(
    database,
  );

  await createInventoryTransactionIndexes(
    database,
  );

  /*
   * V2 PURCHASE ORDERS
   */
  await createPurchaseOrderTable(
    database,
  );

  await migratePurchaseOrderStatus(
    database,
  );

  await createPurchaseOrderItemsTable(
    database,
  );

  await migratePurchaseOrderItemsTable(
    database,
  );

  await createPurchaseOrderIndexes(
    database,
  );
}