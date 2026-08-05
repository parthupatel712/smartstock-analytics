export interface ProductFormValues {
  barcode: string;
  name: string;

  department: string;
  category: string;
  brand: string;

  unitCost: string;
  unitPrice: string;
  currentStock: string;
  reorderLevel: string;
}

export interface ProductFormErrors {
  barcode?: string;
  name?: string;

  department?: string;
  category?: string;
  brand?: string;

  unitCost?: string;
  unitPrice?: string;
  currentStock?: string;
  reorderLevel?: string;
}