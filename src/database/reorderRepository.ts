import type {
  ReorderItem,
  ReorderPriority,
} from "../types/reorderItem";

import type {
  Product,
} from "../types/product";

import {
  getAllProducts,
} from "./productRepository";

function getPriority(
  product:
    Product,
): ReorderPriority {
  if (
    product.currentStock ===
    0
  ) {
    return "out_of_stock";
  }

  return "low_stock";
}

function buildReorderItem(
  product:
    Product,
): ReorderItem {
  return {
    product,

    currentStock:
      product.currentStock,

    reorderLevel:
      product.reorderLevel,

    priority:
      getPriority(
        product,
      ),
  };
}

function priorityScore(
  priority:
    ReorderPriority,
): number {
  switch (
    priority
  ) {
    case "out_of_stock":
      return 2;

    case "low_stock":
      return 1;
  }
}

export async function getReorderItems(): Promise<
  ReorderItem[]
> {
  const products =
    await getAllProducts();

  return products
    .filter(
      (
        product,
      ) =>
        product.isActive &&
        product.currentStock <=
          product.reorderLevel,
    )
    .map(
      buildReorderItem,
    )
    .sort(
      (
        first,
        second,
      ) => {
        const priorityDifference =
          priorityScore(
            second.priority,
          ) -
          priorityScore(
            first.priority,
          );

        if (
          priorityDifference !==
          0
        ) {
          return priorityDifference;
        }

        const stockDifference =
          first.currentStock -
          second.currentStock;

        if (
          stockDifference !==
          0
        ) {
          return stockDifference;
        }

        return first.product.name.localeCompare(
          second.product.name,
        );
      },
    );
}