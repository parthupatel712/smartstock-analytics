import {
  useMemo,
  useState,
} from "react";

import {
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Line,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import type {
  DailyInventoryMetric,
  SalesTrendMetric,
} from "../types/inventoryAnalytics";

export type SalesChartMetric =
  | "sales"
  | "items"
  | "profit";

type TrendFilterMode =
  | "all"
  | "category"
  | "product";

interface SalesLineChartProps {
  metrics:
    DailyInventoryMetric[];

  salesTrendMetrics:
    SalesTrendMetric[];
}

interface ChartPoint {
  date: string;
  value: number;
  x: number;
  y: number;
}

interface CategoryOption {
  key: string;
  department: string;
  category: string;
  label: string;
}

interface ProductOption {
  id: number;
  name: string;
  brand: string;
  label: string;
}

const METRIC_OPTIONS: {
  label: string;
  value: SalesChartMetric;
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
    label: "Est. Profit",
    value: "profit",
  },
];

const FILTER_MODE_OPTIONS: {
  label: string;
  value: TrendFilterMode;
}[] = [
  {
    label: "All Store",
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

const CHART_HEIGHT = 260;

const LEFT_PADDING = 48;
const RIGHT_PADDING = 16;
const TOP_PADDING = 22;
const BOTTOM_PADDING = 38;

export function SalesLineChart({
  metrics,
  salesTrendMetrics,
}: SalesLineChartProps) {
  const {
    width: screenWidth,
  } = useWindowDimensions();

  const [
    selectedMetric,
    setSelectedMetric,
  ] =
    useState<SalesChartMetric>(
      "sales",
    );

  const [
    filterMode,
    setFilterMode,
  ] =
    useState<TrendFilterMode>(
      "all",
    );

  const [
    selectedCategoryKey,
    setSelectedCategoryKey,
  ] =
    useState("");

  const [
    selectedProductId,
    setSelectedProductId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    selectedPoint,
    setSelectedPoint,
  ] =
    useState<ChartPoint | null>(
      null,
    );

  const chartWidth =
    Math.max(
      280,
      Math.min(
        screenWidth - 72,
        520,
      ),
    );

  const categories =
    useMemo(() => {
      const categoryMap =
        new Map<
          string,
          CategoryOption
        >();

      salesTrendMetrics.forEach(
        (item) => {
          const key =
            `${item.department}::${item.category}`;

          if (
            categoryMap.has(
              key,
            )
          ) {
            return;
          }

          categoryMap.set(
            key,
            {
              key,

              department:
                item.department,

              category:
                item.category,

              label:
                `${item.department} · ${item.category}`,
            },
          );
        },
      );

      return Array.from(
        categoryMap.values(),
      ).sort(
        (
          first,
          second,
        ) =>
          first.label.localeCompare(
            second.label,
          ),
      );
    }, [
      salesTrendMetrics,
    ]);

  const products =
    useMemo(() => {
      const productMap =
        new Map<
          number,
          ProductOption
        >();

      salesTrendMetrics.forEach(
        (item) => {
          if (
            productMap.has(
              item.productId,
            )
          ) {
            return;
          }

          const brand =
            item.brand.trim();

          productMap.set(
            item.productId,
            {
              id:
                item.productId,

              name:
                item.productName,

              brand:
                item.brand,

              label:
                brand
                  ? `${item.productName} · ${brand}`
                  : item.productName,
            },
          );
        },
      );

      return Array.from(
        productMap.values(),
      ).sort(
        (
          first,
          second,
        ) =>
          first.name.localeCompare(
            second.name,
          ),
      );
    }, [
      salesTrendMetrics,
    ]);

  const selectedCategory =
    categories.find(
      (category) =>
        category.key ===
        selectedCategoryKey,
    );

  const selectedProduct =
    products.find(
      (product) =>
        product.id ===
        selectedProductId,
    );

  const chartMetrics =
    useMemo(() => {
      if (
        filterMode ===
        "all"
      ) {
        return reduceChartPoints(
          metrics,
          14,
        );
      }

      let filtered:
        SalesTrendMetric[] = [];

      if (
        filterMode ===
        "category"
      ) {
        const category =
          categories.find(
            (item) =>
              item.key ===
              selectedCategoryKey,
          );

        if (
          !category
        ) {
          return [];
        }

        filtered =
          salesTrendMetrics.filter(
            (item) =>
              item.department ===
                category.department &&
              item.category ===
                category.category,
          );
      }

      if (
        filterMode ===
        "product"
      ) {
        if (
          selectedProductId ===
          null
        ) {
          return [];
        }

        filtered =
          salesTrendMetrics.filter(
            (item) =>
              item.productId ===
              selectedProductId,
          );
      }

      const grouped =
        new Map<
          string,
          DailyInventoryMetric
        >();

      filtered.forEach(
        (item) => {
          const existing =
            grouped.get(
              item.date,
            );

          if (
            existing
          ) {
            existing.salesValue +=
              item.salesValue;

            existing.salesUnits +=
              item.salesUnits;

            existing.estimatedProfit +=
              item.estimatedProfit;

            existing.transactionCount +=
              1;

            return;
          }

          grouped.set(
            item.date,
            {
              date:
                item.date,

              salesValue:
                item.salesValue,

              estimatedProfit:
                item.estimatedProfit,

              stockInValue:
                0,

              damageValue:
                0,

              salesUnits:
                item.salesUnits,

              stockInUnits:
                0,

              damageUnits:
                0,

              transactionCount:
                1,
            },
          );
        },
      );

      const groupedMetrics =
        Array.from(
          grouped.values(),
        ).sort(
          (
            first,
            second,
          ) =>
            first.date.localeCompare(
              second.date,
            ),
        );

      return reduceChartPoints(
        groupedMetrics,
        14,
      );
    }, [
      categories,
      filterMode,
      metrics,
      salesTrendMetrics,
      selectedCategoryKey,
      selectedProductId,
    ]);

  const values =
    chartMetrics.map(
      (metric) =>
        getMetricValue(
          metric,
          selectedMetric,
        ),
    );

  /*
   * Percentage for the entire
   * displayed period.
   *
   * Example:
   *
   * Aug 11 = $15
   * Aug 12 = $30
   *
   * Period change = +100%
   */
  const periodChange =
    chartMetrics.length >= 2
      ? calculatePercentChange(
          getMetricValue(
            chartMetrics[
              chartMetrics.length - 1
            ],
            selectedMetric,
          ),

          getMetricValue(
            chartMetrics[0],
            selectedMetric,
          ),
        )
      : null;

  /*
   * When the crosshair is being used,
   * calculate change compared with
   * the previous displayed sales day.
   */
  const selectedPointIndex =
    selectedPoint
      ? chartMetrics.findIndex(
          (metric) =>
            metric.date ===
            selectedPoint.date,
        )
      : -1;

  const selectedDayChange =
    selectedPointIndex > 0
      ? calculatePercentChange(
          getMetricValue(
            chartMetrics[
              selectedPointIndex
            ],
            selectedMetric,
          ),

          getMetricValue(
            chartMetrics[
              selectedPointIndex - 1
            ],
            selectedMetric,
          ),
        )
      : null;

  const maximumValue =
    Math.max(
      ...values,
      1,
    );

  const roundedMaximum =
    getNiceMaximum(
      maximumValue,
    );

  const chartBottom =
    CHART_HEIGHT -
    BOTTOM_PADDING;

  const usableWidth =
    chartWidth -
    LEFT_PADDING -
    RIGHT_PADDING;

  const usableHeight =
    chartBottom -
    TOP_PADDING;

  const points =
    chartMetrics.map(
      (
        metric,
        index,
      ): ChartPoint => {
        const value =
          getMetricValue(
            metric,
            selectedMetric,
          );

        const x =
          chartMetrics.length ===
          1
            ? LEFT_PADDING +
              usableWidth / 2
            : LEFT_PADDING +
              (
                index /
                (
                  chartMetrics.length -
                  1
                )
              ) *
                usableWidth;

        const y =
          chartBottom -
          (
            value /
            roundedMaximum
          ) *
            usableHeight;

        return {
          date:
            metric.date,

          value,

          x,

          y,
        };
      },
    );

  const linePath =
    buildLinePath(
      points,
    );

  const areaPath =
    buildAreaPath(
      points,
      chartBottom,
    );

  const ySteps = [
    1,
    0.75,
    0.5,
    0.25,
    0,
  ];

  const totalValue =
    values.reduce(
      (
        total,
        value,
      ) =>
        total +
        value,
      0,
    );

  function selectPointFromX(
    touchX: number,
  ): void {
    if (
      points.length ===
      0
    ) {
      return;
    }

    const clampedX =
      Math.max(
        LEFT_PADDING,

        Math.min(
          touchX,
          chartWidth -
            RIGHT_PADDING,
        ),
      );

    let nearestPoint =
      points[0];

    let nearestDistance =
      Math.abs(
        points[0].x -
          clampedX,
      );

    for (
      let index = 1;
      index <
      points.length;
      index += 1
    ) {
      const distance =
        Math.abs(
          points[index].x -
            clampedX,
        );

      if (
        distance <
        nearestDistance
      ) {
        nearestDistance =
          distance;

        nearestPoint =
          points[index];
      }
    }

    setSelectedPoint(
      nearestPoint,
    );
  }

  const panResponder =
    useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder:
            () =>
              points.length >
              0,

          onMoveShouldSetPanResponder:
            () =>
              points.length >
              0,

          onPanResponderGrant:
            (
              event,
            ) => {
              selectPointFromX(
                event.nativeEvent
                  .locationX,
              );
            },

          onPanResponderMove:
            (
              event,
            ) => {
              selectPointFromX(
                event.nativeEvent
                  .locationX,
              );
            },
        }),
      [
        points,
        chartWidth,
      ],
    );

  function changeMetric(
    metric:
      SalesChartMetric,
  ): void {
    setSelectedMetric(
      metric,
    );

    setSelectedPoint(
      null,
    );
  }

  function changeFilterMode(
    mode:
      TrendFilterMode,
  ): void {
    setFilterMode(
      mode,
    );

    setSelectedPoint(
      null,
    );

    if (
      mode ===
        "category" &&
      !selectedCategoryKey
    ) {
      setSelectedCategoryKey(
        categories[0]?.key ??
          "",
      );
    }

    if (
      mode ===
        "product" &&
      selectedProductId ===
        null
    ) {
      setSelectedProductId(
        products[0]?.id ??
          null,
      );
    }
  }

  const filterDescription =
    getFilterDescription(
      filterMode,
      selectedCategory,
      selectedProduct,
    );

  return (
    <View>
      <Text
        style={
          styles.controlLabel
        }
      >
        View By
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.metricRow
        }
      >
        {METRIC_OPTIONS.map(
          (option) => {
            const isSelected =
              option.value ===
              selectedMetric;

            return (
              <Pressable
                key={
                  option.value
                }
                accessibilityRole="button"
                onPress={() =>
                  changeMetric(
                    option.value,
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.metricButton,

                  isSelected &&
                    styles.metricButtonSelected,

                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.metricButtonText,

                    isSelected &&
                      styles.metricButtonTextSelected,
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
          styles.controlLabel
        }
      >
        Sales Filter
      </Text>

      <View
        style={
          styles.filterModeRow
        }
      >
        {FILTER_MODE_OPTIONS.map(
          (option) => {
            const isSelected =
              option.value ===
              filterMode;

            return (
              <Pressable
                key={
                  option.value
                }
                accessibilityRole="button"
                onPress={() =>
                  changeFilterMode(
                    option.value,
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.filterModeButton,

                  isSelected &&
                    styles.filterModeButtonSelected,

                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.filterModeText,

                    isSelected &&
                      styles.filterModeTextSelected,
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
      </View>

      {filterMode ===
      "category" ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filterOptionsRow
          }
        >
          {categories.map(
            (category) => {
              const isSelected =
                selectedCategoryKey ===
                category.key;

              return (
                <Pressable
                  key={
                    category.key
                  }
                  onPress={() => {
                    setSelectedCategoryKey(
                      category.key,
                    );

                    setSelectedPoint(
                      null,
                    );
                  }}
                  style={[
                    styles.filterChip,

                    isSelected &&
                      styles.filterChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,

                      isSelected &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    {
                      category.label
                    }
                  </Text>
                </Pressable>
              );
            },
          )}
        </ScrollView>
      ) : null}

      {filterMode ===
      "product" ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filterOptionsRow
          }
        >
          {products.map(
            (product) => {
              const isSelected =
                selectedProductId ===
                product.id;

              return (
                <Pressable
                  key={
                    product.id
                  }
                  onPress={() => {
                    setSelectedProductId(
                      product.id,
                    );

                    setSelectedPoint(
                      null,
                    );
                  }}
                  style={[
                    styles.filterChip,

                    isSelected &&
                      styles.filterChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,

                      isSelected &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    {
                      product.label
                    }
                  </Text>
                </Pressable>
              );
            },
          )}
        </ScrollView>
      ) : null}

      <View
        style={
          styles.activeFilterBar
        }
      >
        <Text
          style={
            styles.activeFilterLabel
          }
        >
          Showing
        </Text>

        <Text
          style={
            styles.activeFilterValue
          }
        >
          {
            filterDescription
          }
        </Text>
      </View>

      <View
        style={
          styles.chartHeader
        }
      >
        <View
          style={
            styles.chartHeaderMain
          }
        >
          <Text
            style={
              styles.chartHeaderLabel
            }
          >
            {selectedPoint
              ? formatDate(
                  selectedPoint.date,
                )
              : getMetricLabel(
                  selectedMetric,
                )}
          </Text>

          <Text
            style={
              styles.chartHeaderValue
            }
          >
            {selectedPoint
              ? formatMetricValue(
                  selectedPoint.value,
                  selectedMetric,
                )
              : formatMetricValue(
                  totalValue,
                  selectedMetric,
                )}
          </Text>

          <TrendChange
            change={
              selectedPoint
                ? selectedDayChange
                : periodChange
            }
            hasPrevious={
              selectedPoint
                ? selectedPointIndex >
                  0
                : chartMetrics.length >
                  1
            }
            caption={
              selectedPoint
                ? "vs previous sales day"
                : "first to latest sales day"
            }
          />
        </View>

        <View
          style={
            styles.rangeContainer
          }
        >
          <Text
            style={
              styles.rangeLabel
            }
          >
            {selectedPoint
              ? "Selected day"
              : "Period high"}
          </Text>

          <Text
            style={
              styles.rangeValue
            }
          >
            {selectedPoint
              ? getMetricLabel(
                  selectedMetric,
                )
              : values.length >
                  0
                ? formatMetricValue(
                    Math.max(
                      ...values,
                    ),
                    selectedMetric,
                  )
                : "—"}
          </Text>
        </View>
      </View>

      {chartMetrics.length ===
      0 ? (
        <View
          style={
            styles.emptyChart
          }
        >
          <Text
            style={
              styles.emptyTitle
            }
          >
            No sales data
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            There are no recorded sales for this filter during the selected time period.
          </Text>
        </View>
      ) : (
        <>
          <View
            {...panResponder.panHandlers}
            style={[
              styles.chartContainer,

              {
                width:
                  chartWidth,
              },
            ]}
          >
            <Svg
              width={
                chartWidth
              }
              height={
                CHART_HEIGHT
              }
              pointerEvents="none"
            >
              <Defs>
                <LinearGradient
                  id="salesArea"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <Stop
                    offset="0%"
                    stopColor="#2563EB"
                    stopOpacity={
                      0.24
                    }
                  />

                  <Stop
                    offset="100%"
                    stopColor="#2563EB"
                    stopOpacity={
                      0.02
                    }
                  />
                </LinearGradient>
              </Defs>

              {ySteps.map(
                (
                  step,
                  index,
                ) => {
                  const y =
                    TOP_PADDING +
                    (
                      1 -
                      step
                    ) *
                      usableHeight;

                  const value =
                    roundedMaximum *
                    step;

                  return (
                    <G
                      key={
                        `grid-${index}`
                      }
                    >
                      <Line
                        x1={
                          LEFT_PADDING
                        }
                        y1={
                          y
                        }
                        x2={
                          chartWidth -
                          RIGHT_PADDING
                        }
                        y2={
                          y
                        }
                        stroke="#E5E7EB"
                        strokeWidth={
                          1
                        }
                        strokeDasharray={
                          index ===
                          ySteps.length -
                            1
                            ? undefined
                            : "4 4"
                        }
                      />

                      <SvgText
                        x={
                          LEFT_PADDING -
                          7
                        }
                        y={
                          y + 4
                        }
                        fontSize={
                          9
                        }
                        fill="#8B949E"
                        textAnchor="end"
                      >
                        {formatAxisValue(
                          value,
                          selectedMetric,
                        )}
                      </SvgText>
                    </G>
                  );
                },
              )}

              {points.length >
              1 ? (
                <>
                  <Path
                    d={
                      areaPath
                    }
                    fill="url(#salesArea)"
                  />

                  <Path
                    d={
                      linePath
                    }
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth={
                      3
                    }
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : null}

              {points.map(
                (
                  point,
                  index,
                ) => {
                  const isSelected =
                    selectedPoint?.date ===
                    point.date;

                  return (
                    <G
                      key={
                        `${selectedMetric}-${point.date}`
                      }
                    >
                      <Circle
                        cx={
                          point.x
                        }
                        cy={
                          point.y
                        }
                        r={
                          isSelected
                            ? 7
                            : 4
                        }
                        fill="#FFFFFF"
                        stroke="#2563EB"
                        strokeWidth={
                          isSelected
                            ? 4
                            : 2.5
                        }
                      />

                      {shouldShowDateLabel(
                        index,
                        points.length,
                      ) ? (
                        <SvgText
                          x={
                            point.x
                          }
                          y={
                            CHART_HEIGHT -
                            9
                          }
                          fontSize={
                            9
                          }
                          fill="#8B949E"
                          textAnchor="middle"
                        >
                          {formatShortDate(
                            point.date,
                          )}
                        </SvgText>
                      ) : null}
                    </G>
                  );
                },
              )}

              {selectedPoint ? (
                <>
                  <Line
                    x1={
                      selectedPoint.x
                    }
                    y1={
                      TOP_PADDING
                    }
                    x2={
                      selectedPoint.x
                    }
                    y2={
                      chartBottom
                    }
                    stroke="#64748B"
                    strokeWidth={
                      1.5
                    }
                    strokeDasharray="4 3"
                  />

                  <Circle
                    cx={
                      selectedPoint.x
                    }
                    cy={
                      selectedPoint.y
                    }
                    r={
                      8
                    }
                    fill="#FFFFFF"
                    stroke="#1D4ED8"
                    strokeWidth={
                      4
                    }
                  />
                </>
              ) : null}
            </Svg>
          </View>

          {chartMetrics.length ===
          1 ? (
            <View
              style={
                styles.singlePointCard
              }
            >
              <Text
                style={
                  styles.singlePointTitle
                }
              >
                Only one day of sales
              </Text>

              <Text
                style={
                  styles.singlePointText
                }
              >
                More sales dates are needed to calculate a trend percentage.
              </Text>
            </View>
          ) : (
            <Text
              style={
                styles.dragHint
              }
            >
              Slide across the chart to inspect each day
            </Text>
          )}

          {selectedPoint ? (
            <View
              style={
                styles.tooltip
              }
            >
              <View>
                <Text
                  style={
                    styles.tooltipDate
                  }
                >
                  {formatDate(
                    selectedPoint.date,
                  )}
                </Text>

                <Text
                  style={
                    styles.tooltipLabel
                  }
                >
                  {
                    filterDescription
                  }
                </Text>
              </View>

              <View
                style={
                  styles.tooltipValueContainer
                }
              >
                <Text
                  style={
                    styles.tooltipMetricLabel
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
                    selectedPoint.value,
                    selectedMetric,
                  )}
                </Text>

                {selectedPointIndex >
                0 ? (
                  <Text
                    style={[
                      styles.tooltipChange,

                      selectedDayChange !==
                        null &&
                        selectedDayChange >
                          0 &&
                        styles.changePositive,

                      selectedDayChange !==
                        null &&
                        selectedDayChange <
                          0 &&
                        styles.changeNegative,
                    ]}
                  >
                    {formatPercentChange(
                      selectedDayChange,
                    )}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

function TrendChange({
  change,
  hasPrevious,
  caption,
}: {
  change:
    number | null;

  hasPrevious:
    boolean;

  caption:
    string;
}) {
  if (
    !hasPrevious
  ) {
    return (
      <View
        style={
          styles.changeContainer
        }
      >
        <Text
          style={
            styles.changeUnavailable
          }
        >
          First recorded day
        </Text>
      </View>
    );
  }

  if (
    change === null
  ) {
    return (
      <View
        style={
          styles.changeContainer
        }
      >
        <Text
          style={
            styles.changeNew
          }
        >
          New activity
        </Text>

        <Text
          style={
            styles.changeCaption
          }
        >
          Previous value was zero
        </Text>
      </View>
    );
  }

  return (
    <View
      style={
        styles.changeContainer
      }
    >
      <Text
        style={[
          styles.changeValue,

          change > 0 &&
            styles.changePositive,

          change < 0 &&
            styles.changeNegative,

          change === 0 &&
            styles.changeNeutral,
        ]}
      >
        {formatPercentChange(
          change,
        )}
      </Text>

      <Text
        style={
          styles.changeCaption
        }
      >
        {caption}
      </Text>
    </View>
  );
}

function calculatePercentChange(
  current:
    number,

  previous:
    number,
): number | null {
  if (
    previous === 0
  ) {
    return current === 0
      ? 0
      : null;
  }

  return (
    (
      current -
      previous
    ) /
    previous
  ) * 100;
}

function formatPercentChange(
  value:
    number | null,
): string {
  if (
    value === null
  ) {
    return "New";
  }

  const rounded =
    Math.round(
      value * 10,
    ) / 10;

  if (
    Math.abs(
      rounded,
    ) < 0.05
  ) {
    return "0%";
  }

  if (
    rounded > 0
  ) {
    return `↑ ${rounded}%`;
  }

  return `↓ ${Math.abs(
    rounded,
  )}%`;
}

function getFilterDescription(
  mode:
    TrendFilterMode,

  category:
    CategoryOption | undefined,

  product:
    ProductOption | undefined,
): string {
  switch (
    mode
  ) {
    case "category":
      return category?.label ??
        "Select a category";

    case "product":
      return product?.label ??
        "Select a product";

    case "all":
    default:
      return "All Store";
  }
}

function buildLinePath(
  points:
    ChartPoint[],
): string {
  if (
    points.length ===
    0
  ) {
    return "";
  }

  return points
    .map(
      (
        point,
        index,
      ) =>
        `${
          index === 0
            ? "M"
            : "L"
        } ${point.x} ${point.y}`,
    )
    .join(" ");
}

function buildAreaPath(
  points:
    ChartPoint[],

  bottom:
    number,
): string {
  if (
    points.length <
    2
  ) {
    return "";
  }

  const first =
    points[0];

  const last =
    points[
      points.length -
      1
    ];

  const line =
    buildLinePath(
      points,
    );

  return `${line} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
}

function getMetricValue(
  metric:
    DailyInventoryMetric,

  selectedMetric:
    SalesChartMetric,
): number {
  switch (
    selectedMetric
  ) {
    case "items":
      return metric.salesUnits;

    case "profit":
      return metric.estimatedProfit;

    case "sales":
    default:
      return metric.salesValue;
  }
}

function getMetricLabel(
  metric:
    SalesChartMetric,
): string {
  switch (
    metric
  ) {
    case "items":
      return "Items sold";

    case "profit":
      return "Estimated profit";

    case "sales":
    default:
      return "Sales";
  }
}

function getNiceMaximum(
  value:
    number,
): number {
  if (
    value <= 10
  ) {
    return Math.max(
      Math.ceil(
        value,
      ),
      1,
    );
  }

  if (
    value <= 100
  ) {
    return (
      Math.ceil(
        value / 10,
      ) * 10
    );
  }

  if (
    value <= 1000
  ) {
    return (
      Math.ceil(
        value / 100,
      ) * 100
    );
  }

  return (
    Math.ceil(
      value / 1000,
    ) * 1000
  );
}

function shouldShowDateLabel(
  index:
    number,

  total:
    number,
): boolean {
  if (
    total <= 6
  ) {
    return true;
  }

  const middle =
    Math.floor(
      total / 2,
    );

  return (
    index === 0 ||
    index === middle ||
    index ===
      total - 1
  );
}

function formatMetricValue(
  value:
    number,

  metric:
    SalesChartMetric,
): string {
  if (
    metric ===
    "items"
  ) {
    return `${formatNumber(
      value,
    )} items`;
  }

  return formatCurrency(
    value,
  );
}

function formatAxisValue(
  value:
    number,

  metric:
    SalesChartMetric,
): string {
  if (
    metric ===
    "items"
  ) {
    return Math.round(
      value,
    ).toString();
  }

  if (
    value >= 1000
  ) {
    return `$${(
      value / 1000
    ).toFixed(1)}k`;
  }

  return `$${Math.round(
    value,
  )}`;
}

function reduceChartPoints(
  metrics:
    DailyInventoryMetric[],

  maxPoints:
    number,
): DailyInventoryMetric[] {
  if (
    metrics.length <=
    maxPoints
  ) {
    return metrics;
  }

  const step =
    Math.ceil(
      metrics.length /
        maxPoints,
    );

  const result:
    DailyInventoryMetric[] =
    [];

  for (
    let index = 0;
    index <
    metrics.length;
    index += step
  ) {
    const group =
      metrics.slice(
        index,
        index + step,
      );

    if (
      group.length ===
      0
    ) {
      continue;
    }

    result.push({
      date:
        group[
          group.length - 1
        ].date,

      salesValue:
        group.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.salesValue,
          0,
        ),

      estimatedProfit:
        group.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.estimatedProfit,
          0,
        ),

      stockInValue:
        group.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.stockInValue,
          0,
        ),

      damageValue:
        group.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.damageValue,
          0,
        ),

      salesUnits:
        group.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.salesUnits,
          0,
        ),

      stockInUnits:
        group.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.stockInUnits,
          0,
        ),

      damageUnits:
        group.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.damageUnits,
          0,
        ),

      transactionCount:
        group.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.transactionCount,
          0,
        ),
    });
  }

  return result;
}

function formatCurrency(
  value:
    number,
): string {
  return new Intl.NumberFormat(
    "en-CA",
    {
      style:
        "currency",

      currency:
        "CAD",

      maximumFractionDigits:
        2,
    },
  ).format(
    value,
  );
}

function formatNumber(
  value:
    number,
): string {
  return new Intl.NumberFormat(
    "en-CA",
  ).format(
    value,
  );
}

function formatShortDate(
  value:
    string,
): string {
  const date =
    new Date(
      `${value}T00:00:00`,
    );

  return date.toLocaleDateString(
    "en-CA",
    {
      month:
        "short",

      day:
        "numeric",
    },
  );
}

function formatDate(
  value:
    string,
): string {
  const date =
    new Date(
      `${value}T00:00:00`,
    );

  return date.toLocaleDateString(
    "en-CA",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    },
  );
}

const styles =
  StyleSheet.create({
    controlLabel: {
      marginTop: 3,
      marginBottom: 8,
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      color: "#8B949E",
    },

    metricRow: {
      gap: 8,
      paddingRight: 10,
      paddingBottom: 16,
    },

    metricButton: {
      minHeight: 38,
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#D6DCE3",
      borderRadius: 999,
      paddingHorizontal: 13,
      backgroundColor: "#FFFFFF",
    },

    metricButtonSelected: {
      borderColor: "#20252B",
      backgroundColor: "#20252B",
    },

    metricButtonText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#52606D",
    },

    metricButtonTextSelected: {
      color: "#FFFFFF",
    },

    filterModeRow: {
      flexDirection: "row",
      gap: 7,
      marginBottom: 10,
    },

    filterModeButton: {
      flex: 1,
      minHeight: 38,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#D6DCE3",
      borderRadius: 10,
      paddingHorizontal: 8,
      backgroundColor: "#FFFFFF",
    },

    filterModeButtonSelected: {
      borderColor: "#0F766E",
      backgroundColor: "#ECFDF5",
    },

    filterModeText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#6B7280",
    },

    filterModeTextSelected: {
      color: "#0F766E",
    },

    filterOptionsRow: {
      gap: 7,
      paddingRight: 10,
      paddingBottom: 12,
    },

    filterChip: {
      minHeight: 36,
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#D6DCE3",
      borderRadius: 999,
      paddingHorizontal: 12,
      backgroundColor: "#FFFFFF",
    },

    filterChipSelected: {
      borderColor: "#20252B",
      backgroundColor: "#20252B",
    },

    filterChipText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#52606D",
    },

    filterChipTextSelected: {
      color: "#FFFFFF",
    },

    activeFilterBar: {
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 10,
      paddingHorizontal: 11,
      paddingVertical: 9,
      backgroundColor: "#F8FAFC",
    },

    activeFilterLabel: {
      fontSize: 10,
      fontWeight: "700",
      textTransform: "uppercase",
      color: "#8B949E",
    },

    activeFilterValue: {
      flex: 1,
      marginLeft: 8,
      fontSize: 11,
      fontWeight: "700",
      color: "#374151",
    },

    buttonPressed: {
      opacity: 0.72,
    },

    chartHeader: {
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },

    chartHeaderMain: {
      flex: 1,
      marginRight: 12,
    },

    chartHeaderLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: "#6B7280",
    },

    chartHeaderValue: {
      marginTop: 3,
      fontSize: 21,
      fontWeight: "800",
      color: "#111827",
    },

    changeContainer: {
      marginTop: 6,
    },

    changeValue: {
      fontSize: 13,
      fontWeight: "800",
    },

    changePositive: {
      color: "#15803D",
    },

    changeNegative: {
      color: "#B42318",
    },

    changeNeutral: {
      color: "#6B7280",
    },

    changeNew: {
      fontSize: 12,
      fontWeight: "800",
      color: "#2563EB",
    },

    changeUnavailable: {
      fontSize: 11,
      fontWeight: "700",
      color: "#8B949E",
    },

    changeCaption: {
      marginTop: 2,
      fontSize: 9,
      color: "#9CA3AF",
    },

    rangeContainer: {
      alignItems: "flex-end",
    },

    rangeLabel: {
      fontSize: 10,
      color: "#8B949E",
    },

    rangeValue: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: "700",
      color: "#52606D",
    },

    chartContainer: {
      alignSelf: "center",
      overflow: "hidden",
      borderRadius: 12,
      backgroundColor: "#FFFFFF",
    },

    dragHint: {
      marginTop: 10,
      fontSize: 11,
      textAlign: "center",
      color: "#7A838E",
    },

    tooltip: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: "#E0E4E8",
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 11,
      backgroundColor: "#F8FAFC",
    },

    tooltipDate: {
      fontSize: 11,
      fontWeight: "700",
      color: "#374151",
    },

    tooltipLabel: {
      marginTop: 3,
      maxWidth: 190,
      fontSize: 10,
      color: "#8B949E",
    },

    tooltipValueContainer: {
      marginLeft: 12,
      alignItems: "flex-end",
    },

    tooltipMetricLabel: {
      fontSize: 9,
      fontWeight: "700",
      textTransform: "uppercase",
      color: "#8B949E",
    },

    tooltipValue: {
      marginTop: 2,
      fontSize: 16,
      fontWeight: "800",
      color: "#111827",
    },

    tooltipChange: {
      marginTop: 3,
      fontSize: 11,
      fontWeight: "800",
    },

    singlePointCard: {
      marginTop: 10,
      borderRadius: 10,
      padding: 11,
      backgroundColor: "#F8FAFC",
    },

    singlePointTitle: {
      fontSize: 12,
      fontWeight: "800",
      color: "#374151",
    },

    singlePointText: {
      marginTop: 3,
      fontSize: 11,
      lineHeight: 16,
      color: "#6B7280",
    },

    emptyChart: {
      minHeight: 180,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
    },

    emptyTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: "#111827",
    },

    emptyText: {
      marginTop: 5,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      color: "#6B7280",
    },
  });