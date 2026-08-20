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

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import type {
  PurchaseOrderStatus,
  PurchaseOrderSummary,
} from "../types/purchaseOrder";

interface OrderManagementProps {
  orders:
    PurchaseOrderSummary[];

  hasDraft:
    boolean;

  draftProductCount:
    number;

  onCreateOrder:
    () => void;

  onContinueDraft:
    () => void;

  onOpenOrder: (
    orderId:
      number,
  ) => void;

  onClose:
    () => void;
}

export function OrderManagement({
  orders,
  hasDraft,
  draftProductCount,
  onCreateOrder,
  onContinueDraft,
  onOpenOrder,
  onClose,
}: OrderManagementProps) {
  const placedOrders =
    orders.filter(
      (
        order,
      ) =>
        order.status ===
          "ordered" ||
        order.status ===
          "partially_received" ||
        order.status ===
          "received",
    );

  const pendingOrders =
    orders.filter(
      (
        order,
      ) =>
        order.status ===
          "ordered" ||
        order.status ===
          "partially_received",
    );

  const receivedOrders =
    orders.filter(
      (
        order,
      ) =>
        order.status ===
        "received",
    );

  const onOrderValue =
    pendingOrders.reduce(
      (
        total,
        order,
      ) =>
        total +
        order.remainingValue,
      0,
    );

  return (
    <SafeAreaView
      edges={[
        "top",
        "left",
        "right",
        "bottom",
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
            styles.header
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
              Order Management
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Create, track and review purchase orders from one place.
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

        <View
          style={
            styles.summaryGrid
          }
        >
          <SummaryCard
            icon="document-text-outline"
            label="Draft"
            value={
              hasDraft
                ? "1"
                : "0"
            }
          />

          <SummaryCard
            icon="cube-outline"
            label="Placed"
            value={
              placedOrders.length.toString()
            }
          />

          <SummaryCard
            icon="time-outline"
            label="Pending"
            value={
              pendingOrders.length.toString()
            }
            tone="warning"
          />

          <SummaryCard
            icon="checkmark-done-outline"
            label="Received"
            value={
              receivedOrders.length.toString()
            }
            tone="success"
          />

          <SummaryCard
            icon="cash-outline"
            label="On Order"
            value={
              formatCurrency(
                onOrderValue,
              )
            }
            compact
            wide
          />
        </View>

        {hasDraft ? (
          <View
            style={
              styles.draftCard
            }
          >
            <View
              style={
                styles.draftHeader
              }
            >
              <View
                style={
                  styles.draftIcon
                }
              >
                <Ionicons
                  name="document-text-outline"
                  size={
                    21
                  }
                  color="#2563EB"
                />
              </View>

              <View
                style={
                  styles.draftText
                }
              >
                <Text
                  style={
                    styles.draftTitle
                  }
                >
                  Active Draft Order
                </Text>

                <Text
                  style={
                    styles.draftSubtitle
                  }
                >
                  {draftProductCount}{" "}
                  {draftProductCount ===
                  1
                    ? "product"
                    : "products"} currently saved
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={
                onContinueDraft
              }
              style={({
                pressed,
              }) => [
                styles.continueButton,

                pressed &&
                  styles.continueButtonPressed,
              ]}
            >
              <Text
                style={
                  styles.continueButtonText
                }
              >
                Continue Draft
              </Text>

              <Ionicons
                name="arrow-forward"
                size={
                  17
                }
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={
              onCreateOrder
            }
            style={({
              pressed,
            }) => [
              styles.newOrderButton,

              pressed &&
                styles.newOrderButtonPressed,
            ]}
          >
            <Ionicons
              name="add-circle-outline"
              size={
                20
              }
              color="#FFFFFF"
            />

            <Text
              style={
                styles.newOrderButtonText
              }
            >
              Create New Order
            </Text>
          </Pressable>
        )}

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
            Purchase Orders
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            Review pending, received and previous purchase orders.
          </Text>
        </View>

        {orders.length ===
        0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <Ionicons
              name="receipt-outline"
              size={
                42
              }
              color="#9CA3AF"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No purchase orders yet
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Purchase orders will appear here after you save or place them.
            </Text>
          </View>
        ) : (
          orders.map(
            (
              order,
            ) => (
              <OrderCard
                key={
                  order.id
                }
                order={
                  order
                }
                onPress={() =>
                  onOpenOrder(
                    order.id,
                  )
                }
              />
            ),
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  compact =
    false,
  wide =
    false,
  tone =
    "normal",
}: {
  icon:
    | "document-text-outline"
    | "cube-outline"
    | "time-outline"
    | "checkmark-done-outline"
    | "cash-outline";

  label:
    string;

  value:
    string;

  compact?:
    boolean;

  wide?:
    boolean;

  tone?:
    | "normal"
    | "warning"
    | "success";
}) {
  const iconColor =
    tone ===
    "success"
      ? "#15803D"
      : tone ===
          "warning"
        ? "#B45309"
        : "#52606D";

  return (
    <View
      style={[
        styles.summaryCard,

        wide &&
          styles.summaryCardWide,

        tone ===
          "warning" &&
          styles.summaryCardWarning,

        tone ===
          "success" &&
          styles.summaryCardSuccess,
      ]}
    >
      <Ionicons
        name={
          icon
        }
        size={
          19
        }
        color={
          iconColor
        }
      />

      <Text
        style={[
          styles.summaryValue,

          compact &&
            styles.summaryValueCompact,

          tone ===
            "warning" &&
            styles.summaryValueWarning,

          tone ===
            "success" &&
            styles.summaryValueSuccess,
        ]}
        numberOfLines={
          1
        }
        adjustsFontSizeToFit
        minimumFontScale={
          0.7
        }
      >
        {
          value
        }
      </Text>

      <Text
        style={
          styles.summaryLabel
        }
      >
        {
          label
        }
      </Text>
    </View>
  );
}

function OrderCard({
  order,
  onPress,
}: {
  order:
    PurchaseOrderSummary;

  onPress:
    () => void;
}) {
  const status =
    getStatusDisplay(
      order.status,
    );

  const isReceivedWithShortage =
    order.status ===
      "received" &&
    order.remainingUnits >
      0;

  const isFullyReceived =
    order.status ===
      "received" &&
    order.remainingUnits ===
      0;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.orderCard,

        pressed &&
          styles.orderCardPressed,
      ]}
    >
      <View
        style={
          styles.orderCardHeader
        }
      >
        <View
          style={
            styles.orderCardIdentity
          }
        >
          <Text
            style={
              styles.orderNumber
            }
          >
            {
              order.orderNumber
            }
          </Text>

          <Text
            style={
              styles.vendorName
            }
            numberOfLines={
              1
            }
          >
            {order.vendorName.trim()
              ? order.vendorName
              : "Vendor not specified"}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,

            {
              backgroundColor:
                status.background,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,

              {
                color:
                  status.color,
              },
            ]}
          >
            {
              status.label
            }
          </Text>
        </View>
      </View>

      <View
        style={
          styles.orderMetrics
        }
      >
        <OrderMetric
          label="Products"
          value={
            order.itemCount.toString()
          }
        />

        <OrderMetric
          label="Ordered Units"
          value={
            order.totalUnits.toString()
          }
        />

        <OrderMetric
          label="Total"
          value={
            formatCurrency(
              order.total,
            )
          }
        />
      </View>

      {isFullyReceived ? (
        <View
          style={
            styles.receivedCompleteCard
          }
        >
          <Ionicons
            name="checkmark-circle"
            size={
              22
            }
            color="#15803D"
          />

          <View
            style={
              styles.receivedCompleteContent
            }
          >
            <Text
              style={
                styles.receivedCompleteTitle
              }
            >
              Fully Received
            </Text>

            <Text
              style={
                styles.receivedCompleteSubtitle
              }
            >
              {order.receivedUnits}{" "}
              {order.receivedUnits ===
              1
                ? "unit"
                : "units"} received · no items missing
            </Text>
          </View>
        </View>
      ) : isReceivedWithShortage ? (
        <View
          style={
            styles.receivedShortageCard
          }
        >
          <Ionicons
            name="checkmark-circle"
            size={
              22
            }
            color="#15803D"
          />

          <View
            style={
              styles.receivedCompleteContent
            }
          >
            <Text
              style={
                styles.receivedCompleteTitle
              }
            >
              Received
            </Text>

            <Text
              style={
                styles.receivedCompleteSubtitle
              }
            >
              {order.receivedUnits}{" "}
              {order.receivedUnits ===
              1
                ? "unit"
                : "units"} received
            </Text>

            <View
              style={
                styles.receivedShortageRow
              }
            >
              <Ionicons
                name="warning-outline"
                size={
                  14
                }
                color="#B45309"
              />

              <Text
                style={
                  styles.receivedShortageText
                }
              >
                {order.remainingUnits}{" "}
                {order.remainingUnits ===
                1
                  ? "unit was"
                  : "units were"} missing from delivery
              </Text>
            </View>
          </View>
        </View>
      ) : order.status ===
        "partially_received" ? (
        <View
          style={
            styles.receivingSummary
          }
        >
          <View
            style={
              styles.receivingSummaryHeader
            }
          >
            <Text
              style={
                styles.receivingSummaryTitle
              }
            >
              Receiving
            </Text>

            <Text
              style={
                styles.receivingSummaryCount
              }
            >
              {order.receivedUnits} /{" "}
              {order.totalUnits} units
            </Text>
          </View>

          <View
            style={
              styles.progressTrack
            }
          >
            <View
              style={[
                styles.progressFill,

                {
                  width:
                    `${getReceivingPercentage(
                      order,
                    )}%`,
                },
              ]}
            />
          </View>

          <Text
            style={
              styles.remainingText
            }
          >
            {order.remainingUnits}{" "}
            {order.remainingUnits ===
            1
              ? "unit"
              : "units"} still outstanding
          </Text>
        </View>
      ) : null}

      <View
        style={
          styles.orderFooter
        }
      >
        <Text
          style={
            styles.orderDate
          }
        >
          {
            formatDate(
              order.orderedAt ??
                order.createdAt,
            )
          }
        </Text>

        <View
          style={
            styles.viewDetails
          }
        >
          <Text
            style={
              styles.viewDetailsText
            }
          >
            View Details
          </Text>

          <Ionicons
            name="chevron-forward"
            size={
              16
            }
            color="#64748B"
          />
        </View>
      </View>
    </Pressable>
  );
}

function OrderMetric({
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
        styles.orderMetric
      }
    >
      <Text
        style={
          styles.orderMetricLabel
        }
      >
        {
          label
        }
      </Text>

      <Text
        style={
          styles.orderMetricValue
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
    </View>
  );
}

function getReceivingPercentage(
  order:
    PurchaseOrderSummary,
): number {
  if (
    order.totalUnits <=
    0
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      (
        order.receivedUnits /
        order.totalUnits
      ) *
        100,
    ),
  );
}

function getStatusDisplay(
  status:
    PurchaseOrderStatus,
): {
  label:
    string;

  color:
    string;

  background:
    string;
} {
  switch (
    status
  ) {
    case "draft":
      return {
        label:
          "Draft",

        color:
          "#2563EB",

        background:
          "#EFF6FF",
      };

    case "ordered":
      return {
        label:
          "Ordered",

        color:
          "#B45309",

        background:
          "#FFF7ED",
      };

    case "partially_received":
      return {
        label:
          "Partially Received",

        color:
          "#2563EB",

        background:
          "#EFF6FF",
      };

    case "received":
      return {
        label:
          "Received",

        color:
          "#15803D",

        background:
          "#ECFDF3",
      };

    case "cancelled":
      return {
        label:
          "Cancelled",

        color:
          "#B42318",

        background:
          "#FFF1F0",
      };

    default:
      return {
        label:
          "Unknown",

        color:
          "#64748B",

        background:
          "#F1F5F9",
      };
  }
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

function formatDate(
  value:
    string,
): string {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

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

    header: {
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
        5,

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

    summaryGrid: {
      marginTop:
        22,

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
        100,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        15,

      padding:
        13,

      backgroundColor:
        "#FFFFFF",
    },

    summaryCardWide: {
      width:
        "100%",
    },

    summaryCardWarning: {
      borderColor:
        "#FDE68A",

      backgroundColor:
        "#FFFBEB",
    },

    summaryCardSuccess: {
      borderColor:
        "#BBF7D0",

      backgroundColor:
        "#F7FEFA",
    },

    summaryValue: {
      marginTop:
        7,

      fontSize:
        22,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    summaryValueCompact: {
      fontSize:
        17,
    },

    summaryValueWarning: {
      color:
        "#B45309",
    },

    summaryValueSuccess: {
      color:
        "#15803D",
    },

    summaryLabel: {
      marginTop:
        3,

      fontSize:
        11,

      fontWeight:
        "700",

      color:
        "#6B7280",
    },

    draftCard: {
      marginTop:
        18,

      borderWidth:
        1,

      borderColor:
        "#BFDBFE",

      borderRadius:
        16,

      padding:
        15,

      backgroundColor:
        "#EFF6FF",
    },

    draftHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    draftIcon: {
      width:
        43,

      height:
        43,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        22,

      backgroundColor:
        "#DBEAFE",
    },

    draftText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        11,
    },

    draftTitle: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#1E3A8A",
    },

    draftSubtitle: {
      marginTop:
        3,

      fontSize:
        11,

      color:
        "#64748B",
    },

    continueButton: {
      marginTop:
        13,

      minHeight:
        44,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        7,

      borderRadius:
        11,

      backgroundColor:
        "#2563EB",
    },

    continueButtonPressed: {
      backgroundColor:
        "#1D4ED8",
    },

    continueButtonText: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    newOrderButton: {
      marginTop:
        18,

      minHeight:
        50,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        8,

      borderRadius:
        12,

      backgroundColor:
        "#20252B",
    },

    newOrderButtonPressed: {
      backgroundColor:
        "#111827",
    },

    newOrderButtonText: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    sectionHeader: {
      marginTop:
        28,

      marginBottom:
        12,
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

    orderCard: {
      marginBottom:
        12,

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

    orderCardPressed: {
      backgroundColor:
        "#F8FAFC",
    },

    orderCardHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    orderCardIdentity: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        10,
    },

    orderNumber: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    vendorName: {
      marginTop:
        3,

      fontSize:
        12,

      color:
        "#6B7280",
    },

    statusBadge: {
      flexShrink:
        0,

      borderRadius:
        999,

      paddingHorizontal:
        9,

      paddingVertical:
        5,
    },

    statusText: {
      fontSize:
        10,

      fontWeight:
        "800",
    },

    orderMetrics: {
      marginTop:
        14,

      flexDirection:
        "row",

      gap:
        10,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        12,
    },

    orderMetric: {
      flex:
        1,

      minWidth:
        0,
    },

    orderMetricLabel: {
      fontSize:
        9,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#8B949E",
    },

    orderMetricValue: {
      marginTop:
        4,

      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    receivingSummary: {
      marginTop:
        13,

      borderRadius:
        11,

      padding:
        10,

      backgroundColor:
        "#F8FAFC",
    },

    receivingSummaryHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    receivingSummaryTitle: {
      fontSize:
        9,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      color:
        "#64748B",
    },

    receivingSummaryCount: {
      fontSize:
        10,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    progressTrack: {
      height:
        6,

      marginTop:
        8,

      overflow:
        "hidden",

      borderRadius:
        999,

      backgroundColor:
        "#E5E7EB",
    },

    progressFill: {
      height:
        "100%",

      borderRadius:
        999,

      backgroundColor:
        "#15803D",
    },

    remainingText: {
      marginTop:
        7,

      fontSize:
        9,

      color:
        "#B45309",
    },

    receivedCompleteCard: {
      marginTop:
        13,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        9,

      borderWidth:
        1,

      borderColor:
        "#BBF7D0",

      borderRadius:
        11,

      padding:
        11,

      backgroundColor:
        "#F7FEFA",
    },

    receivedShortageCard: {
      marginTop:
        13,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        9,

      borderWidth:
        1,

      borderColor:
        "#FDE68A",

      borderRadius:
        11,

      padding:
        11,

      backgroundColor:
        "#FFFBEB",
    },

    receivedCompleteContent: {
      flex:
        1,
    },

    receivedCompleteTitle: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    receivedCompleteSubtitle: {
      marginTop:
        2,

      fontSize:
        9,

      color:
        "#64748B",
    },

    receivedShortageRow: {
      marginTop:
        6,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,
    },

    receivedShortageText: {
      flex:
        1,

      fontSize:
        9,

      fontWeight:
        "700",

      color:
        "#B45309",
    },

    orderFooter: {
      marginTop:
        13,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    orderDate: {
      fontSize:
        10,

      color:
        "#8B949E",
    },

    viewDetails: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        3,
    },

    viewDetailsText: {
      fontSize:
        11,

      fontWeight:
        "700",

      color:
        "#52606D",
    },

    emptyCard: {
      minHeight:
        220,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#E5E7EB",

      borderRadius:
        17,

      padding:
        24,

      backgroundColor:
        "#FFFFFF",
    },

    emptyTitle: {
      marginTop:
        10,

      fontSize:
        17,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    emptyText: {
      marginTop:
        6,

      maxWidth:
        280,

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