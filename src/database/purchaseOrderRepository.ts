import type {
  CreatePurchaseOrderInput,
  CreatePurchaseOrderItemInput,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
  PurchaseOrderSummary,
  PurchaseOrderWithItems,
  UpdatePurchaseOrderInput,
} from "../types/purchaseOrder";

import {
  getDatabase,
} from "./database";

interface PurchaseOrderRow {
  id:
    number;

  order_number:
    string;

  vendor_name:
    string;

  status:
    PurchaseOrderStatus;

  notes:
    string;

  subtotal:
    number;

  tax:
    number;

  total:
    number;

  created_at:
    string;

  updated_at:
    string;

  ordered_at:
    string | null;

  received_at:
    string | null;

  cancelled_at:
    string | null;
}

interface PurchaseOrderItemRow {
  id:
    number;

  order_id:
    number;

  product_id:
    number | null;

  barcode:
    string;

  product_name:
    string;

  brand:
    string;

  department:
    string;

  category:
    string;

  quantity:
    number;

  received_quantity:
    number;

  unit_cost:
    number;

  line_total:
    number;

  created_at:
    string;

  last_received_at:
    string | null;
}

interface PurchaseOrderSummaryRow {
  id:
    number;

  order_number:
    string;

  vendor_name:
    string;

  status:
    PurchaseOrderStatus;

  item_count:
    number;

  total_units:
    number;

  received_units:
    number;

  remaining_units:
    number;

  remaining_value:
    number;

  subtotal:
    number;

  tax:
    number;

  total:
    number;

  created_at:
    string;

  ordered_at:
    string | null;
}

function mapPurchaseOrderRow(
  row:
    PurchaseOrderRow,
): PurchaseOrder {
  return {
    id:
      row.id,

    orderNumber:
      row.order_number,

    vendorName:
      row.vendor_name,

    status:
      row.status,

    notes:
      row.notes,

    subtotal:
      row.subtotal,

    tax:
      row.tax,

    total:
      row.total,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

    orderedAt:
      row.ordered_at,

    receivedAt:
      row.received_at,

    cancelledAt:
      row.cancelled_at,
  };
}

function mapPurchaseOrderItemRow(
  row:
    PurchaseOrderItemRow,
): PurchaseOrderItem {
  const receivedQuantity =
    Math.max(
      0,
      Math.min(
        row.received_quantity,
        row.quantity,
      ),
    );

  return {
    id:
      row.id,

    orderId:
      row.order_id,

    productId:
      row.product_id,

    barcode:
      row.barcode,

    productName:
      row.product_name,

    brand:
      row.brand,

    department:
      row.department,

    category:
      row.category,

    quantity:
      row.quantity,

    receivedQuantity,

    remainingQuantity:
      Math.max(
        row.quantity -
          receivedQuantity,
        0,
      ),

    unitCost:
      row.unit_cost,

    lineTotal:
      row.line_total,

    createdAt:
      row.created_at,

    lastReceivedAt:
      row.last_received_at,
  };
}

function mapPurchaseOrderSummaryRow(
  row:
    PurchaseOrderSummaryRow,
): PurchaseOrderSummary {
  return {
    id:
      row.id,

    orderNumber:
      row.order_number,

    vendorName:
      row.vendor_name,

    status:
      row.status,

    itemCount:
      row.item_count,

    totalUnits:
      row.total_units,

    receivedUnits:
      row.received_units,

    remainingUnits:
      row.remaining_units,

    remainingValue:

      row.remaining_value,

    subtotal:
      row.subtotal,

    tax:
      row.tax,

    total:
      row.total,

    createdAt:
      row.created_at,

    orderedAt:
      row.ordered_at,
  };
}

function validateItems(
  items:
    CreatePurchaseOrderItemInput[],
): void {
  if (
    items.length ===
    0
  ) {
    throw new Error(
      "The order must contain at least one product.",
    );
  }

  items.forEach(
    (
      item,
    ) => {
      if (
        !Number.isInteger(
          item.quantity,
        ) ||
        item.quantity <=
          0
      ) {
        throw new Error(
          `Invalid quantity for ${item.product.name}.`,
        );
      }

      if (
        !Number.isFinite(
          item.product.unitCost,
        ) ||
        item.product.unitCost <
          0
      ) {
        throw new Error(
          `Invalid unit cost for ${item.product.name}.`,
        );
      }
    },
  );
}

function calculateOrderTotals(
  items:
    CreatePurchaseOrderItemInput[],

  tax:
    number,
): {
  subtotal:
    number;

  tax:
    number;

  total:
    number;
} {
  const subtotal =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.product.unitCost *
          item.quantity,
      0,
    );

  const normalizedTax =
    Number.isFinite(
      tax,
    ) &&
    tax >=
      0
      ? tax
      : 0;

  return {
    subtotal,

    tax:
      normalizedTax,

    total:
      subtotal +
      normalizedTax,
  };
}

async function generateOrderNumber():
  Promise<string> {
  const database =
    await getDatabase();

  const now =
    new Date();

  const datePart = [
    now.getFullYear(),

    String(
      now.getMonth() +
        1,
    ).padStart(
      2,
      "0",
    ),

    String(
      now.getDate(),
    ).padStart(
      2,
      "0",
    ),
  ].join(
    "",
  );

  const prefix =
    `PO-${datePart}-`;

  const latest =
    await database.getFirstAsync<{
      order_number:
        string;
    }>(
      `
        SELECT
          order_number

        FROM purchase_orders

        WHERE
          order_number LIKE ?

        ORDER BY
          order_number DESC

        LIMIT 1;
      `,
      `${prefix}%`,
    );

  let nextNumber =
    1;

  if (
    latest
  ) {
    const parts =
      latest.order_number.split(
        "-",
      );

    const lastPart =
      parts[
        parts.length -
          1
      ];

    const parsed =
      Number(
        lastPart,
      );

    if (
      Number.isInteger(
        parsed,
      ) &&
      parsed >
        0
    ) {
      nextNumber =
        parsed +
        1;
    }
  }

  return `${prefix}${String(
    nextNumber,
  ).padStart(
    3,
    "0",
  )}`;
}

async function replaceOrderItems(
  orderId:
    number,

  items:
    CreatePurchaseOrderItemInput[],
): Promise<void> {
  const database =
    await getDatabase();

  await database.runAsync(
    `
      DELETE FROM
        purchase_order_items

      WHERE
        order_id = ?;
    `,
    orderId,
  );

  const now =
    new Date().toISOString();

  for (
    const item
    of items
  ) {
    const lineTotal =
      item.product.unitCost *
      item.quantity;

    await database.runAsync(
      `
        INSERT INTO purchase_order_items (
          order_id,
          product_id,
          barcode,
          product_name,
          brand,
          department,
          category,
          quantity,
          received_quantity,
          unit_cost,
          line_total,
          created_at,
          last_received_at
        )

        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, NULL
        );
      `,
      orderId,
      item.product.id,
      item.product.barcode,
      item.product.name,
      item.product.brand,
      item.product.department,
      item.product.category,
      item.quantity,
      item.product.unitCost,
      lineTotal,
      now,
    );
  }
}

export async function createPurchaseOrder(
  input:
    CreatePurchaseOrderInput,
): Promise<PurchaseOrderWithItems> {
  const database =
    await getDatabase();

  validateItems(
    input.items,
  );

  const vendorName =
    input.vendorName.trim();

  const notes =
    input.notes?.trim() ??
    "";

  const totals =
    calculateOrderTotals(
      input.items,
      input.tax ??
        0,
    );

  const orderNumber =
    await generateOrderNumber();

  const now =
    new Date().toISOString();

  const orderedAt =
    input.status ===
    "ordered"
      ? now
      : null;

  await database.execAsync(
    "BEGIN TRANSACTION;",
  );

  try {
    const result =
      await database.runAsync(
        `
          INSERT INTO purchase_orders (
            order_number,
            vendor_name,
            status,
            notes,
            subtotal,
            tax,
            total,
            created_at,
            updated_at,
            ordered_at,
            received_at,
            cancelled_at
          )

          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL
          );
        `,
        orderNumber,
        vendorName,
        input.status,
        notes,
        totals.subtotal,
        totals.tax,
        totals.total,
        now,
        now,
        orderedAt,
      );

    await replaceOrderItems(
      result.lastInsertRowId,
      input.items,
    );

    await database.execAsync(
      "COMMIT;",
    );

    const created =
      await getPurchaseOrderById(
        result.lastInsertRowId,
      );

    if (
      !created
    ) {
      throw new Error(
        "The purchase order was created but could not be reloaded.",
      );
    }

    return created;
  } catch (
    error
  ) {
    await database.execAsync(
      "ROLLBACK;",
    );

    throw error;
  }
}

export async function getActiveDraftPurchaseOrder():
  Promise<PurchaseOrderWithItems | null> {
  const database =
    await getDatabase();

  const row =
    await database.getFirstAsync<{
      id:
        number;
    }>(
      `
        SELECT
          id

        FROM purchase_orders

        WHERE
          status = 'draft'

        ORDER BY
          updated_at DESC,
          id DESC

        LIMIT 1;
      `,
    );

  if (
    !row
  ) {
    return null;
  }

  return getPurchaseOrderById(
    row.id,
  );
}

export async function updateDraftPurchaseOrder(
  input:
    UpdatePurchaseOrderInput,
): Promise<PurchaseOrderWithItems> {
  const database =
    await getDatabase();

  validateItems(
    input.items,
  );

  const existing =
    await database.getFirstAsync<{
      id:
        number;

      status:
        PurchaseOrderStatus;
    }>(
      `
        SELECT
          id,
          status

        FROM purchase_orders

        WHERE
          id = ?

        LIMIT 1;
      `,
      input.orderId,
    );

  if (
    !existing
  ) {
    throw new Error(
      "Draft order could not be found.",
    );
  }

  if (
    existing.status !==
    "draft"
  ) {
    throw new Error(
      "Only draft orders can be edited.",
    );
  }

  const totals =
    calculateOrderTotals(
      input.items,
      input.tax,
    );

  const now =
    new Date().toISOString();

  await database.execAsync(
    "BEGIN TRANSACTION;",
  );

  try {
    await database.runAsync(
      `
        UPDATE purchase_orders

        SET
          vendor_name = ?,
          notes = ?,
          subtotal = ?,
          tax = ?,
          total = ?,
          updated_at = ?

        WHERE
          id = ?

          AND status = 'draft';
      `,
      input.vendorName.trim(),
      input.notes.trim(),
      totals.subtotal,
      totals.tax,
      totals.total,
      now,
      input.orderId,
    );

    await replaceOrderItems(
      input.orderId,
      input.items,
    );

    await database.execAsync(
      "COMMIT;",
    );

    const updated =
      await getPurchaseOrderById(
        input.orderId,
      );

    if (
      !updated
    ) {
      throw new Error(
        "The draft was updated but could not be reloaded.",
      );
    }

    return updated;
  } catch (
    error
  ) {
    await database.execAsync(
      "ROLLBACK;",
    );

    throw error;
  }
}

export async function saveOrCreateDraftPurchaseOrder(
  input: {
    vendorName?:
      string;

    notes?:
      string;

    tax?:
      number;

    items:
      CreatePurchaseOrderItemInput[];
  },
): Promise<PurchaseOrderWithItems> {
  validateItems(
    input.items,
  );

  const activeDraft =
    await getActiveDraftPurchaseOrder();

  if (
    activeDraft
  ) {
    return updateDraftPurchaseOrder({
      orderId:
        activeDraft.order.id,

      vendorName:
        input.vendorName ??
        activeDraft.order.vendorName,

      notes:
        input.notes ??
        activeDraft.order.notes,

      tax:
        input.tax ??
        activeDraft.order.tax,

      items:
        input.items,
    });
  }

  return createPurchaseOrder({
    vendorName:
      input.vendorName ??
      "",

    notes:
      input.notes ??
      "",

    status:
      "draft",

    tax:
      input.tax ??
      0,

    items:
      input.items,
  });
}

export async function deleteActiveDraftPurchaseOrder():
  Promise<void> {
  const database =
    await getDatabase();

  const draft =
    await database.getFirstAsync<{
      id:
        number;
    }>(
      `
        SELECT
          id

        FROM purchase_orders

        WHERE
          status = 'draft'

        ORDER BY
          updated_at DESC,
          id DESC

        LIMIT 1;
      `,
    );

  if (
    !draft
  ) {
    return;
  }

  await database.runAsync(
    `
      DELETE FROM purchase_orders

      WHERE
        id = ?

        AND status = 'draft';
    `,
    draft.id,
  );
}

export async function placeDraftPurchaseOrder(
  orderId:
    number,
): Promise<PurchaseOrderWithItems> {
  const database =
    await getDatabase();

  const existing =
    await getPurchaseOrderById(
      orderId,
    );

  if (
    !existing
  ) {
    throw new Error(
      "Draft order could not be found.",
    );
  }

  if (
    existing.order.status !==
    "draft"
  ) {
    throw new Error(
      "Only draft orders can be placed.",
    );
  }

  if (
    existing.items.length ===
    0
  ) {
    throw new Error(
      "The order does not contain any products.",
    );
  }

  if (
    !existing.order.vendorName.trim()
  ) {
    throw new Error(
      "Vendor or supplier name is required before placing the order.",
    );
  }

  const now =
    new Date().toISOString();

  const result =
    await database.runAsync(
      `
        UPDATE purchase_orders

        SET
          status = 'ordered',
          ordered_at = ?,
          updated_at = ?

        WHERE
          id = ?

          AND status = 'draft';
      `,
      now,
      now,
      orderId,
    );

  if (
    result.changes ===
    0
  ) {
    throw new Error(
      "The draft order could not be placed.",
    );
  }

  const placed =
    await getPurchaseOrderById(
      orderId,
    );

  if (
    !placed
  ) {
    throw new Error(
      "The order was placed but could not be reloaded.",
    );
  }

  return placed;
}

export async function getPurchaseOrderById(
  orderId:
    number,
): Promise<PurchaseOrderWithItems | null> {
  const database =
    await getDatabase();

  const orderRow =
    await database.getFirstAsync<PurchaseOrderRow>(
      `
        SELECT
          id,
          order_number,
          vendor_name,
          status,
          notes,
          subtotal,
          tax,
          total,
          created_at,
          updated_at,
          ordered_at,
          received_at,
          cancelled_at

        FROM purchase_orders

        WHERE
          id = ?

        LIMIT 1;
      `,
      orderId,
    );

  if (
    !orderRow
  ) {
    return null;
  }

  const itemRows =
    await database.getAllAsync<PurchaseOrderItemRow>(
      `
        SELECT
          id,
          order_id,
          product_id,
          barcode,
          product_name,
          brand,
          department,
          category,
          quantity,
          received_quantity,
          unit_cost,
          line_total,
          created_at,
          last_received_at

        FROM purchase_order_items

        WHERE
          order_id = ?

        ORDER BY
          id ASC;
      `,
      orderId,
    );

  return {
    order:
      mapPurchaseOrderRow(
        orderRow,
      ),

    items:
      itemRows.map(
        mapPurchaseOrderItemRow,
      ),
  };
}

export async function getPurchaseOrderHistory(
  limit =
    100,
): Promise<PurchaseOrderSummary[]> {
  const database =
    await getDatabase();

  const safeLimit =
    Math.max(
      1,
      Math.floor(
        limit,
      ),
    );

  const rows =
    await database.getAllAsync<PurchaseOrderSummaryRow>(
      `
        SELECT
          po.id,
          po.order_number,
          po.vendor_name,
          po.status,

          COUNT(
            poi.id
          ) AS item_count,

          COALESCE(
            SUM(
              poi.quantity
            ),
            0
          ) AS total_units,

          COALESCE(
            SUM(
              poi.received_quantity
            ),
            0
          ) AS received_units,

          COALESCE(
            SUM(
              CASE
                WHEN
                  poi.quantity -
                  poi.received_quantity >
                  0
                THEN
                  poi.quantity -
                  poi.received_quantity
                ELSE
                  0
              END
            ),
            0
          ) AS remaining_units,

          COALESCE(
            SUM(
              CASE
                WHEN
                  poi.quantity -
                  poi.received_quantity >
                  0
                THEN
                  (
                    poi.quantity -
                    poi.received_quantity
                  ) *
                  poi.unit_cost
                ELSE
                  0
                END
              ),
              0
            ) AS remaining_value,

          po.subtotal,
          po.tax,
          po.total,
          po.created_at,
          po.ordered_at

        FROM purchase_orders po

        LEFT JOIN
          purchase_order_items poi
            ON poi.order_id =
              po.id

        GROUP BY
          po.id

        ORDER BY
          po.created_at DESC,
          po.id DESC

        LIMIT ?;
      `,
      safeLimit,
    );

  return rows.map(
    mapPurchaseOrderSummaryRow,
  );
}

export async function getDraftQuantitiesByProduct():
  Promise<Map<number, number>> {
  const database =
    await getDatabase();

  const rows =
    await database.getAllAsync<{
      product_id:
        number;

      quantity:
        number;
    }>(
      `
        SELECT
          poi.product_id,

          SUM(
            poi.quantity
          ) AS quantity

        FROM purchase_order_items poi

        INNER JOIN
          purchase_orders po
            ON po.id =
              poi.order_id

        WHERE
          po.status = 'draft'

          AND poi.product_id
            IS NOT NULL

        GROUP BY
          poi.product_id;
      `,
    );

  return new Map(
    rows.map(
      (
        row,
      ) => [
        row.product_id,
        row.quantity,
      ],
    ),
  );
}

export async function getOrderedQuantitiesByProduct():
  Promise<Map<number, number>> {
  const database =
    await getDatabase();

  const rows =
    await database.getAllAsync<{
      product_id:
        number;

      quantity:
        number;
    }>(
      `
        SELECT
          poi.product_id,

          SUM(
            CASE
              WHEN
                poi.quantity -
                poi.received_quantity >
                0
              THEN
                poi.quantity -
                  poi.received_quantity
              ELSE
                0
            END
          ) AS quantity

        FROM purchase_order_items poi

        INNER JOIN
          purchase_orders po
            ON po.id =
              poi.order_id

        WHERE
          po.status IN (
            'ordered',
            'partially_received'
          )

          AND poi.product_id
            IS NOT NULL

        GROUP BY
          poi.product_id;
      `,
    );

  return new Map(
    rows
      .filter(
        (
          row,
        ) =>
          row.quantity >
          0,
      )
      .map(
        (
          row,
        ) => [
          row.product_id,
          row.quantity,
        ],
      ),
  );
}

/*
 * Update the accumulated received
 * quantity for one PO line.
 *
 * IMPORTANT:
 *
 * This function does NOT update
 * products.current_stock.
 *
 * The receiving service should update
 * physical inventory first and call
 * this function inside the same
 * receiving workflow.
 */
export async function addReceivedQuantityToOrderItem(
  orderItemId:
    number,

  receivedNow:
    number,
): Promise<void> {
  if (
    !Number.isInteger(
      receivedNow,
    ) ||
    receivedNow <
      0
  ) {
    throw new Error(
      "Received quantity must be a non-negative whole number.",
    );
  }

  if (
    receivedNow ===
    0
  ) {
    return;
  }

  const database =
    await getDatabase();

  const item =
    await database.getFirstAsync<{
      id:
        number;

      quantity:
        number;

      received_quantity:
        number;
    }>(
      `
        SELECT
          id,
          quantity,
          received_quantity

        FROM purchase_order_items

        WHERE
          id = ?

        LIMIT 1;
      `,
      orderItemId,
    );

  if (
    !item
  ) {
    throw new Error(
      "Purchase order item could not be found.",
    );
  }

  const remaining =
    Math.max(
      item.quantity -
        item.received_quantity,
      0,
    );

  if (
    receivedNow >
    remaining
  ) {
    throw new Error(
      `Cannot receive ${receivedNow} units. Only ${remaining} units remain on this order line.`,
    );
  }

  const now =
    new Date().toISOString();

  await database.runAsync(
    `
      UPDATE purchase_order_items

      SET
        received_quantity =
          received_quantity + ?,

        last_received_at = ?

      WHERE
        id = ?;
    `,
    receivedNow,
    now,
    orderItemId,
  );
}

/*
 * After receiving has been applied,
 * calculate whether the PO is:
 *
 * ordered
 * partially_received
 * received
 *
 * A missing product does NOT disappear.
 * Its remaining quantity stays on the
 * PO so history still shows what was
 * ordered versus what actually arrived.
 */
export async function refreshPurchaseOrderReceivingStatus(
  orderId:
    number,
): Promise<PurchaseOrderWithItems> {
  const database =
    await getDatabase();

  const existing =
    await getPurchaseOrderById(
      orderId,
    );

  if (
    !existing
  ) {
    throw new Error(
      "Purchase order could not be found.",
    );
  }

  if (
    existing.order.status ===
      "draft" ||
    existing.order.status ===
      "cancelled"
  ) {
    return existing;
  }

  const totalOrdered =
    existing.items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.quantity,
      0,
    );

  const totalReceived =
    existing.items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.receivedQuantity,
      0,
    );

  let nextStatus:
    PurchaseOrderStatus =
      "ordered";

  if (
    totalOrdered >
      0 &&
    totalReceived >=
      totalOrdered
  ) {
    nextStatus =
      "received";
  } else if (
    totalReceived >
      0
  ) {
    nextStatus =
      "partially_received";
  }

  const now =
    new Date().toISOString();

  const receivedAt =
    nextStatus ===
    "received"
      ? existing.order.receivedAt ??
        now
      : null;

  await database.runAsync(
    `
      UPDATE purchase_orders

      SET
        status = ?,
        received_at = ?,
        updated_at = ?

      WHERE
        id = ?;
    `,
    nextStatus,
    receivedAt,
    now,
    orderId,
  );

  const refreshed =
    await getPurchaseOrderById(
      orderId,
    );

  if (
    !refreshed
  ) {
    throw new Error(
      "Purchase order status was updated but could not be reloaded.",
    );
  }

  return refreshed;
}

/*
 * Used when the user says:
 *
 * "Finish this delivery even though
 * some ordered products did not arrive."
 *
 * The PO is removed from the active
 * receiving/reorder workflow, but the
 * missing quantities remain stored in
 * purchase_order_items for historical
 * comparison.
 */
export async function completePurchaseOrderWithExceptions(
  orderId:
    number,

  exceptionNote:
    string,
): Promise<PurchaseOrderWithItems> {
  const database =
    await getDatabase();

  const existing =
    await getPurchaseOrderById(
      orderId,
    );

  if (
    !existing
  ) {
    throw new Error(
      "Purchase order could not be found.",
    );
  }

  if (
    existing.order.status !==
      "ordered" &&
    existing.order.status !==
      "partially_received"
  ) {
    throw new Error(
      "Only an active ordered purchase order can be completed.",
    );
  }

  const now =
    new Date().toISOString();

  const cleanNote =
    exceptionNote.trim();

  const previousNotes =
    existing.order.notes.trim();

  const nextNotes =
    [
      previousNotes,

      cleanNote ||
        "Delivery completed with missing or short-shipped products.",
    ]
      .filter(
        Boolean,
      )
      .join(
        "\n",
      );

  await database.runAsync(
    `
      UPDATE purchase_orders

      SET
        status = 'received_with_exceptions',
        notes = ?,
        received_at = ?,
        updated_at = ?

      WHERE
        id = ?;
    `,
    nextNotes,
    now,
    now,
    orderId,
  );

  const completed =
    await getPurchaseOrderById(
      orderId,
    );

  if (
    !completed
  ) {
    throw new Error(
      "The purchase order was completed but could not be reloaded.",
    );
  }

  return completed;
}