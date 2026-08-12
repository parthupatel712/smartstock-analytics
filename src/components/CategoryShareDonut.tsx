import {
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Svg, {
  Circle,
} from "react-native-svg";

import type {
  CategorySalesMetric,
} from "../types/inventoryAnalytics";

type CategoryShareMetricType =
  | "sales"
  | "items"
  | "profit";

interface CategoryShareDonutProps {
  categories:
    CategorySalesMetric[];
}

interface DonutItem {
  id: string;

  label: string;

  department: string;

  value: number;

  share: number;

  color: string;
}

const DONUT_SIZE =
  210;

const STROKE_WIDTH =
  32;

const RADIUS =
  (
    DONUT_SIZE -
    STROKE_WIDTH
  ) / 2;

const CIRCUMFERENCE =
  2 *
  Math.PI *
  RADIUS;

const METRIC_OPTIONS: {
  label: string;

  value:
    CategoryShareMetricType;
}[] = [
  {
    label:
      "Sales",

    value:
      "sales",
  },

  {
    label:
      "Items Sold",

    value:
      "items",
  },

  {
    label:
      "Est. Profit",

    value:
      "profit",
  },
];

const SEGMENT_COLORS = [
  "#2563EB",
  "#0F766E",
  "#7C3AED",
  "#EA580C",
  "#DB2777",
  "#64748B",
];

export function CategoryShareDonut({
  categories,
}: CategoryShareDonutProps) {
  const [
    selectedMetric,
    setSelectedMetric,
  ] =
    useState<CategoryShareMetricType>(
      "sales",
    );

  const [
    selectedItemId,
    setSelectedItemId,
  ] =
    useState<string | null>(
      null,
    );

  const donutData =
    useMemo(
      () =>
        buildDonutData(
          categories,
          selectedMetric,
        ),
      [
        categories,
        selectedMetric,
      ],
    );

  const total =
    donutData.reduce(
      (
        sum,
        item,
      ) =>
        sum +
        item.value,
      0,
    );

  const selectedItem =
    donutData.find(
      (item) =>
        item.id ===
        selectedItemId,
    ) ?? null;

  function changeMetric(
    metric:
      CategoryShareMetricType,
  ): void {
    setSelectedMetric(
      metric,
    );

    setSelectedItemId(
      null,
    );
  }

  if (
    donutData.length ===
    0
  ) {
    return (
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
          No category sales yet
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          Category share will appear after sales are recorded.
        </Text>
      </View>
    );
  }

  let cumulativeShare =
    0;

  return (
    <View>
      <View
        style={
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
      </View>

      <View
        style={
          styles.donutSection
        }
      >
        <View
          style={
            styles.donutWrapper
          }
        >
          <Svg
            width={
              DONUT_SIZE
            }
            height={
              DONUT_SIZE
            }
          >
            <Circle
              cx={
                DONUT_SIZE / 2
              }
              cy={
                DONUT_SIZE / 2
              }
              r={
                RADIUS
              }
              fill="none"
              stroke="#EEF0F2"
              strokeWidth={
                STROKE_WIDTH
              }
            />

            {donutData.map(
              (item) => {
                const segmentLength =
                  item.share *
                  CIRCUMFERENCE;

                const offset =
                  cumulativeShare *
                  CIRCUMFERENCE;

                cumulativeShare +=
                  item.share;

                return (
                  <Circle
                    key={
                      item.id
                    }
                    cx={
                      DONUT_SIZE /
                      2
                    }
                    cy={
                      DONUT_SIZE /
                      2
                    }
                    r={
                      RADIUS
                    }
                    fill="none"
                    stroke={
                      item.color
                    }
                    strokeWidth={
                      selectedItem?.id ===
                      item.id
                        ? STROKE_WIDTH +
                          5
                        : STROKE_WIDTH
                    }
                    strokeDasharray={`${segmentLength} ${
                      CIRCUMFERENCE -
                      segmentLength
                    }`}
                    strokeDashoffset={
                      -offset
                    }
                    strokeLinecap="butt"
                    rotation={
                      -90
                    }
                    originX={
                      DONUT_SIZE /
                      2
                    }
                    originY={
                      DONUT_SIZE /
                      2
                    }
                  />
                );
              },
            )}
          </Svg>

          <View
            pointerEvents="none"
            style={
              styles.centerContent
            }
          >
            <Text
              style={
                styles.centerLabel
              }
              numberOfLines={
                2
              }
            >
              {selectedItem
                ? selectedItem.label
                : getCenterLabel(
                    selectedMetric,
                  )}
            </Text>

            <Text
              style={
                styles.centerValue
              }
              numberOfLines={
                1
              }
            >
              {formatMetricValue(
                selectedItem
                  ? selectedItem.value
                  : total,
                selectedMetric,
              )}
            </Text>

            {selectedItem ? (
              <Text
                style={
                  styles.centerShare
                }
              >
                {formatPercent(
                  selectedItem.share *
                    100,
                )}
              </Text>
            ) : (
              <Text
                style={
                  styles.centerShare
                }
              >
                Total
              </Text>
            )}
          </View>
        </View>

        <Text
          style={
            styles.helperText
          }
        >
          Tap a category below to highlight it.
        </Text>
      </View>

      <View
        style={
          styles.legend
        }
      >
        {donutData.map(
          (item) => {
            const isSelected =
              selectedItem?.id ===
              item.id;

            return (
              <Pressable
                key={
                  item.id
                }
                accessibilityRole="button"
                onPress={() =>
                  setSelectedItemId(
                    isSelected
                      ? null
                      : item.id,
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.legendRow,

                  isSelected &&
                    styles.legendRowSelected,

                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <View
                  style={[
                    styles.legendColor,

                    {
                      backgroundColor:
                        item.color,
                    },
                  ]}
                />

                <View
                  style={
                    styles.legendTextContainer
                  }
                >
                  <Text
                    style={
                      styles.legendTitle
                    }
                  >
                    {
                      item.label
                    }
                  </Text>

                  {item.department !==
                  "Other" ? (
                    <Text
                      style={
                        styles.legendSubtitle
                      }
                    >
                      {
                        item.department
                      }
                    </Text>
                  ) : null}
                </View>

                <View
                  style={
                    styles.legendValueContainer
                  }
                >
                  <Text
                    style={
                      styles.legendPercent
                    }
                  >
                    {formatPercent(
                      item.share *
                        100,
                    )}
                  </Text>

                  <Text
                    style={
                      styles.legendValue
                    }
                  >
                    {formatMetricValue(
                      item.value,
                      selectedMetric,
                    )}
                  </Text>
                </View>
              </Pressable>
            );
          },
        )}
      </View>
    </View>
  );
}

function buildDonutData(
  categories:
    CategorySalesMetric[],

  metric:
    CategoryShareMetricType,
): DonutItem[] {
  const normalized =
    categories
      .map(
        (category) => ({
          category,

          value:
            getMetricValue(
              category,
              metric,
            ),
        }),
      )
      .filter(
        (item) =>
          item.value > 0,
      )
      .sort(
        (
          first,
          second,
        ) =>
          second.value -
          first.value,
      );

  const total =
    normalized.reduce(
      (
        sum,
        item,
      ) =>
        sum +
        item.value,
      0,
    );

  if (
    total <= 0
  ) {
    return [];
  }

  const mainItems =
    normalized.slice(
      0,
      5,
    );

  const otherItems =
    normalized.slice(
      5,
    );

  const result:
    DonutItem[] =
    mainItems.map(
      (
        item,
        index,
      ) => ({
        id:
          `${item.category.department}-${item.category.category}`,

        label:
          item.category.category,

        department:
          item.category.department,

        value:
          item.value,

        share:
          item.value /
          total,

        color:
          SEGMENT_COLORS[
            index
          ],
      }),
    );

  if (
    otherItems.length >
    0
  ) {
    const otherValue =
      otherItems.reduce(
        (
          sum,
          item,
        ) =>
          sum +
          item.value,
        0,
      );

    result.push({
      id:
        "other",

      label:
        "Other",

      department:
        "Other",

      value:
        otherValue,

      share:
        otherValue /
        total,

      color:
        SEGMENT_COLORS[
          SEGMENT_COLORS.length -
            1
        ],
    });
  }

  return result;
}

function getMetricValue(
  category:
    CategorySalesMetric,

  metric:
    CategoryShareMetricType,
): number {
  switch (
    metric
  ) {
    case "items":
      return category.unitsSold;

    case "profit":
      return category.estimatedProfit;

    case "sales":
    default:
      return category.salesValue;
  }
}

function getCenterLabel(
  metric:
    CategoryShareMetricType,
): string {
  switch (
    metric
  ) {
    case "items":
      return "Items Sold";

    case "profit":
      return "Est. Profit";

    case "sales":
    default:
      return "Sales";
  }
}

function formatMetricValue(
  value:
    number,

  metric:
    CategoryShareMetricType,
): string {
  if (
    metric ===
    "items"
  ) {
    return new Intl.NumberFormat(
      "en-CA",
    ).format(
      value,
    );
  }

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

function formatPercent(
  value:
    number,
): string {
  const rounded =
    Math.round(
      value * 10,
    ) / 10;

  return `${rounded}%`;
}

const styles =
  StyleSheet.create({
    metricRow: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        8,

      marginBottom:
        18,
    },

    metricButton: {
      minHeight:
        38,

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#D6DCE3",

      borderRadius:
        999,

      paddingHorizontal:
        13,

      backgroundColor:
        "#FFFFFF",
    },

    metricButtonSelected: {
      borderColor:
        "#20252B",

      backgroundColor:
        "#20252B",
    },

    metricButtonText: {
      fontSize:
        12,

      fontWeight:
        "700",

      color:
        "#52606D",
    },

    metricButtonTextSelected: {
      color:
        "#FFFFFF",
    },

    donutSection: {
      alignItems:
        "center",
    },

    donutWrapper: {
      width:
        DONUT_SIZE,

      height:
        DONUT_SIZE,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    centerContent: {
      position:
        "absolute",

      width:
        130,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    centerLabel: {
      fontSize:
        11,

      fontWeight:
        "700",

      textAlign:
        "center",

      color:
        "#6B7280",
    },

    centerValue: {
      marginTop:
        4,

      fontSize:
        20,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    centerShare: {
      marginTop:
        3,

      fontSize:
        11,

      fontWeight:
        "700",

      color:
        "#8B949E",
    },

    helperText: {
      marginTop:
        10,

      fontSize:
        10,

      textAlign:
        "center",

      color:
        "#9CA3AF",
    },

    legend: {
      marginTop:
        18,
    },

    legendRow: {
      minHeight:
        58,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingVertical:
        10,

      paddingHorizontal:
        5,
    },

    legendRowSelected: {
      borderRadius:
        10,

      backgroundColor:
        "#F8FAFC",
    },

    legendColor: {
      width:
        12,

      height:
        12,

      borderRadius:
        6,
    },

    legendTextContainer: {
      flex:
        1,

      marginLeft:
        10,

      marginRight:
        10,
    },

    legendTitle: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    legendSubtitle: {
      marginTop:
        2,

      fontSize:
        10,

      color:
        "#8B949E",
    },

    legendValueContainer: {
      alignItems:
        "flex-end",
    },

    legendPercent: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#374151",
    },

    legendValue: {
      marginTop:
        2,

      fontSize:
        10,

      color:
        "#8B949E",
    },

    buttonPressed: {
      opacity:
        0.72,
    },

    emptyContainer: {
      minHeight:
        180,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        24,
    },

    emptyTitle: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    emptyText: {
      marginTop:
        5,

      fontSize:
        12,

      lineHeight:
        18,

      textAlign:
        "center",

      color:
        "#6B7280",
    },
  });