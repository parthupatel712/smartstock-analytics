export interface ProductFormValues {
  barcode: string;
  name: string;
  category: string;
  unitCost: string;
  unitPrice: string;
  currentStock: string;
  reorderLevel: string;
}

export interface ProductFormErrors {
  barcode?: string;
  name?: string;
  category?: string;
  unitCost?: string;
  unitPrice?: string;
  currentStock?: string;
  reorderLevel?: string;
}