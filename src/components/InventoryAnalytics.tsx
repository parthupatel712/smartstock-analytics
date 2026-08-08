import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  ANALYTICS_PERIOD_OPTIONS,
  type AnalyticsPeriodDays,
} from "../types/analyticsPeriod";

import type {
  CategorySalesMetric,
  DailyInventoryMetric,
  InventoryAnalyticsSummary,
  ProductSalesMetric,
} from "../types/inventoryAnalytics";

interface InventoryAnalyticsProps {
  summary: InventoryAnalyticsSummary;

  selectedPeriod: AnalyticsPeriodDays;

  onPeriodChange: (
    period: AnalyticsPeriodDays,
  ) => void;

  onClose: () => void;
}

export function InventoryAnalytics({
  summary,
  selectedPeriod,
  onPeriodChange,
  onClose,
}: InventoryAnalyticsProps) {
  const totals =
    calculateTotals(
      summary.dailyMetrics,
    );

  const maxDailySales =
    Math.max(
      ...summary.dailyMetrics.map(
        (metric) =>
          metric.salesValue,
      ),
      1,
    );

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
          style={styles.headerRow}
        >
          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text
              style={styles.title}
            >
              Store Trends
            </Text>

            <Text
              style={styles.subtitle}
            >
              See what is selling and how your stock is changing over time.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
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
          style={styles.periodLabel}
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
                  key={option.days}
                  onPress={() =>
                    onPeriodChange(
                      option.days,
                    )
                  }
                  style={({ pressed }) => [
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
                    {option.label}
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
          Showing trends from the last{" "}
          {formatPeriodLabel(
            selectedPeriod,
          )}
        </Text>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Period Summary
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          A quick look at what happened during this time period.
        </Text>

        <View
          style={
            styles.summaryGrid
          }
        >
          <SummaryCard
            label="Sales"
            value={formatCurrency(
              totals.salesValue,
            )}
            description={`${formatNumber(
              totals.salesUnits,
            )} items sold`}
            tone="positive"
          />

          <SummaryCard
            label="Items Sold"
            value={formatNumber(
              totals.salesUnits,
            )}
            description="Total items sold during this period"
          />

          <SummaryCard
            label="Stock Added"
            value={formatNumber(
              totals.stockInUnits,
            )}
            description={`${formatCurrency(
              totals.stockInValue,
            )} worth of stock added`}
          />

          <SummaryCard
            label="Damaged Stock"
            value={formatNumber(
              totals.damageUnits,
            )}
            description={`${formatCurrency(
              totals.damageValue,
            )} worth of damaged stock`}
            tone={
              totals.damageUnits > 0
                ? "danger"
                : "normal"
            }
          />
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Sales by Day
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          See which days had more or fewer sales.
        </Text>

        <View
          style={styles.chartCard}
        >
          {summary.dailyMetrics
            .length === 0 ? (
            <EmptyMessage
              text="No sales or stock activity is available for this time period."
            />
          ) : (
            summary.dailyMetrics.map(
              (metric) => (
                <DailyMetricRow
                  key={
                    metric.date
                  }
                  metric={
                    metric
                  }
                  maxSales={
                    maxDailySales
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
          Best Selling Products
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          Products that brought in the most sales during this time period.
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

interface SummaryCardProps {
  label: string;

  value: string;

  description: string;

  tone?:
    | "normal"
    | "positive"
    | "danger";
}

function SummaryCard({
  label,
  value,
  description,
  tone = "normal",
}: SummaryCardProps) {
  return (
    <View
      style={[
        styles.summaryCard,

        tone === "positive" &&
          styles.summaryCardPositive,

        tone === "danger" &&
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
        style={[
          styles.summaryValue,

          tone === "positive" &&
            styles.summaryValuePositive,

          tone === "danger" &&
            styles.summaryValueDanger,
        ]}
      >
        {value}
      </Text>

      <Text
        style={
          styles.summaryDescription
        }
      >
        {description}
      </Text>
    </View>
  );
}

interface DailyMetricRowProps {
  metric: DailyInventoryMetric;

  maxSales: number;
}

function DailyMetricRow({
  metric,
  maxSales,
}: DailyMetricRowProps) {
  const salesWidth =
    Math.max(
      (
        metric.salesValue /
        maxSales
      ) * 100,

      metric.salesValue > 0
        ? 4
        : 0,
    );

  return (
    <View
      style={styles.dailyRow}
    >
      <View
        style={
          styles.dailyHeader
        }
      >
        <Text
          style={
            styles.dailyDate
          }
        >
          {formatDate(
            metric.date,
          )}
        </Text>

        <Text
          style={
            styles.dailySalesValue
          }
        >
          {formatCurrency(
            metric.salesValue,
          )}
        </Text>
      </View>

      <View
        style={
          styles.barTrack
        }
      >
        <View
          style={[
            styles.barFill,

            {
              width:
                `${salesWidth}%`,
            },
          ]}
        />
      </View>

      <View
        style={
          styles.dailyMetaRow
        }
      >
        <Text
          style={
            styles.dailyMetaText
          }
        >
          Sold:{" "}
          {formatNumber(
            metric.salesUnits,
          )}
        </Text>

        <Text
          style={
            styles.dailyMetaText
          }
        >
          Added:{" "}
          {formatNumber(
            metric.stockInUnits,
          )}
        </Text>

        <Text
          style={
            styles.dailyMetaText
          }
        >
          Damaged:{" "}
          {formatNumber(
            metric.damageUnits,
          )}
        </Text>
      </View>
    </View>
  );
}

interface ProductRankingRowProps {
  product: ProductSalesMetric;

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
          items sold
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
  category: CategorySalesMetric;

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
          items sold
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

function calculateTotals(
  dailyMetrics: DailyInventoryMetric[],
) {
  return dailyMetrics.reduce(
    (
      totals,
      metric,
    ) => ({
      salesValue:
        totals.salesValue +
        metric.salesValue,

      stockInValue:
        totals.stockInValue +
        metric.stockInValue,

      damageValue:
        totals.damageValue +
        metric.damageValue,

      salesUnits:
        totals.salesUnits +
        metric.salesUnits,

      stockInUnits:
        totals.stockInUnits +
        metric.stockInUnits,

      damageUnits:
        totals.damageUnits +
        metric.damageUnits,
    }),

    {
      salesValue: 0,
      stockInValue: 0,
      damageValue: 0,

      salesUnits: 0,
      stockInUnits: 0,
      damageUnits: 0,
    },
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
  ).format(value);
}

function formatPeriodLabel(
  period: AnalyticsPeriodDays,
): string {
  if (period === 365) {
    return "1 year";
  }

  return `${period} days`;
}

function formatDate(
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

      year:
        parsedDate.getFullYear() !==
        new Date().getFullYear()
          ? "numeric"
          : undefined,
    },
  );
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
      paddingBottom: 48,
    },

    headerRow: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
    },

    headerTextContainer: {
      flex: 1,
      marginRight: 16,
    },

    title: {
      fontSize: 30,
      fontWeight: "800",
      color: "#111827",
    },

    subtitle: {
      marginTop: 6,
      fontSize: 15,
      lineHeight: 21,
      color: "#6B7280",
    },

    closeButton: {
      borderWidth: 1,
      borderColor:
        "#CBD2DA",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 9,
      backgroundColor:
        "#FFFFFF",
    },

    closeButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#20252B",
    },

    buttonPressed: {
      opacity: 0.72,
    },

    periodLabel: {
      marginTop: 24,
      fontSize: 14,
      fontWeight: "800",
      color: "#374151",
    },

    periodContainer: {
      marginTop: 10,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 9,
    },

    periodButton: {
      minHeight: 42,
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth: 1,
      borderColor:
        "#CBD2DA",
      borderRadius: 12,
      paddingHorizontal: 14,
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
      fontSize: 13,
      fontWeight: "700",
      color: "#374151",
    },

    periodButtonTextSelected: {
      color: "#FFFFFF",
    },

    periodDescription: {
      marginTop: 9,
      fontSize: 12,
      color: "#6B7280",
    },

    sectionTitle: {
      marginTop: 26,
      fontSize: 19,
      fontWeight: "800",
      color: "#111827",
    },

    sectionDescription: {
      marginTop: 4,
      marginBottom: 12,
      fontSize: 12,
      lineHeight: 18,
      color: "#6B7280",
    },

    summaryGrid: {
      marginTop: 2,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },

    summaryCard: {
      width: "48%",
      minHeight: 126,
      borderWidth: 1,
      borderColor:
        "#E0E4E8",
      borderRadius: 16,
      padding: 15,
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
      fontSize: 13,
      fontWeight: "700",
      color: "#6B7280",
    },

    summaryValue: {
      marginTop: 9,
      fontSize: 23,
      fontWeight: "800",
      color: "#111827",
    },

    summaryValuePositive: {
      color: "#15803D",
    },

    summaryValueDanger: {
      color: "#B42318",
    },

    summaryDescription: {
      marginTop: 7,
      fontSize: 12,
      lineHeight: 17,
      color: "#6B7280",
    },

    chartCard: {
      borderWidth: 1,
      borderColor:
        "#E0E4E8",
      borderRadius: 16,
      padding: 16,
      backgroundColor:
        "#FFFFFF",
    },

    dailyRow: {
      marginBottom: 18,
    },

    dailyHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    dailyDate: {
      fontSize: 14,
      fontWeight: "700",
      color: "#374151",
    },

    dailySalesValue: {
      fontSize: 14,
      fontWeight: "800",
      color: "#15803D",
    },

    barTrack: {
      marginTop: 8,
      height: 9,
      overflow: "hidden",
      borderRadius: 5,
      backgroundColor:
        "#E5E7EB",
    },

    barFill: {
      height: "100%",
      borderRadius: 5,
      backgroundColor:
        "#1D4ED8",
    },

    dailyMetaRow: {
      marginTop: 7,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },

    dailyMetaText: {
      fontSize: 12,
      color: "#6B7280",
    },

    rankingCard: {
      borderWidth: 1,
      borderColor:
        "#E0E4E8",
      borderRadius: 16,
      paddingHorizontal: 16,
      backgroundColor:
        "#FFFFFF",
    },

    rankingRow: {
      minHeight: 88,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor:
        "#E5E7EB",
      paddingVertical: 14,
    },

    rankBadge: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius: 17,
      backgroundColor:
        "#EAF2FF",
    },

    rankText: {
      fontSize: 14,
      fontWeight: "800",
      color: "#1D4ED8",
    },

    rankingTextContainer: {
      flex: 1,
      marginHorizontal: 12,
    },

    rankingTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: "#111827",
    },

    rankingSubtitle: {
      marginTop: 3,
      fontSize: 13,
      color: "#5D6673",
    },

    rankingMeta: {
      marginTop: 4,
      fontSize: 12,
      color: "#7A838E",
    },

    rankingValue: {
      fontSize: 15,
      fontWeight: "800",
      color: "#15803D",
    },

    emptyContainer: {
      paddingVertical: 30,
      alignItems: "center",
    },

    emptyText: {
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
      color: "#6B7280",
    },
  });