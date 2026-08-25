import {
  getDatabase,
} from "./database";

export interface HomeOrderSummary {
  draftOrderCount:
    number;

  upcomingOrderCount:
    number;

  upcomingUnits:
    number;

  upcomingValue:
    number;
}

interface HomeOrderSummaryRow {
  draft_order_count:
    number;

  upcoming_order_count:
    number;

  upcoming_units:
    number;

  upcoming_value:
    number;
}

export async function getHomeOrderSummary():
  Promise<HomeOrderSummary> {
  const database =
    await getDatabase();

  const row =
    await database.getFirstAsync<HomeOrderSummaryRow>(
      `
        SELECT

          (
            SELECT
              COUNT(*)

            FROM
              purchase_orders

            WHERE
              status = 'draft'
          ) AS draft_order_count,

          (
            SELECT
              COUNT(*)

            FROM
              purchase_orders po

            WHERE
              po.status IN (
                'ordered',
                'partially_received'
              )

              AND EXISTS (
                SELECT
                  1

                FROM
                  purchase_order_items poi

                WHERE
                  poi.order_id =
                    po.id

                  AND
                    poi.quantity >
                    poi.received_quantity
              )
          ) AS upcoming_order_count,

          (
            SELECT
              COALESCE(
                SUM(
                  CASE
                    WHEN
                      poi.quantity >
                      poi.received_quantity

                    THEN
                      poi.quantity -
                      poi.received_quantity

                    ELSE
                      0
                  END
                ),
                0
              )

            FROM
              purchase_order_items poi

            INNER JOIN
              purchase_orders po
                ON po.id =
                  poi.order_id

            WHERE
              po.status IN (
                'ordered',
                'partially_received'
              )
          ) AS upcoming_units,

          (
            SELECT
              COALESCE(
                SUM(
                  CASE
                    WHEN
                      poi.quantity >
                      poi.received_quantity

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
              )

            FROM
              purchase_order_items poi

            INNER JOIN
              purchase_orders po
                ON po.id =
                  poi.order_id

            WHERE
              po.status IN (
                'ordered',
                'partially_received'
              )
          ) AS upcoming_value;
      `,
    );

  return {
    draftOrderCount:
      row?.draft_order_count ??
      0,

    upcomingOrderCount:
      row?.upcoming_order_count ??
      0,

    upcomingUnits:
      row?.upcoming_units ??
      0,

    upcomingValue:
      row?.upcoming_value ??
      0,
  };
}