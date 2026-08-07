import type { ProductDepartment } from "../constants/productTaxonomy";

export type InventorySortOption =
  | "name-asc"
  | "name-desc"
  | "stock-asc"
  | "stock-desc"
  | "price-asc"
  | "price-desc";

export interface InventoryFilterState {
  searchQuery: string;
  department: ProductDepartment | "all";
  lowStockOnly: boolean;
  sortBy: InventorySortOption;
}

export const DEFAULT_INVENTORY_FILTERS: InventoryFilterState = {
  searchQuery: "",
  department: "all",
  lowStockOnly: false,
  sortBy: "name-asc",
};