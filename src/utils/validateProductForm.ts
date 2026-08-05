import type {
  ProductFormErrors,
  ProductFormValues,
} from "../types/productForm";

interface ValidationResult {
  isValid: boolean;
  errors: ProductFormErrors;
}

function isNonNegativeNumber(value: string): boolean {
  if (value.trim() === "") {
    return false;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue >= 0;
}

function isNonNegativeInteger(value: string): boolean {
  if (value.trim() === "") {
    return false;
  }

  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue >= 0;
}

export function validateProductForm(
  values: ProductFormValues,
): ValidationResult {
  const errors: ProductFormErrors = {};

  if (!values.barcode.trim()) {
    errors.barcode = "Barcode is required.";
  }

  if (!values.name.trim()) {
    errors.name = "Product name is required.";
  }

  if (!values.category.trim()) {
    errors.category = "Category is required.";
  }

  if (!isNonNegativeNumber(values.unitCost)) {
    errors.unitCost =
      "Unit cost must be a valid non-negative number.";
  }

  if (!isNonNegativeNumber(values.unitPrice)) {
    errors.unitPrice =
      "Unit price must be a valid non-negative number.";
  }

  if (!isNonNegativeInteger(values.currentStock)) {
    errors.currentStock =
      "Current stock must be a non-negative whole number.";
  }

  if (!isNonNegativeInteger(values.reorderLevel)) {
    errors.reorderLevel =
      "Reorder level must be a non-negative whole number.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}