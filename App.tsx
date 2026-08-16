import {
  StatusBar,
} from "expo-status-bar";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  ArchivedProducts,
} from "./src/components/ArchivedProducts";

import {
  BarcodeScanner,
} from "./src/components/BarcodeScanner";

import {
  CloudSyncStatus,
} from "./src/components/CloudSyncStatus";

import {
  EditProductForm,
} from "./src/components/EditProductForm";

import {
  ExportReports,
} from "./src/components/ExportReports";

import {
  GlobalTransactions,
} from "./src/components/GlobalTransactions";

import {
  InventoryAnalytics,
} from "./src/components/InventoryAnalytics";

import {
  InventoryDashboard,
} from "./src/components/InventoryDashboard";

import {
  InventoryToolbar,
} from "./src/components/InventoryToolbar";

import {
  InventoryTransactionForm,
} from "./src/components/InventoryTransactionForm";

import {
  ProductCard,
} from "./src/components/ProductCard";

import {
  ProductDetails,
} from "./src/components/ProductDetails";

import {
  ProductForm,
} from "./src/components/ProductForm";

import {
  ProductTransactionHistory,
} from "./src/components/ProductTransactionHistory";

import {
  ReorderManagement,
} from "./src/components/ReorderManagement";

import {
  getInventoryAnalyticsSummary,
} from "./src/database/inventoryAnalyticsRepository";

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
  getFilteredProducts,
  getProductByBarcode,
  restoreProduct,
  updateProduct,
} from "./src/database/productRepository";

import {
  getReorderItems,
} from "./src/database/reorderRepository";

import {
  initializeDatabase,
} from "./src/database/schema";

import {
  downloadCloudProductToLocalByBarcode,
} from "./src/services/cloudProductDownloadService";

import {
  downloadCloudTransactionToLocalById,
  reconcileLocalTransactionsFromCloud,
} from "./src/services/cloudTransactionDownloadService";

import {
  pullInventoryFromCloud,
  pushInventoryToCloud,
} from "./src/services/cloudSyncService";

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
  subscribeToInventoryRealtime,
  unsubscribeFromInventoryRealtime,
} from "./src/services/inventoryRealtimeService";

import type {
  InventoryRealtimeChange,
} from "./src/services/inventoryRealtimeService";

import {
  exportAnalyticsPdf,
  exportInventoryPdf,
  exportTransactionsPdf,
} from "./src/services/pdfExportService";

import {
  shareExportedReport,
} from "./src/services/reportSharingService";

import {
  DEFAULT_ANALYTICS_PERIOD,
  type AnalyticsPeriodDays,
} from "./src/types/analyticsPeriod";

import {
  INITIAL_CLOUD_SYNC_STATUS,
  type CloudSyncOperation,
  type CloudSyncStatusState,
} from "./src/types/cloudSyncStatus";

import type {
  DashboardRecentActivity,
} from "./src/types/dashboardRecentActivity";

import type {
  ExportedReport,
  ExportFileFormat,
  ExportReportType,
} from "./src/types/exportReport";

import type {
  GlobalTransaction,
} from "./src/types/globalTransaction";

import type {
  InventoryAnalyticsSummary,
} from "./src/types/inventoryAnalytics";

import type {
  InventoryDashboardSummary,
} from "./src/types/inventoryDashboard";

import {
  DEFAULT_INVENTORY_FILTERS,
  type InventoryFilterState,
} from "./src/types/inventoryFilter";

import type {
  CreateInventoryTransactionInput,
} from "./src/types/inventoryTransaction";

import type {
  Product,
} from "./src/types/product";

import type {
  ProductDeliverySummary,
} from "./src/types/productDelivery";

import type {
  ProductFormValues,
} from "./src/types/productForm";

import type {
  ReorderItem,
} from "./src/types/reorderItem";

import type {
  TransactionHistoryItem,
} from "./src/types/transactionHistory";

import type {
  UpdateProductInput,
} from "./src/types/productUpdate";

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
  | "product-details"
  | "reorder-management";

type TransactionReturnView =
  | "inventory"
  | "reorder-management";

const CLOUD_SYNC_TIMEOUT_MS =
  8000;

const INVENTORY_SEARCH_DEBOUNCE_MS =
  180;

const INITIAL_DASHBOARD_SUMMARY:
  InventoryDashboardSummary = {
    totalProducts:
      0,

    totalStockUnits:
      0,

    totalInventoryCostValue:
      0,

    totalInventoryRetailValue:
      0,

    potentialGrossProfit:
      0,

    lowStockProductCount:
      0,

    outOfStockProductCount:
      0,

    recentSalesValue:
      0,

    recentStockInValue:
      0,

    recentDamageValue:
      0,

    recentTransactionCount:
      0,
  };

const INITIAL_ANALYTICS_SUMMARY:
  InventoryAnalyticsSummary = {
    dailyMetrics:
      [],

    topProducts:
      [],

    topCategories:
      [],

    categoryShareMetrics:
      [],

    comparison: {
      current: {
        salesValue:
          0,

        estimatedProfit:
          0,

        salesUnits:
          0,

        stockInValue:
          0,

        stockInUnits:
          0,

        damageValue:
          0,

        damageUnits:
          0,

        transactionCount:
          0,
      },

      previous: {
        salesValue:
          0,

        estimatedProfit:
          0,

        salesUnits:
          0,

        stockInValue:
          0,

        stockInUnits:
          0,

        damageValue:
          0,

        damageUnits:
          0,

        transactionCount:
          0,
      },

      salesValueChangePercent:
        0,

      salesUnitsChangePercent:
        0,

      estimatedProfitChangePercent:
        0,

      stockInUnitsChangePercent:
        0,

      damageValueChangePercent:
        0,
    },

    productTrends:
      [],

    salesTrendMetrics:
      [],
  };

async function withCloudTimeout<T>(
  operation:
    Promise<T>,
): Promise<T> {
  let timeoutId:
    ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise =
    new Promise<never>(
      (
        _resolve,
        reject,
      ) => {
        timeoutId =
          setTimeout(
            () => {
              reject(
                new Error(
                  "Cloud connection timed out. Check your internet connection.",
                ),
              );
            },

            CLOUD_SYNC_TIMEOUT_MS,
          );
      },
    );

  try {
    return await Promise.race([
      operation,
      timeoutPromise,
    ]);
  } finally {
    if (
      timeoutId !==
      undefined
    ) {
      clearTimeout(
        timeoutId,
      );
    }
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SmartStockApp />
    </SafeAreaProvider>
  );
}

function SmartStockApp() {
  const [
    status,
    setStatus,
  ] =
    useState<AppStatus>(
      "loading",
    );

  const [
    currentView,
    setCurrentView,
  ] =
    useState<AppView>(
      "inventory",
    );

  const [
    products,
    setProducts,
  ] =
    useState<Product[]>(
      [],
    );

  const [
    visibleProducts,
    setVisibleProducts,
  ] =
    useState<Product[]>(
      [],
    );

  const [
    inventoryRevision,
    setInventoryRevision,
  ] =
    useState(
      0,
    );

  const [
    archivedProducts,
    setArchivedProducts,
  ] =
    useState<Product[]>(
      [],
    );

  const [
    globalTransactions,
    setGlobalTransactions,
  ] =
    useState<GlobalTransaction[]>(
      [],
    );

  const [
    reorderItems,
    setReorderItems,
  ] =
    useState<ReorderItem[]>(
      [],
    );

  const [
    cloudSyncStatus,
    setCloudSyncStatus,
  ] =
    useState<CloudSyncStatusState>(
      INITIAL_CLOUD_SYNC_STATUS,
    );

  const [
    filters,
    setFilters,
  ] =
    useState<InventoryFilterState>(
      DEFAULT_INVENTORY_FILTERS,
    );

  const [
    selectedProduct,
    setSelectedProduct,
  ] =
    useState<Product | null>(
      null,
    );

  const [
    transactionReturnView,
    setTransactionReturnView,
  ] =
    useState<TransactionReturnView>(
      "inventory",
    );

  const [
    transactionHistory,
    setTransactionHistory,
  ] =
    useState<
      TransactionHistoryItem[]
    >(
      [],
    );

  const [
    latestDeliveries,
    setLatestDeliveries,
  ] =
    useState<
      Map<
        number,
        ProductDeliverySummary
      >
    >(
      new Map(),
    );

  const [
    dashboardSummary,
    setDashboardSummary,
  ] =
    useState<InventoryDashboardSummary>(
      INITIAL_DASHBOARD_SUMMARY,
    );

  const [
    dashboardRecentActivity,
    setDashboardRecentActivity,
  ] =
    useState<
      DashboardRecentActivity[]
    >(
      [],
    );

  const [
    analyticsSummary,
    setAnalyticsSummary,
  ] =
    useState<InventoryAnalyticsSummary>(
      INITIAL_ANALYTICS_SUMMARY,
    );

  const [
    analyticsPeriod,
    setAnalyticsPeriod,
  ] =
    useState<AnalyticsPeriodDays>(
      DEFAULT_ANALYTICS_PERIOD,
    );

  const [
    selectedExportReportType,
    setSelectedExportReportType,
  ] =
    useState<ExportReportType>(
      "inventory",
    );

  const [
    selectedExportFormat,
    setSelectedExportFormat,
  ] =
    useState<ExportFileFormat>(
      "csv",
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState(
      "",
    );

  const [
    isRefreshing,
    setIsRefreshing,
  ] =
    useState(
      false,
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
    );

  const [
    isProductUpdating,
    setIsProductUpdating,
  ] =
    useState(
      false,
    );

  const [
    isTransactionSubmitting,
    setIsTransactionSubmitting,
  ] =
    useState(
      false,
    );

  const [
    isHistoryLoading,
    setIsHistoryLoading,
  ] =
    useState(
      false,
    );

  const [
    isDashboardLoading,
    setIsDashboardLoading,
  ] =
    useState(
      false,
    );

  const [
    isAnalyticsLoading,
    setIsAnalyticsLoading,
  ] =
    useState(
      false,
    );

  const [
    isArchivedProductsLoading,
    setIsArchivedProductsLoading,
  ] =
    useState(
      false,
    );

  const [
    isGlobalTransactionsLoading,
    setIsGlobalTransactionsLoading,
  ] =
    useState(
      false,
    );

  const [
    isReorderLoading,
    setIsReorderLoading,
  ] =
    useState(
      false,
    );

  const [
    isExporting,
    setIsExporting,
  ] =
    useState(
      false,
    );

  const [
    scannedBarcode,
    setScannedBarcode,
  ] =
    useState(
      "",
    );

  const realtimeRefreshQueue =
    useRef<Promise<void>>(
      Promise.resolve(),
    );

  const loadInventoryData =
    useCallback(
      async (): Promise<void> => {
        const [
          storedProducts,
          deliveryMap,
          dashboard,
          recentActivity,
          currentReorderItems,
        ] =
          await Promise.all([
            getAllProducts(),

            getLatestDeliveriesByProduct(),

            getInventoryDashboardSummary(),

            getDashboardRecentActivity(
              8,
            ),

            getReorderItems(),
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

        setReorderItems(
          currentReorderItems,
        );

        setInventoryRevision(
          (
            previous,
          ) =>
            previous +
            1,
        );
      },
      [],
    );

  useEffect(
    () => {
      if (
        status !==
        "ready"
      ) {
        return;
      }

      let isCancelled =
        false;

      const timeoutId =
        setTimeout(
          () => {
            void (
              async () => {
                try {
                  const filteredProducts =
                    await getFilteredProducts(
                      filters,
                    );

                  if (
                    !isCancelled
                  ) {
                    setVisibleProducts(
                      filteredProducts,
                    );
                  }
                } catch (
                  error
                ) {
                  console.error(
                    "Could not filter inventory:",
                    error,
                  );
                }
              }
            )();
          },

          INVENTORY_SEARCH_DEBOUNCE_MS,
        );

      return () => {
        isCancelled =
          true;

        clearTimeout(
          timeoutId,
        );
      };
    },

    [
      filters,
      inventoryRevision,
      status,
    ],
  );

  const beginCloudSync =
    useCallback(
      (
        operation:
          CloudSyncOperation,
      ): void => {
        setCloudSyncStatus(
          (
            previous,
          ) => ({
            ...previous,

            state:
              "syncing",

            operation,

            errorMessage:
              null,
          }),
        );
      },
      [],
    );

  const markCloudSyncSuccessful =
    useCallback(
      (): void => {
        setCloudSyncStatus({
          state:
            "synced",

          operation:
            null,

          lastSuccessfulSync:
            new Date().toISOString(),

          errorMessage:
            null,
        });
      },
      [],
    );

  const markCloudSyncFailed =
    useCallback(
      (
        error:
          unknown,
      ): void => {
        const message =
          error instanceof Error
            ? error.message
            : "Cloud synchronization failed.";

        setCloudSyncStatus(
          (
            previous,
          ) => ({
            ...previous,

            state:
              "error",

            operation:
              null,

            errorMessage:
              message,
          }),
        );
      },
      [],
    );

  const pushToCloud =
    useCallback(
      async (
        operation:
          CloudSyncOperation,
      ): Promise<boolean> => {
        beginCloudSync(
          operation,
        );

        try {
          await withCloudTimeout(
            pushInventoryToCloud(),
          );

          markCloudSyncSuccessful();

          return true;
        } catch (
          error
        ) {
          console.warn(
            "Cloud upload unavailable:",
            error,
          );

          markCloudSyncFailed(
            error,
          );

          return false;
        }
      },

      [
        beginCloudSync,
        markCloudSyncFailed,
        markCloudSyncSuccessful,
      ],
    );

  const refreshInventoryFromRealtime =
    useCallback(
      (
        change:
          InventoryRealtimeChange,
      ): void => {
        realtimeRefreshQueue.current =
          realtimeRefreshQueue.current
            .catch(
              () =>
                undefined,
            )
            .then(
              async () => {
                try {
                  if (
                    change.table ===
                    "products"
                  ) {
                    if (
                      !change.productBarcode ||
                      change.eventType ===
                        "DELETE"
                    ) {
                      return;
                    }

                    await withCloudTimeout(
                      downloadCloudProductToLocalByBarcode(
                        change.productBarcode,
                      ),
                    );
                  } else {
                    if (
                      !change.transactionId ||
                      change.eventType ===
                        "DELETE"
                    ) {
                      return;
                    }

                    await withCloudTimeout(
                      downloadCloudTransactionToLocalById(
                        change.transactionId,
                      ),
                    );
                  }

                  await loadInventoryData();
                } catch (
                  error
                ) {
                  console.warn(
                    "Incremental realtime refresh unavailable:",
                    error,
                  );
                }
              },
            );
      },

      [
        loadInventoryData,
      ],
    );

  const loadProducts =
    useCallback(
      async (
        isPullToRefresh =
          false,
      ): Promise<void> => {
        try {
          if (
            isPullToRefresh
          ) {
            setIsRefreshing(
              true,
            );
          } else {
            setStatus(
              "loading",
            );
          }

          setErrorMessage(
            "",
          );

          await initializeDatabase();

          beginCloudSync(
            isPullToRefresh
              ? "refresh"
              : "startup",
          );

          try {
            await withCloudTimeout(
              pushInventoryToCloud(),
            );

            await withCloudTimeout(
              pullInventoryFromCloud(),
            );

            await withCloudTimeout(
              reconcileLocalTransactionsFromCloud(),
            );

            markCloudSyncSuccessful();
          } catch (
            syncError
          ) {
            console.warn(
              "Startup cloud sync unavailable:",
              syncError,
            );

            markCloudSyncFailed(
              syncError,
            );
          }

          await loadInventoryData();

          setStatus(
            "ready",
          );
        } catch (
          error
        ) {
          console.error(
            "Could not load local inventory:",
            error,
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "An unexpected inventory error occurred.",
          );

          setStatus(
            "error",
          );
        } finally {
          setIsRefreshing(
            false,
          );
        }
      },

      [
        beginCloudSync,
        loadInventoryData,
        markCloudSyncFailed,
        markCloudSyncSuccessful,
      ],
    );

  useEffect(
    () => {
      void loadProducts();
    },

    [
      loadProducts,
    ],
  );

  useEffect(
    () => {
      const channel =
        subscribeToInventoryRealtime({
          onChange:
            (
              change,
            ) => {
              refreshInventoryFromRealtime(
                change,
              );
            },

          onStatusChange:
            (
              realtimeStatus,
            ) => {
              if (
                realtimeStatus ===
                "CHANNEL_ERROR"
              ) {
                console.warn(
                  "Inventory realtime channel unavailable.",
                );
              }
            },
        });

      return () => {
        void unsubscribeFromInventoryRealtime(
          channel,
        );
      };
    },

    [
      refreshInventoryFromRealtime,
    ],
  );

  const handleManualSync =
    useCallback(
      async (): Promise<void> => {
        if (
          cloudSyncStatus.state ===
          "syncing"
        ) {
          return;
        }

        beginCloudSync(
          "manual",
        );

        try {
          await withCloudTimeout(
            pushInventoryToCloud(),
          );

          await withCloudTimeout(
            pullInventoryFromCloud(),
          );

          await withCloudTimeout(
            reconcileLocalTransactionsFromCloud(),
          );

          await loadInventoryData();

          markCloudSyncSuccessful();
        } catch (
          error
        ) {
          console.warn(
            "Manual cloud reconciliation unavailable:",
            error,
          );

          markCloudSyncFailed(
            error,
          );
        }
      },
      [
        beginCloudSync,
        cloudSyncStatus.state,
        loadInventoryData,
        markCloudSyncFailed,
        markCloudSyncSuccessful,
      ],
    );

  async function handleCreateProduct(
    values:
      ProductFormValues,
  ): Promise<void> {
    try {
      setIsSubmitting(
        true,
      );

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

          currentStock:
            0,

          reorderLevel:
            Number(
              values.reorderLevel,
            ),
        });

      if (
        openingStock >
        0
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

      await pushToCloud(
        "product-create",
      );

      setScannedBarcode(
        "",
      );

      setCurrentView(
        "inventory",
      );

      Alert.alert(
        "Product saved",

        `${values.name.trim()} was added successfully.`,
      );
    } catch (
      error
    ) {
      console.error(
        "Could not create product:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "The product could not be saved.";

      const lowerMessage =
        message.toLowerCase();

      const isDuplicateBarcode =
        lowerMessage.includes(
          "unique",
        ) ||
        lowerMessage.includes(
          "constraint",
        ) ||
        lowerMessage.includes(
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
      setIsSubmitting(
        false,
      );
    }
  }

  const handleBarcodeDetected =
    useCallback(
      async (
        barcode:
          string,
      ): Promise<void> => {
        try {
          const existingProduct =
            await getProductByBarcode(
              barcode,
            );

          if (
            existingProduct
          ) {
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
        } catch (
          error
        ) {
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
      },
      [],
    );

  const openEditProduct =
    useCallback(
      (
        product:
          Product,
      ): void => {
        setSelectedProduct(
          product,
        );

        setCurrentView(
          "edit-product",
        );
      },
      [],
    );

  const closeEditProduct =
    useCallback(
      (): void => {
        setSelectedProduct(
          null,
        );

        setCurrentView(
          "inventory",
        );
      },
      [],
    );

  async function handleUpdateProduct(
    input:
      UpdateProductInput,
  ): Promise<void> {
    try {
      setIsProductUpdating(
        true,
      );

      await updateProduct(
        input,
      );

      await loadInventoryData();

      await pushToCloud(
        "product-update",
      );

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
    } catch (
      error
    ) {
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

  const handleArchiveProduct =
    useCallback(
      async (
        product:
          Product,
      ): Promise<void> => {
        try {
          await archiveProduct(
            product.id,
          );

          await loadInventoryData();

          await pushToCloud(
            "product-archive",
          );

          setSelectedProduct(
            (
              current,
            ) =>
              current?.id ===
              product.id
                ? null
                : current,
          );

          Alert.alert(
            "Product archived",

            `${product.name} was removed from active inventory.`,
          );
        } catch (
          error
        ) {
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
      },
      [
        loadInventoryData,
        pushToCloud,
      ],
    );

  const confirmArchiveProduct =
    useCallback(
      (
        product:
          Product,
      ): void => {
        Alert.alert(
          "Archive product?",

          `${product.name} will be removed from your active inventory.\n\nIts stock history and analytics records will be preserved.`,

          [
            {
              text:
                "Cancel",

              style:
                "cancel",
            },

            {
              text:
                "Archive",

              style:
                "destructive",

              onPress:
                () =>
                  void handleArchiveProduct(
                    product,
                  ),
            },
          ],
        );
      },
      [
        handleArchiveProduct,
      ],
    );

  async function openArchivedProducts():
    Promise<void> {
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
    } catch (
      error
    ) {
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
    product:
      Product,
  ): void {
    Alert.alert(
      "Restore product?",

      `${product.name} will be returned to active inventory.`,

      [
        {
          text:
            "Cancel",

          style:
            "cancel",
        },

        {
          text:
            "Restore",

          onPress:
            () =>
              void handleRestoreProduct(
                product,
              ),
        },
      ],
    );
  }

  async function handleRestoreProduct(
    product:
      Product,
  ): Promise<void> {
    try {
      await restoreProduct(
        product.id,
      );

      await loadInventoryData();

      await pushToCloud(
        "product-restore",
      );

      const refreshedArchivedProducts =
        await getArchivedProducts();

      setArchivedProducts(
        refreshedArchivedProducts,
      );

      Alert.alert(
        "Product restored",

        `${product.name} is active again.`,
      );
    } catch (
      error
    ) {
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

  async function openGlobalTransactions():
    Promise<void> {
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
    } catch (
      error
    ) {
      console.error(
        "Could not load stock history:",
        error,
      );

      setCurrentView(
        "inventory",
      );

      Alert.alert(
        "Could not load stock history",

        error instanceof Error
          ? error.message
          : "Stock history could not be loaded.",
      );
    } finally {
      setIsGlobalTransactionsLoading(
        false,
      );
    }
  }

  async function openReorderManagement():
    Promise<void> {
    try {
      setIsReorderLoading(
        true,
      );

      setCurrentView(
        "reorder-management",
      );

      const items =
        await getReorderItems();

      setReorderItems(
        items,
      );
    } catch (
      error
    ) {
      console.error(
        "Could not load reorder management:",
        error,
      );

      setCurrentView(
        "inventory",
      );

      Alert.alert(
        "Could not load reorder list",

        error instanceof Error
          ? error.message
          : "The reorder list could not be loaded.",
      );
    } finally {
      setIsReorderLoading(
        false,
      );
    }
  }

  const openTransactionForm =
    useCallback(
      (
        product:
          Product,
      ): void => {
        setTransactionReturnView(
          "inventory",
        );

        setSelectedProduct(
          product,
        );

        setCurrentView(
          "inventory-transaction",
        );
      },
      [],
    );

  const openReorderStockForm =
    useCallback(
      (
        product:
          Product,
      ): void => {
        setTransactionReturnView(
          "reorder-management",
        );

        setSelectedProduct(
          product,
        );

        setCurrentView(
          "inventory-transaction",
        );
      },
      [],
    );

  const closeTransactionForm =
    useCallback(
      (): void => {
        const returnView =
          transactionReturnView;

        setSelectedProduct(
          null,
        );

        setTransactionReturnView(
          "inventory",
        );

        setCurrentView(
          returnView,
        );
      },
      [
        transactionReturnView,
      ],
    );

  async function handleInventoryTransaction(
    input:
      CreateInventoryTransactionInput,
  ): Promise<void> {
    try {
      setIsTransactionSubmitting(
        true,
      );

      const returnView =
        transactionReturnView;

      const transaction =
        await createInventoryTransaction(
          input,
        );

      await loadInventoryData();

      await pushToCloud(
        "inventory-update",
      );

      if (
        returnView ===
        "reorder-management"
      ) {
        const updatedReorderItems =
          await getReorderItems();

        setReorderItems(
          updatedReorderItems,
        );
      }

      setSelectedProduct(
        null,
      );

      setTransactionReturnView(
        "inventory",
      );

      setCurrentView(
        returnView,
      );

      Alert.alert(
        "Inventory updated",

        `Stock changed from ${transaction.stockBefore} to ${transaction.stockAfter} units.`,
      );
    } catch (
      error
    ) {
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

  const openTransactionHistory =
    useCallback(
      async (
        product:
          Product,
      ): Promise<void> => {
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
        } catch (
          error
        ) {
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
      },
      [],
    );

  const closeTransactionHistory =
    useCallback(
      (): void => {
        setTransactionHistory(
          [],
        );

        setSelectedProduct(
          null,
        );

        setCurrentView(
          "inventory",
        );
      },
      [],
    );

  async function openDashboard():
    Promise<void> {
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
      ] =
        await Promise.all([
          getInventoryDashboardSummary(),

          getDashboardRecentActivity(
            8,
          ),
        ]);

      setDashboardSummary(
        summary,
      );

      setDashboardRecentActivity(
        recentActivity,
      );
    } catch (
      error
    ) {
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
    period:
      AnalyticsPeriodDays,
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

  async function openAnalytics():
    Promise<void> {
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
    } catch (
      error
    ) {
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
    period:
      AnalyticsPeriodDays,
  ): Promise<void> {
    if (
      period ===
      analyticsPeriod
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
    } catch (
      error
    ) {
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

  async function loadAllTransactionsForExport():
    Promise<
      TransactionHistoryItem[]
    > {
    const histories =
      await Promise.all(
        products.map(
          (
            product,
          ) =>
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

  async function generateExport():
    Promise<ExportedReport> {
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

  async function handleExport():
    Promise<void> {
    try {
      setIsExporting(
        true,
      );

      const report =
        await generateExport();

      await shareExportedReport(
        report,
      );
    } catch (
      error
    ) {
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

  const openManualProductForm =
    useCallback(
      (): void => {
        setScannedBarcode(
          "",
        );

        setCurrentView(
          "add-product",
        );
      },
      [],
    );

  const closeProductForm =
    useCallback(
      (): void => {
        setScannedBarcode(
          "",
        );

        setCurrentView(
          "inventory",
        );
      },
      [],
    );

  const clearInventoryFilters =
    useCallback(
      (): void => {
        setFilters(
          DEFAULT_INVENTORY_FILTERS,
        );
      },
      [],
    );

  const closeProductDetails =
    useCallback(
      (): void => {
        setSelectedProduct(
          null,
        );

        setCurrentView(
          "inventory",
        );
      },
      [],
    );

  const openScanner =
    useCallback(
      (): void => {
        setScannedBarcode(
          "",
        );

        setCurrentView(
          "scanner",
        );
      },
      [],
    );

  const closeScanner =
    useCallback(
      (): void => {
        setCurrentView(
          "inventory",
        );
      },
      [],
    );

  const renderProduct =
    useCallback(
      ({
        item,
      }: {
        item:
          Product;
      }) => (
        <ProductCard
          product={
            item
          }
          latestDelivery={
            latestDeliveries.get(
              item.id,
            )
          }
          onUpdateInventory={
            openTransactionForm
          }
          onViewHistory={
            openTransactionHistory
          }
          onEditProduct={
            openEditProduct
          }
          onArchiveProduct={
            confirmArchiveProduct
          }
        />
      ),
      [
        latestDeliveries,
        openTransactionForm,
        openTransactionHistory,
        openEditProduct,
        confirmArchiveProduct,
      ],
    );

  if (
    status ===
    "loading"
  ) {
    return (
      <LoadingScreen
        message="Loading inventory…"
      />
    );
  }

  if (
    status ===
    "error"
  ) {
    return (
      <SafeAreaView
        edges={[
          "top",
          "left",
          "right",
          "bottom",
        ]}
        style={
          styles.screen
        }
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
            Could not load inventory
          </Text>

          <Text
            style={
              styles.errorMessage
            }
          >
            {
              errorMessage
            }
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              void loadProducts()
            }
            style={({
              pressed,
            }) => [
              styles.primaryButton,

              pressed &&
                styles.primaryButtonPressed,
            ]}
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Try Again
            </Text>
          </Pressable>

          <StatusBar
            style="auto"
          />
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
        onClose={
          closeScanner
        }
      />
    );
  }

  if (
    currentView ===
    "product-details"
  ) {
    if (
      !selectedProduct
    ) {
      return (
        <FallbackScreen
          message="Product not selected"
          onReturn={
            closeProductDetails
          }
        />
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
        onViewHistory={
          openTransactionHistory
        }
        onEdit={
          openEditProduct
        }
        onArchive={
          confirmArchiveProduct
        }
        onClose={
          closeProductDetails
        }
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
        <LoadingScreen
          message="Loading dashboard…"
        />
      );
    }

    return (
      <InventoryDashboard
        summary={
          dashboardSummary
        }
        recentDays={
          30
        }
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
        <LoadingScreen
          message="Loading stock history…"
        />
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
    "reorder-management"
  ) {
    if (
      isReorderLoading
    ) {
      return (
        <LoadingScreen
          message="Loading reorder list…"
        />
      );
    }

    return (
      <ReorderManagement
        items={
          reorderItems
        }
        onStockIn={
          openReorderStockForm
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
        <LoadingScreen
          message="Loading analytics…"
        />
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
        <LoadingScreen
          message="Loading archived products…"
        />
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
    if (
      !selectedProduct
    ) {
      return (
        <FallbackScreen
          message="Product not selected"
          onReturn={() => {
            setTransactionReturnView(
              "inventory",
            );

            setCurrentView(
              "inventory",
            );
          }}
        />
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
        initialTransactionType={
          transactionReturnView ===
          "reorder-management"
            ? "stock_in"
            : undefined
        }
        initialQuantity={
          transactionReturnView ===
          "reorder-management"
            ? Math.max(
                selectedProduct.reorderLevel *
                  2 -
                  selectedProduct.currentStock,

                0,
              )
            : undefined
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
    if (
      !selectedProduct
    ) {
      return (
        <FallbackScreen
          message="Product not selected"
          onReturn={
            closeTransactionHistory
          }
        />
      );
    }

    if (
      isHistoryLoading
    ) {
      return (
        <LoadingScreen
          message="Loading transaction history…"
        />
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
    if (
      !selectedProduct
    ) {
      return (
        <FallbackScreen
          message="Product not selected"
          onReturn={
            closeEditProduct
          }
        />
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
      <SafeAreaView
        edges={[
          "top",
          "left",
          "right",
          "bottom",
        ]}
        style={
          styles.screen
        }
      >
        <View
          style={
            styles.topBar
          }
        >
          <Pressable
            accessibilityRole="button"
            hitSlop={
              10
            }
            onPress={
              closeProductForm
            }
            style={({
              pressed,
            }) => [
              styles.secondaryButton,

              pressed &&
                styles.secondaryButtonPressed,
            ]}
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

        <StatusBar
          style="auto"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={[
        "top",
        "left",
        "right",
        "bottom",
      ]}
      style={
        styles.screen
      }
    >
      <FlatList
        data={
          visibleProducts
        }
        keyExtractor={(
          product,
        ) =>
          product.id.toString()
        }
        renderItem={
          renderProduct
        }
        contentContainerStyle={
          styles.listContent
        }
        initialNumToRender={
          10
        }
        maxToRenderPerBatch={
          10
        }
        updateCellsBatchingPeriod={
          40
        }
        windowSize={
          7
        }
        removeClippedSubviews={
          true
        }
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View
              style={
                styles.header
              }
            >
              <Text
                style={
                  styles.title
                }
                numberOfLines={
                  2
                }
              >
                SmartStock
              </Text>

              <Text
                style={
                  styles.summary
                }
              >
                {products.length} active{" "}
                {products.length ===
                1
                  ? "product"
                  : "products"}
              </Text>

              <CloudSyncStatus
                status={
                  cloudSyncStatus
                }
                onSync={() =>
                  void handleManualSync()
                }
              />

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
                    label="Reorder"
                    onPress={() =>
                      void openReorderManagement()
                    }
                  />

                  <ActionMenuItem
                    label="History"
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
                    label="Scan"
                    onPress={
                      openScanner
                    }
                    emphasized
                  />

                  <ActionMenuItem
                    label="Add Product"
                    onPress={
                      openManualProductForm
                    }
                    emphasized
                  />

                  <ActionMenuItem
                    label="Archived"
                    onPress={() =>
                      void openArchivedProducts()
                    }
                  />

                  <ActionMenuItem
                    label="Export"
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
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={
                styles.emptyTitle
              }
            >
              {products.length ===
              0
                ? "No products yet"
                : "No matching products"}
            </Text>

            <Text
              style={
                styles.statusText
              }
            >
              {products.length ===
              0
                ? "Add your first product to start tracking inventory."
                : "Try changing or resetting your inventory filters."}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={
                products.length ===
                0
                  ? openManualProductForm
                  : clearInventoryFilters
              }
              style={({
                pressed,
              }) => [
                styles.primaryButton,

                pressed &&
                  styles.primaryButtonPressed,
              ]}
            >
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                {products.length ===
                0
                  ? "Add First Product"
                  : "Reset Filters"}
              </Text>
            </Pressable>
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

      <StatusBar
        style="auto"
      />
    </SafeAreaView>
  );
}

interface ActionMenuItemProps {
  label:
    string;

  onPress:
    () => void;

  emphasized?:
    boolean;
}

function ActionMenuItem({
  label,
  onPress,
  emphasized = false,
}: ActionMenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.actionMenuItem,

        emphasized &&
          styles.actionMenuItemEmphasized,

        pressed &&
          styles.actionMenuItemPressed,

        pressed &&
          emphasized &&
          styles.actionMenuItemEmphasizedPressed,
      ]}
    >
      <Text
        style={[
          styles.actionMenuText,

          emphasized &&
            styles.actionMenuTextEmphasized,
        ]}
      >
        {
          label
        }
      </Text>
    </Pressable>
  );
}

function LoadingScreen({
  message,
}: {
  message:
    string;
}) {
  return (
    <SafeAreaView
      edges={[
        "top",
        "left",
        "right",
        "bottom",
      ]}
      style={
        styles.screen
      }
    >
      <View
        style={
          styles.centeredContainer
        }
      >
        <ActivityIndicator
          size="large"
        />

        <Text
          style={
            styles.statusText
          }
        >
          {
            message
          }
        </Text>

        <StatusBar
          style="auto"
        />
      </View>
    </SafeAreaView>
  );
}

function FallbackScreen({
  message,
  onReturn,
}: {
  message:
    string;

  onReturn:
    () => void;
}) {
  return (
    <SafeAreaView
      edges={[
        "top",
        "left",
        "right",
        "bottom",
      ]}
      style={
        styles.screen
      }
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
          {
            message
          }
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={
            onReturn
          }
          style={({
            pressed,
          }) => [
            styles.primaryButton,

            pressed &&
              styles.primaryButtonPressed,
          ]}
        >
          <Text
            style={
              styles.primaryButtonText
            }
          >
            Return to Inventory
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex:
        1,

      backgroundColor:
        "#F4F6F8",
    },

    listContent: {
      padding:
        16,

      paddingBottom:
        40,
    },

    header: {
      marginBottom:
        18,
    },

    title: {
      fontSize:
        30,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    summary: {
      marginTop:
        4,

      fontSize:
        14,

      color:
        "#5D6673",
    },

    actionMenuWrapper: {
      marginTop:
        18,

      marginHorizontal:
        -16,

      borderTopWidth:
        1,

      borderBottomWidth:
        1,

      borderColor:
        "#EEF0F2",

      backgroundColor:
        "#FFFFFF",
    },

    actionMenu: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        8,

      paddingVertical:
        5,

      gap:
        2,
    },

    actionMenuItem: {
      minHeight:
        46,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        10,

      paddingHorizontal:
        16,

      backgroundColor:
        "#FFFFFF",
    },

    actionMenuItemEmphasized: {
      backgroundColor:
        "#F1F5F9",
    },

    actionMenuItemPressed: {
      backgroundColor:
        "#EEF1F3",
    },

    actionMenuItemEmphasizedPressed: {
      backgroundColor:
        "#E2E8F0",
    },

    actionMenuText: {
      fontSize:
        12,

      fontWeight:
        "800",

      letterSpacing:
        0.2,

      color:
        "#69747C",
    },

    actionMenuTextEmphasized: {
      color:
        "#20252B",
    },

    topBar: {
      alignItems:
        "flex-end",

      paddingHorizontal:
        20,

      paddingTop:
        8,
    },

    centeredContainer: {
      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      padding:
        24,
    },

    statusText: {
      marginTop:
        10,

      maxWidth:
        320,

      fontSize:
        14,

      lineHeight:
        20,

      textAlign:
        "center",

      color:
        "#5D6673",
    },

    errorTitle: {
      fontSize:
        21,

      fontWeight:
        "800",

      textAlign:
        "center",

      color:
        "#111827",
    },

    errorMessage: {
      marginTop:
        12,

      maxWidth:
        340,

      fontSize:
        14,

      lineHeight:
        21,

      textAlign:
        "center",

      color:
        "#5D6673",
    },

    primaryButton: {
      marginTop:
        18,

      minHeight:
        46,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        11,

      paddingHorizontal:
        18,

      backgroundColor:
        "#20252B",
    },

    primaryButtonPressed: {
      backgroundColor:
        "#111827",
    },

    primaryButtonText: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    secondaryButton: {
      minHeight:
        42,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#C8CED6",

      borderRadius:
        10,

      paddingHorizontal:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    secondaryButtonPressed: {
      backgroundColor:
        "#F1F5F9",
    },

    secondaryButtonText: {
      fontSize:
        14,

      fontWeight:
        "700",

      color:
        "#20252B",
    },

    emptyContainer: {
      paddingHorizontal:
        20,

      paddingVertical:
        60,

      alignItems:
        "center",
    },

    emptyTitle: {
      fontSize:
        20,

      fontWeight:
        "800",

      textAlign:
        "center",

      color:
        "#111827",
    },
  });