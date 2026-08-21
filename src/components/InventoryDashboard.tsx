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

import {
  RecentActivityCard,
} from "./RecentActivityCard";

import type {
  DashboardRecentActivity,
} from "../types/dashboardRecentActivity";

import type {
  InventoryDashboardSummary,
} from "../types/inventoryDashboard";

interface InventoryDashboardProps {
  summary:
    InventoryDashboardSummary;

  recentDays:
    number;

  recentActivity?:
    DashboardRecentActivity[];

  onViewAllActivity?:
    () => void;

  onClose:
    () => void;
}

export function InventoryDashboard({
  summary,
  recentDays,
  recentActivity =
    [],
  onViewAllActivity,
  onClose,
}: InventoryDashboardProps) {
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
              Dashboard
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              A quick overview of your inventory and recent stock activity.
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

        <SectionHeader
          title="Inventory Overview"
          description="Current stock position across active products."
        />

        <View
          style={
            styles.summaryGrid
          }
        >
          <SummaryCard
            label="Active Products"
            value={
              formatNumber(
                summary.totalProducts,
              )
            }
            description="Products currently active"
          />

          <SummaryCard
            label="Stock Units"
            value={
              formatNumber(
                summary.totalStockUnits,
              )
            }
            description="Total units currently in stock"
          />

          <SummaryCard
            label="Inventory Cost"
            value={
              formatCurrency(
                summary.totalInventoryCostValue,
              )
            }
            description="Current stock at cost"
          />

          <SummaryCard
            label="Retail Value"
            value={
              formatCurrency(
                summary.totalInventoryRetailValue,
              )
            }
            description="Current stock at selling price"
          />

          <SummaryCard
            label="Potential Profit"
            value={
              formatCurrency(
                summary.potentialGrossProfit,
              )
            }
            description="Retail value minus inventory cost"
            tone="positive"
          />

          <SummaryCard
            label="Low Stock"
            value={
              formatNumber(
                summary.lowStockProductCount,
              )
            }
            description="Products at or below reorder level"
            tone={
              summary.lowStockProductCount >
              0
                ? "warning"
                : "normal"
            }
          />

          <SummaryCard
            label="Out of Stock"
            value={
              formatNumber(
                summary.outOfStockProductCount,
              )
            }
            description="Products with no units available"
            tone={
              summary.outOfStockProductCount >
              0
                ? "danger"
                : "normal"
            }
          />
        </View>

        <SectionHeader
          title={`Last ${recentDays} Days`}
          description="Recent transaction activity."
        />

        <View
          style={
            styles.summaryGrid
          }
        >
          <SummaryCard
            label="Sales"
            value={
              formatCurrency(
                summary.recentSalesValue,
              )
            }
            description="Value of recorded sales"
            tone="positive"
          />

          <SummaryCard
            label="Stock In"
            value={
              formatCurrency(
                summary.recentStockInValue,
              )
            }
            description="Value of inventory received"
          />

          <SummaryCard
            label="Damage"
            value={
              formatCurrency(
                summary.recentDamageValue,
              )
            }
            description="Value of damaged or expired stock"
            tone={
              summary.recentDamageValue >
              0
                ? "danger"
                : "normal"
            }
          />

          <SummaryCard
            label="Transactions"
            value={
              formatNumber(
                summary.recentTransactionCount,
              )
            }
            description="Total inventory updates"
          />
        </View>

        <View
          style={
            styles.recentActivitySection
          }
        >
          <View
            style={
              styles.sectionHeaderRow
            }
          >
            <View
              style={
                styles.sectionHeaderText
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Recent Activity
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Latest inventory changes across your products.
              </Text>
            </View>

            {onViewAllActivity ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={
                  6
                }
                onPress={
                  onViewAllActivity
                }
                style={({
                  pressed,
                }) => [
                  styles.viewAllButton,

                  pressed &&
                    styles.viewAllButtonPressed,
                ]}
              >
                <Text
                  style={
                    styles.viewAllButtonText
                  }
                >
                  View All
                </Text>
              </Pressable>
            ) : null}
          </View>

          {recentActivity.length >
          0 ? (
            <View
              style={
                styles.activityList
              }
            >
              {recentActivity.map(
                (
                  activity,
                ) => (
                  <RecentActivityCard
                    key={
                      activity.transactionId
                    }
                    activity={
                      activity
                    }
                  />
                ),
              )}
            </View>
          ) : (
            <View
              style={
                styles.emptyActivityCard
              }
            >
              <Text
                style={
                  styles.emptyActivityTitle
                }
              >
                No recent activity
              </Text>

              <Text
                style={
                  styles.emptyActivityText
                }
              >
                Stock In, Sale, Return, Damage, and Physical Count updates will appear here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SectionHeaderProps {
  title:
    string;

  description?:
    string;
}

function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
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

      {description ? (
        <Text
          style={
            styles.sectionSubtitle
          }
        >
          {
            description
          }
        </Text>
      ) : null}
    </View>
  );
}

interface SummaryCardProps {
  label:
    string;

  value:
    string;

  description:
    string;

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
  tone =
    "normal",
}: SummaryCardProps) {
  return (
    <View
      style={[
        styles.summaryCard,

        tone ===
          "positive" &&
          styles.summaryCardPositive,

        tone ===
          "warning" &&
          styles.summaryCardWarning,

        tone ===
          "danger" &&
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
        style={[
          styles.summaryValue,

          tone ===
            "positive" &&
            styles.summaryValuePositive,

          tone ===
            "warning" &&
            styles.summaryValueWarning,

          tone ===
            "danger" &&
            styles.summaryValueDanger,
        ]}
      >
        {
          value
        }
      </Text>

      <Text
        style={
          styles.summaryDescription
        }
      >
        {
          description
        }
      </Text>
    </View>
  );
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
        0.7,
    },

    sectionHeader: {
      marginTop:
        26,
    },

    sectionTitle: {
      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    sectionSubtitle: {
      marginTop:
        4,

      fontSize:
        12,

      lineHeight:
        17,

      color:
        "#6B7280",
    },

    summaryGrid: {
      marginTop:
        12,

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
        126,

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
      fontSize:
        10,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      letterSpacing:
        0.3,

      color:
        "#7A838E",
    },

    summaryValue: {
      marginTop:
        8,

      fontSize:
        21,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    summaryValuePositive: {
      color:
        "#15803D",
    },

    summaryValueWarning: {
      color:
        "#9A6700",
    },

    summaryValueDanger: {
      color:
        "#B42318",
    },

    summaryDescription: {
      marginTop:
        6,

      fontSize:
        10,

      lineHeight:
        15,

      color:
        "#6B7280",
    },

    recentActivitySection: {
      marginTop:
        28,
    },

    sectionHeaderRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      marginBottom:
        12,
    },

    sectionHeaderText: {
      flex:
        1,

      marginRight:
        12,
    },

    viewAllButton: {
      minHeight:
        38,

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#D8DEE6",

      borderRadius:
        10,

      paddingHorizontal:
        12,

      backgroundColor:
        "#FFFFFF",
    },

    viewAllButtonPressed: {
      backgroundColor:
        "#EEF1F3",
    },

    viewAllButtonText: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#2563EB",
    },

    activityList: {
      gap:
        8,
    },

    emptyActivityCard: {
      borderWidth:
        1,

      borderColor:
        "#E5E7EB",

      borderRadius:
        15,

      padding:
        22,

      alignItems:
        "center",

      backgroundColor:
        "#FFFFFF",
    },

    emptyActivityTitle: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    emptyActivityText: {
      marginTop:
        6,

      maxWidth:
        320,

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