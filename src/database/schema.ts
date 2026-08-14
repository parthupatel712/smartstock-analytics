import type { SQLiteDatabase } from "expo-sqlite";

import { getDatabase } from "./database";

interface TableColumn {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

async function columnExists(
  database: SQLiteDatabase,
  tableName: string,
  columnName: string,
): Promise<boolean> {
  const columns =
    await database.getAllAsync<TableColumn>(
      `PRAGMA table_info(${tableName});`,
    );

  return columns.some(
    (column) =>
      column.name ===
      columnName,
  );
}

async function migrateProductsTable(
  database: SQLiteDatabase,
): Promise<void> {
  const hasDepartment =
    await columnExists(
      database,
      "products",
      "department",
    );

  if (!hasDepartment) {
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

  if (!hasBrand) {
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
  database: SQLiteDatabase,
): Promise<void> {
  await database.execAsync(`
    /*
     * Barcode lookup.
     *
     * The UNIQUE constraint on barcode
     * already creates an internal index,
     * but keeping this explicit index is
     * harmless and makes intent obvious.
     */
    CREATE INDEX IF NOT EXISTS idx_products_barcode
      ON products(barcode);

    /*
     * Alphabetical sorting / search support.
     */
    CREATE INDEX IF NOT EXISTS idx_products_name
      ON products(name);

    CREATE INDEX IF NOT EXISTS idx_products_department
      ON products(department);

    CREATE INDEX IF NOT EXISTS idx_products_category
      ON products(category);

    CREATE INDEX IF NOT EXISTS idx_products_brand
      ON products(brand);

    /*
     * Very common active inventory query.
     *
     * Helps:
     * - inventory list
     * - archived vs active separation
     * - dashboard counts
     */
    CREATE INDEX IF NOT EXISTS idx_products_active
      ON products(is_active);

    /*
     * Useful when filtering active products
     * by department.
     */
    CREATE INDEX IF NOT EXISTS idx_products_active_department
      ON products(
        is_active,
        department
      );

    /*
     * Useful for low-stock / reorder queries.
     *
     * SQLite can use this for active product
     * filtering before evaluating:
     *
     * current_stock <= reorder_level
     */
    CREATE INDEX IF NOT EXISTS idx_products_active_stock
      ON products(
        is_active,
        current_stock,
        reorder_level
      );

    /*
     * Helps common active + alphabetical list
     * queries.
     */
    CREATE INDEX IF NOT EXISTS idx_products_active_name
      ON products(
        is_active,
        name
      );

    /*
     * Useful for cloud-sync conflict checks
     * and recency-related operations.
     */
    CREATE INDEX IF NOT EXISTS idx_products_updated_at
      ON products(updated_at);
  `);
}

async function createInventoryTransactionTable(
  database: SQLiteDatabase,
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
  database: SQLiteDatabase,
): Promise<void> {
  await database.execAsync(`
    /*
     * Product transaction history.
     */
    CREATE INDEX IF NOT EXISTS idx_transactions_product_id
      ON inventory_transactions(product_id);

    /*
     * Filters such as:
     * sale / stock_in / damage.
     */
    CREATE INDEX IF NOT EXISTS idx_transactions_type
      ON inventory_transactions(transaction_type);

    /*
     * Global history / recent activity /
     * Dashboard / Analytics date filters.
     */
    CREATE INDEX IF NOT EXISTS idx_transactions_created_at
      ON inventory_transactions(created_at);

    /*
     * Product-specific history ordered or
     * filtered by date.
     */
    CREATE INDEX IF NOT EXISTS idx_transactions_product_created
      ON inventory_transactions(
        product_id,
        created_at
      );

    /*
     * Analytics commonly filters by
     * transaction_type + created_at.
     *
     * Example:
     * sale transactions from last 30 days.
     */
    CREATE INDEX IF NOT EXISTS idx_transactions_type_created
      ON inventory_transactions(
        transaction_type,
        created_at
      );

    /*
     * Useful when analytics needs:
     *
     * product + transaction type + time period.
     */
    CREATE INDEX IF NOT EXISTS idx_transactions_product_type_created
      ON inventory_transactions(
        product_id,
        transaction_type,
        created_at
      );

    /*
     * Recent transaction ordering.
     *
     * SQLite indexes can be scanned in reverse,
     * so ASC/DESC declaration isn't required.
     */
    CREATE INDEX IF NOT EXISTS idx_transactions_created_id
      ON inventory_transactions(
        created_at,
        id
      );

    /*
     * Helps the latest stock-in / delivery
     * queries for each product.
     */
    CREATE INDEX IF NOT EXISTS idx_transactions_product_type_id
      ON inventory_transactions(
        product_id,
        transaction_type,
        id
      );
  `);
}

export async function initializeDatabase(): Promise<void> {
  const database =
    await getDatabase();

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

  await createInventoryTransactionTable(
    database,
  );

  await createInventoryTransactionIndexes(
    database,
  );
}