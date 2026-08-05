import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getProductCount } from "./src/database/productRepository";
import { initializeDatabase } from "./src/database/schema";
import { seedDatabase } from "./src/database/seed";

type AppStatus = "loading" | "ready" | "error";

export default function App() {
  const [status, setStatus] = useState<AppStatus>("loading");
  const [productCount, setProductCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function prepareApp(): Promise<void> {
      try {
        await initializeDatabase();
        await seedDatabase();

        const totalProducts = await getProductCount();

        setProductCount(totalProducts);
        setStatus("ready");
      } catch (error) {
        console.error("Application initialization failed:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "An unexpected initialization error occurred.",
        );

        setStatus("error");
      }
    }

    void prepareApp();
  }, []);

  if (status === "loading") {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" />

          <Text style={styles.statusText}>
            Preparing SmartStock database…
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
            Database initialization failed
          </Text>

          <Text style={styles.errorMessage}>
            {errorMessage}
          </Text>

          <StatusBar style="auto" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>SmartStock Analytics</Text>

        <Text style={styles.subtitle}>
          Inventory scanning and retail analytics platform
        </Text>

        <View style={styles.statusCard}>
          <Text style={styles.successText}>
            Database connected successfully
          </Text>

          <Text style={styles.productCount}>
            {productCount} sample products stored
          </Text>
        </View>

        <Text style={styles.nextStep}>
          Next milestone: display the product inventory
        </Text>

        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },
  statusCard: {
    marginTop: 36,
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  successText: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  productCount: {
    marginTop: 10,
    fontSize: 15,
    textAlign: "center",
  },
  nextStep: {
    marginTop: 28,
    fontSize: 14,
    textAlign: "center",
  },
  statusText: {
    marginTop: 14,
    fontSize: 16,
    textAlign: "center",
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
  },
});