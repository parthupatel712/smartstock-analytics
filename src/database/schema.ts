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
  const columns = await database.getAllAsync<TableColumn>(
    `PRAGMA table_info(${tableName});`,
  );

  return columns.some((column) => column.name === columnName);
}

async function migrateProductsTable(
  database: SQLiteDatabase,
): Promise<void> {
  const hasDepartment = await columnExists(
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

  const hasBrand = await columnExists(
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
  `);
}

export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();

  // Step 1: Create the latest table structure for new installations.
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

  // Step 2: Upgrade existing installations before using new columns.
  await migrateProductsTable(database);

  // Step 3: Create indexes only after all required columns exist.
  await createProductIndexes(database);
}