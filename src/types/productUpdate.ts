import type {
  ProductCategory,
  ProductDepartment,
} from "../constants/productTaxonomy";

export interface UpdateProductInput {
  productId: number;

  barcode: string;
  name: string;
  brand: string;

  department: ProductDepartment;
  category: ProductCategory;

  unitCost: number;
  unitPrice: number;

  reorderLevel: number;
}