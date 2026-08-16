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
  ReorderItem,
  ReorderPriority,
} from "../types/reorderItem";

interface ReorderManagementProps {
  items:
    ReorderItem[];

  onStockIn: (
    product:
      ReorderItem["product"],
  ) => void;

  onClose:
    () => void;
}

export function ReorderManagement({
  items,
  onStockIn,
  onClose,
}: ReorderManagementProps) {
  const outOfStockCount =
    items.filter(
      (
        item,
      ) =>
        item.priority ===
        "out_of_stock",
    ).length;

  const criticalCount =
    items.filter(
      (
        item,
      ) =>
        item.priority ===
        "critical",
    ).length;

  const lowStockCount =
    items.filter(
      (
        item,
      ) =>
        item.priority ===
        "low_stock",
    ).length;

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
              Reorder
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Products at or below their reorder level appear here automatically.
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
            styles.summaryGrid
          }
        >
          <SummaryCard
            label="Need Reorder"
            value={
              items.length
            }
            icon="cart-outline"
          />

          <SummaryCard
            label="Out of Stock"
            value={
              outOfStockCount
            }
            icon="alert-circle-outline"
            tone="danger"
          />

          <SummaryCard
            label="Critical"
            value={
              criticalCount
            }
            icon="warning-outline"
            tone="warning"
          />

          <SummaryCard
            label="Low Stock"
            value={
              lowStockCount
            }
            icon="trending-down-outline"
          />
        </View>

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
            Reorder Queue
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            Highest-priority products appear first.
          </Text>
        </View>

        {items.length ===
        0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={
                48
              }
              color="#15803D"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              Inventory looks healthy
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              No active products are currently at or below their reorder level.
            </Text>
          </View>
        ) : (
          items.map(
            (
              item,
            ) => (
              <ReorderCard
                key={
                  item.product.id
                }
                item={
                  item
                }
                onStockIn={
                  onStockIn
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
  label,
  value,
  icon,
  tone =
    "normal",
}: {
  label:
    string;

  value:
    number;

  icon:
    | "cart-outline"
    | "alert-circle-outline"
    | "warning-outline"
    | "trending-down-outline";

  tone?:
    | "normal"
    | "warning"
    | "danger";
}) {
  const color =
    tone ===
    "danger"
      ? "#B42318"
      : tone ===
          "warning"
        ? "#B45309"
        : "#52606D";

  return (
    <View
      style={[
        styles.summaryCard,

        tone ===
          "warning" &&
          styles.summaryCardWarning,

        tone ===
          "danger" &&
          styles.summaryCardDanger,
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
          color
        }
      />

      <Text
        style={[
          styles.summaryValue,

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

function ReorderCard({
  item,
  onStockIn,
}: {
  item:
    ReorderItem;

  onStockIn: (
    product:
      ReorderItem["product"],
  ) => void;
}) {
  const priority =
    getPriorityDisplay(
      item.priority,
    );

  const productDetails = [
    item.product.brand.trim(),
    item.product.department,
    item.product.category,
  ]
    .filter(
      Boolean,
    )
    .join(
      " · ",
    );

  const estimatedReorderCost =
    item.suggestedReorderQuantity *
    item.product.unitCost;

  return (
    <View
      style={[
        styles.reorderCard,

        item.priority ===
          "out_of_stock" &&
          styles.reorderCardDanger,

        item.priority ===
          "critical" &&
          styles.reorderCardWarning,
      ]}
    >
      <View
        style={
          styles.cardHeader
        }
      >
        <View
          style={
            styles.productTextContainer
          }
        >
          <Text
            style={
              styles.productName
            }
            numberOfLines={
              2
            }
          >
            {
              item.product.name
            }
          </Text>

          {productDetails ? (
            <Text
              style={
                styles.productDetails
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

        <View
          style={[
            styles.priorityBadge,

            {
              backgroundColor:
                priority.background,
            },
          ]}
        >
          <Text
            style={[
              styles.priorityText,

              {
                color:
                  priority.color,
              },
            ]}
            numberOfLines={
              1
            }
          >
            {
              priority.label
            }
          </Text>
        </View>
      </View>

      <Text
        style={
          styles.barcode
        }
        numberOfLines={
          1
        }
      >
        Barcode:{" "}
        {
          item.product.barcode
        }
      </Text>

      <View
        style={
          styles.metricsGrid
        }
      >
        <Metric
          label="Current"
          value={
            item.currentStock
          }
        />

        <Metric
          label="Reorder At"
          value={
            item.reorderLevel
          }
        />

        <Metric
          label="Target"
          value={
            item.targetStock
          }
        />

        <Metric
          label="Suggested"
          value={
            item.suggestedReorderQuantity
          }
          emphasized
        />
      </View>

      <View
        style={
          styles.costRow
        }
      >
        <View
          style={
            styles.costBlock
          }
        >
          <Text
            style={
              styles.costLabel
            }
          >
            Estimated reorder cost
          </Text>

          <Text
            style={
              styles.costValue
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
                estimatedReorderCost,
              )
            }
          </Text>
        </View>

        <View
          style={[
            styles.costBlock,
            styles.costRight,
          ]}
        >
          <Text
            style={
              styles.costLabel
            }
          >
            Unit cost
          </Text>

          <Text
            style={
              styles.unitCostValue
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
                item.product.unitCost,
              )
            }
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Add stock for ${item.product.name}`}
        onPress={() =>
          onStockIn(
            item.product,
          )
        }
        style={({
          pressed,
        }) => [
          styles.stockInButton,

          pressed &&
            styles.buttonPressed,
        ]}
      >
        <Ionicons
          name="add-circle-outline"
          size={
            18
          }
          color="#FFFFFF"
        />

        <Text
          style={
            styles.stockInButtonText
          }
        >
          Stock In
        </Text>
      </Pressable>
    </View>
  );
}

function Metric({
  label,
  value,
  emphasized =
    false,
}: {
  label:
    string;

  value:
    number;

  emphasized?:
    boolean;
}) {
  return (
    <View
      style={[
        styles.metric,

        emphasized &&
          styles.metricEmphasized,
      ]}
    >
      <Text
        style={
          styles.metricLabel
        }
      >
        {
          label
        }
      </Text>

      <Text
        style={[
          styles.metricValue,

          emphasized &&
            styles.metricValueEmphasized,
        ]}
        numberOfLines={
          1
        }
        adjustsFontSizeToFit
        minimumFontScale={
          0.8
        }
      >
        {
          value
        }
      </Text>
    </View>
  );
}

function getPriorityDisplay(
  priority:
    ReorderPriority,
): {
  label:
    string;

  color:
    string;

  background:
    string;
} {
  switch (
    priority
  ) {
    case "out_of_stock":
      return {
        label:
          "Out of Stock",

        color:
          "#B42318",

        background:
          "#FFF1F0",
      };

    case "critical":
      return {
        label:
          "Critical",

        color:
          "#B45309",

        background:
          "#FFF7ED",
      };

    case "low_stock":
    default:
      return {
        label:
          "Low Stock",

        color:
          "#2563EB",

        background:
          "#EFF6FF",
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
        105,

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

    summaryCardWarning: {
      borderColor:
        "#FDE68A",

      backgroundColor:
        "#FFFBEB",
    },

    summaryCardDanger: {
      borderColor:
        "#FECACA",

      backgroundColor:
        "#FFF8F7",
    },

    summaryValue: {
      marginTop:
        8,

      fontSize:
        23,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    summaryValueWarning: {
      color:
        "#B45309",
    },

    summaryValueDanger: {
      color:
        "#B42318",
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

    reorderCard: {
      marginBottom:
        14,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        18,

      padding:
        16,

      backgroundColor:
        "#FFFFFF",
    },

    reorderCardDanger: {
      borderColor:
        "#FECACA",
    },

    reorderCardWarning: {
      borderColor:
        "#FDE68A",
    },

    cardHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    productTextContainer: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        10,
    },

    productName: {
      flexShrink:
        1,

      fontSize:
        17,

      lineHeight:
        22,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    productDetails: {
      marginTop:
        4,

      fontSize:
        11,

      lineHeight:
        16,

      color:
        "#6B7280",
    },

    priorityBadge: {
      flexShrink:
        0,

      alignSelf:
        "flex-start",

      maxWidth:
        110,

      borderRadius:
        999,

      paddingHorizontal:
        9,

      paddingVertical:
        5,
    },

    priorityText: {
      fontSize:
        10,

      fontWeight:
        "800",

      textAlign:
        "center",
    },

    barcode: {
      marginTop:
        10,

      fontSize:
        11,

      color:
        "#8B949E",
    },

    metricsGrid: {
      marginTop:
        15,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        8,
    },

    metric: {
      width:
        "48%",

      minWidth:
        0,

      borderRadius:
        10,

      padding:
        10,

      backgroundColor:
        "#F8FAFC",
    },

    metricEmphasized: {
      backgroundColor:
        "#EFF6FF",
    },

    metricLabel: {
      fontSize:
        9,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#8B949E",
    },

    metricValue: {
      marginTop:
        4,

      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    metricValueEmphasized: {
      color:
        "#1D4ED8",
    },

    costRow: {
      marginTop:
        14,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      gap:
        12,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        13,
    },

    costBlock: {
      flex:
        1,

      minWidth:
        0,
    },

    costRight: {
      alignItems:
        "flex-end",
    },

    costLabel: {
      fontSize:
        10,

      color:
        "#8B949E",
    },

    costValue: {
      marginTop:
        3,

      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    unitCostValue: {
      marginTop:
        3,

      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#52606D",
    },

    stockInButton: {
      marginTop:
        15,

      minHeight:
        46,

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
        "#20252B",
    },

    stockInButtonText: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
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
        "#D1FAE5",

      borderRadius:
        18,

      padding:
        24,

      backgroundColor:
        "#F7FEFA",
    },

    emptyTitle: {
      marginTop:
        10,

      fontSize:
        18,

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