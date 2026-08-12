import {
  Ionicons,
} from "@expo/vector-icons";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
      (item) =>
        item.priority ===
        "out_of_stock",
    ).length;

  const criticalCount =
    items.filter(
      (item) =>
        item.priority ===
        "critical",
    ).length;

  const lowStockCount =
    items.filter(
      (item) =>
        item.priority ===
        "low_stock",
    ).length;

  return (
    <SafeAreaView
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
              Reorder Management
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
          />

          <SummaryCard
            label="Critical"
            value={
              criticalCount
            }
            icon="warning-outline"
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
            (item) => (
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
}) {
  return (
    <View
      style={
        styles.summaryCard
      }
    >
      <Ionicons
        name={
          icon
        }
        size={
          20
        }
        color="#52606D"
      />

      <Text
        style={
          styles.summaryValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.summaryLabel
        }
      >
        {label}
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
          label="Suggested Order"
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
        <View>
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
          >
            {formatCurrency(
              item.suggestedReorderQuantity *
                item.product.unitCost,
            )}
          </Text>
        </View>

        <View
          style={
            styles.costRight
          }
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
          >
            {formatCurrency(
              item.product.unitCost,
            )}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
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
          Add Stock
        </Text>
      </Pressable>
    </View>
  );
}

function Metric({
  label,
  value,
  emphasized = false,
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
        {label}
      </Text>

      <Text
        style={[
          styles.metricValue,

          emphasized &&
            styles.metricValueEmphasized,
        ]}
      >
        {value}
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

const styles =
  StyleSheet.create({
    screen: {
      flex:
        1,

      backgroundColor:
        "#F4F6F8",
    },

    content: {
      padding:
        18,

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
        30,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    subtitle: {
      marginTop:
        5,

      fontSize:
        14,

      lineHeight:
        20,

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
        27,

      marginBottom:
        12,
    },

    sectionTitle: {
      fontSize:
        20,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    sectionSubtitle: {
      marginTop:
        3,

      fontSize:
        12,

      color:
        "#8B949E",
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

      marginRight:
        10,
    },

    productName: {
      fontSize:
        17,

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

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        13,
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