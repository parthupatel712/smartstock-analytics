import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Product } from "../types/product";
import type { ProductDeliverySummary } from "../types/productDelivery";

interface ProductDetailsProps {
  product: Product;

  latestDelivery?: ProductDeliverySummary;

  onUpdateStock: (product: Product) => void;

  onViewHistory: (product: Product) => void;

  onEdit: (product: Product) => void;

  onArchive: (product: Product) => void;

  onClose: () => void;
}

export function ProductDetails({
  product,
  latestDelivery,
  onUpdateStock,
  onViewHistory,
  onEdit,
  onArchive,
  onClose,
}: ProductDetailsProps) {
  const estimatedProfitPerUnit =
    product.unitPrice -
    product.unitCost;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              {product.name}
            </Text>

            {product.brand.trim() ? (
              <Text style={styles.brand}>
                {product.brand}
              </Text>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Text style={styles.closeButtonText}>
              Close
            </Text>
          </Pressable>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>
            Current Stock
          </Text>

          <Text
            style={[
              styles.stockValue,

              product.currentStock === 0 &&
                styles.stockValueDanger,

              product.currentStock > 0 &&
                product.currentStock <=
                  product.reorderLevel &&
                styles.stockValueWarning,
            ]}
          >
            {product.currentStock}
          </Text>

          <Text style={styles.stockUnit}>
            units
          </Text>

          {product.currentStock === 0 ? (
            <Text style={styles.stockMessageDanger}>
              Out of stock
            </Text>
          ) : product.currentStock <=
            product.reorderLevel ? (
            <Text style={styles.stockMessageWarning}>
              Low stock
            </Text>
          ) : (
            <Text style={styles.stockMessageGood}>
              Stock level looks good
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Product Information
        </Text>

        <View style={styles.infoCard}>
          <InfoRow
            label="Barcode"
            value={product.barcode}
          />

          <InfoRow
            label="Department"
            value={product.department}
          />

          <InfoRow
            label="Category"
            value={product.category}
          />

          <InfoRow
            label="Unit Cost"
            value={formatCurrency(
              product.unitCost,
            )}
          />

          <InfoRow
            label="Selling Price"
            value={formatCurrency(
              product.unitPrice,
            )}
          />

          <InfoRow
            label="Estimated Profit / Unit"
            value={formatCurrency(
              estimatedProfitPerUnit,
            )}
          />

          <InfoRow
            label="Reorder Level"
            value={`${product.reorderLevel} units`}
            isLast
          />
        </View>

        {latestDelivery ? (
          <>
            <Text style={styles.sectionTitle}>
              Last Stock Added
            </Text>

            <View style={styles.deliveryCard}>
              <View style={styles.deliveryTopRow}>
                <View>
                  <Text style={styles.deliveryLabel}>
                    Added
                  </Text>

                  <Text style={styles.deliveryQuantity}>
                    +{latestDelivery.quantityReceived}
                  </Text>
                </View>

                <Text style={styles.deliveryDate}>
                  {formatDateTime(
                    latestDelivery.receivedAt,
                  )}
                </Text>
              </View>

              <View style={styles.deliveryMetrics}>
                <SmallMetric
                  label="Before"
                  value={latestDelivery.stockBefore.toString()}
                />

                <SmallMetric
                  label="After"
                  value={latestDelivery.stockAfter.toString()}
                />

                <SmallMetric
                  label="Value"
                  value={formatCurrency(
                    latestDelivery.deliveryValue,
                  )}
                />
              </View>
            </View>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>
          What do you want to do?
        </Text>

        <View style={styles.actions}>
          <ActionButton
            label="Update Stock"
            description="Sale, stock added, damaged item, return or stock count"
            onPress={() =>
              onUpdateStock(product)
            }
          />

          <ActionButton
            label="Stock History"
            description="See all stock changes for this product"
            onPress={() =>
              onViewHistory(product)
            }
          />

          <ActionButton
            label="Edit Product"
            description="Change product details, price or reorder level"
            onPress={() =>
              onEdit(product)
            }
          />

          <ActionButton
            label="Hide Product"
            description="Remove this product from active inventory"
            onPress={() =>
              onArchive(product)
            }
            danger
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        isLast &&
          styles.infoRowLast,
      ]}
    >
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text
        style={styles.infoValue}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.smallMetric}>
      <Text style={styles.smallMetricLabel}>
        {label}
      </Text>

      <Text style={styles.smallMetricValue}>
        {value}
      </Text>
    </View>
  );
}

function ActionButton({
  label,
  description,
  onPress,
  danger = false,
}: {
  label: string;
  description: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,

        danger &&
          styles.actionButtonDanger,

        pressed &&
          styles.buttonPressed,
      ]}
    >
      <View style={styles.actionText}>
        <Text
          style={[
            styles.actionLabel,

            danger &&
              styles.actionLabelDanger,
          ]}
        >
          {label}
        </Text>

        <Text style={styles.actionDescription}>
          {description}
        </Text>
      </View>

      <Text
        style={[
          styles.actionArrow,

          danger &&
            styles.actionArrowDanger,
        ]}
      >
        ›
      </Text>
    </Pressable>
  );
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-CA",
    {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-CA",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },

  content: {
    padding: 18,
    paddingBottom: 48,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  headerText: {
    flex: 1,
    marginRight: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },

  brand: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },

  closeButton: {
    borderWidth: 1,
    borderColor: "#CBD2DA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
  },

  closeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#20252B",
  },

  buttonPressed: {
    opacity: 0.7,
  },

  statusCard: {
    marginTop: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E4E8",
    borderRadius: 18,
    padding: 22,
    backgroundColor: "#FFFFFF",
  },

  statusLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#6B7280",
  },

  stockValue: {
    marginTop: 6,
    fontSize: 44,
    fontWeight: "800",
    color: "#15803D",
  },

  stockValueWarning: {
    color: "#B45309",
  },

  stockValueDanger: {
    color: "#B42318",
  },

  stockUnit: {
    fontSize: 13,
    color: "#6B7280",
  },

  stockMessageGood: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#15803D",
  },

  stockMessageWarning: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#B45309",
  },

  stockMessageDanger: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#B42318",
  },

  sectionTitle: {
    marginTop: 26,
    marginBottom: 10,
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },

  infoCard: {
    borderWidth: 1,
    borderColor: "#E0E4E8",
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },

  infoRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F2",
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  infoLabel: {
    flex: 1,
    marginRight: 14,
    fontSize: 13,
    color: "#6B7280",
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
    color: "#111827",
  },

  deliveryCard: {
    borderWidth: 1,
    borderColor: "#E0E4E8",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },

  deliveryTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  deliveryLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#6B7280",
  },

  deliveryQuantity: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "800",
    color: "#15803D",
  },

  deliveryDate: {
    fontSize: 11,
    color: "#6B7280",
  },

  deliveryMetrics: {
    marginTop: 15,
    flexDirection: "row",
    gap: 12,
  },

  smallMetric: {
    flex: 1,
  },

  smallMetricLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#8B949E",
  },

  smallMetricValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },

  actions: {
    gap: 10,
  },

  actionButton: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E4E8",
    borderRadius: 15,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
  },

  actionButtonDanger: {
    borderColor: "#FECACA",
  },

  actionText: {
    flex: 1,
    marginRight: 12,
  },

  actionLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  actionLabelDanger: {
    color: "#B42318",
  },

  actionDescription: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: "#6B7280",
  },

  actionArrow: {
    fontSize: 28,
    color: "#9CA3AF",
  },

  actionArrowDanger: {
    color: "#B42318",
  },
});