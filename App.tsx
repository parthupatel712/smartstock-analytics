import {
  Ionicons,
} from "@expo/vector-icons";

import {
  StatusBar,
} from "expo-status-bar";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaProvider,
} from "react-native-safe-area-context";

import {
  AppHeader,
} from "./src/components/AppHeader";

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
  HomeDashboard,
} from "./src/components/HomeDashboard";

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
  ScannerProductResult,
} from "./src/components/ScannerProductResult";

import {
  getHomeOrderSummary,
} from "./src/database/homeRepository";

import type {
  HomeOrderSummary,
} from "./src/database/homeRepository";

import {
  getInventoryAnalyticsSummary,
} from "./src/database/inventoryAnalyticsRepository";

import {
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
  | "dashboard"
  | "inventory"
  | "add-product"
  | "edit-product"
  | "scanner"
  | "order-scanner"
  | "inventory-transaction"
  | "transaction-history"
  | "global-transactions"
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

type ProductFormReturnView =
  | "inventory"
  | "scanner";

type ProductActionReturnView =
  | "inventory"
  | "scanner";

function getActiveBottomNavigationItem(
  view:
    AppView,
): BottomNavigationItem | null {
  switch (
    view
  ) {
    case "dashboard":
      return "home";

    case "inventory":
    case "global-transactions":
    case "export-reports":
    case "import-inventory":
      return "inventory";

    case "scanner":
      return "scan";

    case "reorder-management":
    case "order-management":
      return "orders";

    case "analytics":
      return "analytics";

    default:
      return null;
  }
}

const CLOUD_SYNC_TIMEOUT_MS =
  8000;

const INVENTORY_SEARCH_DEBOUNCE_MS =
  180;

/*
 * Temporary store name.
 *
 * Later this can come from
 * Business / Store Settings.
 */
const STORE_NAME =
  "Esso/Becker's";

const INITIAL_HOME_ORDER_SUMMARY:
  HomeOrderSummary = {
    draftOrderCount:
      0,

    upcomingOrderCount:
      0,

    upcomingUnits:
      0,

    upcomingValue:
      0,
  };

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

  /*
   * Home is the application
   * launch screen.
   */
  const [
    currentView,
    setCurrentView,
  ] =
    useState<AppView>(
      "dashboard",
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
    homeOrderSummary,
    setHomeOrderSummary,
  ] =
    useState<HomeOrderSummary>(
      INITIAL_HOME_ORDER_SUMMARY,
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
    isHomeLoading,
    setIsHomeLoading,
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

  const [
    scannerProduct,
    setScannerProduct,
  ] =
    useState<Product | null>(
      null,
    );

  const [
    productFormReturnView,
    setProductFormReturnView,
  ] =
    useState<ProductFormReturnView>(
      "inventory",
    );

  const [
    productActionReturnView,
    setProductActionReturnView,
  ] =
    useState<ProductActionReturnView>(
      "inventory",
    );

  const [
    scannerSessionKey,
    setScannerSessionKey,
  ] =
    useState(
      0,
    );

  const [
    isInventoryMenuVisible,
    setIsInventoryMenuVisible,
  ] =
    useState(
      false,
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
          currentReorderItems,
          currentOrderedQuantities,
          currentHomeOrderSummary,
        ] =
          await Promise.all([
            getAllProducts(),

            getLatestDeliveriesByProduct(),

            getInventoryDashboardSummary(),

            getReorderItems(),

            getOrderedQuantitiesByProduct(),

            getHomeOrderSummary(),
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

        setReorderItems(
          currentReorderItems,
        );

        setOrderedQuantities(
          currentOrderedQuantities,
        );

        setHomeOrderSummary(
          currentHomeOrderSummary,
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

                    setHomeOrderSummary(
                      await getHomeOrderSummary(),
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

                  setHomeOrderSummary(
                    await getHomeOrderSummary(),
                  );
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

      const createdProduct =
        productFormReturnView ===
        "scanner"
          ? await getProductByBarcode(
              values.barcode,
            )
          : null;

      setScannedBarcode(
        "",
      );

      if (
        productFormReturnView ===
        "scanner"
      ) {
        setScannerProduct(
          createdProduct,
        );

        setCurrentView(
          "scanner",
        );

        Alert.alert(
          "Product added",
          `${values.name.trim()} was added successfully.`,
        );

        return;
      }

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
            setScannerProduct(
              existingProduct,
            );

            return;
          }

          setScannerProduct(
            null,
          );

          setScannedBarcode(
            barcode,
          );

          setProductFormReturnView(
            "scanner",
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

          throw error;
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
        setProductActionReturnView(
          "inventory",
        );

        setSelectedProduct(
          product,
        );

        setCurrentView(
          "edit-product",
        );
      },

      [],
    );

  const openScannerEditProduct =
    useCallback(
      (
        product:
          Product,
      ): void => {
        setProductActionReturnView(
          "scanner",
        );

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
          productActionReturnView,
        );
      },

      [
        productActionReturnView,
      ],
    );

  async function handleUpdateProduct(
    input:
      UpdateProductInput,
  ): Promise<void> {
    try {
      setIsProductUpdating(
        true,
      );

      const originalBarcode =
        selectedProduct?.barcode ??
        "";

      await updateProduct(
        input,
      );

      await loadInventoryData();

      await pushToCloud(
        "product-update",
      );

      let scannerUpdatedProduct:
        Product | null = null;

      if (
        productActionReturnView ===
        "scanner"
      ) {
        const inputBarcode =
          "barcode" in input &&
          typeof input.barcode ===
            "string"
            ? input.barcode
            : "";

        const barcodeToReload =
          inputBarcode.trim()
            ? inputBarcode
            : originalBarcode;

        if (
          barcodeToReload
        ) {
          scannerUpdatedProduct =
            await getProductByBarcode(
              barcodeToReload,
            );
        }
      }

      setSelectedProduct(
        null,
      );

      if (
        productActionReturnView ===
        "scanner"
      ) {
        setScannerProduct(
          scannerUpdatedProduct,
        );

        setCurrentView(
          "scanner",
        );

        Alert.alert(
          "Product updated",
          "The product details were updated successfully.",
        );

        return;
      }

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

        returnView:
          ProductActionReturnView =
          "inventory",
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

          setScannerProduct(
            null,
          );

          if (
            returnView ===
            "scanner"
          ) {
            setScannerSessionKey(
              (
                previous,
              ) =>
                previous +
                1,
            );

            setCurrentView(
              "scanner",
            );

            return;
          }

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

        returnView:
          ProductActionReturnView =
          "inventory",
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
                    returnView,
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

    setArchivedProducts(
      await getArchivedProducts(),
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

    setArchivedProducts(
      await getArchivedProducts(),
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

      setPurchaseOrderHistory(
        await getPurchaseOrderHistory(
          200,
        ),
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

      setHomeOrderSummary(
        await getHomeOrderSummary(),
      );

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
        setProductActionReturnView(
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

  const openScannerTransactionForm =
    useCallback(
      (
        product:
          Product,
      ): void => {
        setProductActionReturnView(
          "scanner",
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
        setSelectedProduct(
          null,
        );

        setCurrentView(
          productActionReturnView,
        );
      },

      [
        productActionReturnView,
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

      const productBarcode =
        selectedProduct?.barcode ??
        "";

      await createInventoryTransaction(
        input,
      );

      await loadInventoryData();

      await pushToCloud(
        "inventory-update",
      );

      let updatedScannerProduct:
        Product | null = null;

      if (
        productActionReturnView ===
          "scanner" &&
        productBarcode
      ) {
        updatedScannerProduct =
          await getProductByBarcode(
            productBarcode,
          );
      }

      setSelectedProduct(
        null,
      );

      if (
        productActionReturnView ===
        "scanner"
      ) {
        setScannerProduct(
          updatedScannerProduct,
        );

        setCurrentView(
          "scanner",
        );

        return;
      }

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
        setProductActionReturnView(
          "inventory",
        );

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

  const openScannerTransactionHistory =
    useCallback(
      async (
        product:
          Product,
      ): Promise<void> => {
        setProductActionReturnView(
          "scanner",
        );

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
          productActionReturnView,
        );
      },

      [
        productActionReturnView,
      ],
    );

  async function openHome():
    Promise<void> {
    setCurrentView(
      "dashboard",
    );

    setIsHomeLoading(
      true,
    );

    try {
      const [
        inventorySummary,
        orderSummary,
      ] =
        await Promise.all([
          getInventoryDashboardSummary(),

          getHomeOrderSummary(),
        ]);

      setDashboardSummary(
        inventorySummary,
      );

      setHomeOrderSummary(
        orderSummary,
      );
    } catch (
      error
    ) {
      console.error(
        "Could not load Home:",
        error,
      );
    } finally {
      setIsHomeLoading(
        false,
      );
    }
  }

  const openInventory =
    useCallback(
      (): void => {
        setSelectedProduct(
          null,
        );

        setProductActionReturnView(
          "inventory",
        );

        setProductFormReturnView(
          "inventory",
        );

        setCurrentView(
          "inventory",
        );
      },

      [],
    );

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

        setScannerProduct(
          null,
        );

        setProductFormReturnView(
          "inventory",
        );

        setCurrentView(
          "add-product",
        );
      },

      [],
    );

  const openManualProductFromScanner =
    useCallback(
      (): void => {
        setScannerProduct(
          null,
        );

        setScannedBarcode(
          "",
        );

        setProductFormReturnView(
          "scanner",
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

        if (
          productFormReturnView ===
          "scanner"
        ) {
          setCurrentView(
            "scanner",
          );

          return;
        }

        setCurrentView(
          "inventory",
        );
      },

      [
        productFormReturnView,
      ],
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

  const resetScannerWorkspace =
    useCallback(
      (): void => {
        setScannerProduct(
          null,
        );

        setScannedBarcode(
          "",
        );

        setScannerSessionKey(
          (
            previous,
          ) =>
            previous +
            1,
        );
      },

      [],
    );

  const openScannerWorkspace =
    useCallback(
      (): void => {
        resetScannerWorkspace();

        setProductFormReturnView(
          "inventory",
        );

        setProductActionReturnView(
          "inventory",
        );

        setCurrentView(
          "scanner",
        );
      },

      [
        resetScannerWorkspace,
      ],
    );

  const closeScannerWorkspace =
    useCallback(
      (): void => {
        resetScannerWorkspace();

        setProductFormReturnView(
          "inventory",
        );

        setProductActionReturnView(
          "inventory",
        );

        setCurrentView(
          "inventory",
        );
      },

      [
        resetScannerWorkspace,
      ],
    );

  const openInventoryMenu =
    useCallback(
      (): void => {
        setIsInventoryMenuVisible(
          true,
        );
      },

      [],
    );

  const closeInventoryMenu =
    useCallback(
      (): void => {
        setIsInventoryMenuVisible(
          false,
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
        onHome={() =>
          void openHome()
        }
        onInventory={
          openInventory
        }
        onScan={
          openScannerWorkspace
        }
        onOrders={() =>
          void openReorderManagement()
        }
        onAnalytics={() =>
          void openAnalytics()
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
          onArchiveProduct={(
            product,
          ) =>
            confirmArchiveProduct(
              product,
              "inventory",
            )
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
      <BrandedScreen>
        <LoadingContent
          message="Loading inventory…"
        />
      </BrandedScreen>
    );
  }

  if (
    status ===
    "error"
  ) {
    return (
      <BrandedScreen>
        <FallbackContent
          message={
            errorMessage
          }
          onReturn={() =>
            void loadProducts()
          }
        />
      </BrandedScreen>
    );
  }

  /*
   * SCAN
   */
  if (
    currentView ===
    "scanner"
  ) {
    return (
      <BrandedScreen>
        <BarcodeScanner
          key={
            scannerSessionKey
          }
          title="Scan Product"
          subtitle="Scan a barcode or add a product manually."
          onBarcodeDetected={
            handleBarcodeDetected
          }
          onAddProductManually={
            openManualProductFromScanner
          }
          onClose={
            closeScannerWorkspace
          }
          bottomContent={
            scannerProduct ? (
              <ScannerProductResult
                product={
                  scannerProduct
                }
                latestDelivery={
                  latestDeliveries.get(
                    scannerProduct.id,
                  )
                }
                onUpdateInventory={
                  openScannerTransactionForm
                }
                onViewHistory={
                  openScannerTransactionHistory
                }
                onEditProduct={
                  openScannerEditProduct
                }
                onArchiveProduct={(
                  product,
                ) =>
                  confirmArchiveProduct(
                    product,
                    "scanner",
                  )
                }
              />
            ) : undefined
          }
        />
      </BrandedScreen>
    );
  }

  /*
   * ORDER BARCODE SCANNER
   */
  if (
    currentView ===
    "order-scanner"
  ) {
    return (
      <BrandedScreen>
        <BarcodeScanner
          title="Scan Order Product"
          subtitle="Scan a product barcode to add it to the purchase order."
          onBarcodeDetected={
            handleOrderBarcodeDetected
          }
          onClose={() =>
            setCurrentView(
              "create-order",
            )
          }
        />
      </BrandedScreen>
    );
  }

  /*
   * PRODUCT DETAILS
   */
  if (
    currentView ===
      "product-details" &&
    selectedProduct
  ) {
    return (
      <BrandedScreen>
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
          onArchive={(
            product,
          ) =>
            confirmArchiveProduct(
              product,
              "inventory",
            )
          }
          onClose={
            closeProductDetails
          }
        />
      </BrandedScreen>
    );
  }

  /*
   * HOME
   */
  if (
    currentView ===
    "dashboard"
  ) {
    return (
      <BrandedScreen>
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
            {isHomeLoading ? (
              <PrimaryLoadingContent
                message="Loading Home…"
              />
            ) : (
              <HomeDashboard
                storeName={
                  STORE_NAME
                }
                summary={
                  dashboardSummary
                }
                draftOrderCount={
                  homeOrderSummary.draftOrderCount
                }
                upcomingOrderCount={
                  homeOrderSummary.upcomingOrderCount
                }
                upcomingUnits={
                  homeOrderSummary.upcomingUnits
                }
                upcomingValue={
                  homeOrderSummary.upcomingValue
                }
                cloudSyncStatus={
                  cloudSyncStatus
                }
                onOpenInventory={
                  openInventory
                }
                onOpenLowStock={() =>
                  void openReorderManagement()
                }
                onOpenOutOfStock={
                  openInventory
                }
                onOpenDraftOrders={() =>
                  void openOrderManagement()
                }
                onOpenUpcomingOrders={() =>
                  void openOrderManagement()
                }
              />
            )}
          </View>

          {
            renderBottomNavigation()
          }
        </View>
      </BrandedScreen>
    );
  }

  /*
   * STOCK AUDIT / GLOBAL TRANSACTIONS
   */
  if (
    currentView ===
    "global-transactions"
  ) {
    return (
      <BrandedScreen>
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
                onClose={
                  openInventory
                }
              />
            )}
          </View>

          {
            renderBottomNavigation()
          }
        </View>
      </BrandedScreen>
    );
  }

  /*
   * ORDERS
   */
  if (
    currentView ===
    "reorder-management"
  ) {
    return (
      <BrandedScreen>
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
                message="Loading orders…"
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
                  void openHome()
                }
              />
            )}
          </View>

          {
            renderBottomNavigation()
          }
        </View>
      </BrandedScreen>
    );
  }

  /*
   * ORDER MANAGEMENT
   */
  if (
    currentView ===
    "order-management"
  ) {
    return (
      <BrandedScreen>
        {isOrderManagementLoading ? (
          <LoadingContent
            message="Loading purchase orders…"
          />
        ) : (
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
        )}
      </BrandedScreen>
    );
  }

  /*
   * ORDER DETAILS
   */
  if (
    currentView ===
    "order-details"
  ) {
    return (
      <BrandedScreen>
        {isOrderDetailsLoading ? (
          <LoadingContent
            message="Loading order details…"
          />
        ) : !selectedPurchaseOrder ? (
          <FallbackContent
            message="Purchase order not selected"
            onReturn={
              closePurchaseOrderDetails
            }
          />
        ) : (
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
        )}
      </BrandedScreen>
    );
  }

  /*
   * RECEIVE ORDER
   */
  if (
    currentView ===
    "receive-order"
  ) {
    return (
      <BrandedScreen>
        {!selectedPurchaseOrder ? (
          <FallbackContent
            message="Purchase order not selected"
            onReturn={
              closePurchaseOrderDetails
            }
          />
        ) : (
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
        )}
      </BrandedScreen>
    );
  }

  /*
   * INVOICE REVIEW
   */
  if (
    currentView ===
    "invoice-review"
  ) {
    return (
      <BrandedScreen>
        {!invoiceImportResult ? (
          <FallbackContent
            message="Invoice review unavailable"
            onReturn={() =>
              setCurrentView(
                "receive-order",
              )
            }
          />
        ) : isOrderReceiving ? (
          <LoadingContent
            message="Receiving order and updating inventory…"
          />
        ) : (
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
        )}
      </BrandedScreen>
    );
  }

  /*
   * CREATE ORDER
   */
  if (
    currentView ===
    "create-order"
  ) {
    return (
      <BrandedScreen>
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
      </BrandedScreen>
    );
  }

  /*
   * ORDER PREVIEW
   */
  if (
    currentView ===
    "order-preview"
  ) {
    return (
      <BrandedScreen>
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
      </BrandedScreen>
    );
  }

  /*
   * ANALYTICS
   */
  if (
    currentView ===
    "analytics"
  ) {
    return (
      <BrandedScreen>
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
                  void openHome()
                }
              />
            )}
          </View>

          {
            renderBottomNavigation()
          }
        </View>
      </BrandedScreen>
    );
  }

  /*
   * EXPORT REPORTS
   */
  if (
    currentView ===
    "export-reports"
  ) {
    return (
      <BrandedScreen>
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
              onClose={
                openInventory
              }
            />
          </View>

          {
            renderBottomNavigation()
          }
        </View>
      </BrandedScreen>
    );
  }

  /*
   * UPDATE INVENTORY
   */
  if (
    currentView ===
      "inventory-transaction" &&
    selectedProduct
  ) {
    return (
      <BrandedScreen>
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
      </BrandedScreen>
    );
  }

  /*
   * PRODUCT STOCK HISTORY
   */
  if (
    currentView ===
      "transaction-history" &&
    selectedProduct
  ) {
    return (
      <BrandedScreen>
        {isHistoryLoading ? (
          <LoadingContent
            message="Loading transaction history…"
          />
        ) : (
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
        )}
      </BrandedScreen>
    );
  }

  /*
   * EDIT PRODUCT
   */
  if (
    currentView ===
      "edit-product" &&
    selectedProduct
  ) {
    return (
      <BrandedScreen>
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
      </BrandedScreen>
    );
  }

  /*
   * ADD PRODUCT
   */
  if (
    currentView ===
    "add-product"
  ) {
    return (
      <BrandedScreen>
        <View
          style={
            styles.addProductScreen
          }
        >
          <View
            style={
              styles.topBar
            }
          >
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
                {productFormReturnView ===
                "scanner"
                  ? "Back"
                  : "Cancel"}
              </Text>
            </Pressable>
          </View>

          <View
            style={
              styles.formContent
            }
          >
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
          </View>
        </View>
      </BrandedScreen>
    );
  }

  /*
   * IMPORT INVENTORY
   */
  if (
    currentView ===
    "import-inventory"
  ) {
    return (
      <BrandedScreen>
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
              onClose={
                openInventory
              }
            />
          </View>

          {
            renderBottomNavigation()
          }
        </View>
      </BrandedScreen>
    );
  }

  /*
   * MAIN INVENTORY
   */
  return (
    <BrandedScreen>
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
          showsVerticalScrollIndicator={
            false
          }
          ListHeaderComponent={
            <View>
              <View
                style={
                  styles.header
                }
              >
                <View
                  style={
                    styles.inventoryHeaderRow
                  }
                >
                  <View
                    style={
                      styles.inventoryHeaderText
                    }
                  >
                    <Text
                      style={
                        styles.title
                      }
                    >
                      Inventory
                    </Text>

                    <Text
                      style={
                        styles.summary
                      }
                    >
                      {products.length} active products
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Inventory tools"
                    hitSlop={
                      8
                    }
                    onPress={
                      openInventoryMenu
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.inventoryMenuButton,

                      pressed &&
                        styles.inventoryMenuButtonPressed,
                    ]}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={
                        22
                      }
                      color="#20252B"
                    />
                  </Pressable>
                </View>

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
                    void openHome()
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
                  onScanBarcode={
                    openScannerWorkspace
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

      <Modal
        animationType="fade"
        transparent
        visible={
          isInventoryMenuVisible
        }
        onRequestClose={
          closeInventoryMenu
        }
      >
        <Pressable
          style={
            styles.inventoryMenuBackdrop
          }
          onPress={
            closeInventoryMenu
          }
        >
          <Pressable
            style={
              styles.inventoryMenuSheet
            }
            onPress={() => {
              // Prevent backdrop press.
            }}
          >
            <View
              style={
                styles.inventoryMenuHandle
              }
            />

            <View
              style={
                styles.inventoryMenuHeader
              }
            >
              <View
                style={
                  styles.inventoryMenuTitleRow
                }
              >
                <View
                  style={
                    styles.inventoryMenuHeaderIcon
                  }
                >
                  <Ionicons
                    name="cube-outline"
                    size={
                      20
                    }
                    color="#2563EB"
                  />
                </View>

                <View
                  style={
                    styles.inventoryMenuHeaderText
                  }
                >
                  <Text
                    style={
                      styles.inventoryMenuTitle
                    }
                  >
                    Inventory Tools
                  </Text>

                  <Text
                    style={
                      styles.inventoryMenuSubtitle
                    }
                  >
                    Manage data and review inventory activity.
                  </Text>
                </View>
              </View>
            </View>

            <InventoryMenuItem
              icon="download-outline"
              title="Import Inventory"
              subtitle="Add or update products from a file"
              onPress={() => {
                closeInventoryMenu();

                setCurrentView(
                  "import-inventory",
                );
              }}
            />

            <InventoryMenuItem
              icon="share-outline"
              title="Export Reports"
              subtitle="Generate CSV, Excel or PDF reports"
              onPress={() => {
                closeInventoryMenu();

                setCurrentView(
                  "export-reports",
                );
              }}
            />

            <InventoryMenuItem
              icon="time-outline"
              title="Stock Audit History"
              subtitle="Review stock movements and archived products"
              onPress={() => {
                closeInventoryMenu();

                void openGlobalTransactions();
              }}
            />

            <Pressable
              accessibilityRole="button"
              onPress={
                closeInventoryMenu
              }
              style={({
                pressed,
              }) => [
                styles.inventoryMenuCancel,

                pressed &&
                  styles.inventoryMenuCancelPressed,
              ]}
            >
              <Text
                style={
                  styles.inventoryMenuCancelText
                }
              >
                Cancel
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </BrandedScreen>
  );
}

/*
 * GLOBAL SMARTSTOCK HEADER
 *
 * AppHeader handles the iPhone
 * safe-area itself.
 *
 * Child screens therefore should not
 * add the "top" SafeArea edge.
 */
function BrandedScreen({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <View
      style={
        styles.brandedScreen
      }
    >
      <AppHeader />

      <View
        style={
          styles.brandedContent
        }
      >
        {
          children
        }
      </View>

      <StatusBar
        style="dark"
      />
    </View>
  );
}

function InventoryMenuItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon:
    | "download-outline"
    | "share-outline"
    | "time-outline";

  title:
    string;

  subtitle:
    string;

  onPress:
    () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.inventoryMenuItem,

        pressed &&
          styles.inventoryMenuItemPressed,
      ]}
    >
      <View
        style={
          styles.inventoryMenuItemIcon
        }
      >
        <Ionicons
          name={
            icon
          }
          size={
            21
          }
          color="#2563EB"
        />
      </View>

      <View
        style={
          styles.inventoryMenuItemText
        }
      >
        <Text
          style={
            styles.inventoryMenuItemTitle
          }
        >
          {
            title
          }
        </Text>

        <Text
          style={
            styles.inventoryMenuItemSubtitle
          }
        >
          {
            subtitle
          }
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={
          18
        }
        color="#98A2B3"
      />
    </Pressable>
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

function LoadingContent({
  message,
}: {
  message:
    string;
}) {
  return (
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
    </View>
  );
}

function FallbackContent({
  message,
  onReturn,
}: {
  message:
    string;

  onReturn:
    () => void;
}) {
  return (
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
  );
}

const styles =
  StyleSheet.create({
    brandedScreen: {
      flex:
        1,

      minHeight:
        0,

      backgroundColor:
        "#F4F6F8",
    },

    /*
     * IMPORTANT:
     *
     * No paddingTop here.
     *
     * AppHeader already handles the
     * iPhone safe area.
     */
    brandedContent: {
      flex:
        1,

      minHeight:
        0,

      backgroundColor:
        "#F4F6F8",
    },

    primaryNavigationScreen: {
      flex:
        1,

      minHeight:
        0,

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

      backgroundColor:
        "#F4F6F8",
    },

    addProductScreen: {
      flex:
        1,

      minHeight:
        0,

      backgroundColor:
        "#F4F6F8",
    },

    formContent: {
      flex:
        1,

      minHeight:
        0,
    },

    listContent: {
      paddingHorizontal:
        16,

      paddingTop:
        8,

      paddingBottom:
        10,
    },

    header: {
      marginBottom:
        18,
    },

    inventoryHeaderRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    inventoryHeaderText: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        12,
    },

    inventoryMenuButton: {
      width:
        42,

      height:
        42,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#D8DEE6",

      borderRadius:
        13,

      backgroundColor:
        "#FFFFFF",
    },

    inventoryMenuButtonPressed: {
      backgroundColor:
        "#F2F4F7",
    },

    title: {
      fontSize:
        28,

      lineHeight:
        34,

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
        6,

      paddingBottom:
        4,
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

    inventoryMenuBackdrop: {
      flex:
        1,

      justifyContent:
        "flex-end",

      backgroundColor:
        "rgba(15, 23, 42, 0.32)",
    },

    inventoryMenuSheet: {
      borderTopLeftRadius:
        28,

      borderTopRightRadius:
        28,

      paddingHorizontal:
        18,

      paddingTop:
        9,

      paddingBottom:
        28,

      backgroundColor:
        "#FFFFFF",
    },

    inventoryMenuHandle: {
      width:
        38,

      height:
        4,

      alignSelf:
        "center",

      borderRadius:
        999,

      backgroundColor:
        "#D0D5DD",
    },

    inventoryMenuHeader: {
      marginTop:
        18,

      marginBottom:
        16,
    },

    inventoryMenuTitleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    inventoryMenuHeaderIcon: {
      width:
        44,

      height:
        44,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        14,

      backgroundColor:
        "#EFF6FF",
    },

    inventoryMenuHeaderText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        12,
    },

    inventoryMenuTitle: {
      fontSize:
        20,

      fontWeight:
        "800",

      color:
        "#101828",
    },

    inventoryMenuSubtitle: {
      marginTop:
        3,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#667085",
    },

    inventoryMenuItem: {
      minHeight:
        68,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        9,

      borderWidth:
        1,

      borderColor:
        "#EAECF0",

      borderRadius:
        17,

      paddingHorizontal:
        13,

      backgroundColor:
        "#FFFFFF",
    },

    inventoryMenuItemPressed: {
      backgroundColor:
        "#F8FAFC",
    },

    inventoryMenuItemIcon: {
      width:
        42,

      height:
        42,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        13,

      backgroundColor:
        "#EFF6FF",
    },

    inventoryMenuItemText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        12,

      marginRight:
        8,
    },

    inventoryMenuItemTitle: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#101828",
    },

    inventoryMenuItemSubtitle: {
      marginTop:
        3,

      fontSize:
        11,

      lineHeight:
        16,

      color:
        "#667085",
    },

    inventoryMenuCancel: {
      minHeight:
        50,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        4,

      borderRadius:
        15,

      backgroundColor:
        "#F2F4F7",
    },

    inventoryMenuCancelPressed: {
      backgroundColor:
        "#E4E7EC",
    },

    inventoryMenuCancelText: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#344054",
    },
  });