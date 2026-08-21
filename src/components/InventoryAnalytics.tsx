import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

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
      (
        trend,
      ) =>
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
      (
        trend,
      ) =>
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
      (
        trend,
      ) =>
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
      edges={[
        "top",
        "left",
        "right",
      ]}
      style={
        styles.screen
      }
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
              Analytics
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Track sales, profit, trends, and products that need attention.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            hitSlop={
              8
            }
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

        <View
          style={
            styles.periodSection
          }
        >
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
              (
                option,
              ) => {
                const isSelected =
                  option.days ===
                  selectedPeriod;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{
                      selected:
                        isSelected,
                    }}
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
            {
              formatPeriodLabel(
                selectedPeriod,
              )
            }{" "}
            with the previous{" "}
            {
              formatPeriodLabel(
                selectedPeriod,
              )
            }.
          </Text>
        </View>

        <SectionHeader
          title="Performance"
          description="Compare current sales, items sold, and estimated profit with the previous period."
        />

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
            label="Average Sale / Item"
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

        <SectionHeader
          title="Business Insights"
          description="Important changes and opportunities detected from your store activity."
        />

        <StoreInsightCards
          summary={
            summary
          }
        />

        <SectionHeader
          title="Sales Trend"
          description="Explore store, category, or individual product performance over time."
        />

        <View
          style={
            styles.chartCard
          }
        >
          {summary.dailyMetrics.length ===
          0 ? (
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
                <View
                  style={
                    styles.chartMetricBlock
                  }
                >
                  <Text
                    style={
                      styles.chartFooterText
                    }
                  >
                    Total sales
                  </Text>

                  <Text
                    style={
                      styles.chartFooterValue
                    }
                    numberOfLines={
                      1
                    }
                    adjustsFontSizeToFit
                    minimumFontScale={
                      0.8
                    }
                  >
                    {
                      formatCurrency(
                        current.salesValue,
                      )
                    }
                  </Text>
                </View>

                <View
                  style={[
                    styles.chartMetricBlock,
                    styles.chartFooterRight,
                  ]}
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
                    numberOfLines={
                      1
                    }
                    adjustsFontSizeToFit
                    minimumFontScale={
                      0.8
                    }
                  >
                    {
                      formatCurrency(
                        current.estimatedProfit,
                      )
                    }
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        <SectionHeader
          title="Products to Notice"
          description="Products growing quickly, running low, or selling much slower than before."
        />

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
                  (
                    trend,
                  ) => (
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
                  (
                    trend,
                  ) => (
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
                  (
                    trend,
                  ) => (
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

        <SectionHeader
          title="Best Selling Products"
          description="Products bringing in the most sales during this time period."
        />

        <View
          style={
            styles.rankingCard
          }
        >
          {summary.topProducts.length ===
          0 ? (
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
                    index +
                    1
                  }
                />
              ),
            )
          )}
        </View>

        <SectionHeader
          title="Best Selling Categories"
          description="Categories bringing in the most sales during this time period."
        />

        <View
          style={
            styles.rankingCard
          }
        >
          {summary.topCategories.length ===
          0 ? (
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
                    index +
                    1
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

function SectionHeader({
  title,
  description,
}: {
  title:
    string;

  description:
    string;
}) {
  return (
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
        {
          title
        }
      </Text>

      <Text
        style={
          styles.sectionDescription
        }
      >
        {
          description
        }
      </Text>
    </View>
  );
}

interface ComparisonCardProps {
  label:
    string;

  value:
    string;

  previousValue:
    string;

  change:
    number | null;

  positiveIsGood?:
    boolean;
}

function ComparisonCard({
  label,
  value,
  previousValue,
  change,
  positiveIsGood,
}: ComparisonCardProps) {
  const isUp =
    change !==
      null &&
    change >
      0;

  const isDown =
    change !==
      null &&
    change <
      0;

  const isGood =
    positiveIsGood ===
    undefined
      ? null
      : positiveIsGood
        ? isUp
        : isDown;

  const isBad =
    positiveIsGood ===
    undefined
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
        {
          label
        }
      </Text>

      <Text
        style={
          styles.summaryValue
        }
        numberOfLines={
          1
        }
        adjustsFontSizeToFit
        minimumFontScale={
          0.75
        }
      >
        {
          value
        }
      </Text>

      <Text
        style={
          styles.previousValue
        }
        numberOfLines={
          1
        }
        adjustsFontSizeToFit
        minimumFontScale={
          0.8
        }
      >
        {
          previousValue
        }
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
          {
            formatChange(
              change,
            )
          }
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
  showStockWarning =
    false,
}: {
  trend:
    ProductTrend;

  showStockWarning?:
    boolean;
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
    .filter(
      Boolean,
    )
    .join(
      " · ",
    );

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
            numberOfLines={
              2
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
              numberOfLines={
                2
              }
            >
              {
                productDetails
              }
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
          numberOfLines={
            1
          }
        >
          {
            formatChange(
              trend.changePercent,
            )
          }
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
            {
              formatNumber(
                trend.previousUnitsSold,
              )
            }
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
            {
              formatNumber(
                trend.currentUnitsSold,
              )
            }
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
            {
              formatNumber(
                trend.currentStock,
              )
            }{" "}
            · Reorder level:{" "}
            {
              formatNumber(
                trend.reorderLevel,
              )
            }
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

  rank:
    number;
}

function ProductRankingRow({
  product,
  rank,
}: ProductRankingRowProps) {
  const productDetails = [
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
          {
            rank
          }
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
          numberOfLines={
            2
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
            numberOfLines={
              2
            }
          >
            {
              productDetails
            }
          </Text>
        ) : null}

        <Text
          style={
            styles.rankingMeta
          }
        >
          {
            formatNumber(
              product.unitsSold,
            )
          }{" "}
          items sold ·{" "}
          {
            formatCurrency(
              product.estimatedProfit,
            )
          }{" "}
          est. profit
        </Text>
      </View>

      <Text
        style={
          styles.rankingValue
        }
        numberOfLines={
          1
        }
        adjustsFontSizeToFit
        minimumFontScale={
          0.75
        }
      >
        {
          formatCurrency(
            product.salesValue,
          )
        }
      </Text>
    </View>
  );
}

interface CategoryRankingRowProps {
  category:
    CategorySalesMetric;

  rank:
    number;
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
          {
            rank
          }
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
          numberOfLines={
            2
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
          numberOfLines={
            2
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
          {
            formatNumber(
              category.unitsSold,
            )
          }{" "}
          items sold ·{" "}
          {
            formatCurrency(
              category.estimatedProfit,
            )
          }{" "}
          est. profit
        </Text>
      </View>

      <Text
        style={
          styles.rankingValue
        }
        numberOfLines={
          1
        }
        adjustsFontSizeToFit
        minimumFontScale={
          0.75
        }
      >
        {
          formatCurrency(
            category.salesValue,
          )
        }
      </Text>
    </View>
  );
}

function EmptyMessage({
  text,
}: {
  text:
    string;
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
        {
          text
        }
      </Text>
    </View>
  );
}

function calculateAverageSale(
  salesValue:
    number,

  salesUnits:
    number,
): number {
  if (
    salesUnits <=
    0
  ) {
    return 0;
  }

  return (
    salesValue /
    salesUnits
  );
}

function calculatePercentChange(
  current:
    number,

  previous:
    number,
): number | null {
  if (
    previous ===
    0
  ) {
    return current ===
      0
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
    value ===
    null
  ) {
    return "New";
  }

  if (
    Math.abs(
      value,
    ) <
    0.05
  ) {
    return "No change";
  }

  const rounded =
    Math.round(
      value *
        10,
    ) /
    10;

  if (
    rounded >
    0
  ) {
    return `↑ ${rounded}%`;
  }

  if (
    rounded <
    0
  ) {
    return `↓ ${Math.abs(
      rounded,
    )}%`;
  }

  return "No change";
}

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

const numberFormatter =
  new Intl.NumberFormat(
    "en-CA",
  );

function formatCurrency(
  value:
    number,
): string {
  return currencyFormatter.format(
    value,
  );
}

function formatNumber(
  value:
    number,
): string {
  return numberFormatter.format(
    value,
  );
}

function formatPeriodLabel(
  period:
    AnalyticsPeriodDays,
): string {
  if (
    period ===
    365
  ) {
    return "1 year";
  }

  return `${period} days`;
}

const styles =
  StyleSheet.create({
    screen: {
      flex:
        1,

      backgroundColor:
        "#F4F6F8",
    },

    content: {
      paddingHorizontal:
        18,

      paddingTop:
        12,

      paddingBottom:
        50,
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
      flex:
        1,

      minWidth:
        0,

      marginRight:
        16,
    },

    title: {
      fontSize:
        28,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    subtitle: {
      marginTop:
        6,

      maxWidth:
        320,

      fontSize:
        13,

      lineHeight:
        19,

      color:
        "#6B7280",
    },

    closeButton: {
      minHeight:
        42,

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        10,

      paddingHorizontal:
        14,

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

    periodSection: {
      marginTop:
        24,
    },

    periodLabel: {
      fontSize:
        12,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      letterSpacing:
        0.4,

      color:
        "#6B7280",
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
        40,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        999,

      paddingHorizontal:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    periodButtonSelected: {
      borderColor:
        "#20252B",

      backgroundColor:
        "#20252B",
    },

    periodButtonText: {
      fontSize:
        12,

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

    sectionHeader: {
      marginTop:
        28,
    },

    sectionTitle: {
      fontSize:
        18,

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
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        10,
    },

    summaryCard: {
      width:
        "48%",

      minHeight:
        145,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        15,

      padding:
        14,

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
        11,

      fontWeight:
        "800",

      color:
        "#6B7280",
    },

    summaryValue: {
      marginTop:
        9,

      fontSize:
        21,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    previousValue: {
      marginTop:
        5,

      fontSize:
        10,

      color:
        "#8B949E",
    },

    changeRow: {
      marginTop:
        10,
    },

    changeText: {
      fontSize:
        12,

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
        9,

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

      justifyContent:
        "space-between",

      gap:
        12,
    },

    chartMetricBlock: {
      flex:
        1,

      minWidth:
        0,
    },

    chartFooterRight: {
      alignItems:
        "flex-end",
    },

    chartFooterText: {
      fontSize:
        11,

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

      minWidth:
        0,

      marginRight:
        12,
    },

    trendProductName: {
      fontSize:
        15,

      lineHeight:
        20,

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

      lineHeight:
        16,

      color:
        "#6B7280",
    },

    trendPercent: {
      flexShrink:
        0,

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

      lineHeight:
        16,

      color:
        "#92400E",
    },

    trendMessage: {
      marginTop:
        11,

      fontSize:
        12,

      lineHeight:
        17,

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

      flexShrink:
        0,

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

      minWidth:
        0,

      marginHorizontal:
        12,
    },

    rankingTitle: {
      fontSize:
        15,

      lineHeight:
        20,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    rankingSubtitle: {
      marginTop:
        3,

      fontSize:
        12,

      lineHeight:
        17,

      color:
        "#5D6673",
    },

    rankingMeta: {
      marginTop:
        4,

      fontSize:
        11,

      lineHeight:
        16,

      color:
        "#7A838E",
    },

    rankingValue: {
      flexShrink:
        0,

      maxWidth:
        105,

      fontSize:
        14,

      fontWeight:
        "800",

      textAlign:
        "right",

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
      maxWidth:
        300,

      fontSize:
        13,

      lineHeight:
        19,

      textAlign:
        "center",

      color:
        "#6B7280",
    },
  });