export interface ProductDeliverySummary {
  transactionId: number;
  productId: number;

  quantityReceived: number;
  stockBefore: number;
  stockAfter: number;

  unitCost: number;
  deliveryValue: number;

  source:
    | "manual"
    | "camera"
    | "bluetooth"
    | "usb"
    | "esp32";

  notes: string | null;
  receivedAt: string;
}