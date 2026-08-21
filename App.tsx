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
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  BarcodeScanner,
} from "./src/components/BarcodeScanner";

import {
  BottomNavigation,
  type BottomNavigationItem,
} from "./src/components/BottomNavigation";

import {
  CloudSyncStatus,
} from "./src/components/CloudSyncStatus";

import {
  CreateOrder,
} from "./src/components/CreateOrder";

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
  ImportInventory,
} from "./src/components/ImportInventory";

import {
  InventoryActionBar,
} from "./src/components/InventoryActionBar";

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
  InvoiceReview,
} from "./src/components/InvoiceReview";

import {
  OrderDetails,
} from "./src/components/OrderDetails";

import {
  OrderManagement,
} from "./src/components/OrderManagement";

import {
  OrderPreview,
} from "./src/components/OrderPreview";

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
  ReceiveOrder,
} from "./src/components/ReceiveOrder";

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
  deleteActiveDraftPurchaseOrder,
  getActiveDraftPurchaseOrder,
  getDraftQuantitiesByProduct,
  getOrderedQuantitiesByProduct,
  getPurchaseOrderById,
  getPurchaseOrderHistory,
  placeDraftPurchaseOrder,
  saveOrCreateDraftPurchaseOrder,
} from "./src/database/purchaseOrderRepository";

import {
  archiveProduct,
  canPermanentlyDeleteProduct,
  createProduct,
  getAllProducts,
  getArchivedProducts,
  getFilteredProducts,
  getProductByBarcode,
  permanentlyDeleteProduct,
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
  captureImportDocument,
  chooseImportFile,
  chooseImportImage,
} from "./src/services/importDocumentService";

import {
  subscribeToInventoryRealtime,
  unsubscribeFromInventoryRealtime,
} from "./src/services/inventoryRealtimeService";

import type {
  InventoryRealtimeChange,
} from "./src/services/inventoryRealtimeService";

import {
  createMockInvoiceImportResult,
} from "./src/services/mockInvoiceParserService";

import {
  exportAnalyticsPdf,
  exportInventoryPdf,
  exportTransactionsPdf,
} from "./src/services/pdfExportService";

import {
  receivePurchaseOrder,
} from "./src/services/purchaseOrderReceivingService";

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
  ImportDocument,
} from "./src/types/importDocument";

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
  InvoiceImportResult,
} from "./src/types/invoiceImport";

import type {
  OrderDraftItem,
} from "./src/types/orderDraft";

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
  PurchaseOrderSummary,
  PurchaseOrderWithItems,
} from "./src/types/purchaseOrder";

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
  | "order-scanner"
  | "inventory-transaction"
  | "transaction-history"
  | "global-transactions"
  | "dashboard"
  | "analytics"
  | "export-reports"
  | "product-details"
  | "reorder-management"
  | "order-management"
  | "order-details"
  | "receive-order"
  | "invoice-review"
  | "create-order"
  | "order-preview"
  | "import-inventory";

function getActiveBottomNavigationItem(
  view:
    AppView,
): BottomNavigationItem | null {
  switch (
    view
  ) {
    case "dashboard":
      return "dashboard";

    case "global-transactions":
      return "history";

    case "scanner":
      return "scan";

    case "reorder-management":
      return "reorder";

    case "analytics":
      return "analytics";

    case "export-reports":
    case "import-inventory":
      return "data";

    default:
      return null;
  }
}

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

const currencyFormatter =
  new Intl.NumberFormat(
    "en-CA",
    {
      style:
        "currency",

      currency:
        "CAD",

      maximumFractionDigits:
        2,
    },
  );

function formatCurrency(
  value:
    number,
): string {
  return currencyFormatter.format(
    value,
  );
}

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

function parseTaxAmount(
  value:
    string,
): number {
  const normalized =
    value
      .replace(
        "$",
        "",
      )
      .replace(
        ",",
        "",
      )
      .trim();

  if (
    normalized ===
    ""
  ) {
    return 0;
  }

  const parsed =
    Number(
      normalized,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    parsed <
      0
  ) {
    return 0;
  }

  return parsed;
}

function formatTaxInput(
  value:
    number,
): string {
  if (
    value ===
    0
  ) {
    return "";
  }

  return value.toFixed(
    2,
  );
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
    archivedProducts,
    setArchivedProducts,
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
    orderDraftItems,
    setOrderDraftItems,
  ] =
    useState<OrderDraftItem[]>(
      [],
    );

  const [
    scannedOrderProduct,
    setScannedOrderProduct,
  ] =
    useState<Product | null>(
      null,
    );

  const [
    draftQuantities,
    setDraftQuantities,
  ] =
    useState<
      Map<
        number,
        number
      >
    >(
      new Map(),
    );

  const [
    orderedQuantities,
    setOrderedQuantities,
  ] =
    useState<
      Map<
        number,
        number
      >
    >(
      new Map(),
    );

  const [
    activeDraftOrderId,
    setActiveDraftOrderId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    orderNumber,
    setOrderNumber,
  ] =
    useState(
      "",
    );

  const [
    orderVendorName,
    setOrderVendorName,
  ] =
    useState(
      "",
    );

  const [
    orderNotes,
    setOrderNotes,
  ] =
    useState(
      "",
    );

  const [
    orderTax,
    setOrderTax,
  ] =
    useState(
      "",
    );

  const [
    isOrderDraftSaving,
    setIsOrderDraftSaving,
  ] =
    useState(
      false,
    );

  const [
    isOrderPlacing,
    setIsOrderPlacing,
  ] =
    useState(
      false,
    );

  const [
    purchaseOrderHistory,
    setPurchaseOrderHistory,
  ] =
    useState<PurchaseOrderSummary[]>(
      [],
    );

  const [
    selectedPurchaseOrder,
    setSelectedPurchaseOrder,
  ] =
    useState<PurchaseOrderWithItems | null>(
      null,
    );

  const [
    invoiceImportResult,
    setInvoiceImportResult,
  ] =
    useState<InvoiceImportResult | null>(
      null,
    );

  const [
    isInvoiceProcessing,
    setIsInvoiceProcessing,
  ] =
    useState(
      false,
    );

  const [
    isOrderReceiving,
    setIsOrderReceiving,
  ] =
    useState(
      false,
    );

  const [
    isOrderManagementLoading,
    setIsOrderManagementLoading,
  ] =
    useState(
      false,
    );

  const [
    isOrderDetailsLoading,
    setIsOrderDetailsLoading,
  ] =
    useState(
      false,
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
    transactionHistory,
    setTransactionHistory,
  ] =
    useState<TransactionHistoryItem[]>(
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

  const orderDraftSaveQueue =
    useRef<Promise<void>>(
      Promise.resolve(),
    );

  const hasLoadedOrderDraft =
    useRef(
      false,
    );

  const resetOrderDraftState =
    useCallback(
      (): void => {
        setOrderDraftItems(
          [],
        );

        setDraftQuantities(
          new Map(),
        );

        setActiveDraftOrderId(
          null,
        );

        setOrderNumber(
          "",
        );

        setOrderVendorName(
          "",
        );

        setOrderNotes(
          "",
        );

        setOrderTax(
          "",
        );

        setScannedOrderProduct(
          null,
        );
      },

      [],
    );

  const refreshDraftQuantities =
    useCallback(
      async (): Promise<void> => {
        const quantities =
          await getDraftQuantitiesByProduct();

        setDraftQuantities(
          quantities,
        );
      },

      [],
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
          currentOrderedQuantities,
        ] =
          await Promise.all([
            getAllProducts(),

            getLatestDeliveriesByProduct(),

            getInventoryDashboardSummary(),

            getDashboardRecentActivity(
              8,
            ),

            getReorderItems(),

            getOrderedQuantitiesByProduct(),
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

        setOrderedQuantities(
          currentOrderedQuantities,
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

  const loadSavedOrderDraft =
    useCallback(
      async (): Promise<void> => {
        try {
          const draft =
            await getActiveDraftPurchaseOrder();

          if (
            !draft
          ) {
            setOrderDraftItems(
              [],
            );

            setDraftQuantities(
              new Map(),
            );

            setActiveDraftOrderId(
              null,
            );

            setOrderNumber(
              "",
            );

            setOrderVendorName(
              "",
            );

            setOrderNotes(
              "",
            );

            setOrderTax(
              "",
            );

            return;
          }

          const productMap =
            new Map<
              number,
              Product
            >();

          products.forEach(
            (
              product,
            ) => {
              productMap.set(
                product.id,
                product,
              );
            },
          );

          const restoredItems:
            OrderDraftItem[] = [];

          draft.items.forEach(
            (
              item,
            ) => {
              if (
                item.productId ===
                null
              ) {
                return;
              }

              const product =
                productMap.get(
                  item.productId,
                );

              if (
                !product
              ) {
                return;
              }

              restoredItems.push({
                product,

                quantity:
                  item.quantity,
              });
            },
          );

          setOrderDraftItems(
            restoredItems,
          );

          setActiveDraftOrderId(
            draft.order.id,
          );

          setOrderNumber(
            draft.order.orderNumber,
          );

          setOrderVendorName(
            draft.order.vendorName,
          );

          setOrderNotes(
            draft.order.notes,
          );

          setOrderTax(
            formatTaxInput(
              draft.order.tax,
            ),
          );

          await refreshDraftQuantities();
        } catch (
          error
        ) {
          console.error(
            "Could not restore saved order draft:",
            error,
          );
        }
      },

      [
        products,
        refreshDraftQuantities,
      ],
    );

  const persistOrderItems =
    useCallback(
      (
        items:
          OrderDraftItem[],
      ): void => {
        const optimisticQuantities =
          new Map<
            number,
            number
          >();

        items.forEach(
          (
            item,
          ) => {
            optimisticQuantities.set(
              item.product.id,
              item.quantity,
            );
          },
        );

        setDraftQuantities(
          optimisticQuantities,
        );

        orderDraftSaveQueue.current =
          orderDraftSaveQueue.current
            .catch(
              () =>
                undefined,
            )
            .then(
              async () => {
                try {
                  if (
                    items.length ===
                    0
                  ) {
                    await deleteActiveDraftPurchaseOrder();

                    setActiveDraftOrderId(
                      null,
                    );

                    setOrderNumber(
                      "",
                    );

                    setDraftQuantities(
                      new Map(),
                    );

                    return;
                  }

                  const saved =
                    await saveOrCreateDraftPurchaseOrder({
                      vendorName:
                        orderVendorName,

                      notes:
                        orderNotes,

                      tax:
                        parseTaxAmount(
                          orderTax,
                        ),

                      items,
                    });

                  setActiveDraftOrderId(
                    saved.order.id,
                  );

                  setOrderNumber(
                    saved.order.orderNumber,
                  );

                  await refreshDraftQuantities();
                } catch (
                  error
                ) {
                  console.error(
                    "Could not persist order draft:",
                    error,
                  );

                  try {
                    await refreshDraftQuantities();
                  } catch (
                    refreshError
                  ) {
                    console.error(
                      "Could not refresh draft quantities:",
                      refreshError,
                    );
                  }
                }
              },
            );
      },

      [
        orderNotes,
        orderTax,
        orderVendorName,
        refreshDraftQuantities,
      ],
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
      if (
        status !==
        "ready"
      ) {
        return;
      }

      if (
        hasLoadedOrderDraft.current
      ) {
        return;
      }

      hasLoadedOrderDraft.current =
        true;

      void loadSavedOrderDraft();
    },

    [
      loadSavedOrderDraft,
      status,
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

      Alert.alert(
        "Could not save product",
        error instanceof Error
          ? error.message
          : "The product could not be saved.",
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

  const handleOrderBarcodeDetected =
    useCallback(
      async (
        barcode:
          string,
      ): Promise<void> => {
        const product =
          await getProductByBarcode(
            barcode,
          );

        if (
          !product
        ) {
          Alert.alert(
            "Product not found",
            "This barcode is not currently registered in your inventory.",
          );

          throw new Error(
            "ORDER_PRODUCT_NOT_FOUND",
          );
        }

        setScannedOrderProduct(
          product,
        );

        setCurrentView(
          "create-order",
        );
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
            null,
          );

          setCurrentView(
            "inventory",
          );
        } catch (
          error
        ) {
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
          `${product.name} will be removed from active inventory.`,
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

  async function handleRestoreProduct(
    product:
      Product,
  ): Promise<void> {
    await restoreProduct(
      product.id,
    );

    await loadInventoryData();

    await pushToCloud(
      "product-restore",
    );

    const archived =
      await getArchivedProducts();

    setArchivedProducts(
      archived,
    );
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

  async function handleDeleteArchivedProduct(
    product:
      Product,
  ): Promise<void> {
    await permanentlyDeleteProduct(
      product.id,
    );

    const archived =
      await getArchivedProducts();

    setArchivedProducts(
      archived,
    );

    await loadInventoryData();
  }

  async function confirmDeleteArchivedProduct(
    product:
      Product,
  ): Promise<void> {
    const canDelete =
      await canPermanentlyDeleteProduct(
        product.id,
      );

    if (
      !canDelete
    ) {
      Alert.alert(
        "Cannot permanently delete",
        `${product.name} has stock history.`,
      );

      return;
    }

    Alert.alert(
      "Delete permanently?",
      `${product.name} will be permanently removed.`,
      [
        {
          text:
            "Cancel",

          style:
            "cancel",
        },

        {
          text:
            "Delete Permanently",

          style:
            "destructive",

          onPress:
            () =>
              void handleDeleteArchivedProduct(
                product,
              ),
        },
      ],
    );
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

      const [
        transactions,
        archived,
      ] =
        await Promise.all([
          getGlobalTransactions(
            500,
          ),

          getArchivedProducts(),
        ]);

      setGlobalTransactions(
        transactions,
      );

      setArchivedProducts(
        archived,
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

      const [
        items,
        currentDraftQuantities,
        currentOrderedQuantities,
      ] =
        await Promise.all([
          getReorderItems(),

          getDraftQuantitiesByProduct(),

          getOrderedQuantitiesByProduct(),
        ]);

      setReorderItems(
        items,
      );

      setDraftQuantities(
        currentDraftQuantities,
      );

      setOrderedQuantities(
        currentOrderedQuantities,
      );
    } finally {
      setIsReorderLoading(
        false,
      );
    }
  }

  async function openOrderManagement():
    Promise<void> {
    try {
      setIsOrderManagementLoading(
        true,
      );

      setCurrentView(
        "order-management",
      );

      const [
        orders,
        currentDraftQuantities,
        currentOrderedQuantities,
      ] =
        await Promise.all([
          getPurchaseOrderHistory(
            200,
          ),

          getDraftQuantitiesByProduct(),

          getOrderedQuantitiesByProduct(),
        ]);

      setPurchaseOrderHistory(
        orders,
      );

      setDraftQuantities(
        currentDraftQuantities,
      );

      setOrderedQuantities(
        currentOrderedQuantities,
      );
    } finally {
      setIsOrderManagementLoading(
        false,
      );
    }
  }

  async function openPurchaseOrderDetails(
    orderId:
      number,
  ): Promise<void> {
    try {
      setIsOrderDetailsLoading(
        true,
      );

      setSelectedPurchaseOrder(
        null,
      );

      setCurrentView(
        "order-details",
      );

      const purchaseOrder =
        await getPurchaseOrderById(
          orderId,
        );

      if (
        !purchaseOrder
      ) {
        throw new Error(
          "Purchase order could not be found.",
        );
      }

      setSelectedPurchaseOrder(
        purchaseOrder,
      );
    } catch (
      error
    ) {
      setCurrentView(
        "order-management",
      );

      Alert.alert(
        "Could not load order",
        error instanceof Error
          ? error.message
          : "Purchase order could not be loaded.",
      );
    } finally {
      setIsOrderDetailsLoading(
        false,
      );
    }
  }

  const closePurchaseOrderDetails =
    useCallback(
      (): void => {
        setSelectedPurchaseOrder(
          null,
        );

        setInvoiceImportResult(
          null,
        );

        setCurrentView(
          "order-management",
        );
      },

      [],
    );

  const openReceiveOrder =
    useCallback(
      (): void => {
        if (
          !selectedPurchaseOrder
        ) {
          return;
        }

        setInvoiceImportResult(
          null,
        );

        setCurrentView(
          "receive-order",
        );
      },

      [
        selectedPurchaseOrder,
      ],
    );

  async function processReceivingDocument(
    document:
      ImportDocument,
  ): Promise<void> {
    if (
      !selectedPurchaseOrder
    ) {
      return;
    }

    try {
      setIsInvoiceProcessing(
        true,
      );

      const result =
        await createMockInvoiceImportResult(
          selectedPurchaseOrder,
          document,
          products,
        );

      setInvoiceImportResult(
        result,
      );

      setCurrentView(
        "invoice-review",
      );
    } catch (
      error
    ) {
      Alert.alert(
        "Could not read invoice",
        error instanceof Error
          ? error.message
          : "The invoice could not be processed.",
      );
    } finally {
      setIsInvoiceProcessing(
        false,
      );
    }
  }

  async function handleTakeInvoicePhoto():
    Promise<void> {
    try {
      const result =
        await captureImportDocument();

      if (
        result.cancelled ||
        !result.document
      ) {
        return;
      }

      await processReceivingDocument(
        result.document,
      );
    } catch (
      error
    ) {
      Alert.alert(
        "Camera unavailable",
        error instanceof Error
          ? error.message
          : "The invoice photo could not be captured.",
      );
    }
  }

  async function handleChooseInvoiceImage():
    Promise<void> {
    try {
      const result =
        await chooseImportImage();

      if (
        result.cancelled ||
        !result.document
      ) {
        return;
      }

      await processReceivingDocument(
        result.document,
      );
    } catch (
      error
    ) {
      Alert.alert(
        "Could not choose image",
        error instanceof Error
          ? error.message
          : "The invoice image could not be selected.",
      );
    }
  }

  async function handleChooseInvoiceFile():
    Promise<void> {
    try {
      const result =
        await chooseImportFile();

      if (
        result.cancelled ||
        !result.document
      ) {
        return;
      }

      await processReceivingDocument(
        result.document,
      );
    } catch (
      error
    ) {
      Alert.alert(
        "Could not choose file",
        error instanceof Error
          ? error.message
          : "The invoice file could not be selected.",
      );
    }
  }

  async function handleManualReceivingReview():
    Promise<void> {
    if (
      !selectedPurchaseOrder
    ) {
      return;
    }

    const document = {
      uri:
        "manual://receiving",

      name:
        "Manual receiving",

      mimeType:
        "text/plain",

      fileType:
        "unknown",

      source:
        "file",

      size:
        null,

      createdAt:
        new Date().toISOString(),
    } as ImportDocument;

    await processReceivingDocument(
      document,
    );
  }

  async function handleConfirmPurchaseOrderReceiving(
    result:
      InvoiceImportResult,
  ): Promise<void> {
    if (
      isOrderReceiving
    ) {
      return;
    }

    if (
      !selectedPurchaseOrder
    ) {
      Alert.alert(
        "Purchase order unavailable",
        "The purchase order could not be found.",
      );

      return;
    }

    try {
      setIsOrderReceiving(
        true,
      );

      setInvoiceImportResult(
        result,
      );

      const receivingResult =
        await receivePurchaseOrder(
          selectedPurchaseOrder,
          result,
        );

      await loadInventoryData();

      const updatedOrderHistory =
        await getPurchaseOrderHistory(
          200,
        );

      setPurchaseOrderHistory(
        updatedOrderHistory,
      );

      const [
        updatedDraftQuantities,
        updatedOrderedQuantities,
      ] =
        await Promise.all([
          getDraftQuantitiesByProduct(),

          getOrderedQuantitiesByProduct(),
        ]);

      setDraftQuantities(
        updatedDraftQuantities,
      );

      setOrderedQuantities(
        updatedOrderedQuantities,
      );

      const completedOrder =
        await getPurchaseOrderById(
          receivingResult.orderId,
        );

      if (
        !completedOrder
      ) {
        throw new Error(
          "Receiving was completed, but the purchase order could not be reloaded.",
        );
      }

      setSelectedPurchaseOrder(
        completedOrder,
      );

      setCurrentView(
        "order-details",
      );

      setInvoiceImportResult(
        null,
      );

      await pushToCloud(
        "inventory-update",
      );

      const summaryLines:
        string[] = [];

      summaryLines.push(
        `${receivingResult.receivedUnits} ${
          receivingResult.receivedUnits ===
          1
            ? "unit"
            : "units"
        } received.`,
      );

      summaryLines.push(
        `${receivingResult.receivedProductCount} ${
          receivingResult.receivedProductCount ===
          1
            ? "product"
            : "products"
        } added to inventory.`,
      );

      if (
        receivingResult.zeroReceivedProductCount >
        0
      ) {
        summaryLines.push(
          `${receivingResult.zeroReceivedProductCount} ${
            receivingResult.zeroReceivedProductCount ===
            1
              ? "product was"
              : "products were"
          } not delivered.`,
        );
      }

      if (
        receivingResult.partialProductCount >
        0
      ) {
        summaryLines.push(
          `${receivingResult.partialProductCount} ${
            receivingResult.partialProductCount ===
            1
              ? "product was"
              : "products were"
          } received in a lower quantity than ordered.`,
        );
      }

      if (
        receivingResult.shortageValue >
        0
      ) {
        summaryLines.push(
          `${formatCurrency(
            receivingResult.shortageValue,
          )} of ordered merchandise was not received.`,
        );
      }

      summaryLines.push(
        `Received merchandise value: ${formatCurrency(
          receivingResult.receivedSubtotal,
        )}.`,
      );

      Alert.alert(
        "Order received",
        summaryLines.join(
          "\n\n",
        ),
      );
    } catch (
      error
    ) {
      console.error(
        "Could not receive purchase order:",
        error,
      );

      Alert.alert(
        "Could not receive order",
        error instanceof Error
          ? error.message
          : "The purchase order could not be received.",
      );
    } finally {
      setIsOrderReceiving(
        false,
      );
    }
  }

  const startNewOrder =
    useCallback(
      async (): Promise<void> => {
        await loadSavedOrderDraft();

        setScannedOrderProduct(
          null,
        );

        setCurrentView(
          "create-order",
        );
      },

      [
        loadSavedOrderDraft,
      ],
    );

  const addProductToOrderDraft =
    useCallback(
      (
        product:
          Product,

        quantity:
          number,
      ): void => {
        if (
          quantity <=
          0
        ) {
          return;
        }

        setOrderDraftItems(
          (
            current,
          ) => {
            const existing =
              current.find(
                (
                  item,
                ) =>
                  item.product.id ===
                  product.id,
              );

            const updated =
              existing
                ? current.map(
                    (
                      item,
                    ) =>
                      item.product.id ===
                      product.id
                        ? {
                            ...item,

                            quantity:
                              item.quantity +
                              quantity,
                          }
                        : item,
                  )
                : [
                    ...current,

                    {
                      product,

                      quantity,
                    },
                  ];

            persistOrderItems(
              updated,
            );

            return updated;
          },
        );
      },

      [
        persistOrderItems,
      ],
    );

  const changeOrderDraftQuantity =
    useCallback(
      (
        productId:
          number,

        change:
          number,
      ): void => {
        setOrderDraftItems(
          (
            current,
          ) => {
            const updated =
              current
                .map(
                  (
                    item,
                  ) =>
                    item.product.id ===
                    productId
                      ? {
                          ...item,

                          quantity:
                            Math.max(
                              0,
                              item.quantity +
                                change,
                            ),
                        }
                      : item,
                )
                .filter(
                  (
                    item,
                  ) =>
                    item.quantity >
                    0,
                );

            persistOrderItems(
              updated,
            );

            return updated;
          },
        );
      },

      [
        persistOrderItems,
      ],
    );

  const removeOrderDraftItem =
    useCallback(
      (
        productId:
          number,
      ): void => {
        setOrderDraftItems(
          (
            current,
          ) => {
            const updated =
              current.filter(
                (
                  item,
                ) =>
                  item.product.id !==
                  productId,
              );

            persistOrderItems(
              updated,
            );

            return updated;
          },
        );
      },

      [
        persistOrderItems,
      ],
    );

  async function handleSaveOrderDraft():
    Promise<void> {
    if (
      orderDraftItems.length ===
      0
    ) {
      return;
    }

    try {
      setIsOrderDraftSaving(
        true,
      );

      const saved =
        await saveOrCreateDraftPurchaseOrder({
          vendorName:
            orderVendorName,

          notes:
            orderNotes,

          tax:
            parseTaxAmount(
              orderTax,
            ),

          items:
            orderDraftItems,
        });

      setActiveDraftOrderId(
        saved.order.id,
      );

      setOrderNumber(
        saved.order.orderNumber,
      );

      await refreshDraftQuantities();

      Alert.alert(
        "Draft saved",
        `${saved.order.orderNumber} was saved.`,
      );
    } finally {
      setIsOrderDraftSaving(
        false,
      );
    }
  }

  async function handlePlaceOrder():
    Promise<void> {
    if (
      orderDraftItems.length ===
        0 ||
      !orderVendorName.trim()
    ) {
      return;
    }

    try {
      setIsOrderPlacing(
        true,
      );

      const savedDraft =
        await saveOrCreateDraftPurchaseOrder({
          vendorName:
            orderVendorName,

          notes:
            orderNotes,

          tax:
            parseTaxAmount(
              orderTax,
            ),

          items:
            orderDraftItems,
        });

      const placed =
        await placeDraftPurchaseOrder(
          savedDraft.order.id,
        );

      resetOrderDraftState();

      await loadInventoryData();

      setPurchaseOrderHistory(
        await getPurchaseOrderHistory(
          200,
        ),
      );

      setCurrentView(
        "reorder-management",
      );

      Alert.alert(
        "Order placed",
        `${placed.order.orderNumber} was placed successfully.`,
      );
    } finally {
      setIsOrderPlacing(
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
        setSelectedProduct(
          null,
        );

        setCurrentView(
          "inventory",
        );
      },

      [],
    );

  async function handleInventoryTransaction(
    input:
      CreateInventoryTransactionInput,
  ): Promise<void> {
    try {
      setIsTransactionSubmitting(
        true,
      );

      await createInventoryTransaction(
        input,
      );

      await loadInventoryData();

      await pushToCloud(
        "inventory-update",
      );

      setSelectedProduct(
        null,
      );

      setCurrentView(
        "inventory",
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
        setSelectedProduct(
          product,
        );

        setIsHistoryLoading(
          true,
        );

        setCurrentView(
          "transaction-history",
        );

        try {
          setTransactionHistory(
            await getTransactionHistoryForProduct(
              product.id,
            ),
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
    setCurrentView(
      "dashboard",
    );

    setIsDashboardLoading(
      true,
    );

    try {
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
    setAnalyticsSummary(
      await getInventoryAnalyticsSummary(
        period,
        5,
      ),
    );
  }

  async function openAnalytics():
    Promise<void> {
    setCurrentView(
      "analytics",
    );

    setIsAnalyticsLoading(
      true,
    );

    try {
      await loadAnalytics(
        analyticsPeriod,
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
    setAnalyticsPeriod(
      period,
    );

    setIsAnalyticsLoading(
      true,
    );

    try {
      await loadAnalytics(
        period,
      );
    } finally {
      setIsAnalyticsLoading(
        false,
      );
    }
  }

  async function loadAllTransactionsForExport():
    Promise<TransactionHistoryItem[]> {
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
      if (
        selectedExportFormat ===
        "csv"
      ) {
        return exportInventoryCsv(
          products,
        );
      }

      if (
        selectedExportFormat ===
        "xlsx"
      ) {
        return exportInventoryExcel(
          products,
        );
      }

      return exportInventoryPdf(
        products,
      );
    }

    if (
      selectedExportReportType ===
      "transactions"
    ) {
      const transactions =
        await loadAllTransactionsForExport();

      if (
        selectedExportFormat ===
        "csv"
      ) {
        return exportTransactionsCsv(
          transactions,
        );
      }

      if (
        selectedExportFormat ===
        "xlsx"
      ) {
        return exportTransactionsExcel(
          transactions,
        );
      }

      return exportTransactionsPdf(
        transactions,
      );
    }

    const analytics =
      await getInventoryAnalyticsSummary(
        analyticsPeriod,
        50,
      );

    if (
      selectedExportFormat ===
      "csv"
    ) {
      return exportAnalyticsCsv(
        analytics,
      );
    }

    if (
      selectedExportFormat ===
      "xlsx"
    ) {
      return exportAnalyticsExcel(
        analytics,
      );
    }

    return exportAnalyticsPdf(
      analytics,
    );
  }

  async function handleExport():
    Promise<void> {
    try {
      setIsExporting(
        true,
      );

      await shareExportedReport(
        await generateExport(),
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

  const openDataMenu =
    useCallback(
      (): void => {
        Alert.alert(
          "Inventory Data",
          "Choose an inventory data action.",
          [
            {
              text:
                "Import Inventory",

              onPress:
                () =>
                  setCurrentView(
                    "import-inventory",
                  ),
            },

            {
              text:
                "Export Reports",

              onPress:
                () =>
                  setCurrentView(
                    "export-reports",
                  ),
            },

            {
              text:
                "Cancel",

              style:
                "cancel",
            },
          ],
        );
      },

      [],
    );

  function renderBottomNavigation() {
    return (
      <BottomNavigation
        activeItem={
          getActiveBottomNavigationItem(
            currentView,
          )
        }
        onDashboard={() =>
          void openDashboard()
        }
        onHistory={() =>
          void openGlobalTransactions()
        }
        onScan={() =>
          setCurrentView(
            "scanner",
          )
        }
        onReorder={() =>
          void openReorderManagement()
        }
        onAnalytics={() =>
          void openAnalytics()
        }
        onData={
          openDataMenu
        }
      />
    );
  }

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
      <FallbackScreen
        message={
          errorMessage
        }
        onReturn={() =>
          void loadProducts()
        }
      />
    );
  }

  /*
   * Scanner remains a dedicated
   * full-screen workflow.
   */
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
    "order-scanner"
  ) {
    return (
      <BarcodeScanner
        onBarcodeDetected={
          handleOrderBarcodeDetected
        }
        onClose={() =>
          setCurrentView(
            "create-order",
          )
        }
      />
    );
  }

  if (
    currentView ===
      "product-details" &&
    selectedProduct
  ) {
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

  /*
   * Primary navigation screens.
   *
   * Navbar now participates in flex
   * layout instead of overlapping
   * these components.
   */
  if (
    currentView ===
    "dashboard"
  ) {
    return (
      <View
        style={
          styles.primaryNavigationScreen
        }
      >
        <View
          style={
            styles.primaryContent
          }
        >
          {isDashboardLoading ? (
            <PrimaryLoadingContent
              message="Loading dashboard…"
            />
          ) : (
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
          )}
        </View>

        {
          renderBottomNavigation()
        }
      </View>
    );
  }

  if (
    currentView ===
    "global-transactions"
  ) {
    return (
      <View
        style={
          styles.primaryNavigationScreen
        }
      >
        <View
          style={
            styles.primaryContent
          }
        >
          {isGlobalTransactionsLoading ? (
            <PrimaryLoadingContent
              message="Loading stock history…"
            />
          ) : (
            <GlobalTransactions
              transactions={
                globalTransactions
              }
              archivedProducts={
                archivedProducts
              }
              onRestoreArchivedProduct={
                confirmRestoreProduct
              }
              onDeleteArchivedProduct={
                confirmDeleteArchivedProduct
              }
              onClose={() =>
                setCurrentView(
                  "inventory",
                )
              }
            />
          )}
        </View>

        {
          renderBottomNavigation()
        }
      </View>
    );
  }

  if (
    currentView ===
    "reorder-management"
  ) {
    return (
      <View
        style={
          styles.primaryNavigationScreen
        }
      >
        <View
          style={
            styles.primaryContent
          }
        >
          {isReorderLoading ? (
            <PrimaryLoadingContent
              message="Loading reorder list…"
            />
          ) : (
            <ReorderManagement
              items={
                reorderItems
              }
              draftQuantities={
                draftQuantities
              }
              orderedQuantities={
                orderedQuantities
              }
              onCreateOrder={() =>
                void startNewOrder()
              }
              onOpenOrderManagement={() =>
                void openOrderManagement()
              }
              onClose={() =>
                setCurrentView(
                  "inventory",
                )
              }
            />
          )}
        </View>

        {
          renderBottomNavigation()
        }
      </View>
    );
  }

  /*
   * Deeper order workflow.
   *
   * Main navbar intentionally hidden.
   */
  if (
    currentView ===
    "order-management"
  ) {
    if (
      isOrderManagementLoading
    ) {
      return (
        <LoadingScreen
          message="Loading purchase orders…"
        />
      );
    }

    return (
      <OrderManagement
        orders={
          purchaseOrderHistory
        }
        hasDraft={
          activeDraftOrderId !==
            null ||
          orderDraftItems.length >
            0
        }
        draftProductCount={
          orderDraftItems.length
        }
        onCreateOrder={() =>
          void startNewOrder()
        }
        onContinueDraft={() =>
          void startNewOrder()
        }
        onOpenOrder={(
          orderId,
        ) =>
          void openPurchaseOrderDetails(
            orderId,
          )
        }
        onClose={() =>
          setCurrentView(
            "reorder-management",
          )
        }
      />
    );
  }

  if (
    currentView ===
    "order-details"
  ) {
    if (
      isOrderDetailsLoading
    ) {
      return (
        <LoadingScreen
          message="Loading order details…"
        />
      );
    }

    if (
      !selectedPurchaseOrder
    ) {
      return (
        <FallbackScreen
          message="Purchase order not selected"
          onReturn={
            closePurchaseOrderDetails
          }
        />
      );
    }

    return (
      <OrderDetails
        purchaseOrder={
          selectedPurchaseOrder
        }
        onReceiveOrder={
          openReceiveOrder
        }
        onClose={
          closePurchaseOrderDetails
        }
      />
    );
  }

  if (
    currentView ===
    "receive-order"
  ) {
    if (
      !selectedPurchaseOrder
    ) {
      return (
        <FallbackScreen
          message="Purchase order not selected"
          onReturn={
            closePurchaseOrderDetails
          }
        />
      );
    }

    return (
      <ReceiveOrder
        purchaseOrder={
          selectedPurchaseOrder
        }
        isProcessing={
          isInvoiceProcessing
        }
        onTakePhoto={() =>
          void handleTakeInvoicePhoto()
        }
        onChooseImage={() =>
          void handleChooseInvoiceImage()
        }
        onChooseFile={() =>
          void handleChooseInvoiceFile()
        }
        onManualReview={() =>
          void handleManualReceivingReview()
        }
        onClose={() =>
          setCurrentView(
            "order-details",
          )
        }
      />
    );
  }

  if (
    currentView ===
    "invoice-review"
  ) {
    if (
      !invoiceImportResult
    ) {
      return (
        <FallbackScreen
          message="Invoice review unavailable"
          onReturn={() =>
            setCurrentView(
              "receive-order",
            )
          }
        />
      );
    }

    if (
      isOrderReceiving
    ) {
      return (
        <LoadingScreen
          message="Receiving order and updating inventory…"
        />
      );
    }

    return (
      <InvoiceReview
        result={
          invoiceImportResult
        }
        onChangeResult={
          setInvoiceImportResult
        }
        onConfirm={(
          result,
        ) =>
          void handleConfirmPurchaseOrderReceiving(
            result,
          )
        }
        onClose={() => {
          if (
            isOrderReceiving
          ) {
            return;
          }

          setInvoiceImportResult(
            null,
          );

          setCurrentView(
            "receive-order",
          );
        }}
      />
    );
  }

  if (
    currentView ===
    "create-order"
  ) {
    return (
      <CreateOrder
        reorderItems={
          reorderItems
        }
        products={
          products
        }
        cartItems={
          orderDraftItems
        }
        scannedProduct={
          scannedOrderProduct
        }
        onAddToCart={
          addProductToOrderDraft
        }
        onScanBarcode={() =>
          setCurrentView(
            "order-scanner",
          )
        }
        onClearScannedProduct={() =>
          setScannedOrderProduct(
            null,
          )
        }
        onPreviewOrder={() =>
          setCurrentView(
            "order-preview",
          )
        }
        onClose={() =>
          setCurrentView(
            "reorder-management",
          )
        }
      />
    );
  }

  if (
    currentView ===
    "order-preview"
  ) {
    return (
      <OrderPreview
        items={
          orderDraftItems
        }
        vendorName={
          orderVendorName
        }
        notes={
          orderNotes
        }
        tax={
          orderTax
        }
        orderNumber={
          orderNumber
        }
        onVendorNameChange={
          setOrderVendorName
        }
        onNotesChange={
          setOrderNotes
        }
        onTaxChange={
          setOrderTax
        }
        onIncrease={(
          productId,
        ) =>
          changeOrderDraftQuantity(
            productId,
            1,
          )
        }
        onDecrease={(
          productId,
        ) =>
          changeOrderDraftQuantity(
            productId,
            -1,
          )
        }
        onRemove={
          removeOrderDraftItem
        }
        onAddMore={() =>
          setCurrentView(
            "create-order",
          )
        }
        onSaveDraft={() =>
          void handleSaveOrderDraft()
        }
        onPlaceOrder={() =>
          void handlePlaceOrder()
        }
        isSaving={
          isOrderDraftSaving
        }
        isPlacing={
          isOrderPlacing
        }
        onClose={() =>
          setCurrentView(
            "create-order",
          )
        }
      />
    );
  }

  if (
    currentView ===
    "analytics"
  ) {
    return (
      <View
        style={
          styles.primaryNavigationScreen
        }
      >
        <View
          style={
            styles.primaryContent
          }
        >
          {isAnalyticsLoading ? (
            <PrimaryLoadingContent
              message="Loading analytics…"
            />
          ) : (
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
          )}
        </View>

        {
          renderBottomNavigation()
        }
      </View>
    );
  }

  if (
    currentView ===
    "export-reports"
  ) {
    return (
      <View
        style={
          styles.primaryNavigationScreen
        }
      >
        <View
          style={
            styles.primaryContent
          }
        >
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
        </View>

        {
          renderBottomNavigation()
        }
      </View>
    );
  }

  if (
    currentView ===
      "inventory-transaction" &&
    selectedProduct
  ) {
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
      "transaction-history" &&
    selectedProduct
  ) {
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
      "edit-product" &&
    selectedProduct
  ) {
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
      </SafeAreaView>
    );
  }

  if (
    currentView ===
    "import-inventory"
  ) {
    return (
      <View
        style={
          styles.primaryNavigationScreen
        }
      >
        <View
          style={
            styles.primaryContent
          }
        >
          <ImportInventory
            onClose={() =>
              setCurrentView(
                "inventory",
              )
            }
          />
        </View>

        {
          renderBottomNavigation()
        }
      </View>
    );
  }

  /*
   * MAIN INVENTORY
   *
   * Bottom safe area intentionally omitted
   * here because BottomNavigation owns it.
   */
  return (
    <SafeAreaView
      edges={[
        "top",
        "left",
        "right",
      ]}
      style={
        styles.screen
      }
    >
      <View
        style={
          styles.inventoryScreen
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
                >
                  SmartStock
                </Text>

                <Text
                  style={
                    styles.summary
                  }
                >
                  {products.length} active products
                </Text>

                <CloudSyncStatus
                  status={
                    cloudSyncStatus
                  }
                  onSync={() =>
                    void handleManualSync()
                  }
                />

                <InventoryActionBar
                  onDashboard={() =>
                    void openDashboard()
                  }
                  onReorder={() =>
                    void openReorderManagement()
                  }
                  onStockHistory={() =>
                    void openGlobalTransactions()
                  }
                  onAnalytics={() =>
                    void openAnalytics()
                  }
                  onScanBarcode={() =>
                    setCurrentView(
                      "scanner",
                    )
                  }
                  onAddProductManually={
                    openManualProductForm
                  }
                  onImport={() =>
                    setCurrentView(
                      "import-inventory",
                    )
                  }
                  onExport={() =>
                    setCurrentView(
                      "export-reports",
                    )
                  }
                />
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
          refreshing={
            isRefreshing
          }
          onRefresh={() =>
            void loadProducts(
              true,
            )
          }
        />

        {
          renderBottomNavigation()
        }
      </View>

      <StatusBar
        style="auto"
      />
    </SafeAreaView>
  );
}

function PrimaryLoadingContent({
  message,
}: {
  message:
    string;
}) {
  return (
    <View
      style={
        styles.primaryLoadingContent
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
    </View>
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
          style={
            styles.primaryButton
          }
        >
          <Text
            style={
              styles.primaryButtonText
            }
          >
            Return
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

    /*
     * Navbar is now a normal second child:
     *
     * [ primaryContent flex:1 ]
     * [ bottom navigation       ]
     */
    primaryNavigationScreen: {
      flex:
        1,

      backgroundColor:
        "#F4F6F8",
    },

    primaryContent: {
      flex:
        1,

      minHeight:
        0,
    },

    primaryLoadingContent: {
      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        24,
    },

    inventoryScreen: {
      flex:
        1,

      minHeight:
        0,
    },

    /*
     * We no longer need 125px for
     * an overlapping floating navbar.
     */
    listContent: {
      padding:
        16,

      paddingBottom:
        10,
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

    secondaryButtonText: {
      fontSize:
        14,

      fontWeight:
        "700",

      color:
        "#20252B",
    },
  });