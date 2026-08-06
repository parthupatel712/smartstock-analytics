import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
  onUpdateInventory: (product: Product) => void;
  onViewHistory: (product: Product) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value);
}

export function ProductCard({
  product,
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