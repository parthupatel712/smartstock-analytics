import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ProductCard } from "./src/components/ProductCard";
import { ProductForm } from "./src/components/ProductForm";
import {
  createProduct,
  getAllProducts,
} from "./src/database/productRepository";
import { initializeDatabase } from "./src/database/schema";
import { seedDatabase } from "./src/database/seed";
import type { Product } from "./src/types/product";
import type { ProductFormValues } from "./src/types/productForm";

type AppStatus = "loading" | "ready" | "error";
type AppView = "inventory" | "add-product";

export default function App() {
  const [status, setStatus] = useState<AppStatus>("loading");
  const [currentView, setCurrentView] =
    useState<AppView>("inventory");

  const [products, setProducts] = useState<Product[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProducts = useCallback(
    async (isPullToRefresh = false): Promise<void> => {
      try {
        if (isPullToRefresh) {
          setIsRefreshing(true);
        } else {
          setStatus("loading");
        }

        setErrorMessage("");

        await initializeDatabase();
        await seedDatabase();

        const storedProducts = await getAllProducts();

        setProducts(storedProducts);
        setStatus("ready");
      } catch (error) {
        console.error("Could not load inventory:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "An unexpected inventory error occurred.",
        );

        setStatus("error");
      } finally {
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  async function handleCreateProduct(
    values: ProductFormValues,
  ): Promise<void> {
    try {
      setIsSubmitting(true);

      await createProduct({
  barcode: values.barcode,
  name: values.name,
  department: values.department as Product["department"],
  category: values.category as Product["category"],
  brand: values.brand,
  unitCost: Number(values.unitCost),
  unitPrice: Number(values.unitPrice),
  currentStock: Number(values.currentStock),
  reorderLevel: Number(values.reorderLevel),
});

      const updatedProducts = await getAllProducts();

      setProducts(updatedProducts);
      setCurrentView("inventory");

      Alert.alert(
        "Product saved",
        `${values.name.trim()} was added successfully.`,
      );
    } catch (error) {
      console.error("Could not create product:", error);

      const message =
        error instanceof Error
          ? error.message
          : "The product could not be saved.";

      const isDuplicateBarcode =
        message.toLowerCase().includes("unique") ||
        message.toLowerCase().includes("constraint");

      Alert.alert(
        isDuplicateBarcode
          ? "Barcode already exists"
          : "Could not save product",
        isDuplicateBarcode
          ? "Another active product already uses this barcode."
          : message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" />

          <Text style={styles.statusText}>
            Loading inventory…
          </Text>

          <StatusBar style="auto" />
        </View>
      </SafeAreaView>
    );
  }

  if (status === "error") {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorTitle}>
            Could not load inventory
          </Text>

          <Text style={styles.errorMessage}>
            {errorMessage}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => void loadProducts()}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              Try again
            </Text>
          </Pressable>

          <StatusBar style="auto" />
        </View>
      </SafeAreaView>
    );
  }

  if (currentView === "add-product") {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setCurrentView("inventory")}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              Cancel
            </Text>
          </Pressable>
        </View>

        <ProductForm
          isSubmitting={isSubmitting}
          onSubmit={handleCreateProduct}
        />

        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={products}
        keyExtractor={(product) => product.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProductCard product={item} />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>
                  SmartStock Inventory
                </Text>

                <Text style={styles.summary}>
                  {products.length} active products
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setCurrentView("add-product")
                }
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>
                  Add Product
                </Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No products found
            </Text>

            <Text style={styles.statusText}>
              Add a product to begin tracking inventory.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setCurrentView("add-product")
              }
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                Add first product
              </Text>
            </Pressable>
          </View>
        }
        refreshing={isRefreshing}
        onRefresh={() => void loadProducts(true)}
      />

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
  },
  summary: {
    marginTop: 4,
    fontSize: 15,
    color: "#5D6673",
  },
  topBar: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  addButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#20252B",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  statusText: {
    marginTop: 10,
    fontSize: 15,
    textAlign: "center",
    color: "#5D6673",
  },
  errorTitle: {
    fontSize: 21,
    fontWeight: "700",
    textAlign: "center",
  },
  errorMessage: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#5D6673",
  },
  primaryButton: {
    marginTop: 18,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingHorizontal: 18,
    backgroundColor: "#20252B",
  },
  primaryButtonText: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#C8CED6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    fontWeight: "700",
    color: "#20252B",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
});