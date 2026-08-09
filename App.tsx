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
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ArchivedProducts } from "./src/components/ArchivedProducts";
import { BarcodeScanner } from "./src/components/BarcodeScanner";
import { EditProductForm } from "./src/components/EditProductForm";
import { ExportReports } from "./src/components/ExportReports";
import { GlobalTransactions } from "./src/components/GlobalTransactions";
import { InventoryAnalytics } from "./src/components/InventoryAnalytics";
import { InventoryDashboard } from "./src/components/InventoryDashboard";
import { InventoryToolbar } from "./src/components/InventoryToolbar";
import { InventoryTransactionForm } from "./src/components/InventoryTransactionForm";
import { ProductCard } from "./src/components/ProductCard";
import { ProductForm } from "./src/components/ProductForm";
import { ProductTransactionHistory } from "./src/components/ProductTransactionHistory";
import { ProductDetails } from "./src/components/ProductDetails";

import { getInventoryAnalyticsSummary } from "./src/database/inventoryAnalyticsRepository";
import {
  getDashboardRecentActivity,
  getInventoryDashboardSummary,
} from "./src/database/inventoryDashboardRepository";
import {
  createInventoryTransaction,
  getGlobalTransactions,
  getLatestDeliveriesByProduct,
  getTransactionHistoryForProduct,
} from "./src/database/inventoryTransactionRepository";
import {
  archiveProduct,
  createProduct,
  getAllProducts,
  getArchivedProducts,
  getProductByBarcode,
  restoreProduct,
  updateProduct,
} from "./src/database/productRepository";
import { initializeDatabase } from "./src/database/schema";
//import { seedDatabase } from "./src/database/seed";

import {
  exportAnalyticsCsv,
  exportInventoryCsv,
  exportTransactionsCsv,
} from "./src/services/csvExportService";
import {
  exportAnalyticsExcel,
  exportInventoryExcel,
  exportTransactionsExcel,
} from "./src/services/excelExportService";
import {
  exportAnalyticsPdf,
  exportInventoryPdf,
  exportTransactionsPdf,
} from "./src/services/pdfExportService";
import { shareExportedReport } from "./src/services/reportSharingService";

import {
  DEFAULT_ANALYTICS_PERIOD,
  type AnalyticsPeriodDays,
} from "./src/types/analyticsPeriod";
import type { DashboardRecentActivity } from "./src/types/dashboardRecentActivity";
import type {
  ExportedReport,
  ExportFileFormat,
  ExportReportType,
} from "./src/types/exportReport";
import type { GlobalTransaction } from "./src/types/globalTransaction";
import type { InventoryAnalyticsSummary } from "./src/types/inventoryAnalytics";
import type { InventoryDashboardSummary } from "./src/types/inventoryDashboard";
import {
  DEFAULT_INVENTORY_FILTERS,
  type InventoryFilterState,
} from "./src/types/inventoryFilter";
import type { CreateInventoryTransactionInput } from "./src/types/inventoryTransaction";
import type { Product } from "./src/types/product";
import type { ProductDeliverySummary } from "./src/types/productDelivery";
import type { ProductFormValues } from "./src/types/productForm";
import type { UpdateProductInput } from "./src/types/productUpdate";
import type { TransactionHistoryItem } from "./src/types/transactionHistory";

type AppStatus =
  | "loading"
  | "ready"
  | "error";

type AppView =
  | "inventory"
  | "add-product"
  | "edit-product"
  | "scanner"
  | "inventory-transaction"
  | "transaction-history"
  | "global-transactions"
  | "dashboard"
  | "analytics"
  | "export-reports"
  | "archived-products"
  | "product-details";

const INITIAL_DASHBOARD_SUMMARY: InventoryDashboardSummary = {
  totalProducts: 0,
  totalStockUnits: 0,
  totalInventoryCostValue: 0,
  totalInventoryRetailValue: 0,
  potentialGrossProfit: 0,
  lowStockProductCount: 0,
  outOfStockProductCount: 0,
  recentSalesValue: 0,
  recentStockInValue: 0,
  recentDamageValue: 0,
  recentTransactionCount: 0,
};

const INITIAL_ANALYTICS_SUMMARY: InventoryAnalyticsSummary = {
  dailyMetrics: [],
  topProducts: [],
  topCategories: [],

  comparison: {
    current: {
      salesValue: 0,
      estimatedProfit: 0,
      salesUnits: 0,
      stockInValue: 0,
      stockInUnits: 0,
      damageValue: 0,
      damageUnits: 0,
      transactionCount: 0,
    },

    previous: {
      salesValue: 0,
      estimatedProfit: 0,
      salesUnits: 0,
      stockInValue: 0,
      stockInUnits: 0,
      damageValue: 0,
      damageUnits: 0,
      transactionCount: 0,
    },

    salesValueChangePercent: 0,
    salesUnitsChangePercent: 0,
    estimatedProfitChangePercent: 0,
    stockInUnitsChangePercent: 0,
    damageValueChangePercent: 0,
  },

  productTrends: [],
};

export default function App() {
  const [status, setStatus] =
    useState<AppStatus>("loading");

  const [currentView, setCurrentView] =
    useState<AppView>("inventory");

  const [products, setProducts] =
    useState<Product[]>([]);

  const [
    archivedProducts,
    setArchivedProducts,
  ] = useState<Product[]>([]);

  const [
    globalTransactions,
    setGlobalTransactions,
  ] = useState<GlobalTransaction[]>([]);

  const [filters, setFilters] =
    useState<InventoryFilterState>(
      DEFAULT_INVENTORY_FILTERS,
    );

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<Product | null>(null);

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

  const [
    dashboardSummary,
    setDashboardSummary,
  ] = useState<InventoryDashboardSummary>(
    INITIAL_DASHBOARD_SUMMARY,
  );

  const [
    dashboardRecentActivity,
    setDashboardRecentActivity,
  ] = useState<DashboardRecentActivity[]>([]);

  const [
    analyticsSummary,
    setAnalyticsSummary,
  ] = useState<InventoryAnalyticsSummary>(
    INITIAL_ANALYTICS_SUMMARY,
  );

  const [
    analyticsPeriod,
    setAnalyticsPeriod,
  ] = useState<AnalyticsPeriodDays>(
    DEFAULT_ANALYTICS_PERIOD,
  );

  const [
    selectedExportReportType,
    setSelectedExportReportType,
  ] = useState<ExportReportType>(
    "inventory",
  );

  const [
    selectedExportFormat,
    setSelectedExportFormat,
  ] = useState<ExportFileFormat>(
    "csv",
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    isProductUpdating,
    setIsProductUpdating,
  ] = useState(false);

  const [
    isTransactionSubmitting,
    setIsTransactionSubmitting,
  ] = useState(false);

  const [
    isHistoryLoading,
    setIsHistoryLoading,
  ] = useState(false);

  const [
    isDashboardLoading,
    setIsDashboardLoading,
  ] = useState(false);

  const [
    isAnalyticsLoading,
    setIsAnalyticsLoading,
  ] = useState(false);

  const [
    isArchivedProductsLoading,
    setIsArchivedProductsLoading,
  ] = useState(false);

  const [
    isGlobalTransactionsLoading,
    setIsGlobalTransactionsLoading,
  ] = useState(false);

  const [
    isExporting,
    setIsExporting,
  ] = useState(false);

  const [
    scannedBarcode,
    setScannedBarcode,
  ] = useState("");

  

  const visibleProducts = useMemo(() => {
    const normalizedSearch =
      filters.searchQuery
        .trim()
        .toLowerCase();

    const filteredProducts =
      products.filter((product) => {
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
          product.department ===
            filters.department;

        const matchesLowStock =
          !filters.lowStockOnly ||
          product.currentStock <=
            product.reorderLevel;

        return (
          matchesSearch &&
          matchesDepartment &&
          matchesLowStock
        );
      });

    return [...filteredProducts].sort(
      (
        firstProduct,
        secondProduct,
      ) => {
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

  const loadInventoryData =
    useCallback(
      async (): Promise<void> => {
        const [
          storedProducts,
          deliveryMap,
          dashboard,
          recentActivity,
        ] = await Promise.all([
          getAllProducts(),
          getLatestDeliveriesByProduct(),
          getInventoryDashboardSummary(),
          getDashboardRecentActivity(8),
        ]);

        setProducts(
          storedProducts,
        );

        setLatestDeliveries(
          deliveryMap,
        );

        setDashboardSummary(
          dashboard,
        );

        setDashboardRecentActivity(
          recentActivity,
        );
      },
      [],
    );

  const loadProducts =
    useCallback(
      async (
        isPullToRefresh = false,
      ): Promise<void> => {
        try {
          if (isPullToRefresh) {
            setIsRefreshing(
              true,
            );
          } else {
            setStatus(
              "loading",
            );
          }

          setErrorMessage("");

          await initializeDatabase();
          //await seedDatabase();
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
          setIsRefreshing(
            false,
          );
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

    const openingStock =
      Number(
        values.currentStock,
      );

    const productId =
      await createProduct({
        barcode:
          values.barcode,

        name:
          values.name,

        department:
          values.department as Product["department"],

        category:
          values.category as Product["category"],

        brand:
          values.brand,

        unitCost:
          Number(
            values.unitCost,
          ),

        unitPrice:
          Number(
            values.unitPrice,
          ),

        /*
         * Important:
         *
         * New products always start
         * at zero here.
         *
         * Opening stock is recorded
         * below as a real stock
         * transaction.
         */
        currentStock: 0,

        reorderLevel:
          Number(
            values.reorderLevel,
          ),
      });

    /*
     * Record opening stock as an
     * actual Stock Added transaction.
     *
     * This makes it appear in:
     *
     * - Stock History
     * - Dashboard Recent Activity
     * - Latest Delivery
     */
    if (
      openingStock > 0
    ) {
      await createInventoryTransaction({
        productId,

        transactionType:
          "stock_in",

        quantity:
          openingStock,

        source:
          scannedBarcode
            ? "camera"
            : "manual",

        notes:
          "Opening stock",
      });
    }

    await loadInventoryData();

    setScannedBarcode("");

    setCurrentView(
      "inventory",
    );

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
        .includes("constraint") ||
      message
        .toLowerCase()
        .includes(
          "already uses this barcode",
        );

    Alert.alert(
      isDuplicateBarcode
        ? "Barcode already exists"
        : "Could not save product",

      isDuplicateBarcode
        ? "Another product already uses this barcode."
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
      await getProductByBarcode(
        barcode,
      );

    if (existingProduct) {
      setSelectedProduct(
        existingProduct,
      );

      setCurrentView(
        "product-details",
      );

      return;
    }

    setScannedBarcode(
      barcode,
    );

    setCurrentView(
      "add-product",
    );
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
  function openEditProduct(
    product: Product,
  ): void {
    setSelectedProduct(
      product,
    );

    setCurrentView(
      "edit-product",
    );
  }

  function closeEditProduct(): void {
    setSelectedProduct(
      null,
    );

    setCurrentView(
      "inventory",
    );
  }

  async function handleUpdateProduct(
    input: UpdateProductInput,
  ): Promise<void> {
    try {
      setIsProductUpdating(
        true,
      );

      await updateProduct(
        input,
      );

      await loadInventoryData();

      setSelectedProduct(
        null,
      );

      setCurrentView(
        "inventory",
      );

      Alert.alert(
        "Product updated",
        "The product details were updated successfully.",
      );
    } catch (error) {
      console.error(
        "Could not update product:",
        error,
      );

      Alert.alert(
        "Could not update product",

        error instanceof Error
          ? error.message
          : "The product could not be updated.",
      );
    } finally {
      setIsProductUpdating(
        false,
      );
    }
  }

  function confirmArchiveProduct(
    product: Product,
  ): void {
    Alert.alert(
      "Archive product?",
      `${product.name} will be removed from your active inventory.\n\nIts transaction history and analytics records will be preserved.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Archive",
          style: "destructive",

          onPress: () =>
            void handleArchiveProduct(
              product,
            ),
        },
      ],
    );
  }

  async function handleArchiveProduct(
    product: Product,
  ): Promise<void> {
    try {
      await archiveProduct(
        product.id,
      );

      await loadInventoryData();

      if (
        selectedProduct?.id ===
        product.id
      ) {
        setSelectedProduct(
          null,
        );
      }

      Alert.alert(
        "Product archived",
        `${product.name} was removed from active inventory.`,
      );
    } catch (error) {
      console.error(
        "Could not archive product:",
        error,
      );

      Alert.alert(
        "Could not archive product",

        error instanceof Error
          ? error.message
          : "The product could not be archived.",
      );
    }
  }

  async function openArchivedProducts(): Promise<void> {
    try {
      setIsArchivedProductsLoading(
        true,
      );

      setCurrentView(
        "archived-products",
      );

      const archived =
        await getArchivedProducts();

      setArchivedProducts(
        archived,
      );
    } catch (error) {
      console.error(
        "Could not load archived products:",
        error,
      );

      setCurrentView(
        "inventory",
      );

      Alert.alert(
        "Could not load archived products",

        error instanceof Error
          ? error.message
          : "Archived products could not be loaded.",
      );
    } finally {
      setIsArchivedProductsLoading(
        false,
      );
    }
  }

  function confirmRestoreProduct(
    product: Product,
  ): void {
    Alert.alert(
      "Restore product?",
      `${product.name} will be returned to active inventory.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Restore",

          onPress: () =>
            void handleRestoreProduct(
              product,
            ),
        },
      ],
    );
  }

  async function handleRestoreProduct(
    product: Product,
  ): Promise<void> {
    try {
      await restoreProduct(
        product.id,
      );

      const [
        refreshedArchivedProducts,
      ] = await Promise.all([
        getArchivedProducts(),
        loadInventoryData(),
      ]);

      setArchivedProducts(
        refreshedArchivedProducts,
      );

      Alert.alert(
        "Product restored",
        `${product.name} is active again.`,
      );
    } catch (error) {
      console.error(
        "Could not restore product:",
        error,
      );

      Alert.alert(
        "Could not restore product",

        error instanceof Error
          ? error.message
          : "The product could not be restored.",
      );
    }
  }

  async function openGlobalTransactions(): Promise<void> {
    try {
      setIsGlobalTransactionsLoading(
        true,
      );

      setCurrentView(
        "global-transactions",
      );

      const transactions =
        await getGlobalTransactions(
          500,
        );

      setGlobalTransactions(
        transactions,
      );
    } catch (error) {
      console.error(
        "Could not load global transactions:",
        error,
      );

      setCurrentView(
        "inventory",
      );

      Alert.alert(
        "Could not load transactions",

        error instanceof Error
          ? error.message
          : "Global transaction history could not be loaded.",
      );
    } finally {
      setIsGlobalTransactionsLoading(
        false,
      );
    }
  }

  function openTransactionForm(
    product: Product,
  ): void {
    setSelectedProduct(
      product,
    );

    setCurrentView(
      "inventory-transaction",
    );
  }

  function closeTransactionForm(): void {
    setSelectedProduct(
      null,
    );

    setCurrentView(
      "inventory",
    );
  }

  async function handleInventoryTransaction(
    input: CreateInventoryTransactionInput,
  ): Promise<void> {
    try {
      setIsTransactionSubmitting(
        true,
      );

      const transaction =
        await createInventoryTransaction(
          input,
        );

      await loadInventoryData();

      setSelectedProduct(
        null,
      );

      setCurrentView(
        "inventory",
      );

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
      setIsTransactionSubmitting(
        false,
      );
    }
  }

  async function openTransactionHistory(
    product: Product,
  ): Promise<void> {
    try {
      setSelectedProduct(
        product,
      );

      setTransactionHistory(
        [],
      );

      setIsHistoryLoading(
        true,
      );

      setCurrentView(
        "transaction-history",
      );

      const history =
        await getTransactionHistoryForProduct(
          product.id,
        );

      setTransactionHistory(
        history,
      );
    } catch (error) {
      console.error(
        "Could not load transaction history:",
        error,
      );

      setCurrentView(
        "inventory",
      );

      setSelectedProduct(
        null,
      );

      Alert.alert(
        "Could not load history",

        error instanceof Error
          ? error.message
          : "Transaction history could not be loaded.",
      );
    } finally {
      setIsHistoryLoading(
        false,
      );
    }
  }

  function closeTransactionHistory(): void {
    setTransactionHistory(
      [],
    );

    setSelectedProduct(
      null,
    );

    setCurrentView(
      "inventory",
    );
  }

  async function openDashboard(): Promise<void> {
    try {
      setIsDashboardLoading(
        true,
      );

      setCurrentView(
        "dashboard",
      );

      const [
        summary,
        recentActivity,
      ] = await Promise.all([
        getInventoryDashboardSummary(),
        getDashboardRecentActivity(8),
      ]);

      setDashboardSummary(
        summary,
      );

      setDashboardRecentActivity(
        recentActivity,
      );
    } catch (error) {
      console.error(
        "Could not load inventory dashboard:",
        error,
      );

      setCurrentView(
        "inventory",
      );

      Alert.alert(
        "Could not load dashboard",

        error instanceof Error
          ? error.message
          : "The dashboard could not be loaded.",
      );
    } finally {
      setIsDashboardLoading(
        false,
      );
    }
  }

  async function loadAnalytics(
    period: AnalyticsPeriodDays,
  ): Promise<void> {
    const summary =
      await getInventoryAnalyticsSummary(
        period,
        5,
      );

    setAnalyticsSummary(
      summary,
    );
  }

  async function openAnalytics(): Promise<void> {
    try {
      setIsAnalyticsLoading(
        true,
      );

      setCurrentView(
        "analytics",
      );

      await loadAnalytics(
        analyticsPeriod,
      );
    } catch (error) {
      console.error(
        "Could not load analytics:",
        error,
      );

      setCurrentView(
        "inventory",
      );

      Alert.alert(
        "Could not load analytics",

        error instanceof Error
          ? error.message
          : "Inventory analytics could not be loaded.",
      );
    } finally {
      setIsAnalyticsLoading(
        false,
      );
    }
  }

  async function handleAnalyticsPeriodChange(
    period: AnalyticsPeriodDays,
  ): Promise<void> {
    if (
      period === analyticsPeriod
    ) {
      return;
    }

    try {
      setAnalyticsPeriod(
        period,
      );

      setIsAnalyticsLoading(
        true,
      );

      await loadAnalytics(
        period,
      );
    } catch (error) {
      console.error(
        "Could not change analytics period:",
        error,
      );

      Alert.alert(
        "Could not update analytics",

        error instanceof Error
          ? error.message
          : "Analytics could not be loaded for the selected period.",
      );
    } finally {
      setIsAnalyticsLoading(
        false,
      );
    }
  }

  async function loadAllTransactionsForExport(): Promise<
    TransactionHistoryItem[]
  > {
    const histories =
      await Promise.all(
        products.map(
          (product) =>
            getTransactionHistoryForProduct(
              product.id,
            ),
        ),
      );

    return histories
      .flat()
      .sort(
        (
          first,
          second,
        ) =>
          new Date(
            second.createdAt,
          ).getTime() -
          new Date(
            first.createdAt,
          ).getTime(),
      );
  }

  async function generateExport(): Promise<ExportedReport> {
    if (
      selectedExportReportType ===
      "inventory"
    ) {
      switch (
        selectedExportFormat
      ) {
        case "csv":
          return exportInventoryCsv(
            products,
          );

        case "xlsx":
          return exportInventoryExcel(
            products,
          );

        case "pdf":
          return exportInventoryPdf(
            products,
          );
      }
    }

    if (
      selectedExportReportType ===
      "transactions"
    ) {
      const transactions =
        await loadAllTransactionsForExport();

      switch (
        selectedExportFormat
      ) {
        case "csv":
          return exportTransactionsCsv(
            transactions,
          );

        case "xlsx":
          return exportTransactionsExcel(
            transactions,
          );

        case "pdf":
          return exportTransactionsPdf(
            transactions,
          );
      }
    }

    const analytics =
      await getInventoryAnalyticsSummary(
        analyticsPeriod,
        50,
      );

    switch (
      selectedExportFormat
    ) {
      case "csv":
        return exportAnalyticsCsv(
          analytics,
        );

      case "xlsx":
        return exportAnalyticsExcel(
          analytics,
        );

      case "pdf":
        return exportAnalyticsPdf(
          analytics,
        );
    }
  }

  async function handleExport(): Promise<void> {
    try {
      setIsExporting(
        true,
      );

      const report =
        await generateExport();

      await shareExportedReport(
        report,
      );
    } catch (error) {
      console.error(
        "Could not export report:",
        error,
      );

      Alert.alert(
        "Export failed",

        error instanceof Error
          ? error.message
          : "The report could not be generated.",
      );
    } finally {
      setIsExporting(
        false,
      );
    }
  }

  function openManualProductForm(): void {
    setScannedBarcode("");

    setCurrentView(
      "add-product",
    );
  }

  function closeProductForm(): void {
    setScannedBarcode("");

    setCurrentView(
      "inventory",
    );
  }

  function clearInventoryFilters(): void {
    setFilters(
      DEFAULT_INVENTORY_FILTERS,
    );
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
            onPress={() =>
              void loadProducts()
            }
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

  if (
    currentView ===
    "scanner"
  ) {
    return (
      <BarcodeScanner
        onBarcodeDetected={
          handleBarcodeDetected
        }
        onClose={() =>
          setCurrentView(
            "inventory",
          )
        }
      />
    );
  }

  if (

  currentView ===

  "product-details"

) {

  if (!selectedProduct) {

    return (

      <SafeAreaView

        style={styles.screen}

      >

        <View

          style={

            styles.centeredContainer

          }

        >

          <Text

            style={

              styles.errorTitle

            }

          >

            Product not selected

          </Text>

          <Pressable

            accessibilityRole="button"

            onPress={() => {

              setSelectedProduct(

                null,

              );

              setCurrentView(

                "inventory",

              );

            }}

            style={

              styles.primaryButton

            }

          >

            <Text

              style={

                styles.primaryButtonText

              }

            >

              Return to inventory

            </Text>

          </Pressable>

        </View>

      </SafeAreaView>

    );

  }

  return (

    <ProductDetails

      product={

        selectedProduct

      }

      latestDelivery={

        latestDeliveries.get(

          selectedProduct.id,

        )

      }

      onUpdateStock={

        openTransactionForm

      }

      onViewHistory={(

        product,

      ) =>

        void openTransactionHistory(

          product,

        )

      }

      onEdit={

        openEditProduct

      }

      onArchive={

        confirmArchiveProduct

      }

      onClose={() => {

        setSelectedProduct(

          null,

        );

        setCurrentView(

          "inventory",

        );

      }}

    />

  );

}

  if (
    currentView ===
    "dashboard"
  ) {
    if (
      isDashboardLoading
    ) {
      return (
        <SafeAreaView style={styles.screen}>
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" />

            <Text style={styles.statusText}>
              Loading dashboard…
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <InventoryDashboard
        summary={
          dashboardSummary
        }
        recentDays={30}
        recentActivity={
          dashboardRecentActivity
        }
        onViewAllActivity={() =>
          void openGlobalTransactions()
        }
        onClose={() =>
          setCurrentView(
            "inventory",
          )
        }
      />
    );
  }

  if (
    currentView ===
    "global-transactions"
  ) {
    if (
      isGlobalTransactionsLoading
    ) {
      return (
        <SafeAreaView style={styles.screen}>
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" />

            <Text style={styles.statusText}>
              Loading transactions…
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <GlobalTransactions
        transactions={
          globalTransactions
        }
        onClose={() =>
          setCurrentView(
            "inventory",
          )
        }
      />
    );
  }

  if (
    currentView ===
    "analytics"
  ) {
    if (
      isAnalyticsLoading
    ) {
      return (
        <SafeAreaView style={styles.screen}>
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" />

            <Text style={styles.statusText}>
              Loading analytics…
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <InventoryAnalytics
        summary={
          analyticsSummary
        }
        selectedPeriod={
          analyticsPeriod
        }
        onPeriodChange={(
          period,
        ) =>
          void handleAnalyticsPeriodChange(
            period,
          )
        }
        onClose={() =>
          setCurrentView(
            "inventory",
          )
        }
      />
    );
  }

  if (
    currentView ===
    "export-reports"
  ) {
    return (
      <ExportReports
        selectedReportType={
          selectedExportReportType
        }
        selectedFormat={
          selectedExportFormat
        }
        isExporting={
          isExporting
        }
        onReportTypeChange={
          setSelectedExportReportType
        }
        onFormatChange={
          setSelectedExportFormat
        }
        onExport={() =>
          void handleExport()
        }
        onClose={() =>
          setCurrentView(
            "inventory",
          )
        }
      />
    );
  }

  if (
    currentView ===
    "archived-products"
  ) {
    if (
      isArchivedProductsLoading
    ) {
      return (
        <SafeAreaView style={styles.screen}>
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" />

            <Text style={styles.statusText}>
              Loading archived products…
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <ArchivedProducts
        products={
          archivedProducts
        }
        onRestore={
          confirmRestoreProduct
        }
        onClose={() =>
          setCurrentView(
            "inventory",
          )
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
          <View style={styles.centeredContainer}>
            <Text style={styles.errorTitle}>
              Product not selected
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setCurrentView(
                  "inventory",
                )
              }
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                Return to inventory
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <InventoryTransactionForm
        product={
          selectedProduct
        }
        isSubmitting={
          isTransactionSubmitting
        }
        onCancel={
          closeTransactionForm
        }
        onSubmit={
          handleInventoryTransaction
        }
      />
    );
  }

  if (
    currentView ===
    "transaction-history"
  ) {
    if (!selectedProduct) {
      return (
        <SafeAreaView style={styles.screen}>
          <View style={styles.centeredContainer}>
            <Text style={styles.errorTitle}>
              Product not selected
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setCurrentView(
                  "inventory",
                )
              }
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                Return to inventory
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    if (
      isHistoryLoading
    ) {
      return (
        <SafeAreaView style={styles.screen}>
          <View style={styles.centeredContainer}>
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
        productName={
          selectedProduct.name
        }
        currentStock={
          selectedProduct.currentStock
        }
        transactions={
          transactionHistory
        }
        onClose={
          closeTransactionHistory
        }
      />
    );
  }

  if (
    currentView ===
    "edit-product"
  ) {
    if (!selectedProduct) {
      return (
        <SafeAreaView style={styles.screen}>
          <View style={styles.centeredContainer}>
            <Text style={styles.errorTitle}>
              Product not selected
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setCurrentView(
                  "inventory",
                )
              }
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                Return to inventory
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <EditProductForm
        product={
          selectedProduct
        }
        isSubmitting={
          isProductUpdating
        }
        onCancel={
          closeEditProduct
        }
        onSubmit={
          handleUpdateProduct
        }
      />
    );
  }

  if (
    currentView ===
    "add-product"
  ) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            onPress={
              closeProductForm
            }
            style={
              styles.secondaryButton
            }
          >
            <Text
              style={
                styles.secondaryButtonText
              }
            >
              Cancel
            </Text>
          </Pressable>
        </View>

        <ProductForm
          initialBarcode={
            scannedBarcode
          }
          isSubmitting={
            isSubmitting
          }
          onSubmit={
            handleCreateProduct
          }
        />

        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={
          visibleProducts
        }
        keyExtractor={(
          product,
        ) =>
          product.id.toString()
        }
        contentContainerStyle={
          styles.listContent
        }
        renderItem={({
          item,
        }) => (
          <ProductCard
            product={item}
            latestDelivery={
              latestDeliveries.get(
                item.id,
              )
            }
            onUpdateInventory={
              openTransactionForm
            }
            onViewHistory={(
              product,
            ) =>
              void openTransactionHistory(
                product,
              )
            }
            onEditProduct={
              openEditProduct
            }
            onArchiveProduct={
              confirmArchiveProduct
            }
          />
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>
                SmartStock Inventory
              </Text>

              <Text style={styles.summary}>
                {products.length} active products
              </Text>

              <View
                style={
                  styles.actionMenuWrapper
                }
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.actionMenu
                  }
                >
                  <ActionMenuItem
                    label="Dashboard"
                    onPress={() =>
                      void openDashboard()
                    }
                  />

                  <ActionMenuItem
                    label="Stock History"
                    onPress={() =>
                      void openGlobalTransactions()
                    }
                  />

                  <ActionMenuItem
                    label="Analytics"
                    onPress={() =>
                      void openAnalytics()
                    }
                  />

                  <ActionMenuItem
                    label="Scan Barcode"
                    onPress={() =>
                      setCurrentView(
                        "scanner",
                      )
                    }
                  />

                  <ActionMenuItem
                    label="Add Product"
                    onPress={
                      openManualProductForm
                    }
                  />

                  <ActionMenuItem
                    label="Archived"
                    onPress={() =>
                      void openArchivedProducts()
                    }
                  />

                  <ActionMenuItem
                    label="Export Reports"
                    onPress={() =>
                      setCurrentView(
                        "export-reports",
                      )
                    }
                  />
                </ScrollView>
              </View>
            </View>

            <InventoryToolbar
              filters={
                filters
              }
              resultCount={
                visibleProducts.length
              }
              totalCount={
                products.length
              }
              onFiltersChange={
                setFilters
              }
              onClearFilters={
                clearInventoryFilters
              }
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

            {products.length ===
            0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={
                  openManualProductForm
                }
                style={
                  styles.primaryButton
                }
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
                onPress={
                  clearInventoryFilters
                }
                style={
                  styles.primaryButton
                }
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
        refreshing={
          isRefreshing
        }
        onRefresh={() =>
          void loadProducts(
            true,
          )
        }
      />

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

interface ActionMenuItemProps {
  label: string;
  onPress: () => void;
}

function ActionMenuItem({
  label,
  onPress,
}: ActionMenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionMenuItem,

        pressed &&
          styles.actionMenuItemPressed,
      ]}
    >
      <Text
        style={
          styles.actionMenuText
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        "#F4F6F8",
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
      color: "#111827",
    },

    summary: {
      marginTop: 4,
      fontSize: 15,
      color: "#5D6673",
    },

    actionMenuWrapper: {
      marginTop: 18,
      marginHorizontal:
        -16,
      backgroundColor:
        "#FFFFFF",
    },

    actionMenu: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
    },

    actionMenuItem: {
      minHeight: 54,

      alignItems: "center",
      justifyContent:
        "center",

      paddingHorizontal: 20,

      backgroundColor:
        "#FFFFFF",
    },

    actionMenuItemPressed: {
      backgroundColor:
        "#EEF1F3",
    },

    actionMenuText: {
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.3,
      color: "#7A858B",
    },

    topBar: {
      alignItems: "flex-end",
      paddingHorizontal: 20,
      paddingTop: 8,
    },

    centeredContainer: {
      flex: 1,

      alignItems: "center",
      justifyContent:
        "center",

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
      justifyContent:
        "center",

      borderRadius: 10,

      paddingHorizontal: 18,

      backgroundColor:
        "#20252B",
    },

    primaryButtonText: {
      fontWeight: "700",
      color: "#FFFFFF",
    },

    secondaryButton: {
      borderWidth: 1,
      borderColor:
        "#C8CED6",

      borderRadius: 10,

      paddingHorizontal: 14,
      paddingVertical: 9,

      backgroundColor:
        "#FFFFFF",
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