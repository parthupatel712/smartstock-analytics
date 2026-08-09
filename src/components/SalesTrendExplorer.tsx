import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  getCategorySalesTrend,
  getOverallSalesTrend,
  getProductSalesTrend,
  getSalesTrendCategoryOptions,
  getSalesTrendProductOptions,
} from "../database/salesTrendRepository";

import type { AnalyticsPeriodDays } from "../types/analyticsPeriod";

import type {
  SalesTrendCategoryOption,
  SalesTrendMetric,
  SalesTrendPoint,
  SalesTrendProductOption,
  SalesTrendView,
} from "../types/salesTrend";

interface SalesTrendExplorerProps {
  selectedPeriod: AnalyticsPeriodDays;
}

type PickerType =
  | "category"
  | "product"
  | null;

const METRIC_OPTIONS: {
  label: string;
  value: SalesTrendMetric;
}[] = [
  {
    label: "Sales",
    value: "sales",
  },
  {
    label: "Items Sold",
    value: "items",
  },
  {
    label: "Estimated Profit",
    value: "estimated_profit",
  },
];

const VIEW_OPTIONS: {
  label: string;
  value: SalesTrendView;
}[] = [
  {
    label: "All Products",
    value: "all",
  },
  {
    label: "Category",
    value: "category",
  },
  {
    label: "Product",
    value: "product",
  },
];

export function SalesTrendExplorer({
  selectedPeriod,
}: SalesTrendExplorerProps) {
  const [
    selectedMetric,
    setSelectedMetric,
  ] = useState<SalesTrendMetric>(
    "sales",
  );

  const [
    selectedView,
    setSelectedView,
  ] = useState<SalesTrendView>(
    "all",
  );

  const [
    categoryOptions,
    setCategoryOptions,
  ] = useState<
    SalesTrendCategoryOption[]
  >([]);

  const [
    productOptions,
    setProductOptions,
  ] = useState<
    SalesTrendProductOption[]
  >([]);

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<SalesTrendCategoryOption | null>(
      null,
    );

  const [
    selectedProduct,
    setSelectedProduct,
  ] =
    useState<SalesTrendProductOption | null>(
      null,
    );

  const [
    trendPoints,
    setTrendPoints,
  ] = useState<SalesTrendPoint[]>(
    [],
  );

  const [
    activePicker,
    setActivePicker,
  ] = useState<PickerType>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    void loadFilterOptions();
  }, []);

  useEffect(() => {
    void loadTrendData();
  }, [
    selectedPeriod,
    selectedView,
    selectedCategory,
    selectedProduct,
  ]);

  async function loadFilterOptions(): Promise<void> {
    try {
      const [
        categories,
        products,
      ] = await Promise.all([
        getSalesTrendCategoryOptions(),
        getSalesTrendProductOptions(),
      ]);

      setCategoryOptions(
        categories,
      );

      setProductOptions(
        products,
      );

      setSelectedCategory(
        (current) =>
          current ??
          categories[0] ??
          null,
      );

      setSelectedProduct(
        (current) =>
          current ??
          products[0] ??
          null,
      );
    } catch (error) {
      console.error(
        "Could not load sales trend filters:",
        error,
      );
    }
  }

  async function loadTrendData(): Promise<void> {
    try {
      setIsLoading(true);
      setErrorMessage("");

      let points:
        SalesTrendPoint[];

      if (
        selectedView === "category"
      ) {
        if (!selectedCategory) {
          setTrendPoints([]);
          return;
        }

        points =
          await getCategorySalesTrend(
            selectedPeriod,
            selectedCategory.department,
            selectedCategory.category,
          );
      } else if (
        selectedView === "product"
      ) {
        if (!selectedProduct) {
          setTrendPoints([]);
          return;
        }

        points =
          await getProductSalesTrend(
            selectedPeriod,
            selectedProduct.productId,
          );
      } else {
        points =
          await getOverallSalesTrend(
            selectedPeriod,
          );
      }

      setTrendPoints(points);
    } catch (error) {
      console.error(
        "Could not load sales trend:",
        error,
      );

      setTrendPoints([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Sales trend could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleViewChange(
    view: SalesTrendView,
  ): void {
    setSelectedView(view);

    if (
      view === "category" &&
      !selectedCategory &&
      categoryOptions.length > 0
    ) {
      setSelectedCategory(
        categoryOptions[0],
      );
    }

    if (
      view === "product" &&
      !selectedProduct &&
      productOptions.length > 0
    ) {
      setSelectedProduct(
        productOptions[0],
      );
    }
  }

  const selectedViewLabel =
    useMemo(() => {
      if (
        selectedView === "category"
      ) {
        return selectedCategory
          ? `${selectedCategory.department} · ${selectedCategory.category}`
          : "Select category";
      }

      if (
        selectedView === "product"
      ) {
        if (!selectedProduct) {
          return "Select product";
        }

        return selectedProduct.brand.trim()
          ? `${selectedProduct.productName} · ${selectedProduct.brand}`
          : selectedProduct.productName;
      }

      return "All Products";
    }, [
      selectedView,
      selectedCategory,
      selectedProduct,
    ]);

  const totalValue =
    useMemo(() => {
      return trendPoints.reduce(
        (
          total,
          point,
        ) =>
          total +
          getMetricValue(
            point,
            selectedMetric,
          ),
        0,
      );
    }, [
      trendPoints,
      selectedMetric,
    ]);

  return (
    <View>
      <View
        style={
          styles.sectionHeader
        }
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          Sales Trend
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          See how sales are changing over time.
        </Text>
      </View>

      <Text
        style={
          styles.filterLabel
        }
      >
        Show
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.optionRow
        }
      >
        {METRIC_OPTIONS.map(
          (option) => {
            const isSelected =
              selectedMetric ===
              option.value;

            return (
              <Pressable
                key={
                  option.value
                }
                accessibilityRole="button"
                onPress={() =>
                  setSelectedMetric(
                    option.value,
                  )
                }
                style={({ pressed }) => [
                  styles.optionButton,

                  isSelected &&
                    styles.optionButtonSelected,

                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.optionButtonText,

                    isSelected &&
                      styles.optionButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          },
        )}
      </ScrollView>

      <Text
        style={
          styles.filterLabel
        }
      >
        View
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.optionRow
        }
      >
        {VIEW_OPTIONS.map(
          (option) => {
            const isSelected =
              selectedView ===
              option.value;

            return (
              <Pressable
                key={
                  option.value
                }
                accessibilityRole="button"
                onPress={() =>
                  handleViewChange(
                    option.value,
                  )
                }
                style={({ pressed }) => [
                  styles.optionButton,

                  isSelected &&
                    styles.optionButtonSelected,

                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.optionButtonText,

                    isSelected &&
                      styles.optionButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          },
        )}
      </ScrollView>

      {selectedView !==
      "all" ? (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            setActivePicker(
              selectedView,
            )
          }
          style={({ pressed }) => [
            styles.selectorButton,

            pressed &&
              styles.buttonPressed,
          ]}
        >
          <View
            style={
              styles.selectorTextContainer
            }
          >
            <Text
              style={
                styles.selectorLabel
              }
            >
              {selectedView ===
              "category"
                ? "Selected Category"
                : "Selected Product"}
            </Text>

            <Text
              style={
                styles.selectorValue
              }
              numberOfLines={2}
            >
              {
                selectedViewLabel
              }
            </Text>
          </View>

          <Text
            style={
              styles.selectorArrow
            }
          >
            ⌄
          </Text>
        </Pressable>
      ) : null}

      <View
        style={
          styles.chartPlaceholder
        }
      >
        {isLoading ? (
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading sales trend…
            </Text>
          </View>
        ) : errorMessage ? (
          <Text
            style={
              styles.errorText
            }
          >
            {errorMessage}
          </Text>
        ) : trendPoints.length ===
          0 ? (
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
              No sales yet
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              There is no sales data for this selection and time period.
            </Text>
          </View>
        ) : (
          <>
            <View
              style={
                styles.previewHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.previewLabel
                  }
                >
                  {
                    getMetricLabel(
                      selectedMetric,
                    )
                  }
                </Text>

                <Text
                  style={
                    styles.previewValue
                  }
                >
                  {
                    formatMetricValue(
                      totalValue,
                      selectedMetric,
                    )
                  }
                </Text>
              </View>

              <Text
                style={
                  styles.previewContext
                }
              >
                {
                  selectedViewLabel
                }
              </Text>
            </View>

            <View
              style={
                styles.previewBars
              }
            >
              {buildPreviewPoints(
                trendPoints,
              ).map(
                (point) => {
                  const value =
                    getMetricValue(
                      point,
                      selectedMetric,
                    );

                  const max =
                    getMaximumMetricValue(
                      trendPoints,
                      selectedMetric,
                    );

                  const height =
                    max > 0
                      ? Math.max(
                          (
                            value /
                            max
                          ) *
                            100,
                          4,
                        )
                      : 4;

                  return (
                    <View
                      key={
                        point.date
                      }
                      style={
                        styles.previewColumn
                      }
                    >
                      <View
                        style={
                          styles.previewBarArea
                        }
                      >
                        <View
                          style={[
                            styles.previewBar,

                            {
                              height:
                                `${height}%`,
                            },
                          ]}
                        />
                      </View>

                      <Text
                        style={
                          styles.previewDate
                        }
                      >
                        {formatShortDate(
                          point.date,
                        )}
                      </Text>
                    </View>
                  );
                },
              )}
            </View>

            <Text
              style={
                styles.chartComingText
              }
            >
              Interactive line chart will replace this preview in the next step.
            </Text>
          </>
        )}
      </View>

      <Modal
        transparent
        animationType="slide"
        visible={
          activePicker !==
          null
        }
        onRequestClose={() =>
          setActivePicker(null)
        }
      >
        <View
          style={
            styles.modalBackdrop
          }
        >
          <View
            style={
              styles.modalContent
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                {activePicker ===
                "category"
                  ? "Select Category"
                  : "Select Product"}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setActivePicker(
                    null,
                  )
                }
                style={
                  styles.modalCloseButton
                }
              >
                <Text
                  style={
                    styles.modalCloseText
                  }
                >
                  Close
                </Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              {activePicker ===
              "category"
                ? categoryOptions.map(
                    (
                      category,
                    ) => {
                      const isSelected =
                        selectedCategory?.department ===
                          category.department &&
                        selectedCategory?.category ===
                          category.category;

                      return (
                        <PickerOption
                          key={`${category.department}-${category.category}`}
                          title={
                            category.category
                          }
                          subtitle={
                            category.department
                          }
                          selected={
                            isSelected
                          }
                          onPress={() => {
                            setSelectedCategory(
                              category,
                            );

                            setActivePicker(
                              null,
                            );
                          }}
                        />
                      );
                    },
                  )
                : productOptions.map(
                    (
                      product,
                    ) => {
                      const isSelected =
                        selectedProduct?.productId ===
                        product.productId;

                      const subtitle =
                        [
                          product.brand.trim(),
                          product.category,
                        ]
                          .filter(
                            Boolean,
                          )
                          .join(
                            " · ",
                          );

                      return (
                        <PickerOption
                          key={
                            product.productId
                          }
                          title={
                            product.productName
                          }
                          subtitle={
                            subtitle
                          }
                          selected={
                            isSelected
                          }
                          onPress={() => {
                            setSelectedProduct(
                              product,
                            );

                            setActivePicker(
                              null,
                            );
                          }}
                        />
                      );
                    },
                  )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function PickerOption({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.pickerOption,

        selected &&
          styles.pickerOptionSelected,

        pressed &&
          styles.buttonPressed,
      ]}
    >
      <View
        style={
          styles.pickerOptionText
        }
      >
        <Text
          style={
            styles.pickerOptionTitle
          }
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={
              styles.pickerOptionSubtitle
            }
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {selected ? (
        <Text
          style={
            styles.selectedMark
          }
        >
          ✓
        </Text>
      ) : null}
    </Pressable>
  );
}

function getMetricValue(
  point: SalesTrendPoint,
  metric: SalesTrendMetric,
): number {
  switch (metric) {
    case "items":
      return point.itemsSold;

    case "estimated_profit":
      return point.estimatedProfit;

    case "sales":
    default:
      return point.salesValue;
  }
}

function getMetricLabel(
  metric: SalesTrendMetric,
): string {
  switch (metric) {
    case "items":
      return "Items Sold";

    case "estimated_profit":
      return "Estimated Profit";

    case "sales":
    default:
      return "Sales";
  }
}

function formatMetricValue(
  value: number,
  metric: SalesTrendMetric,
): string {
  if (
    metric === "items"
  ) {
    return formatNumber(
      value,
    );
  }

  return formatCurrency(
    value,
  );
}

function getMaximumMetricValue(
  points: SalesTrendPoint[],
  metric: SalesTrendMetric,
): number {
  return Math.max(
    ...points.map(
      (point) =>
        getMetricValue(
          point,
          metric,
        ),
    ),
    1,
  );
}

function buildPreviewPoints(
  points: SalesTrendPoint[],
): SalesTrendPoint[] {
  const maximumPoints = 10;

  if (
    points.length <=
    maximumPoints
  ) {
    return points;
  }

  const step =
    Math.ceil(
      points.length /
        maximumPoints,
    );

  return points.filter(
    (
      _,
      index,
    ) =>
      index % step === 0 ||
      index ===
        points.length - 1,
  );
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-CA",
    {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-CA",
    {
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function formatShortDate(
  date: string,
): string {
  const parsedDate =
    new Date(
      `${date}T00:00:00`,
    );

  return parsedDate.toLocaleDateString(
    "en-CA",
    {
      month: "short",
      day: "numeric",
    },
  );
}

const styles =
  StyleSheet.create({
    sectionHeader: {
      marginTop: 28,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: "#111827",
    },

    sectionDescription: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      color: "#6B7280",
    },

    filterLabel: {
      marginTop: 18,
      marginBottom: 8,
      fontSize: 12,
      fontWeight: "800",
      textTransform:
        "uppercase",
      letterSpacing: 0.4,
      color: "#6B7280",
    },

    optionRow: {
      gap: 8,
      paddingRight: 10,
    },

    optionButton: {
      minHeight: 40,
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth: 1,
      borderColor:
        "#CBD2DA",
      borderRadius: 999,
      paddingHorizontal: 14,
      backgroundColor:
        "#FFFFFF",
    },

    optionButtonSelected: {
      borderColor:
        "#20252B",
      backgroundColor:
        "#20252B",
    },

    optionButtonText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#52606D",
    },

    optionButtonTextSelected: {
      color: "#FFFFFF",
    },

    buttonPressed: {
      opacity: 0.7,
    },

    selectorButton: {
      marginTop: 14,
      minHeight: 62,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      borderWidth: 1,
      borderColor:
        "#D6DCE3",
      borderRadius: 14,
      paddingHorizontal: 14,
      backgroundColor:
        "#FFFFFF",
    },

    selectorTextContainer: {
      flex: 1,
      marginRight: 12,
    },

    selectorLabel: {
      fontSize: 10,
      fontWeight: "700",
      textTransform:
        "uppercase",
      color: "#8B949E",
    },

    selectorValue: {
      marginTop: 4,
      fontSize: 14,
      fontWeight: "800",
      color: "#111827",
    },

    selectorArrow: {
      fontSize: 22,
      color: "#6B7280",
    },

    chartPlaceholder: {
      marginTop: 16,
      minHeight: 245,
      borderWidth: 1,
      borderColor:
        "#E0E4E8",
      borderRadius: 16,
      padding: 16,
      backgroundColor:
        "#FFFFFF",
    },

    loadingContainer: {
      minHeight: 210,
      alignItems: "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 10,
      fontSize: 13,
      color: "#6B7280",
    },

    errorText: {
      paddingVertical: 40,
      textAlign: "center",
      color: "#B42318",
    },

    emptyContainer: {
      minHeight: 210,
      alignItems: "center",
      justifyContent:
        "center",
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: "#111827",
    },

    emptyText: {
      marginTop: 6,
      maxWidth: 280,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      color: "#6B7280",
    },

    previewHeader: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
    },

    previewLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: "#6B7280",
    },

    previewValue: {
      marginTop: 4,
      fontSize: 23,
      fontWeight: "800",
      color: "#111827",
    },

    previewContext: {
      maxWidth: "50%",
      marginLeft: 12,
      fontSize: 11,
      lineHeight: 16,
      textAlign: "right",
      color: "#6B7280",
    },

    previewBars: {
      marginTop: 18,
      height: 125,
      flexDirection: "row",
      alignItems:
        "flex-end",
      gap: 5,
    },

    previewColumn: {
      flex: 1,
      alignItems: "center",
    },

    previewBarArea: {
      width: "100%",
      height: 100,
      justifyContent:
        "flex-end",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor:
        "#E5E7EB",
    },

    previewBar: {
      width: "65%",
      minHeight: 3,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      backgroundColor:
        "#2563EB",
    },

    previewDate: {
      marginTop: 6,
      fontSize: 8,
      color: "#8B949E",
    },

    chartComingText: {
      marginTop: 12,
      fontSize: 10,
      textAlign: "center",
      color: "#9CA3AF",
    },

    modalBackdrop: {
      flex: 1,
      justifyContent:
        "flex-end",
      backgroundColor:
        "rgba(0, 0, 0, 0.35)",
    },

    modalContent: {
      maxHeight: "72%",
      borderTopLeftRadius:
        20,
      borderTopRightRadius:
        20,
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 30,
      backgroundColor:
        "#FFFFFF",
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 10,
    },

    modalTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: "#111827",
    },

    modalCloseButton: {
      paddingHorizontal: 10,
      paddingVertical: 7,
    },

    modalCloseText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#20252B",
    },

    pickerOption: {
      minHeight: 62,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor:
        "#E5E7EB",
      paddingHorizontal: 6,
      paddingVertical: 12,
    },

    pickerOptionSelected: {
      backgroundColor:
        "#F8FAFC",
    },

    pickerOptionText: {
      flex: 1,
      marginRight: 12,
    },

    pickerOptionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: "#111827",
    },

    pickerOptionSubtitle: {
      marginTop: 3,
      fontSize: 11,
      color: "#6B7280",
    },

    selectedMark: {
      fontSize: 17,
      fontWeight: "800",
      color: "#15803D",
    },
  });