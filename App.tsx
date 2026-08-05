import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ProductCard } from "./src/components/ProductCard";
import { getAllProducts } from "./src/database/productRepository";
import { initializeDatabase } from "./src/database/schema";
import { seedDatabase } from "./src/database/seed";
import type { Product } from "./src/types/product";

type AppStatus = "loading" | "ready" | "error";

export default function App() {
  const [status, setStatus] = useState<AppStatus>("loading");
  const [products, setProducts] = useState<Product[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

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
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>
              Try again
            </Text>
          </Pressable>

          <StatusBar style="auto" />
        </View>
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
            <Text style={styles.title}>
              SmartStock Inventory
            </Text>

            <Text style={styles.summary}>
              {products.length} active products
            </Text>
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
  title: {
    fontSize: 30,
    fontWeight: "800",
  },
  summary: {
    marginTop: 4,
    fontSize: 15,
    color: "#5D6673",
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
  retryButton: {
    marginTop: 18,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#20252B",
  },
  retryButtonText: {
    fontWeight: "700",
    color: "#FFFFFF",
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