import type {
  RealtimeChannel,
} from "@supabase/supabase-js";

import {
  supabase,
} from "./supabase";

export type InventoryRealtimeChange =
  | {
      table:
        "products";

      eventType:
        | "INSERT"
        | "UPDATE"
        | "DELETE";

      productBarcode:
        string | null;
    }
  | {
      table:
        "inventory_transactions";

      eventType:
        | "INSERT"
        | "UPDATE"
        | "DELETE";

      transactionId:
        number | null;
    };

interface SubscribeInventoryRealtimeOptions {
  onChange: (
    change:
      InventoryRealtimeChange,
  ) => void;

  onStatusChange?: (
    status:
      string,
  ) => void;
}

export function subscribeToInventoryRealtime({
  onChange,
  onStatusChange,
}: SubscribeInventoryRealtimeOptions): RealtimeChannel {
  const channel =
    supabase
      .channel(
        "smartstock-inventory-realtime",
      )

      /*
       * PRODUCT CHANGES
       *
       * We extract the barcode from
       * the changed row so App.tsx
       * can download only that product.
       */
      .on(
        "postgres_changes",
        {
          event:
            "*",

          schema:
            "public",

          table:
            "products",
        },
        (
          payload,
        ) => {
          const newRow =
            payload.new as Record<
              string,
              unknown
            >;

          const oldRow =
            payload.old as Record<
              string,
              unknown
            >;

          const barcodeValue =
            newRow.barcode ??
            oldRow.barcode;

          onChange({
            table:
              "products",

            eventType:
              payload.eventType,

            productBarcode:
              typeof barcodeValue ===
              "string"
                ? barcodeValue
                : null,
          });
        },
      )

      /*
       * TRANSACTION CHANGES
       *
       * We extract the cloud transaction ID
       * so App.tsx can download only that
       * transaction instead of rebuilding
       * the entire history.
       */
      .on(
        "postgres_changes",
        {
          event:
            "*",

          schema:
            "public",

          table:
            "inventory_transactions",
        },
        (
          payload,
        ) => {
          const newRow =
            payload.new as Record<
              string,
              unknown
            >;

          const oldRow =
            payload.old as Record<
              string,
              unknown
            >;

          const idValue =
            newRow.id ??
            oldRow.id;

          const parsedId =
            typeof idValue ===
            "number"
              ? idValue
              : Number(
                  idValue,
                );

          onChange({
            table:
              "inventory_transactions",

            eventType:
              payload.eventType,

            transactionId:
              Number.isInteger(
                parsedId,
              ) &&
              parsedId > 0
                ? parsedId
                : null,
          });
        },
      )

      .subscribe(
        (
          status,
        ) => {
          onStatusChange?.(
            status,
          );
        },
      );

  return channel;
}

export async function unsubscribeFromInventoryRealtime(
  channel:
    RealtimeChannel,
): Promise<void> {
  await supabase.removeChannel(
    channel,
  );
}