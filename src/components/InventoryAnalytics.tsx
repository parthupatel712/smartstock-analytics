import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SalesLineChart } from "./SalesLineChart";
import { StoreInsightCards } from "./StoreInsightCards";
import {
  ANALYTICS_PERIOD_OPTIONS,
  type AnalyticsPeriodDays,
} from "../types/analyticsPeriod";

import type {
  CategorySalesMetric,
  InventoryAnalyticsSummary,
  ProductSalesMetric,
  ProductTrend,
} from "../types/inventoryAnalytics";

interface InventoryAnalyticsProps {
  summary:
    InventoryAnalyticsSummary;

  selectedPeriod:
    AnalyticsPeriodDays;

  onPeriodChange: (
    period:
      AnalyticsPeriodDays,
  ) => void;

  onClose:
    () => void;
}

export function InventoryAnalytics({
  summary,
  selectedPeriod,
  onPeriodChange,
  onClose,
}: InventoryAnalyticsProps) {
  const current =
    summary.comparison.current;

  const previous =
    summary.comparison.previous;

  const currentAverageSale =
    calculateAverageSale(
      current.salesValue,
      current.salesUnits,
    );

  const previousAverageSale =
    calculateAverageSale(
      previous.salesValue,
      previous.salesUnits,
    );

  const averageSaleChange =
    calculatePercentChange(
      currentAverageSale,
      previousAverageSale,
    );

  const fasterProducts =
    summary.productTrends.filter(
      (trend) =>
        (
          trend.trendType ===
            "selling_faster" ||
          trend.trendType ===
            "new_strong_seller"
        ) &&
        !trend.needsRestock,
    );

  const lowStockFastProducts =
    summary.productTrends.filter(
      (trend) =>
        (
          trend.trendType ===
            "selling_faster" ||
          trend.trendType ===
            "new_strong_seller"
        ) &&
        trend.needsRestock,
    );

  const droppedProducts =
    summary.productTrends.filter(
      (trend) =>
        trend.trendType ===
        "sales_dropped",
    );

  const hasProductNotices =
    fasterProducts.length >
      0 ||
    lowStockFastProducts.length >
      0 ||
    droppedProducts.length >
      0;

  return (
    <SafeAreaView
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.headerRow
          }
        >
          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text
              style={
                styles.title
              }
            >
              Store Trends
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              See what is selling, what is making money, and which products need attention.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={
              onClose
            }
            style={({
              pressed,
            }) => [
              styles.closeButton,

              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Text
              style={
                styles.closeButtonText
              }
            >
              Close
            </Text>
          </Pressable>
        </View>

        <Text
          style={
            styles.periodLabel
          }
        >
          Time Period
        </Text>

        <View
          style={
            styles.periodContainer
          }
        >
          {ANALYTICS_PERIOD_OPTIONS.map(
            (option) => {
              const isSelected =
                option.days ===
                selectedPeriod;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={
                    option.days
                  }
                  onPress={() =>
                    onPeriodChange(
                      option.days,
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.periodButton,

                    isSelected &&
                      styles.periodButtonSelected,

                    pressed &&
                      styles.buttonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.periodButtonText,

                      isSelected &&
                        styles.periodButtonTextSelected,
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

        <Text
          style={
            styles.periodDescription
          }
        >
          Comparing the last{" "}
          {formatPeriodLabel(
            selectedPeriod,
          )}{" "}
          with the previous{" "}
          {formatPeriodLabel(
            selectedPeriod,
          )}.
        </Text>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Compared With Before
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          See whether sales, items sold, and estimated profit improved or dropped.
        </Text>

        <View
          style={
            styles.summaryGrid
          }
        >
          <ComparisonCard
            label="Sales"
            value={
              formatCurrency(
                current.salesValue,
              )
            }
            previousValue={`Previous: ${formatCurrency(
              previous.salesValue,
            )}`}
            change={
              summary.comparison
                .salesValueChangePercent
            }
            positiveIsGood
          />

          <ComparisonCard
            label="Items Sold"
            value={
              formatNumber(
                current.salesUnits,
              )
            }
            previousValue={`Previous: ${formatNumber(
              previous.salesUnits,
            )}`}
            change={
              summary.comparison
                .salesUnitsChangePercent
            }
            positiveIsGood
          />

          <ComparisonCard
            label="Estimated Profit"
            value={
              formatCurrency(
                current.estimatedProfit,
              )
            }
            previousValue={`Previous: ${formatCurrency(
              previous.estimatedProfit,
            )}`}
            change={
              summary.comparison
                .estimatedProfitChangePercent
            }
            positiveIsGood
          />

          <ComparisonCard
            label="Average Sale per Item"
            value={
              formatCurrency(
                currentAverageSale,
              )
            }
            previousValue={`Previous: ${formatCurrency(
              previousAverageSale,
            )}`}
            change={
              averageSaleChange
            }
            positiveIsGood
          />
        </View>
        <Text
  style={
    styles.sectionTitle
  }
>
  Business Insights
</Text>

<Text
  style={
    styles.sectionDescription
  }
>
  Important changes and opportunities detected from your store activity.
</Text>

<StoreInsightCards
  summary={
    summary
  }
/>
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
          Explore store, category, or individual product performance over time.
        </Text>

        <View
          style={
            styles.chartCard
          }
        >
          {summary.dailyMetrics
            .length === 0 ? (
            <EmptyMessage
              text="No sales activity is available for this time period."
            />
          ) : (
            <>
              <SalesLineChart
                metrics={
                  summary.dailyMetrics
                }
                salesTrendMetrics={
                  summary.salesTrendMetrics
                }
              />

              <View
                style={
                  styles.chartFooter
                }
              >
                <View>
                  <Text
                    style={
                      styles.chartFooterText
                    }
                  >
                    Total store sales
                  </Text>

                  <Text
                    style={
                      styles.chartFooterValue
                    }
                  >
                    {formatCurrency(
                      current.salesValue,
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.chartFooterRight
                  }
                >
                  <Text
                    style={
                      styles.chartFooterText
                    }
                  >
                    Estimated profit
                  </Text>

                  <Text
                    style={
                      styles.chartProfitValue
                    }
                  >
                    {formatCurrency(
                      current.estimatedProfit,
                    )}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Products to Notice
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          See products growing quickly, running low, or selling much slower than before.
        </Text>

        {!hasProductNotices ? (
          <View
            style={
              styles.noticeEmptyCard
            }
          >
            <Text
              style={
                styles.noticeEmptyTitle
              }
            >
              No major changes found
            </Text>

            <Text
              style={
                styles.noticeEmptyText
              }
            >
              Product sales are fairly steady compared with the previous period.
            </Text>
          </View>
        ) : (
          <>
            {lowStockFastProducts.length >
            0 ? (
              <View
                style={
                  styles.trendGroup
                }
              >
                <Text
                  style={
                    styles.trendGroupTitle
                  }
                >
                  Low Stock — Selling Fast
                </Text>

                <Text
                  style={
                    styles.trendGroupDescription
                  }
                >
                  These products are selling well but may need restocking soon.
                </Text>

                {lowStockFastProducts.map(
                  (trend) => (
                    <ProductTrendCard
                      key={`restock-${trend.productId}`}
                      trend={
                        trend
                      }
                      showStockWarning
                    />
                  ),
                )}
              </View>
            ) : null}

            {fasterProducts.length >
            0 ? (
              <View
                style={
                  styles.trendGroup
                }
              >
                <Text
                  style={
                    styles.trendGroupTitle
                  }
                >
                  Selling Faster
                </Text>

                {fasterProducts.map(
                  (trend) => (
                    <ProductTrendCard
                      key={`up-${trend.productId}`}
                      trend={
                        trend
                      }
                    />
                  ),
                )}
              </View>
            ) : null}

            {droppedProducts.length >
            0 ? (
              <View
                style={
                  styles.trendGroup
                }
              >
                <Text
                  style={
                    styles.trendGroupTitle
                  }
                >
                  Needs Attention
                </Text>

                <Text
                  style={
                    styles.trendGroupDescription
                  }
                >
                  These products are selling much slower than before.
                </Text>

                {droppedProducts.map(
                  (trend) => (
                    <ProductTrendCard
                      key={`down-${trend.productId}`}
                      trend={
                        trend
                      }
                    />
                  ),
                )}
              </View>
            ) : null}
          </>
        )}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Best Selling Products
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          Products bringing in the most sales during this time period.
        </Text>

        <View
          style={
            styles.rankingCard
          }
        >
          {summary.topProducts
            .length === 0 ? (
            <EmptyMessage
              text="No product sales have been recorded for this time period."
            />
          ) : (
            summary.topProducts.map(
              (
                product,
                index,
              ) => (
                <ProductRankingRow
                  key={
                    product.productId
                  }
                  product={
                    product
                  }
                  rank={
                    index + 1
                  }
                />
              ),
            )
          )}
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Best Selling Categories
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          Categories bringing in the most sales during this time period.
        </Text>

        <View
          style={
            styles.rankingCard
          }
        >
          {summary.topCategories
            .length === 0 ? (
            <EmptyMessage
              text="No category sales have been recorded for this time period."
            />
          ) : (
            summary.topCategories.map(
              (
                category,
                index,
              ) => (
                <CategoryRankingRow
                  key={`${category.department}-${category.category}`}
                  category={
                    category
                  }
                  rank={
                    index + 1
                  }
                />
              ),
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ComparisonCardProps {
  label: string;

  value: string;

  previousValue: string;

  change:
    number | null;

  positiveIsGood?: boolean;
}

function ComparisonCard({
  label,
  value,
  previousValue,
  change,
  positiveIsGood,
}: ComparisonCardProps) {
  const isUp =
    change !== null &&
    change > 0;

  const isDown =
    change !== null &&
    change < 0;

  const isGood =
    positiveIsGood === undefined
      ? null
      : positiveIsGood
        ? isUp
        : isDown;

  const isBad =
    positiveIsGood === undefined
      ? null
      : positiveIsGood
        ? isDown
        : isUp;

  return (
    <View
      style={[
        styles.summaryCard,

        isGood &&
          styles.summaryCardPositive,

        isBad &&
          styles.summaryCardDanger,
      ]}
    >
      <Text
        style={
          styles.summaryLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.summaryValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.previousValue
        }
      >
        {previousValue}
      </Text>

      <View
        style={
          styles.changeRow
        }
      >
        <Text
          style={[
            styles.changeText,

            isUp &&
              styles.changeUp,

            isDown &&
              styles.changeDown,
          ]}
        >
          {formatChange(
            change,
          )}
        </Text>

        <Text
          style={
            styles.changeCaption
          }
        >
          vs previous period
        </Text>
      </View>
    </View>
  );
}

function ProductTrendCard({
  trend,
  showStockWarning = false,
}: {
  trend:
    ProductTrend;

  showStockWarning?: boolean;
}) {
  const isDrop =
    trend.trendType ===
    "sales_dropped";

  const isNew =
    trend.trendType ===
    "new_strong_seller";

  const productDetails = [
    trend.brand.trim(),
    trend.category,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View
      style={[
        styles.trendCard,

        showStockWarning
          ? styles.trendCardWarning
          : isDrop
            ? styles.trendCardDanger
            : styles.trendCardPositive,
      ]}
    >
      <View
        style={
          styles.trendCardHeader
        }
      >
        <View
          style={
            styles.trendProductText
          }
        >
          <Text
            style={
              styles.trendProductName
            }
          >
            {
              trend.productName
            }
          </Text>

          {productDetails ? (
            <Text
              style={
                styles.trendProductDetails
              }
            >
              {productDetails}
            </Text>
          ) : null}
        </View>

        <Text
          style={[
            styles.trendPercent,

            isDrop
              ? styles.trendPercentDown
              : styles.trendPercentUp,
          ]}
        >
          {formatChange(
            trend.changePercent,
          )}
        </Text>
      </View>

      <View
        style={
          styles.trendNumbersRow
        }
      >
        <View
          style={
            styles.trendNumberBlock
          }
        >
          <Text
            style={
              styles.trendNumberLabel
            }
          >
            Before
          </Text>

          <Text
            style={
              styles.trendNumberValue
            }
          >
            {formatNumber(
              trend.previousUnitsSold,
            )}
          </Text>
        </View>

        <Text
          style={
            styles.trendArrow
          }
        >
          →
        </Text>

        <View
          style={
            styles.trendNumberBlock
          }
        >
          <Text
            style={
              styles.trendNumberLabel
            }
          >
            Now
          </Text>

          <Text
            style={
              styles.trendNumberValue
            }
          >
            {formatNumber(
              trend.currentUnitsSold,
            )}
          </Text>
        </View>
      </View>

      {showStockWarning ? (
        <View
          style={
            styles.stockWarningBox
          }
        >
          <Text
            style={
              styles.stockWarningTitle
            }
          >
            Consider restocking soon
          </Text>

          <Text
            style={
              styles.stockWarningText
            }
          >
            Current stock:{" "}
            {formatNumber(
              trend.currentStock,
            )}{" "}
            · Reorder level:{" "}
            {formatNumber(
              trend.reorderLevel,
            )}
          </Text>
        </View>
      ) : null}

      <Text
        style={[
          styles.trendMessage,

          showStockWarning
            ? styles.trendMessageWarning
            : isDrop
              ? styles.trendMessageDanger
              : styles.trendMessagePositive,
        ]}
      >
        {showStockWarning
          ? "Selling fast and stock is running low"
          : isNew
            ? "New strong seller"
            : isDrop
              ? "Sales dropped sharply"
              : "Selling much faster than before"}
      </Text>
    </View>
  );
}

interface ProductRankingRowProps {
  product:
    ProductSalesMetric;

  rank: number;
}

function ProductRankingRow({
  product,
  rank,
}: ProductRankingRowProps) {
  const productDetails = [
    product.brand.trim(),
    product.category,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View
      style={
        styles.rankingRow
      }
    >
      <View
        style={
          styles.rankBadge
        }
      >
        <Text
          style={
            styles.rankText
          }
        >
          {rank}
        </Text>
      </View>

      <View
        style={
          styles.rankingTextContainer
        }
      >
        <Text
          style={
            styles.rankingTitle
          }
        >
          {
            product.productName
          }
        </Text>

        {productDetails ? (
          <Text
            style={
              styles.rankingSubtitle
            }
          >
            {productDetails}
          </Text>
        ) : null}

        <Text
          style={
            styles.rankingMeta
          }
        >
          {formatNumber(
            product.unitsSold,
          )}{" "}
          items sold ·{" "}
          {formatCurrency(
            product.estimatedProfit,
          )}{" "}
          est. profit
        </Text>
      </View>

      <Text
        style={
          styles.rankingValue
        }
      >
        {formatCurrency(
          product.salesValue,
        )}
      </Text>
    </View>
  );
}

interface CategoryRankingRowProps {
  category:
    CategorySalesMetric;

  rank: number;
}

function CategoryRankingRow({
  category,
  rank,
}: CategoryRankingRowProps) {
  return (
    <View
      style={
        styles.rankingRow
      }
    >
      <View
        style={
          styles.rankBadge
        }
      >
        <Text
          style={
            styles.rankText
          }
        >
          {rank}
        </Text>
      </View>

      <View
        style={
          styles.rankingTextContainer
        }
      >
        <Text
          style={
            styles.rankingTitle
          }
        >
          {
            category.category
          }
        </Text>

        <Text
          style={
            styles.rankingSubtitle
          }
        >
          {
            category.department
          }
        </Text>

        <Text
          style={
            styles.rankingMeta
          }
        >
          {formatNumber(
            category.unitsSold,
          )}{" "}
          items sold ·{" "}
          {formatCurrency(
            category.estimatedProfit,
          )}{" "}
          est. profit
        </Text>
      </View>

      <Text
        style={
          styles.rankingValue
        }
      >
        {formatCurrency(
          category.salesValue,
        )}
      </Text>
    </View>
  );
}

function EmptyMessage({
  text,
}: {
  text: string;
}) {
  return (
    <View
      style={
        styles.emptyContainer
      }
    >
      <Text
        style={
          styles.emptyText
        }
      >
        {text}
      </Text>
    </View>
  );
}

function calculateAverageSale(
  salesValue: number,
  salesUnits: number,
): number {
  if (
    salesUnits <= 0
  ) {
    return 0;
  }

  return (
    salesValue /
    salesUnits
  );
}

function calculatePercentChange(
  current: number,
  previous: number,
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

function formatChange(
  value:
    number | null,
): string {
  if (
    value === null
  ) {
    return "New";
  }

  if (
    Math.abs(
      value,
    ) < 0.05
  ) {
    return "No change";
  }

  const rounded =
    Math.round(
      value * 10,
    ) / 10;

  if (
    rounded > 0
  ) {
    return `↑ ${rounded}%`;
  }

  if (
    rounded < 0
  ) {
    return `↓ ${Math.abs(
      rounded,
    )}%`;
  }

  return "No change";
}

function formatCurrency(
  value: number,
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
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-CA",
  ).format(
    value,
  );
}

function formatPeriodLabel(
  period:
    AnalyticsPeriodDays,
): string {
  if (
    period === 365
  ) {
    return "1 year";
  }

  return `${period} days`;
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        "#F4F6F8",
    },

    content: {
      padding: 18,

      paddingBottom:
        48,
    },

    headerRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    headerTextContainer: {
      flex: 1,

      marginRight:
        16,
    },

    title: {
      fontSize:
        30,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    subtitle: {
      marginTop:
        6,

      fontSize:
        15,

      lineHeight:
        21,

      color:
        "#6B7280",
    },

    closeButton: {
      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        10,

      paddingHorizontal:
        14,

      paddingVertical:
        9,

      backgroundColor:
        "#FFFFFF",
    },

    closeButtonText: {
      fontSize:
        14,

      fontWeight:
        "700",

      color:
        "#20252B",
    },

    buttonPressed: {
      opacity:
        0.72,
    },

    periodLabel: {
      marginTop:
        24,

      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#374151",
    },

    periodContainer: {
      marginTop:
        10,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        9,
    },

    periodButton: {
      minHeight:
        42,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        12,

      paddingHorizontal:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    periodButtonSelected: {
      borderColor:
        "#0F766E",

      backgroundColor:
        "#0F766E",
    },

    periodButtonText: {
      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#374151",
    },

    periodButtonTextSelected: {
      color:
        "#FFFFFF",
    },

    periodDescription: {
      marginTop:
        9,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#6B7280",
    },

    sectionTitle: {
      marginTop:
        28,

      fontSize:
        20,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    sectionDescription: {
      marginTop:
        4,

      marginBottom:
        12,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#6B7280",
    },

    summaryGrid: {
      marginTop:
        2,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        12,
    },

    summaryCard: {
      width:
        "48%",

      minHeight:
        150,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        16,

      padding:
        15,

      backgroundColor:
        "#FFFFFF",
    },

    summaryCardPositive: {
      borderColor:
        "#D1FAE5",

      backgroundColor:
        "#F7FEFA",
    },

    summaryCardDanger: {
      borderColor:
        "#FECACA",

      backgroundColor:
        "#FFF8F7",
    },

    summaryLabel: {
      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#6B7280",
    },

    summaryValue: {
      marginTop:
        9,

      fontSize:
        22,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    previousValue: {
      marginTop:
        5,

      fontSize:
        11,

      color:
        "#8B949E",
    },

    changeRow: {
      marginTop:
        10,
    },

    changeText: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#6B7280",
    },

    changeUp: {
      color:
        "#15803D",
    },

    changeDown: {
      color:
        "#B42318",
    },

    changeCaption: {
      marginTop:
        2,

      fontSize:
        10,

      color:
        "#9CA3AF",
    },

    chartCard: {
      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        16,

      padding:
        16,

      backgroundColor:
        "#FFFFFF",
    },

    chartFooter: {
      marginTop:
        15,

      paddingTop:
        13,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    chartFooterRight: {
      alignItems:
        "flex-end",
    },

    chartFooterText: {
      fontSize:
        12,

      color:
        "#6B7280",
    },

    chartFooterValue: {
      marginTop:
        3,

      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    chartProfitValue: {
      marginTop:
        3,

      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    noticeEmptyCard: {
      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        16,

      padding:
        20,

      backgroundColor:
        "#FFFFFF",
    },

    noticeEmptyTitle: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    noticeEmptyText: {
      marginTop:
        6,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#6B7280",
    },

    trendGroup: {
      marginBottom:
        18,
    },

    trendGroupTitle: {
      marginBottom:
        4,

      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#374151",
    },

    trendGroupDescription: {
      marginBottom:
        9,

      fontSize:
        11,

      lineHeight:
        16,

      color:
        "#6B7280",
    },

    trendCard: {
      marginBottom:
        10,

      borderWidth:
        1,

      borderRadius:
        15,

      padding:
        14,
    },

    trendCardPositive: {
      borderColor:
        "#D1FAE5",

      backgroundColor:
        "#F7FEFA",
    },

    trendCardDanger: {
      borderColor:
        "#FECACA",

      backgroundColor:
        "#FFF8F7",
    },

    trendCardWarning: {
      borderColor:
        "#FDE68A",

      backgroundColor:
        "#FFFBEB",
    },

    trendCardHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    trendProductText: {
      flex:
        1,

      marginRight:
        12,
    },

    trendProductName: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    trendProductDetails: {
      marginTop:
        3,

      fontSize:
        11,

      color:
        "#6B7280",
    },

    trendPercent: {
      fontSize:
        14,

      fontWeight:
        "800",
    },

    trendPercentUp: {
      color:
        "#15803D",
    },

    trendPercentDown: {
      color:
        "#B42318",
    },

    trendNumbersRow: {
      marginTop:
        13,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    trendNumberBlock: {
      minWidth:
        70,
    },

    trendNumberLabel: {
      fontSize:
        10,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#8B949E",
    },

    trendNumberValue: {
      marginTop:
        3,

      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    trendArrow: {
      marginHorizontal:
        12,

      fontSize:
        18,

      color:
        "#9CA3AF",
    },

    stockWarningBox: {
      marginTop:
        13,

      borderRadius:
        10,

      padding:
        10,

      backgroundColor:
        "#FEF3C7",
    },

    stockWarningTitle: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#92400E",
    },

    stockWarningText: {
      marginTop:
        3,

      fontSize:
        11,

      color:
        "#92400E",
    },

    trendMessage: {
      marginTop:
        11,

      fontSize:
        12,

      fontWeight:
        "700",
    },

    trendMessagePositive: {
      color:
        "#15803D",
    },

    trendMessageDanger: {
      color:
        "#B42318",
    },

    trendMessageWarning: {
      color:
        "#B45309",
    },

    rankingCard: {
      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        16,

      paddingHorizontal:
        16,

      backgroundColor:
        "#FFFFFF",
    },

    rankingRow: {
      minHeight:
        88,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        1,

      borderBottomColor:
        "#E5E7EB",

      paddingVertical:
        14,
    },

    rankBadge: {
      width:
        34,

      height:
        34,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        17,

      backgroundColor:
        "#EAF2FF",
    },

    rankText: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#1D4ED8",
    },

    rankingTextContainer: {
      flex:
        1,

      marginHorizontal:
        12,
    },

    rankingTitle: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    rankingSubtitle: {
      marginTop:
        3,

      fontSize:
        13,

      color:
        "#5D6673",
    },

    rankingMeta: {
      marginTop:
        4,

      fontSize:
        12,

      lineHeight:
        17,

      color:
        "#7A838E",
    },

    rankingValue: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    emptyContainer: {
      paddingVertical:
        30,

      alignItems:
        "center",
    },

    emptyText: {
      fontSize:
        14,

      lineHeight:
        20,

      textAlign:
        "center",

      color:
        "#6B7280",
    },
  });