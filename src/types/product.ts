export interface Product {
  id: number;
  barcode: string;
  name: string;
  category: string;
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
  category: string;
  unitCost: number;
  unitPrice: number;
  currentStock?: number;
  reorderLevel?: number;
}