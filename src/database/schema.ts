import { getDatabase } from "./database";

export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
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

    CREATE INDEX IF NOT EXISTS idx_products_barcode
      ON products(barcode);

    CREATE INDEX IF NOT EXISTS idx_products_name
      ON products(name);

    CREATE INDEX IF NOT EXISTS idx_products_category
      ON products(category);
  `);
}