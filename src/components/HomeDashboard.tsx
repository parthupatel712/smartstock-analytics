import {
  Ionicons,
} from "@expo/vector-icons";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";



import type {
  CloudSyncStatusState,
} from "../types/cloudSyncStatus";

import type {
  InventoryDashboardSummary,
} from "../types/inventoryDashboard";

interface HomeDashboardProps {
  storeName:
    string;

  summary:
    InventoryDashboardSummary;

  draftOrderCount:
    number;

  upcomingOrderCount:
    number;

  upcomingUnits:
    number;

  upcomingValue:
    number;

  cloudSyncStatus:
    CloudSyncStatusState;

  onOpenInventory:
    () => void;

  onOpenLowStock:
    () => void;

  onOpenOutOfStock:
    () => void;

  onOpenDraftOrders:
    () => void;

  onOpenUpcomingOrders:
    () => void;
}

export function HomeDashboard({
  storeName,
  summary,
  draftOrderCount,
  upcomingOrderCount,
  upcomingUnits,
  upcomingValue,
  cloudSyncStatus,
  onOpenInventory,
  onOpenLowStock,
  onOpenOutOfStock,
  onOpenDraftOrders,
  onOpenUpcomingOrders,
}: HomeDashboardProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.content
      }
    >
      

      <View
        style={
          styles.welcomeSection
        }
      >
        <View
          style={
            styles.welcomeBadge
          }
        >
          <Ionicons
            name="storefront-outline"
            size={
              15
            }
            color="#2563EB"
          />

          <Text
            style={
              styles.welcomeBadgeText
            }
          >
            STORE OVERVIEW
          </Text>
        </View>

        <Text
          style={
            styles.welcomeText
          }
        >
          Welcome to
        </Text>

        <Text
          style={
            styles.storeName
          }
          numberOfLines={
            2
          }
          adjustsFontSizeToFit
          minimumFontScale={
            0.78
          }
        >
          {
            storeName
          }
        </Text>

        <Text
          style={
            styles.storeSubtitle
          }
        >
          Your inventory at a glance
        </Text>
      </View>

      <View
        style={
          styles.grid
        }
      >
        <HomeCard
          icon="cube-outline"
          title="Active Products"
          value={
            formatNumber(
              summary.totalProducts,
            )
          }
          onPress={
            onOpenInventory
          }
        />

        <HomeCard
          icon="layers-outline"
          title="Total Units"
          value={
            formatNumber(
              summary.totalStockUnits,
            )
          }
          onPress={
            onOpenInventory
          }
        />

        <HomeCard
          icon="warning-outline"
          title="Low Stock"
          value={
            formatNumber(
              summary.lowStockProductCount,
            )
          }
          tone="warning"
          onPress={
            onOpenLowStock
          }
        />

        <HomeCard
          icon="alert-circle-outline"
          title="Out of Stock"
          value={
            formatNumber(
              summary.outOfStockProductCount,
            )
          }
          tone="danger"
          onPress={
            onOpenOutOfStock
          }
        />

        <HomeCard
          icon="document-text-outline"
          title="Draft Orders"
          value={
            formatNumber(
              draftOrderCount,
            )
          }
          onPress={
            onOpenDraftOrders
          }
        />

        <HomeCard
          icon="time-outline"
          title="Upcoming Orders"
          value={
            formatNumber(
              upcomingOrderCount,
            )
          }
          onPress={
            onOpenUpcomingOrders
          }
        />
      </View>

      {upcomingOrderCount >
      0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={
            onOpenUpcomingOrders
          }
          style={({
            pressed,
          }) => [
            styles.upcomingSummary,

            pressed &&
              styles.pressed,
          ]}
        >
          <View
            style={
              styles.upcomingIcon
            }
          >
            <Ionicons
              name="cube-outline"
              size={
                21
              }
              color="#2563EB"
            />
          </View>

          <View
            style={
              styles.upcomingText
            }
          >
            <Text
              style={
                styles.upcomingTitle
              }
            >
              Upcoming Stock
            </Text>

            <Text
              style={
                styles.upcomingSubtitle
              }
            >
              {formatNumber(
                upcomingUnits,
              )}{" "}
              units ·{" "}
              {formatCurrency(
                upcomingValue,
              )}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={
              18
            }
            color="#98A2B3"
          />
        </Pressable>
      ) : null}

      <View
        style={
          styles.valueSection
        }
      >
        <Text
          style={
            styles.sectionLabel
          }
        >
          Inventory Value
        </Text>

        <View
          style={
            styles.valueCard
          }
        >
          <ValueItem
            label="Cost Value"
            value={
              formatCurrency(
                summary.totalInventoryCostValue,
              )
            }
          />

          <View
            style={
              styles.valueDivider
            }
          />

          <ValueItem
            label="Retail Value"
            value={
              formatCurrency(
                summary.totalInventoryRetailValue,
              )
            }
          />
        </View>
      </View>

      <View
        style={
          styles.syncRow
        }
      >
        <View
          style={[
            styles.syncDot,

            cloudSyncStatus.state ===
              "synced" &&
              styles.syncDotSuccess,

            cloudSyncStatus.state ===
              "syncing" &&
              styles.syncDotSyncing,

            cloudSyncStatus.state ===
              "error" &&
              styles.syncDotError,
          ]}
        />

        <Text
          style={
            styles.syncText
          }
        >
          {
            getSyncText(
              cloudSyncStatus,
            )
          }
        </Text>
      </View>
    </ScrollView>
  );
}

function HomeCard({
  icon,
  title,
  value,
  tone =
    "normal",
  onPress,
}: {
  icon:
    | "cube-outline"
    | "layers-outline"
    | "warning-outline"
    | "alert-circle-outline"
    | "document-text-outline"
    | "time-outline";

  title:
    string;

  value:
    string;

  tone?:
    | "normal"
    | "warning"
    | "danger";

  onPress:
    () => void;
}) {
  const iconColor =
    tone ===
    "warning"
      ? "#B45309"
      : tone ===
          "danger"
        ? "#B42318"
        : "#2563EB";

  const iconBackground =
    tone ===
    "warning"
      ? "#FFF7ED"
      : tone ===
          "danger"
        ? "#FFF1F0"
        : "#EFF6FF";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.card,

        pressed &&
          styles.pressed,
      ]}
    >
      <View
        style={
          styles.cardTopRow
        }
      >
        <View
          style={[
            styles.cardIcon,

            {
              backgroundColor:
                iconBackground,
            },
          ]}
        >
          <Ionicons
            name={
              icon
            }
            size={
              20
            }
            color={
              iconColor
            }
          />
        </View>

        <Ionicons
          name="chevron-forward"
          size={
            16
          }
          color="#B0B7C3"
        />
      </View>

      <Text
        style={[
          styles.cardValue,

          tone ===
            "warning" &&
            styles.cardValueWarning,

          tone ===
            "danger" &&
            styles.cardValueDanger,
        ]}
      >
        {
          value
        }
      </Text>

      <Text
        style={
          styles.cardTitle
        }
        numberOfLines={
          1
        }
      >
        {
          title
        }
      </Text>
    </Pressable>
  );
}

function ValueItem({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <View
      style={
        styles.valueItem
      }
    >
      <Text
        style={
          styles.valueLabel
        }
      >
        {
          label
        }
      </Text>

      <Text
        style={
          styles.valueAmount
        }
        numberOfLines={
          1
        }
        adjustsFontSizeToFit
        minimumFontScale={
          0.72
        }
      >
        {
          value
        }
      </Text>
    </View>
  );
}

function getSyncText(
  status:
    CloudSyncStatusState,
): string {
  switch (
    status.state
  ) {
    case "syncing":
      return "Syncing inventory…";

    case "error":
      return "Cloud sync needs attention";

    case "synced":
      return "Inventory synced";

    default:
      return "Inventory available locally";
  }
}

const numberFormatter =
  new Intl.NumberFormat(
    "en-CA",
  );

function formatNumber(
  value:
    number,
): string {
  return numberFormatter.format(
    value,
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

function formatCurrency(
  value:
    number,
): string {
  return currencyFormatter.format(
    value,
  );
}

const styles =
  StyleSheet.create({
    content: {
      paddingHorizontal:
        18,

      paddingTop:
        14,

      paddingBottom:
        28,
    },

    welcomeSection: {
      alignItems:
        "center",

      marginTop:
        27,

      marginBottom:
        27,

      paddingHorizontal:
        12,
    },

    welcomeBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,

      borderRadius:
        999,

      paddingHorizontal:
        10,

      paddingVertical:
        5,

      backgroundColor:
        "#EFF6FF",
    },

    welcomeBadgeText: {
      fontSize:
        9,

      fontWeight:
        "800",

      letterSpacing:
        0.7,

      color:
        "#2563EB",
    },

    welcomeText: {
      marginTop:
        13,

      fontSize:
        15,

      fontWeight:
        "600",

      color:
        "#667085",
    },

    storeName: {
      marginTop:
        4,

      maxWidth:
        340,

      fontSize:
        27,

      lineHeight:
        33,

      fontWeight:
        "800",

      letterSpacing:
        -0.5,

      textAlign:
        "center",

      color:
        "#101828",
    },

    storeSubtitle: {
      marginTop:
        7,

      fontSize:
        11,

      fontWeight:
        "600",

      color:
        "#98A2B3",
    },

    grid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        10,
    },

    card: {
      width:
        "48%",

      minHeight:
        124,

      borderWidth:
        1,

      borderColor:
        "#E4E7EC",

      borderRadius:
        18,

      padding:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    cardTopRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    cardIcon: {
      width:
        38,

      height:
        38,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        12,
    },

    cardValue: {
      marginTop:
        14,

      fontSize:
        25,

      fontWeight:
        "800",

      color:
        "#101828",
    },

    cardValueWarning: {
      color:
        "#B45309",
    },

    cardValueDanger: {
      color:
        "#B42318",
    },

    cardTitle: {
      marginTop:
        4,

      fontSize:
        11,

      fontWeight:
        "700",

      color:
        "#667085",
    },

    upcomingSummary: {
      minHeight:
        72,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        12,

      borderWidth:
        1,

      borderColor:
        "#DBEAFE",

      borderRadius:
        18,

      paddingHorizontal:
        14,

      backgroundColor:
        "#F8FBFF",
    },

    upcomingIcon: {
      width:
        42,

      height:
        42,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        13,

      backgroundColor:
        "#EFF6FF",
    },

    upcomingText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        12,
    },

    upcomingTitle: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#344054",
    },

    upcomingSubtitle: {
      marginTop:
        3,

      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#667085",
    },

    valueSection: {
      marginTop:
        24,
    },

    sectionLabel: {
      marginBottom:
        10,

      fontSize:
        12,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      letterSpacing:
        0.35,

      color:
        "#667085",
    },

    valueCard: {
      minHeight:
        86,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#E4E7EC",

      borderRadius:
        18,

      paddingHorizontal:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    valueItem: {
      flex:
        1,

      minWidth:
        0,
    },

    valueLabel: {
      fontSize:
        10,

      fontWeight:
        "700",

      color:
        "#98A2B3",
    },

    valueAmount: {
      marginTop:
        5,

      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#101828",
    },

    valueDivider: {
      width:
        1,

      height:
        44,

      marginHorizontal:
        13,

      backgroundColor:
        "#EAECF0",
    },

    syncRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        20,
    },

    syncDot: {
      width:
        7,

      height:
        7,

      borderRadius:
        999,

      backgroundColor:
        "#98A2B3",
    },

    syncDotSuccess: {
      backgroundColor:
        "#16A34A",
    },

    syncDotSyncing: {
      backgroundColor:
        "#2563EB",
    },

    syncDotError: {
      backgroundColor:
        "#DC2626",
    },

    syncText: {
      marginLeft:
        6,

      fontSize:
        10,

      fontWeight:
        "600",

      color:
        "#98A2B3",
    },

    pressed: {
      opacity:
        0.68,
    },
  });