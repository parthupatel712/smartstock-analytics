import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { RecentActivityCard } from "./RecentActivityCard";

import type { DashboardRecentActivity } from "../types/dashboardRecentActivity";
import type { InventoryDashboardSummary } from "../types/inventoryDashboard";

interface InventoryDashboardProps {
  summary: InventoryDashboardSummary;

  recentDays: number;

  recentActivity?: DashboardRecentActivity[];

  onViewAllActivity?: () => void;

  onClose: () => void;
}

export function InventoryDashboard({
  summary,
  recentDays,
  recentActivity = [],
  onViewAllActivity,
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
              Overview of stock, inventory value, and
              recent activity.
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

        <Text style={styles.sectionTitle}>
          Inventory Overview
        </Text>

        <View style={styles.summaryGrid}>
          <SummaryCard
            label="Active Products"
            value={formatNumber(
              summary.totalProducts,
            )}
            description="Products currently available"
          />

          <SummaryCard
            label="Stock Units"
            value={formatNumber(
              summary.totalStockUnits,
            )}
            description="Total units in inventory"
          />

          <SummaryCard
            label="Inventory Cost"
            value={formatCurrency(
              summary.totalInventoryCostValue,
            )}
            description="Current stock at cost"
          />

          <SummaryCard
            label="Retail Value"
            value={formatCurrency(
              summary.totalInventoryRetailValue,
            )}
            description="Current stock at selling price"
          />

          <SummaryCard
            label="Potential Profit"
            value={formatCurrency(
              summary.potentialGrossProfit,
            )}
            description="Retail value minus inventory cost"
          />

          <SummaryCard
            label="Low Stock"
            value={formatNumber(
              summary.lowStockProductCount,
            )}
            description="Products at or below reorder level"
            tone={
              summary.lowStockProductCount > 0
                ? "warning"
                : "normal"
            }
          />

          <SummaryCard
            label="Out of Stock"
            value={formatNumber(
              summary.outOfStockProductCount,
            )}
            description="Products with zero stock"
            tone={
              summary.outOfStockProductCount > 0
                ? "danger"
                : "normal"
            }
          />
        </View>

        <View style={styles.periodHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Recent Performance
            </Text>

            <Text style={styles.sectionSubtitle}>
              Last {recentDays} days
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            label="Sales"
            value={formatCurrency(
              summary.recentSalesValue,
            )}
            description={`Sales recorded in the last ${recentDays} days`}
            tone="positive"
          />

          <SummaryCard
            label="Stock Received"
            value={formatCurrency(
              summary.recentStockInValue,
            )}
            description={`Inventory received in the last ${recentDays} days`}
          />

          <SummaryCard
            label="Damage"
            value={formatCurrency(
              summary.recentDamageValue,
            )}
            description={`Damaged inventory in the last ${recentDays} days`}
            tone={
              summary.recentDamageValue > 0
                ? "danger"
                : "normal"
            }
          />

          <SummaryCard
            label="Transactions"
            value={formatNumber(
              summary.recentTransactionCount,
            )}
            description={`Inventory movements in the last ${recentDays} days`}
          />
        </View>

        <View style={styles.recentActivitySection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Recent Activity
              </Text>

              <Text style={styles.sectionSubtitle}>
                Latest sales, deliveries, damage,
                returns, and stock adjustments
              </Text>
            </View>

            {onViewAllActivity ? (
              <Pressable
                accessibilityRole="button"
                onPress={onViewAllActivity}
                style={({ pressed }) => [
                  styles.viewAllButton,
                  pressed &&
                    styles.viewAllButtonPressed,
                ]}
              >
                <Text
                  style={styles.viewAllButtonText}
                >
                  View All →
                </Text>
              </Pressable>
            ) : null}
          </View>

          {recentActivity.length > 0 ? (
            <View style={styles.activityList}>
              {recentActivity.map(
                (activity) => (
                  <RecentActivityCard
                    key={activity.transactionId}
                    activity={activity}
                  />
                ),
              )}
            </View>
          ) : (
            <View style={styles.emptyActivityCard}>
              <Text
                style={styles.emptyActivityTitle}
              >
                No recent activity
              </Text>

              <Text
                style={styles.emptyActivityText}
              >
                Sales, deliveries, damage, returns,
                and physical counts will appear here
                after inventory transactions are
                recorded.
              </Text>
            </View>
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
    | "warning"
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

        tone === "warning" &&
          styles.summaryCardWarning,

        tone === "danger" &&
          styles.summaryCardDanger,
      ]}
    >
      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.summaryValue,

          tone === "positive" &&
            styles.summaryValuePositive,

          tone === "warning" &&
            styles.summaryValueWarning,

          tone === "danger" &&
            styles.summaryValueDanger,
        ]}
      >
        {value}
      </Text>

      <Text style={styles.summaryDescription}>
        {description}
      </Text>
    </View>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,

    backgroundColor:
      "#F4F6F8",
  },

  content: {
    padding: 18,

    paddingBottom: 50,
  },

  headerRow: {
    flexDirection: "row",

    alignItems: "flex-start",

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

    fontSize: 14,

    lineHeight: 20,

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
    opacity: 0.7,
  },

  sectionTitle: {
    marginTop: 26,

    fontSize: 20,

    fontWeight: "800",

    color: "#111827",
  },

  sectionSubtitle: {
    marginTop: 4,

    fontSize: 13,

    lineHeight: 18,

    color: "#6B7280",
  },

  periodHeader: {
    marginTop: 2,
  },

  summaryGrid: {
    marginTop: 14,

    flexDirection: "row",

    flexWrap: "wrap",

    gap: 12,
  },

  summaryCard: {
    width: "48%",

    minHeight: 135,

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

  summaryCardWarning: {
    borderColor:
      "#FDE7B2",

    backgroundColor:
      "#FFFCF2",
  },

  summaryCardDanger: {
    borderColor:
      "#FECACA",

    backgroundColor:
      "#FFF8F7",
  },

  summaryLabel: {
    fontSize: 12,

    fontWeight: "700",

    textTransform:
      "uppercase",

    color: "#6B7280",
  },

  summaryValue: {
    marginTop: 9,

    fontSize: 22,

    fontWeight: "800",

    color: "#111827",
  },

  summaryValuePositive: {
    color: "#15803D",
  },

  summaryValueWarning: {
    color: "#9A6700",
  },

  summaryValueDanger: {
    color: "#B42318",
  },

  summaryDescription: {
    marginTop: 7,

    fontSize: 11,

    lineHeight: 16,

    color: "#6B7280",
  },

  recentActivitySection: {
    marginTop: 8,
  },

  sectionHeaderRow: {
    flexDirection: "row",

    alignItems: "flex-start",

    justifyContent:
      "space-between",

    marginBottom: 14,
  },

  sectionHeaderText: {
    flex: 1,

    marginRight: 12,
  },

  viewAllButton: {
    marginTop: 22,

    paddingHorizontal: 10,

    paddingVertical: 7,

    borderRadius: 9,
  },

  viewAllButtonPressed: {
    backgroundColor:
      "#E5E7EB",
  },

  viewAllButtonText: {
    fontSize: 13,

    fontWeight: "800",

    color: "#2563EB",
  },

  activityList: {
    marginTop: 2,
  },

  emptyActivityCard: {
    borderWidth: 1,

    borderColor:
      "#E5E7EB",

    borderRadius: 16,

    padding: 24,

    alignItems: "center",

    backgroundColor:
      "#FFFFFF",
  },

  emptyActivityTitle: {
    fontSize: 16,

    fontWeight: "800",

    color: "#111827",
  },

  emptyActivityText: {
    marginTop: 7,

    maxWidth: 320,

    fontSize: 13,

    lineHeight: 19,

    textAlign: "center",

    color: "#6B7280",
  },
});