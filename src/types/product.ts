import type {
  ProductCategory,
  ProductDepartment,
} from "../constants/productTaxonomy";

export interface Product {
  id: number;
  barcode: string;
  name: string;

  department: ProductDepartment;
  category: ProductCategory;
  brand: string;

  unitCost: number;
  unitPrice: number;
  currentStock: number;
  reorderLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  barcode: string;
  name: string;

  department: ProductDepartment;
  category: ProductCategory;
  brand: string;

  unitCost: number;
  unitPrice: number;
  currentStock?: number;
  reorderLevel?: number;
}