import { StatusBar } from "expo-status-bar";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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

import { BarcodeScanner } from "./src/components/BarcodeScanner";
import { InventoryToolbar } from "./src/components/InventoryToolbar";
import { InventoryTransactionForm } from "./src/components/InventoryTransactionForm";
import { ProductCard } from "./src/components/ProductCard";
import { ProductForm } from "./src/components/ProductForm";
import { ProductTransactionHistory } from "./src/components/ProductTransactionHistory";

import {
  createInventoryTransaction,
  getLatestDeliveriesByProduct,
  getTransactionHistoryForProduct,
} from "./src/database/inventoryTransactionRepository";

import {
  createProduct,
  getAllProducts,
  getProductByBarcode,
} from "./src/database/productRepository";

import { initializeDatabase } from "./src/database/schema";
import { seedDatabase } from "./src/database/seed";

import type { CreateInventoryTransactionInput } from "./src/types/inventoryTransaction";
import {
  DEFAULT_INVENTORY_FILTERS,
  type InventoryFilterState,
} from "./src/types/inventoryFilter";
import type { Product } from "./src/types/product";
import type { ProductDeliverySummary } from "./src/types/productDelivery";
import type { ProductFormValues } from "./src/types/productForm";
import type { TransactionHistoryItem } from "./src/types/transactionHistory";

type AppStatus = "loading" | "ready" | "error";

type AppView =
  | "inventory"
  | "add-product"
  | "scanner"
  | "inventory-transaction"
  | "transaction-history";

export default function App() {
  const [status, setStatus] =
    useState<AppStatus>("loading");

  const [currentView, setCurrentView] =
    useState<AppView>("inventory");

  const [products, setProducts] =
    useState<Product[]>([]);

  const [filters, setFilters] =
    useState<InventoryFilterState>(
      DEFAULT_INVENTORY_FILTERS,
    );

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [
    transactionHistory,
    setTransactionHistory,
  ] = useState<TransactionHistoryItem[]>([]);

  const [
    latestDeliveries,
    setLatestDeliveries,
  ] = useState<
    Map<number, ProductDeliverySummary>
  >(new Map());

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    isTransactionSubmitting,
    setIsTransactionSubmitting,
  ] = useState(false);

  const [isHistoryLoading, setIsHistoryLoading] =
    useState(false);

  const [scannedBarcode, setScannedBarcode] =
    useState("");

  const visibleProducts = useMemo(() => {
    const normalizedSearch =
      filters.searchQuery.trim().toLowerCase();

    const filteredProducts = products.filter(
      (product) => {
        const matchesSearch =
          normalizedSearch === "" ||
          product.name
            .toLowerCase()
            .includes(normalizedSearch) ||
          product.brand
            .toLowerCase()
            .includes(normalizedSearch) ||
          product.barcode
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesDepartment =
          filters.department === "all" ||
          product.department === filters.department;

        const matchesLowStock =
          !filters.lowStockOnly ||
          product.currentStock <=
            product.reorderLevel;

        return (
          matchesSearch &&
          matchesDepartment &&
          matchesLowStock
        );
      },
    );

    return [...filteredProducts].sort(
      (firstProduct, secondProduct) => {
        switch (filters.sortBy) {
          case "name-desc":
            return secondProduct.name.localeCompare(
              firstProduct.name,
            );

          case "stock-asc":
            return (
              firstProduct.currentStock -
              secondProduct.currentStock
            );

          case "stock-desc":
            return (
              secondProduct.currentStock -
              firstProduct.currentStock
            );

          case "price-asc":
            return (
              firstProduct.unitPrice -
              secondProduct.unitPrice
            );

          case "price-desc":
            return (
              secondProduct.unitPrice -
              firstProduct.unitPrice
            );

          case "name-asc":
          default:
            return firstProduct.name.localeCompare(
              secondProduct.name,
            );
        }
      },
    );
  }, [filters, products]);

  const loadInventoryData = useCallback(
    async (): Promise<void> => {
      const [
        storedProducts,
        deliveryMap,
      ] = await Promise.all([
        getAllProducts(),
        getLatestDeliveriesByProduct(),
      ]);

      setProducts(storedProducts);
      setLatestDeliveries(deliveryMap);
    },
    [],
  );

  const loadProducts = useCallback(
    async (
      isPullToRefresh = false,
    ): Promise<void> => {
      try {
        if (isPullToRefresh) {
          setIsRefreshing(true);
        } else {
          setStatus("loading");
        }

        setErrorMessage("");

        await initializeDatabase();
        await seedDatabase();
        await loadInventoryData();

        setStatus("ready");
      } catch (error) {
        console.error(
          "Could not load inventory:",
          error,
        );

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
    [loadInventoryData],
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
        department:
          values.department as Product["department"],
        category:
          values.category as Product["category"],
        brand: values.brand,
        unitCost: Number(values.unitCost),
        unitPrice: Number(values.unitPrice),
        currentStock: Number(
          values.currentStock,
        ),
        reorderLevel: Number(
          values.reorderLevel,
        ),
      });

      await loadInventoryData();

      setScannedBarcode("");
      setCurrentView("inventory");

      Alert.alert(
        "Product saved",
        `${values.name.trim()} was added successfully.`,
      );
    } catch (error) {
      console.error(
        "Could not create product:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "The product could not be saved.";

      const isDuplicateBarcode =
        message
          .toLowerCase()
          .includes("unique") ||
        message
          .toLowerCase()
          .includes("constraint");

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

  async function handleBarcodeDetected(
    barcode: string,
  ): Promise<void> {
    try {
      const existingProduct =
        await getProductByBarcode(barcode);

      if (existingProduct) {
        setCurrentView("inventory");

        Alert.alert(
          "Product found",
          `${existingProduct.name}\n\n` +
            `Brand: ${existingProduct.brand}\n` +
            `Stock: ${existingProduct.currentStock} units\n` +
            `Barcode: ${existingProduct.barcode}`,
        );

        return;
      }

      setScannedBarcode(barcode);
      setCurrentView("add-product");
    } catch (error) {
      console.error(
        "Could not look up barcode:",
        error,
      );

      Alert.alert(
        "Barcode lookup failed",
        error instanceof Error
          ? error.message
          : "The barcode could not be processed.",
      );
    }
  }

  function openTransactionForm(
    product: Product,
  ): void {
    setSelectedProduct(product);
    setCurrentView("inventory-transaction");
  }

  function closeTransactionForm(): void {
    setSelectedProduct(null);
    setCurrentView("inventory");
  }

  async function handleInventoryTransaction(
    input: CreateInventoryTransactionInput,
  ): Promise<void> {
    try {
      setIsTransactionSubmitting(true);

      const transaction =
        await createInventoryTransaction(input);

      await loadInventoryData();

      setSelectedProduct(null);
      setCurrentView("inventory");

      Alert.alert(
        "Inventory updated",
        `Stock changed from ${transaction.stockBefore} to ${transaction.stockAfter} units.`,
      );
    } catch (error) {
      console.error(
        "Could not save inventory transaction:",
        error,
      );

      Alert.alert(
        "Could not update inventory",
        error instanceof Error
          ? error.message
          : "The inventory transaction could not be saved.",
      );
    } finally {
      setIsTransactionSubmitting(false);
    }
  }

  async function openTransactionHistory(
    product: Product,
  ): Promise<void> {
    try {
      setSelectedProduct(product);
      setTransactionHistory([]);
      setIsHistoryLoading(true);
      setCurrentView("transaction-history");

      const history =
        await getTransactionHistoryForProduct(
          product.id,
        );

      setTransactionHistory(history);
    } catch (error) {
      console.error(
        "Could not load transaction history:",
        error,
      );

      setCurrentView("inventory");
      setSelectedProduct(null);

      Alert.alert(
        "Could not load history",
        error instanceof Error
          ? error.message
          : "Transaction history could not be loaded.",
      );
    } finally {
      setIsHistoryLoading(false);
    }
  }

  function closeTransactionHistory(): void {
    setTransactionHistory([]);
    setSelectedProduct(null);
    setCurrentView("inventory");
  }

  function openManualProductForm(): void {
    setScannedBarcode("");
    setCurrentView("add-product");
  }

  function closeProductForm(): void {
    setScannedBarcode("");
    setCurrentView("inventory");
  }

  function clearInventoryFilters(): void {
    setFilters(DEFAULT_INVENTORY_FILTERS);
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

  if (currentView === "scanner") {
    return (
      <BarcodeScanner
        onBarcodeDetected={
          handleBarcodeDetected
        }
        onClose={() =>
          setCurrentView("inventory")
        }
      />
    );
  }

  if (
    currentView ===
    "inventory-transaction"
  ) {
    if (!selectedProduct) {
      return (
        <SafeAreaView style={styles.screen}>
          <View
            style={styles.centeredContainer}
          >
            <Text style={styles.errorTitle}>
              Product not selected
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setCurrentView("inventory")
              }
              style={styles.primaryButton}
            >
              <Text
                style={styles.primaryButtonText}
              >
                Return to inventory
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <InventoryTransactionForm
        product={selectedProduct}
        isSubmitting={
          isTransactionSubmitting
        }
        onCancel={closeTransactionForm}
        onSubmit={
          handleInventoryTransaction
        }
      />
    );
  }

  if (currentView === "transaction-history") {
    if (!selectedProduct) {
      return (
        <SafeAreaView style={styles.screen}>
          <View
            style={styles.centeredContainer}
          >
            <Text style={styles.errorTitle}>
              Product not selected
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setCurrentView("inventory")
              }
              style={styles.primaryButton}
            >
              <Text
                style={styles.primaryButtonText}
              >
                Return to inventory
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    if (isHistoryLoading) {
      return (
        <SafeAreaView style={styles.screen}>
          <View
            style={styles.centeredContainer}
          >
            <ActivityIndicator size="large" />

            <Text style={styles.statusText}>
              Loading transaction history…
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <ProductTransactionHistory
        productName={selectedProduct.name}
        currentStock={
          selectedProduct.currentStock
        }
        transactions={transactionHistory}
        onClose={closeTransactionHistory}
      />
    );
  }

  if (currentView === "add-product") {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            onPress={closeProductForm}
            style={styles.secondaryButton}
          >
            <Text
              style={styles.secondaryButtonText}
            >
              Cancel
            </Text>
          </Pressable>
        </View>

        <ProductForm
          initialBarcode={scannedBarcode}
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
        data={visibleProducts}
        keyExtractor={(product) =>
          product.id.toString()
        }
        contentContainerStyle={
          styles.listContent
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            latestDelivery={
              latestDeliveries.get(item.id)
            }
            onUpdateInventory={
              openTransactionForm
            }
            onViewHistory={(product) =>
              void openTransactionHistory(product)
            }
          />
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <View
                  style={
                    styles.headerTextContainer
                  }
                >
                  <Text style={styles.title}>
                    SmartStock Inventory
                  </Text>

                  <Text style={styles.summary}>
                    {products.length} active products
                  </Text>
                </View>

                <View
                  style={styles.headerActions}
                >
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      setCurrentView("scanner")
                    }
                    style={styles.scanButton}
                  >
                    <Text
                      style={
                        styles.scanButtonText
                      }
                    >
                      Scan Barcode
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    onPress={
                      openManualProductForm
                    }
                    style={styles.addButton}
                  >
                    <Text
                      style={
                        styles.addButtonText
                      }
                    >
                      Add Product
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <InventoryToolbar
              filters={filters}
              resultCount={visibleProducts.length}
              totalCount={products.length}
              onFiltersChange={setFilters}
              onClearFilters={clearInventoryFilters}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {products.length === 0
                ? "No products found"
                : "No matching products"}
            </Text>

            <Text style={styles.statusText}>
              {products.length === 0
                ? "Add a product to begin tracking inventory."
                : "Try changing or clearing your inventory filters."}
            </Text>

            {products.length === 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={
                  openManualProductForm
                }
                style={styles.primaryButton}
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Add first product
                </Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={clearInventoryFilters}
                style={styles.primaryButton}
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Clear filters
                </Text>
              </Pressable>
            )}
          </View>
        }
        refreshing={isRefreshing}
        onRefresh={() =>
          void loadProducts(true)
        }
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
  headerActions: {
    alignItems: "flex-end",
    gap: 8,
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
  scanButton: {
    borderWidth: 1,
    borderColor: "#20252B",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#20252B",
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