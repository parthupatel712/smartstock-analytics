import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Product } from "../types/product";

interface ArchivedProductsProps {
  products: Product[];
  onRestore: (product: Product) => void;
  onClose: () => void;
}

export function ArchivedProducts({
  products,
  onRestore,
  onClose,
}: ArchivedProductsProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={products}
        keyExtractor={(product) =>
          product.id.toString()
        }
        contentContainerStyle={
          styles.content
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>
                Archived Products
              </Text>

              <Text style={styles.subtitle}>
                {products.length} archived product
                {products.length === 1 ? "" : "s"}
              </Text>
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
        }
        renderItem={({ item }) => (
          <ArchivedProductCard
            product={item}
            onRestore={() =>
              onRestore(item)
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="archive-outline"
              size={42}
              color="#9CA3AF"
            />

            <Text style={styles.emptyTitle}>
              No archived products
            </Text>

            <Text style={styles.emptyText}>
              Products you archive will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function ArchivedProductCard({
  product,
  onRestore,
}: {
  product: Product;
  onRestore: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTextContainer}>
          <Text style={styles.productName}>
            {product.name}
          </Text>

         {product.brand.trim() ? (
  <Text style={styles.productMeta}>
    {product.brand}
  </Text>
) : null}

          <Text style={styles.productMeta}>
            {product.department} · {product.category}
          </Text>
        </View>

        <View style={styles.archivedBadge}>
          <Text style={styles.archivedBadgeText}>
            Archived
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <DetailRow
          label="Barcode"
          value={product.barcode}
        />

        <DetailRow
          label="Stock"
          value={`${product.currentStock} units`}
        />

        <DetailRow
          label="Selling price"
          value={formatCurrency(product.unitPrice)}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Restore product"
        onPress={onRestore}
        style={({ pressed }) => [
          styles.restoreButton,
          pressed &&
            styles.restoreButtonPressed,
        ]}
      >
        <Ionicons
          name="arrow-undo-outline"
          size={19}
          color="#15803D"
        />

        <Text style={styles.restoreButtonText}>
          Restore Product
        </Text>
      </Pressable>
    </View>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(value);
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

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  headerTextContainer: {
    flex: 1,
    marginRight: 16,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
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
    opacity: 0.72,
  },

  card: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E0E4E8",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  cardTextContainer: {
    flex: 1,
    marginRight: 12,
  },

  productName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  productMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },

  archivedBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#F3F4F6",
  },

  archivedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
  },

  details: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEF0F2",
    paddingTop: 8,
  },

  detailRow: {
    minHeight: 31,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  detailLabel: {
    fontSize: 13,
    color: "#6B7280",
  },

  detailValue: {
    marginLeft: 14,
    fontSize: 13,
    fontWeight: "700",
    color: "#20252B",
  },

  restoreButton: {
    marginTop: 14,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12,
    backgroundColor: "#ECFDF3",
  },

  restoreButtonPressed: {
    backgroundColor: "#D1FAE5",
  },

  restoreButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#15803D",
  },

  emptyContainer: {
    paddingVertical: 80,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
  },
});