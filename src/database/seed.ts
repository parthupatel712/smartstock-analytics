import {
  createProduct,
  getProductCount,
} from "./productRepository";

export async function seedDatabase(): Promise<void> {
  const existingProductCount = await getProductCount();

  if (existingProductCount > 0) {
    return;
  }

  await createProduct({
    barcode: "012345678905",
    name: "Sparkling Water 500 mL",
    department: "Beverages",
    category: "Water",
    brand: "Generic",
    unitCost: 0.75,
    unitPrice: 1.99,
    currentStock: 24,
    reorderLevel: 8,
  });

  await createProduct({
    barcode: "036000291452",
    name: "Potato Chips",
    department: "Snacks & Confectionery",
    category: "Chips",
    brand: "Generic",
    unitCost: 1.2,
    unitPrice: 2.99,
    currentStock: 15,
    reorderLevel: 6,
  });

  await createProduct({
    barcode: "123456789012",
    name: "Chocolate Bar",
    department: "Snacks & Confectionery",
    category: "Chocolate",
    brand: "Generic",
    unitCost: 0.9,
    unitPrice: 2.19,
    currentStock: 4,
    reorderLevel: 5,
  });
}