import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import type {
  InventoryAnalyticsSummary,
  ProductTrend,
  SalesTrendMetric,
} from "../types/inventoryAnalytics";

interface StoreInsightCardsProps {
  summary:
    InventoryAnalyticsSummary;
}

type InsightTone =
  | "positive"
  | "warning"
  | "danger"
  | "info";

interface BusinessInsight {
  id: string;

  eyebrow: string;

  title: string;

  message: string;

  detail?: string;

  tone: InsightTone;
}

interface ProductProfitSummary {
  productId: number;

  productName: string;

  brand: string;

  estimatedProfit: number;

  salesValue: number;

  unitsSold: number;
}

export function StoreInsightCards({
  summary,
}: StoreInsightCardsProps) {
  const insights =
    buildBusinessInsights(
      summary,
    );

  if (
    insights.length === 0
  ) {
    return (
      <View
        style={
          styles.emptyCard
        }
      >
        <Text
          style={
            styles.emptyTitle
          }
        >
          More activity needed
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          Business insights will appear as more sales and inventory activity is recorded.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={
        styles.container
      }
    >
      {insights.map(
        (insight) => (
          <InsightCard
            key={
              insight.id
            }
            insight={
              insight
            }
          />
        ),
      )}
    </View>
  );
}

function InsightCard({
  insight,
}: {
  insight:
    BusinessInsight;
}) {
  return (
    <View
      style={[
        styles.card,

        insight.tone ===
          "positive" &&
          styles.cardPositive,

        insight.tone ===
          "warning" &&
          styles.cardWarning,

        insight.tone ===
          "danger" &&
          styles.cardDanger,

        insight.tone ===
          "info" &&
          styles.cardInfo,
      ]}
    >
      <View
        style={
          styles.cardHeader
        }
      >
        <View
          style={[
            styles.indicator,

            insight.tone ===
              "positive" &&
              styles.indicatorPositive,

            insight.tone ===
              "warning" &&
              styles.indicatorWarning,

            insight.tone ===
              "danger" &&
              styles.indicatorDanger,

            insight.tone ===
              "info" &&
              styles.indicatorInfo,
          ]}
        />

        <Text
          style={
            styles.eyebrow
          }
        >
          {
            insight.eyebrow
          }
        </Text>
      </View>

      <Text
        style={
          styles.title
        }
      >
        {
          insight.title
        }
      </Text>

      <Text
        style={
          styles.message
        }
      >
        {
          insight.message
        }
      </Text>

      {insight.detail ? (
        <Text
          style={
            styles.detail
          }
        >
          {
            insight.detail
          }
        </Text>
      ) : null}
    </View>
  );
}

function buildBusinessInsights(
  summary:
    InventoryAnalyticsSummary,
): BusinessInsight[] {
  const insights:
    BusinessInsight[] = [];

  const salesInsight =
    buildSalesMomentumInsight(
      summary,
    );

  if (
    salesInsight
  ) {
    insights.push(
      salesInsight,
    );
  }

  const categoryInsight =
    buildTopCategoryInsight(
      summary,
    );

  if (
    categoryInsight
  ) {
    insights.push(
      categoryInsight,
    );
  }

  const productProfitInsight =
    buildHighestProfitProductInsight(
      summary.salesTrendMetrics,
    );

  if (
    productProfitInsight
  ) {
    insights.push(
      productProfitInsight,
    );
  }

  const restockInsight =
    buildRestockInsight(
      summary.productTrends,
    );

  if (
    restockInsight
  ) {
    insights.push(
      restockInsight,
    );
  } else {
    const slowdownInsight =
      buildSalesDropInsight(
        summary.productTrends,
      );

    if (
      slowdownInsight
    ) {
      insights.push(
        slowdownInsight,
      );
    }
  }

  return insights.slice(
    0,
    4,
  );
}

function buildSalesMomentumInsight(
  summary:
    InventoryAnalyticsSummary,
): BusinessInsight | null {
  const currentSales =
    summary.comparison
      .current.salesValue;

  const previousSales =
    summary.comparison
      .previous.salesValue;

  const change =
    summary.comparison
      .salesValueChangePercent;

  if (
    currentSales <= 0 &&
    previousSales <= 0
  ) {
    return null;
  }

  if (
    change === null
  ) {
    return {
      id:
        "sales-new",

      eyebrow:
        "Sales Activity",

      title:
        "New sales activity",

      message:
        `${formatCurrency(
          currentSales,
        )} in sales was recorded during this period.`,

      detail:
        "There was no sales activity in the previous comparison period.",

      tone:
        "info",
    };
  }

  if (
    change >= 10
  ) {
    return {
      id:
        "sales-up",

      eyebrow:
        "Sales Momentum",

      title:
        `Sales increased ${formatPercent(
          change,
        )}`,

      message:
        `${formatCurrency(
          currentSales,
        )} in sales compared with ${formatCurrency(
          previousSales,
        )} previously.`,

      detail:
        "Store sales are moving in a positive direction.",

      tone:
        "positive",
    };
  }

  if (
    change <= -10
  ) {
    return {
      id:
        "sales-down",

      eyebrow:
        "Needs Attention",

      title:
        `Sales decreased ${formatPercent(
          Math.abs(
            change,
          ),
        )}`,

      message:
        `${formatCurrency(
          currentSales,
        )} in sales compared with ${formatCurrency(
          previousSales,
        )} previously.`,

      detail:
        "Review product and category trends to see where the decline is coming from.",

      tone:
        "danger",
    };
  }

  return {
    id:
      "sales-steady",

    eyebrow:
      "Sales Momentum",

    title:
      "Sales are fairly steady",

    message:
      `${formatCurrency(
        currentSales,
      )} in sales during this period.`,

    detail:
      `Change from the previous period: ${formatSignedPercent(
        change,
      )}.`,

    tone:
      "info",
  };
}

function buildTopCategoryInsight(
  summary:
    InventoryAnalyticsSummary,
): BusinessInsight | null {
  if (
    summary.categoryShareMetrics.length ===
    0
  ) {
    return null;
  }

  const topCategory =
    [...summary.categoryShareMetrics]
      .sort(
        (
          first,
          second,
        ) =>
          second.salesValue -
          first.salesValue,
      )[0];

  if (
    !topCategory ||
    topCategory.salesValue <=
      0
  ) {
    return null;
  }

  const totalSales =
    summary.categoryShareMetrics.reduce(
      (
        total,
        category,
      ) =>
        total +
        category.salesValue,
      0,
    );

  const share =
    totalSales > 0
      ? (
          topCategory.salesValue /
          totalSales
        ) *
        100
      : 0;

  return {
    id:
      "top-category",

    eyebrow:
      "Top Revenue Category",

    title:
      topCategory.category,

    message:
      `${formatCurrency(
        topCategory.salesValue,
      )} in sales from ${formatNumber(
        topCategory.unitsSold,
      )} items sold.`,

    detail:
      `${formatPercent(
        share,
      )} of store sales in this period · ${topCategory.department}.`,

    tone:
      "positive",
  };
}

function buildHighestProfitProductInsight(
  metrics:
    SalesTrendMetric[],
): BusinessInsight | null {
  const products =
    aggregateProductProfit(
      metrics,
    );

  if (
    products.length ===
    0
  ) {
    return null;
  }

  const highestProfitProduct =
    products.sort(
      (
        first,
        second,
      ) =>
        second.estimatedProfit -
        first.estimatedProfit,
    )[0];

  if (
    !highestProfitProduct ||
    highestProfitProduct
      .estimatedProfit <=
      0
  ) {
    return null;
  }

  const productLabel =
    highestProfitProduct.brand.trim()
      ? `${highestProfitProduct.productName} · ${highestProfitProduct.brand}`
      : highestProfitProduct.productName;

  return {
    id:
      "highest-profit-product",

    eyebrow:
      "Highest-Profit Product",

    title:
      productLabel,

    message:
      `${formatCurrency(
        highestProfitProduct.estimatedProfit,
      )} estimated profit during this period.`,

    detail:
      `${formatNumber(
        highestProfitProduct.unitsSold,
      )} items sold · ${formatCurrency(
        highestProfitProduct.salesValue,
      )} revenue.`,

    tone:
      "positive",
  };
}

function aggregateProductProfit(
  metrics:
    SalesTrendMetric[],
): ProductProfitSummary[] {
  const productMap =
    new Map<
      number,
      ProductProfitSummary
    >();

  metrics.forEach(
    (metric) => {
      const existing =
        productMap.get(
          metric.productId,
        );

      if (
        existing
      ) {
        existing.estimatedProfit +=
          metric.estimatedProfit;

        existing.salesValue +=
          metric.salesValue;

        existing.unitsSold +=
          metric.salesUnits;

        return;
      }

      productMap.set(
        metric.productId,
        {
          productId:
            metric.productId,

          productName:
            metric.productName,

          brand:
            metric.brand,

          estimatedProfit:
            metric.estimatedProfit,

          salesValue:
            metric.salesValue,

          unitsSold:
            metric.salesUnits,
        },
      );
    },
  );

  return Array.from(
    productMap.values(),
  );
}

function buildRestockInsight(
  trends:
    ProductTrend[],
): BusinessInsight | null {
  const candidates =
    trends.filter(
      (trend) =>
        trend.needsRestock &&
        (
          trend.trendType ===
            "selling_faster" ||
          trend.trendType ===
            "new_strong_seller"
        ),
    );

  if (
    candidates.length ===
    0
  ) {
    return null;
  }

  const priority =
    [...candidates].sort(
      (
        first,
        second,
      ) => {
        if (
          first.currentStock !==
          second.currentStock
        ) {
          return (
            first.currentStock -
            second.currentStock
          );
        }

        return (
          second.currentUnitsSold -
          first.currentUnitsSold
        );
      },
    )[0];

  return {
    id:
      "restock-priority",

    eyebrow:
      "Restock Priority",

    title:
      priority.productName,

    message:
      `${formatNumber(
        priority.currentStock,
      )} units remain while sales are running strongly.`,

    detail:
      `Reorder level: ${formatNumber(
        priority.reorderLevel,
      )} · ${formatTrendChange(
        priority,
      )}.`,

    tone:
      "warning",
  };
}

function buildSalesDropInsight(
  trends:
    ProductTrend[],
): BusinessInsight | null {
  const dropped =
    trends
      .filter(
        (trend) =>
          trend.trendType ===
          "sales_dropped",
      )
      .sort(
        (
          first,
          second,
        ) =>
          (
            first.changePercent ??
            0
          ) -
          (
            second.changePercent ??
            0
          ),
      )[0];

  if (
    !dropped
  ) {
    return null;
  }

  return {
    id:
      "product-slowdown",

    eyebrow:
      "Product Slowdown",

    title:
      dropped.productName,

    message:
      dropped.changePercent !==
      null
        ? `Sales volume dropped ${formatPercent(
            Math.abs(
              dropped.changePercent,
            ),
          )}.`
        : "Sales activity has fallen sharply.",

    detail:
      `${formatNumber(
        dropped.previousUnitsSold,
      )} items before → ${formatNumber(
        dropped.currentUnitsSold,
      )} now.`,

    tone:
      "danger",
  };
}

function formatTrendChange(
  trend:
    ProductTrend,
): string {
  if (
    trend.trendType ===
    "new_strong_seller"
  ) {
    return "new strong seller";
  }

  if (
    trend.changePercent ===
    null
  ) {
    return "sales increasing";
  }

  return `sales up ${formatPercent(
    trend.changePercent,
  )}`;
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

function formatSignedPercent(
  value:
    number,
): string {
  const rounded =
    Math.round(
      value * 10,
    ) / 10;

  if (
    rounded > 0
  ) {
    return `+${rounded}%`;
  }

  return `${rounded}%`;
}

const styles =
  StyleSheet.create({
    container: {
      gap:
        11,
    },

    card: {
      borderWidth:
        1,

      borderRadius:
        16,

      padding:
        16,

      backgroundColor:
        "#FFFFFF",
    },

    cardPositive: {
      borderColor:
        "#D1FAE5",

      backgroundColor:
        "#F7FEFA",
    },

    cardWarning: {
      borderColor:
        "#FDE68A",

      backgroundColor:
        "#FFFBEB",
    },

    cardDanger: {
      borderColor:
        "#FECACA",

      backgroundColor:
        "#FFF8F7",
    },

    cardInfo: {
      borderColor:
        "#DBEAFE",

      backgroundColor:
        "#F8FBFF",
    },

    cardHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    indicator: {
      width:
        8,

      height:
        8,

      borderRadius:
        4,

      marginRight:
        7,
    },

    indicatorPositive: {
      backgroundColor:
        "#15803D",
    },

    indicatorWarning: {
      backgroundColor:
        "#D97706",
    },

    indicatorDanger: {
      backgroundColor:
        "#B42318",
    },

    indicatorInfo: {
      backgroundColor:
        "#2563EB",
    },

    eyebrow: {
      fontSize:
        10,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      letterSpacing:
        0.5,

      color:
        "#6B7280",
    },

    title: {
      marginTop:
        9,

      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    message: {
      marginTop:
        6,

      fontSize:
        13,

      lineHeight:
        19,

      color:
        "#374151",
    },

    detail: {
      marginTop:
        7,

      fontSize:
        11,

      lineHeight:
        17,

      color:
        "#7A838E",
    },

    emptyCard: {
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
        6,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#6B7280",
    },
  });