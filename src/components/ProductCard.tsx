import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { ProductDeliverySummary } from "../types/productDelivery";
import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
  latestDelivery?: ProductDeliverySummary;
  onUpdateInventory: (product: Product) => void;
  onViewHistory: (product: Product) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value);
}

function formatDeliveryDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDeliverySource(
  source: ProductDeliverySummary["source"],
): string {
  switch (source) {
    case "camera":
      return "Camera scanner";

    case "bluetooth":
      return "Bluetooth scanner";

    case "usb":
      return "USB scanner";

    case "esp32":
      return "ESP32 scanner";

    case "manual":
    default:
      return "Manual entry";
  }
}

export function ProductCard({
  product,
  latestDelivery,
  onUpdateInventory,
  onViewHistory,
}: ProductCardProps) {
  const isLowStock =
    product.currentStock <= product.reorderLevel;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>
            {product.name}
          </Text>

          <Text style={styles.brand}>
            {product.brand}
          </Text>

          <Text style={styles.taxonomy}>
            {product.department} · {product.category}
          </Text>
        </View>

        <View
          style={[
            styles.stockBadge,
            isLowStock && styles.lowStockBadge,
          ]}
        >
          <Text style={styles.stockText}>
            {product.currentStock} units
          </Text>
        </View>
      </View>

      <Text style={styles.barcode}>
        Barcode: {product.barcode}
      </Text>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>
          Selling price
        </Text>

        <Text style={styles.price}>
          {formatCurrency(product.unitPrice)}
        </Text>
      </View>

      {isLowStock ? (
        <Text style={styles.lowStockText}>
          Low stock — reorder level:{" "}
          {product.reorderLevel}
        </Text>
      ) : null}

      {latestDelivery ? (
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryHeaderRow}>
            <Text style={styles.deliveryTitle}>
              Last delivery received
            </Text>

            <View style={styles.deliveryQuantityBadge}>
              <Text style={styles.deliveryQuantityText}>
                +{latestDelivery.quantityReceived}
              </Text>
            </View>
          </View>

          <Text style={styles.deliveryDate}>
            {formatDeliveryDate(
              latestDelivery.receivedAt,
            )}
          </Text>

          <View style={styles.deliveryDetailsRow}>
            <View style={styles.deliveryDetail}>
              <Text style={styles.deliveryDetailLabel}>
                Stock
              </Text>

              <Text style={styles.deliveryDetailValue}>
                {latestDelivery.stockBefore} →{" "}
                {latestDelivery.stockAfter}
              </Text>
            </View>

            <View style={styles.deliveryDetail}>
              <Text style={styles.deliveryDetailLabel}>
                Value
              </Text>

              <Text style={styles.deliveryDetailValue}>
                {formatCurrency(
                  latestDelivery.deliveryValue,
                )}
              </Text>
            </View>
          </View>

          <Text style={styles.deliverySource}>
            Source:{" "}
            {formatDeliverySource(
              latestDelivery.source,
            )}
          </Text>

          {latestDelivery.notes ? (
            <View style={styles.deliveryNote}>
              <Text style={styles.deliveryNoteLabel}>
                Delivery note
              </Text>

              <Text style={styles.deliveryNoteText}>
                {latestDelivery.notes}
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.noDeliveryCard}>
          <Text style={styles.noDeliveryTitle}>
            No delivery recorded yet
          </Text>

          <Text style={styles.noDeliveryDescription}>
            A Stock In transaction will appear here.
          </Text>
        </View>
      )}

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onViewHistory(product)}
          style={({ pressed }) => [
            styles.secondaryActionButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.secondaryActionText}>
            View History
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => onUpdateInventory(product)}
          style={({ pressed }) => [
            styles.primaryActionButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryActionText}>
            Update Inventory
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D7DCE2",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  brand: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#20252B",
  },
  taxonomy: {
    marginTop: 3,
    fontSize: 13,
    color: "#5D6673",
  },
  stockBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#E8F5E9",
  },
  lowStockBadge: {
    backgroundColor: "#FFF3CD",
  },
  stockText: {
    fontSize: 13,
    fontWeight: "600",
  },
  barcode: {
    marginTop: 14,
    fontSize: 13,
    color: "#5D6673",
  },
  priceRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceLabel: {
    fontSize: 15,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
  },
  lowStockText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#8A5A00",
  },
  deliveryCard: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#CFE0D4",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#F2FAF4",
  },
  deliveryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deliveryTitle: {
    flex: 1,
    marginRight: 12,
    fontSize: 15,
    fontWeight: "800",
    color: "#14532D",
  },
  deliveryQuantityBadge: {
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#DCFCE7",
  },
  deliveryQuantityText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#15803D",
  },
  deliveryDate: {
    marginTop: 5,
    fontSize: 13,
    color: "#4B6352",
  },
  deliveryDetailsRow: {
    marginTop: 13,
    flexDirection: "row",
    gap: 14,
  },
  deliveryDetail: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  deliveryDetailLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#6B7280",
  },
  deliveryDetailValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "800",
    color: "#20252B",
  },
  deliverySource: {
    marginTop: 11,
    fontSize: 12,
    fontWeight: "600",
    color: "#4B6352",
  },
  deliveryNote: {
    marginTop: 11,
    borderRadius: 10,
    padding: 11,
    backgroundColor: "#FFF8E8",
  },
  deliveryNoteLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    color: "#8A5A00",
  },
  deliveryNoteText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#5F4300",
  },
  noDeliveryCard: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E2E6EA",
    borderRadius: 12,
    padding: 13,
    backgroundColor: "#F7F8FA",
  },
  noDeliveryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
  },
  noDeliveryDescription: {
    marginTop: 4,
    fontSize: 12,
    color: "#7A838E",
  },
  actionRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
  },
  secondaryActionButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#20252B",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  primaryActionButton: {
    flex: 1.25,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#20252B",
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#20252B",
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonPressed: {
    opacity: 0.78,
  },
});