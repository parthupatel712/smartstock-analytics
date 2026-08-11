import type {
  CreateProductInput,
  Product,
} from "../types/product";

import { supabase } from "../services/supabase";

interface CloudProductRow {
  id: number;
  barcode: string;
  name: string;
  department: Product["department"];
  category: Product["category"];
  brand: string;
  unit_cost: number;
  unit_price: number;
  current_stock: number;
  reorder_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function mapCloudProductRow(
  row: CloudProductRow,
): Product {
  return {
    id: row.id,
    barcode: row.barcode,
    name: row.name,
    department: row.department,
    category: row.category,
    brand: row.brand,
    unitCost: Number(row.unit_cost),
    unitPrice: Number(row.unit_price),
    currentStock: row.current_stock,
    reorderLevel: row.reorder_level,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCloudProducts(): Promise<
  Product[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Could not load cloud products: ${error.message}`,
    );
  }

  return (
    (data as CloudProductRow[] | null) ?? []
  ).map(
    mapCloudProductRow,
  );
}

export async function getAllCloudProducts(): Promise<
  Product[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select("*")
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Could not load cloud products: ${error.message}`,
    );
  }

  return (
    (data as CloudProductRow[] | null) ?? []
  ).map(
    mapCloudProductRow,
  );
}

export async function createCloudProduct(
  input: CreateProductInput,
): Promise<Product> {
  const now =
    new Date().toISOString();

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .insert({
      barcode:
        input.barcode.trim(),

      name:
        input.name.trim(),

      department:
        input.department,

      category:
        input.category,

      brand:
        input.brand.trim(),

      unit_cost:
        input.unitCost,

      unit_price:
        input.unitPrice,

      current_stock:
        input.currentStock ?? 0,

      reorder_level:
        input.reorderLevel ?? 5,

      is_active:
        true,

      created_at:
        now,

      updated_at:
        now,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Could not save cloud product: ${error.message}`,
    );
  }

  return mapCloudProductRow(
    data as CloudProductRow,
  );
}