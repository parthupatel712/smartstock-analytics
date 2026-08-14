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

  updated_at: string;
}

export interface ProductSyncResult {
  totalLocalProducts:
    number;

  uploaded:
    number;

  updated:
    number;

  skippedNewerCloud:
    number;

  failed:
    number;
}

export async function syncLocalProductsToCloud(): Promise<
  ProductSyncResult
> {
  const localProducts =
    await getAllProducts();

  let uploaded =
    0;

  let updated =
    0;

  let skippedNewerCloud =
    0;

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

      /*
       * Product does not exist in cloud.
       *
       * Upload it.
       */
      if (
        !existingCloudProduct
      ) {
        await insertCloudProduct(
          product,
        );

        uploaded +=
          1;

        continue;
      }

      /*
       * Compare timestamps before
       * overwriting Supabase.
       *
       * This prevents an old/stale device
       * from overwriting newer cloud stock.
       */
      const localUpdatedAt =
        new Date(
          product.updatedAt,
        ).getTime();

      const cloudUpdatedAt =
        new Date(
          existingCloudProduct.updated_at,
        ).getTime();

      /*
       * If either timestamp is invalid,
       * fail instead of guessing which
       * version should win.
       */
      if (
        Number.isNaN(
          localUpdatedAt,
        ) ||
        Number.isNaN(
          cloudUpdatedAt,
        )
      ) {
        throw new Error(
          `Invalid updated_at timestamp for product ${product.barcode}.`,
        );
      }

      /*
       * Cloud is newer OR exactly equal.
       *
       * Do not overwrite it.
       *
       * The following pull will bring
       * that newer cloud version into
       * this device's SQLite database.
       */
      if (
        localUpdatedAt <=
        cloudUpdatedAt
      ) {
        skippedNewerCloud +=
          1;

        continue;
      }

      /*
       * Local version is genuinely newer.
       *
       * This commonly happens when:
       *
       * - stock changed while offline
       * - product was edited locally
       * - archive/restore occurred locally
       */
      await updateCloudProduct(
        existingCloudProduct.id,
        product,
      );

      updated +=
        1;
    } catch (
      error
    ) {
      failed +=
        1;

      console.warn(
        `Could not sync product ${product.barcode}:`,
        error,
      );

      throw error instanceof Error
        ? error
        : new Error(
            `Could not sync product ${product.barcode}.`,
          );
    }
  }

  return {
    totalLocalProducts:
      localProducts.length,

    uploaded,

    updated,

    skippedNewerCloud,

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
          barcode,
          updated_at
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