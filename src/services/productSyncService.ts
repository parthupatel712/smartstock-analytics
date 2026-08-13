import type {
  Product,
} from "../types/product";

import {
  getAllProducts,
} from "../database/productRepository";

import {
  supabase,
} from "./supabase";

interface CloudProductRow {
  id: number;

  barcode: string;
}

export interface ProductSyncResult {
  totalLocalProducts:
    number;

  uploaded:
    number;

  updated:
    number;

  failed:
    number;
}

export async function syncLocalProductsToCloud(): Promise<ProductSyncResult> {
  const localProducts =
    await getAllProducts();

  let uploaded =
    0;

  let updated =
    0;

  /*
   * On a successful complete sync,
   * failed will remain zero.
   *
   * If a product cannot sync,
   * we throw immediately so App.tsx
   * can display Cloud unavailable.
   */
  let failed =
    0;

  for (
    const product of
    localProducts
  ) {
    try {
      const existingCloudProduct =
        await findCloudProductByBarcode(
          product.barcode,
        );

      if (
        existingCloudProduct
      ) {
        await updateCloudProduct(
          existingCloudProduct.id,
          product,
        );

        updated +=
          1;
      } else {
        await insertCloudProduct(
          product,
        );

        uploaded +=
          1;
      }
    } catch (
      error
    ) {
      failed +=
        1;

      /*
       * Network/cloud failure is an
       * expected runtime condition.
       *
       * Use console.warn instead of
       * console.error so Expo does not
       * treat it like an application
       * programming error.
       */
      console.warn(
        `Could not sync product ${product.barcode}:`,
        error,
      );

      /*
       * IMPORTANT:
       *
       * Do not swallow the failure.
       *
       * App.tsx needs this rejection
       * so CloudSyncStatus becomes
       * "Cloud unavailable".
       */
      throw normalizeSyncError(
        error,
        product.barcode,
      );
    }
  }

  return {
    totalLocalProducts:
      localProducts.length,

    uploaded,

    updated,

    failed,
  };
}

async function findCloudProductByBarcode(
  barcode:
    string,
): Promise<CloudProductRow | null> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "products",
      )
      .select(
        `
          id,
          barcode
        `,
      )
      .eq(
        "barcode",
        barcode.trim(),
      )
      .maybeSingle();

  if (
    error
  ) {
    throw new Error(
      `Could not check cloud product: ${error.message}`,
    );
  }

  return data as CloudProductRow | null;
}

async function insertCloudProduct(
  product:
    Product,
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from(
        "products",
      )
      .insert(
        mapProductToCloudRow(
          product,
        ),
      );

  if (
    error
  ) {
    throw new Error(
      `Could not upload product: ${error.message}`,
    );
  }
}

async function updateCloudProduct(
  cloudProductId:
    number,

  product:
    Product,
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from(
        "products",
      )
      .update(
        mapProductToCloudRow(
          product,
        ),
      )
      .eq(
        "id",
        cloudProductId,
      );

  if (
    error
  ) {
    throw new Error(
      `Could not update cloud product: ${error.message}`,
    );
  }
}

function mapProductToCloudRow(
  product:
    Product,
) {
  return {
    barcode:
      product.barcode,

    name:
      product.name,

    department:
      product.department,

    category:
      product.category,

    brand:
      product.brand,

    unit_cost:
      product.unitCost,

    unit_price:
      product.unitPrice,

    current_stock:
      product.currentStock,

    reorder_level:
      product.reorderLevel,

    is_active:
      product.isActive,

    created_at:
      product.createdAt,

    updated_at:
      product.updatedAt,
  };
}

function normalizeSyncError(
  error:
    unknown,

  barcode:
    string,
): Error {
  if (
    error instanceof
    Error
  ) {
    return error;
  }

  return new Error(
    `Could not sync product ${barcode}.`,
  );
}