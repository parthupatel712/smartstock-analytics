import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { InventoryDashboardSummary } from "../types/inventoryDashboard";

interface InventoryDashboardProps {
  summary: InventoryDashboardSummary;
  recentDays?: number;
  onClose: () => void;
}

interface MetricCardProps {
  label: string;
  value: string;
  description?: string;
  emphasis?: "default" | "positive" | "warning" | "danger";
}

export function InventoryDashboard({
  summary,
  recentDays = 30,
  onClose,
}: InventoryDashboardProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              Inventory Dashboard
            </Text>

            <Text style={styles.subtitle}>
              Business performance and stock overview
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.closeButtonText}>
              Close
            </Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>
            Potential inventory profit
          </Text>

          <Text style={styles.heroValue}>
            {formatCurrency(summary.potentialGrossProfit)}
          </Text>

          <Text style={styles.heroDescription}>
            Retail value minus current inventory cost
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Inventory overview
        </Text>

        <View style={styles.metricGrid}>
          <MetricCard
            label="Active products"
            value={formatNumber(summary.totalProducts)}
            description="Products currently tracked"
          />

          <MetricCard
            label="Stock units"
            value={formatNumber(summary.totalStockUnits)}
            description="Units available across inventory"
          />

          <MetricCard
            label="Low stock"
            value={formatNumber(
              summary.lowStockProductCount,
            )}
            description="At or below reorder level"
            emphasis={
              summary.lowStockProductCount > 0
                ? "warning"
                : "positive"
            }
          />

          <MetricCard
            label="Out of stock"
            value={formatNumber(
              summary.outOfStockProductCount,
            )}
            description="Products with zero inventory"
            emphasis={
              summary.outOfStockProductCount > 0
                ? "danger"
                : "positive"
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Inventory valuation
        </Text>

        <View style={styles.metricGrid}>
          <MetricCard
            label="Cost value"
            value={formatCurrency(
              summary.totalInventoryCostValue,
            )}
            description="Current stock valued at unit cost"
          />

          <MetricCard
            label="Retail value"
            value={formatCurrency(
              summary.totalInventoryRetailValue,
            )}
            description="Potential revenue at selling price"
            emphasis="positive"
          />
        </View>

        <View style={styles.marginCard}>
          <View style={styles.marginHeader}>
            <Text style={styles.marginTitle}>
              Potential gross margin
            </Text>

            <Text style={styles.marginPercent}>
              {formatPercentage(
                calculateMarginPercentage(
                  summary.totalInventoryRetailValue,
                  summary.potentialGrossProfit,
                ),
              )}
            </Text>
          </View>

          <Text style={styles.marginValue}>
            {formatCurrency(summary.potentialGrossProfit)}
          </Text>

          <View style={styles.marginTrack}>
            <View
              style={[
                styles.marginFill,
                {
                  width: `${calculateProgressPercentage(
                    summary.totalInventoryRetailValue,
                    summary.potentialGrossProfit,
                  )}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.recentHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Recent activity
            </Text>

            <Text style={styles.sectionDescription}>
              Last {recentDays} days
            </Text>
          </View>

          <View style={styles.transactionBadge}>
            <Text style={styles.transactionBadgeValue}>
              {formatNumber(
                summary.recentTransactionCount,
              )}
            </Text>

            <Text style={styles.transactionBadgeLabel}>
              transactions
            </Text>
          </View>
        </View>

        <View style={styles.activityCard}>
          <ActivityRow
            label="Sales value"
            value={formatCurrency(
              summary.recentSalesValue,
            )}
            description="Revenue recorded from sales"
            emphasis="positive"
          />

          <View style={styles.divider} />

          <ActivityRow
            label="Stock received"
            value={formatCurrency(
              summary.recentStockInValue,
            )}
            description="Inventory purchased or delivered"
          />

          <View style={styles.divider} />

          <ActivityRow
            label="Damaged inventory"
            value={formatCurrency(
              summary.recentDamageValue,
            )}
            description="Cost value removed as damage"
            emphasis={
              summary.recentDamageValue > 0
                ? "danger"
                : "default"
            }
          />
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>
            Dashboard insight
          </Text>

          <Text style={styles.insightText}>
            {buildDashboardInsight(summary)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  label,
  value,
  description,
  emphasis = "default",
}: MetricCardProps) {
  return (
    <View
      style={[
        styles.metricCard,
        emphasis === "positive" &&
          styles.positiveMetricCard,
        emphasis === "warning" &&
          styles.warningMetricCard,
        emphasis === "danger" &&
          styles.dangerMetricCard,
      ]}
    >
      <Text style={styles.metricLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.metricValue,
          emphasis === "positive" &&
            styles.positiveText,
          emphasis === "warning" &&
            styles.warningText,
          emphasis === "danger" &&
            styles.dangerText,
        ]}
      >
        {value}
      </Text>

      {description ? (
        <Text style={styles.metricDescription}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

interface ActivityRowProps {
  label: string;
  value: string;
  description: string;
  emphasis?: "default" | "positive" | "danger";
}

function ActivityRow({
  label,
  value,
  description,
  emphasis = "default",
}: ActivityRowProps) {
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityTextContainer}>
        <Text style={styles.activityLabel}>
          {label}
        </Text>

        <Text style={styles.activityDescription}>
          {description}
        </Text>
      </View>

      <Text
        style={[
          styles.activityValue,
          emphasis === "positive" &&
            styles.positiveText,
          emphasis === "danger" &&
            styles.dangerText,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-CA").format(value);
}

function formatPercentage(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function calculateMarginPercentage(
  retailValue: number,
  grossProfit: number,
): number {
  if (retailValue <= 0) {
    return 0;
  }

  return grossProfit / retailValue;
}

function calculateProgressPercentage(
  retailValue: number,
  grossProfit: number,
): number {
  const percentage =
    calculateMarginPercentage(
      retailValue,
      grossProfit,
    ) * 100;

  return Math.max(0, Math.min(percentage, 100));
}

function buildDashboardInsight(
  summary: InventoryDashboardSummary,
): string {
  if (summary.outOfStockProductCount > 0) {
    return `${summary.outOfStockProductCount} product${
      summary.outOfStockProductCount === 1 ? "" : "s"
    } are out of stock. Review them before the next sales cycle.`;
  }

  if (summary.lowStockProductCount > 0) {
    return `${summary.lowStockProductCount} product${
      summary.lowStockProductCount === 1 ? "" : "s"
    } are at or below their reorder level. Consider scheduling replenishment.`;
  }

  if (summary.totalProducts === 0) {
    return "Add products and inventory transactions to begin generating business insights.";
  }

  return "Inventory levels are currently above their configured reorder thresholds.";
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  content: {
    padding: 18,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
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
    borderColor: "#CBD2DA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#20252B",
  },
  buttonPressed: {
    opacity: 0.72,
  },
  heroCard: {
    marginTop: 22,
    borderRadius: 20,
    padding: 22,
    backgroundColor: "#20252B",
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#CBD5E1",
  },
  heroValue: {
    marginTop: 8,
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroDescription: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: "#AEB6C0",
  },
  sectionTitle: {
    marginTop: 24,
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },
  sectionDescription: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
  metricGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "48%",
    minHeight: 134,
    borderWidth: 1,
    borderColor: "#E0E4E8",
    borderRadius: 16,
    padding: 15,
    backgroundColor: "#FFFFFF",
  },
  positiveMetricCard: {
    borderColor: "#CFE8D5",
    backgroundColor: "#F2FAF4",
  },
  warningMetricCard: {
    borderColor: "#F1D9A7",
    backgroundColor: "#FFF8E8",
  },
  dangerMetricCard: {
    borderColor: "#F3C5C1",
    backgroundColor: "#FFF1F0",
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5D6673",
  },
  metricValue: {
    marginTop: 10,
    fontSize: 25,
    fontWeight: "800",
    color: "#111827",
  },
  metricDescription: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    color: "#6B7280",
  },
  positiveText: {
    color: "#15803D",
  },
  warningText: {
    color: "#9A6700",
  },
  dangerText: {
    color: "#B42318",
  },
  marginCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E0E4E8",
    borderRadius: 16,
    padding: 17,
    backgroundColor: "#FFFFFF",
  },
  marginHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  marginTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#20252B",
  },
  marginPercent: {
    fontSize: 15,
    fontWeight: "800",
    color: "#15803D",
  },
  marginValue: {
    marginTop: 8,
    fontSize: 25,
    fontWeight: "800",
    color: "#111827",
  },
  marginTrack: {
    marginTop: 14,
    height: 9,
    overflow: "hidden",
    borderRadius: 5,
    backgroundColor: "#E5E7EB",
  },
  marginFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#15803D",
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  transactionBadge: {
    alignItems: "flex-end",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#EAF2FF",
  },
  transactionBadgeValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  transactionBadgeLabel: {
    marginTop: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "#4B67A1",
  },
  activityCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E0E4E8",
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  activityRow: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  activityTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  activityLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#20252B",
  },
  activityDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: "#6B7280",
  },
  activityValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  insightCard: {
    marginTop: 18,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#EAF2FF",
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  insightText: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 21,
    color: "#334E84",
  },
});