import type {
  CreateProductInput,
  Product,
} from "../types/product";

import { getDatabase } from "./database";

interface ProductRow {
  id: number;
  barcode: string;
  name: string;
  category: string;
  unit_cost: number;
  unit_price: number;
  current_stock: number;
  reorder_level: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    barcode: row.barcode,
    name: row.name,
    category: row.category,
    unitCost: row.unit_cost,
    unitPrice: row.unit_price,
    currentStock: row.current_stock,
    reorderLevel: row.reorder_level,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeBarcode(barcode: string): string {
  return barcode.trim();
}

export async function createProduct(
  input: CreateProductInput,
): Promise<number> {
  const database = await getDatabase();

  const barcode = normalizeBarcode(input.barcode);
  const name = input.name.trim();
  const category = input.category.trim();
  const currentStock = input.currentStock ?? 0;
  const reorderLevel = input.reorderLevel ?? 5;
  const now = new Date().toISOString();

  if (!barcode) {
    throw new Error("Barcode is required.");
  }

  if (!name) {
    throw new Error("Product name is required.");
  }

  if (!category) {
    throw new Error("Category is required.");
  }

  if (input.unitCost < 0) {
    throw new Error("Unit cost cannot be negative.");
  }

  if (input.unitPrice < 0) {
    throw new Error("Unit price cannot be negative.");
  }

  if (currentStock < 0) {
    throw new Error("Current stock cannot be negative.");
  }

  if (reorderLevel < 0) {
    throw new Error("Reorder level cannot be negative.");
  }

  const result = await database.runAsync(
    `
      INSERT INTO products (
        barcode,
        name,
        category,
        unit_cost,
        unit_price,
        current_stock,
        reorder_level,
        is_active,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `,
    barcode,
    name,
    category,
    input.unitCost,
    input.unitPrice,
    currentStock,
    reorderLevel,
    now,
    now,
  );

  return result.lastInsertRowId;
}

export async function getAllProducts(): Promise<Product[]> {
  const database = await getDatabase();

  const rows = await database.getAllAsync<ProductRow>(`
    SELECT
      id,
      barcode,
      name,
      category,
      unit_cost,
      unit_price,
      current_stock,
      reorder_level,
      is_active,
      created_at,
      updated_at
    FROM products
    WHERE is_active = 1
    ORDER BY name COLLATE NOCASE ASC
  `);

  return rows.map(mapProductRow);
}

export async function getProductCount(): Promise<number> {
  const database = await getDatabase();

  const result = await database.getFirstAsync<{
    total: number;
  }>(`
    SELECT COUNT(*) AS total
    FROM products
    WHERE is_active = 1
  `);

  return result?.total ?? 0;
}

export async function getProductByBarcode(
  barcode: string,
): Promise<Product | null> {
  const database = await getDatabase();

  const row = await database.getFirstAsync<ProductRow>(
    `
      SELECT
        id,
        barcode,
        name,
        category,
        unit_cost,
        unit_price,
        current_stock,
        reorder_level,
        is_active,
        created_at,
        updated_at
      FROM products
      WHERE barcode = ?
        AND is_active = 1
      LIMIT 1
    `,
    normalizeBarcode(barcode),
  );

  return row ? mapProductRow(row) : null;
}