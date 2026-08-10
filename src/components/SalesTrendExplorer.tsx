import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { LineChart } from "react-native-gifted-charts";

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

interface ChartPoint {
  value: number;
  label: string;
  date: string;
  rawPoint: SalesTrendPoint;
}

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
  const { width } =
    useWindowDimensions();

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

      setTrendPoints(
        points,
      );
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

  const chartData =
    useMemo(
      () =>
        buildChartData(
          trendPoints,
          selectedMetric,
        ),
      [
        trendPoints,
        selectedMetric,
      ],
    );

  const chartWidth =
    Math.max(
      width - 92,
      250,
    );

  const maximumValue =
    useMemo(() => {
      const highest =
        Math.max(
          ...chartData.map(
            (point) =>
              point.value,
          ),
          1,
        );

      return Math.ceil(
        highest * 1.15,
      );
    }, [chartData]);

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
                style={({
                  pressed,
                }) => [
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
                  {
                    option.label
                  }
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
                style={({
                  pressed,
                }) => [
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
                  {
                    option.label
                  }
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
          styles.chartCard
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
                styles.chartHeader
              }
            >
              <View
                style={
                  styles.chartHeaderValue
                }
              >
                <Text
                  style={
                    styles.chartMetricLabel
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
                    styles.chartMetricValue
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
                  styles.chartContext
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
                styles.chartHelpText
              }
            >
              Touch and drag across the line to see daily values.
            </Text>

            <View
              style={
                styles.lineChartContainer
              }
            >
              <LineChart
                key={`${selectedMetric}-${selectedView}-${selectedPeriod}-${selectedCategory?.category ?? "all"}-${selectedProduct?.productId ?? "all"}`}
                data={
                  chartData
                }
                width={
                  chartWidth
                }
                height={220}
                maxValue={
                  maximumValue
                }
                initialSpacing={
                  12
                }
                endSpacing={
                  16
                }
                spacing={
                  calculateChartSpacing(
                    chartWidth,
                    chartData.length,
                  )
                }
                thickness={3}
                curved
                hideDataPoints={
                  chartData.length >
                  20
                }
                dataPointsHeight={
                  7
                }
                dataPointsWidth={
                  7
                }
                yAxisLabelWidth={
                  52
                }
                noOfSections={
                  4
                }
                yAxisTextStyle={
                  styles.axisText
                }
                xAxisLabelTextStyle={
                  styles.xAxisText
                }
                xAxisColor="#D7DCE2"
                yAxisColor="#D7DCE2"
                rulesColor="#EEF0F2"
                showVerticalLines={
                  false
                }
                isAnimated
                animationDuration={
                  450
                }
                formatYLabel={(
                  value,
                ) =>
                  formatAxisValue(
                    Number(
                      value,
                    ),
                    selectedMetric,
                  )
                }
                pointerConfig={{
                  pointerStripHeight:
                    220,

                  pointerStripWidth:
                    1,

                  pointerColor:
                    "#8B949E",

                  radius:
                    5,

                  activatePointersOnLongPress:
                    true,

                  autoAdjustPointerLabelPosition:
                    true,

                  pointerLabelWidth:
                    150,

                  pointerLabelHeight:
                    112,

                  pointerLabelComponent:
                    (
                      items: ChartPoint[],
                    ) => {
                      const point =
                        items[0];

                      if (!point) {
                        return null;
                      }

                      return (
                        <View
                          style={
                            styles.tooltip
                          }
                        >
                          <Text
                            style={
                              styles.tooltipDate
                            }
                          >
                            {formatFullDate(
                              point.date,
                            )}
                          </Text>

                          <Text
                            style={
                              styles.tooltipLabel
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
                              styles.tooltipValue
                            }
                          >
                            {formatMetricValue(
                              point.value,
                              selectedMetric,
                            )}
                          </Text>

                          <Text
                            style={
                              styles.tooltipExtra
                            }
                          >
                            {formatNumber(
                              point.rawPoint
                                .itemsSold,
                            )}{" "}
                            items sold
                          </Text>
                        </View>
                      );
                    },
                }}
              />
            </View>
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
          setActivePicker(
            null,
          )
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

function buildChartData(
  points: SalesTrendPoint[],
  metric: SalesTrendMetric,
): ChartPoint[] {
  if (
    points.length === 0
  ) {
    return [];
  }

  const labelInterval =
    getLabelInterval(
      points.length,
    );

  return points.map(
    (
      point,
      index,
    ) => ({
      value:
        getMetricValue(
          point,
          metric,
        ),

      label:
        index %
          labelInterval ===
          0 ||
        index ===
          points.length - 1
          ? formatShortDate(
              point.date,
            )
          : "",

      date:
        point.date,

      rawPoint:
        point,
    }),
  );
}

function getLabelInterval(
  pointCount: number,
): number {
  if (
    pointCount <= 7
  ) {
    return 1;
  }

  if (
    pointCount <= 14
  ) {
    return 2;
  }

  if (
    pointCount <= 31
  ) {
    return 5;
  }

  if (
    pointCount <= 100
  ) {
    return 14;
  }

  return 30;
}

function calculateChartSpacing(
  chartWidth: number,
  pointCount: number,
): number {
  if (
    pointCount <= 1
  ) {
    return chartWidth;
  }

  const naturalSpacing =
    chartWidth /
    Math.max(
      pointCount - 1,
      1,
    );

  return Math.max(
    naturalSpacing,
    18,
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

function formatAxisValue(
  value: number,
  metric: SalesTrendMetric,
): string {
  if (
    metric === "items"
  ) {
    return formatCompactNumber(
      value,
    );
  }

  if (
    Math.abs(value) >=
    1000
  ) {
    return `$${formatCompactNumber(
      value,
    )}`;
  }

  return `$${Math.round(
    value,
  )}`;
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

function formatCompactNumber(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-CA",
    {
      notation: "compact",
      maximumFractionDigits: 1,
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

function formatFullDate(
  date: string,
): string {
  const parsedDate =
    new Date(
      `${date}T00:00:00`,
    );

  return parsedDate.toLocaleDateString(
    "en-CA",
    {
      weekday: "short",
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

    chartCard: {
      marginTop: 16,
      minHeight: 300,
      overflow: "hidden",
      borderWidth: 1,
      borderColor:
        "#E0E4E8",
      borderRadius: 16,
      paddingTop: 16,
      paddingBottom: 14,
      backgroundColor:
        "#FFFFFF",
    },

    chartHeader: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
      paddingHorizontal: 16,
    },

    chartHeaderValue: {
      flex: 1,
      marginRight: 12,
    },

    chartMetricLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: "#6B7280",
    },

    chartMetricValue: {
      marginTop: 4,
      fontSize: 24,
      fontWeight: "800",
      color: "#111827",
    },

    chartContext: {
      maxWidth: "48%",
      fontSize: 11,
      lineHeight: 16,
      textAlign: "right",
      color: "#6B7280",
    },

    chartHelpText: {
      marginTop: 8,
      paddingHorizontal: 16,
      fontSize: 10,
      color: "#8B949E",
    },

    lineChartContainer: {
      marginTop: 18,
      paddingRight: 8,
    },

    axisText: {
      fontSize: 9,
      color: "#8B949E",
    },

    xAxisText: {
      fontSize: 8,
      color: "#8B949E",
    },

    tooltip: {
      width: 145,
      minHeight: 100,
      borderWidth: 1,
      borderColor:
        "#D6DCE3",
      borderRadius: 12,
      padding: 10,
      backgroundColor:
        "#FFFFFF",
    },

    tooltipDate: {
      fontSize: 10,
      fontWeight: "700",
      color: "#6B7280",
    },

    tooltipLabel: {
      marginTop: 7,
      fontSize: 10,
      color: "#8B949E",
    },

    tooltipValue: {
      marginTop: 2,
      fontSize: 16,
      fontWeight: "800",
      color: "#111827",
    },

    tooltipExtra: {
      marginTop: 5,
      fontSize: 10,
      color: "#6B7280",
    },

    loadingContainer: {
      minHeight: 260,
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
      paddingVertical: 60,
      paddingHorizontal: 20,
      textAlign: "center",
      color: "#B42318",
    },

    emptyContainer: {
      minHeight: 260,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 20,
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