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

  draftQuantities:
    Map<
      number,
      number
    >;

  orderedQuantities:
    Map<
      number,
      number
    >;

  onCreateOrder:
    () => void;

  onOpenOrderManagement:
    () => void;

  onClose:
    () => void;
}

export function ReorderManagement({
  items,
  draftQuantities,
  orderedQuantities,
  onCreateOrder,
  onOpenOrderManagement,
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

  const lowStockCount =
    items.filter(
      (
        item,
      ) =>
        item.priority ===
        "low_stock",
    ).length;

  const productsInDraft =
    items.filter(
      (
        item,
      ) =>
        (
          draftQuantities.get(
            item.product.id,
          ) ??
          0
        ) >
        0,
    ).length;

  const productsOnOrder =
    items.filter(
      (
        item,
      ) =>
        (
          orderedQuantities.get(
            item.product.id,
          ) ??
          0
        ) >
        0,
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
              Review low-stock products and track what is already in draft or waiting to arrive.
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
            label="In Draft"
            value={
              productsInDraft
            }
            icon="document-text-outline"
            tone="draft"
          />

          <SummaryCard
            label="On Order"
            value={
              productsOnOrder
            }
            icon="cube-outline"
            tone="ordered"
          />
        </View>

        <View
          style={
            styles.orderActions
          }
        >
          <Pressable
            accessibilityRole="button"
            onPress={
              onCreateOrder
            }
            style={({
              pressed,
            }) => [
              styles.createOrderButton,

              pressed &&
                styles.createOrderButtonPressed,
            ]}
          >
            <Ionicons
              name={
                productsInDraft >
                0
                  ? "document-text-outline"
                  : "cart-outline"
              }
              size={
                19
              }
              color="#FFFFFF"
            />

            <Text
              style={
                styles.createOrderButtonText
              }
            >
              {productsInDraft >
              0
                ? "Continue Draft Order"
                : "Create Order"}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={
                18
              }
              color="#FFFFFF"
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={
              onOpenOrderManagement
            }
            style={({
              pressed,
            }) => [
              styles.orderManagementButton,

              pressed &&
                styles.orderManagementButtonPressed,
            ]}
          >
            <Ionicons
              name="file-tray-full-outline"
              size={
                19
              }
              color="#20252B"
            />

            <View
              style={
                styles.orderManagementTextContainer
              }
            >
              <Text
                style={
                  styles.orderManagementTitle
                }
              >
                Order Management
              </Text>

              <Text
                style={
                  styles.orderManagementSubtitle
                }
              >
                View drafts, placed orders and purchase history
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={
                19
              }
              color="#64748B"
            />
          </Pressable>
        </View>

        {productsInDraft >
        0 ? (
          <View
            style={
              styles.draftMessageContainer
            }
          >
            <Ionicons
              name="document-text-outline"
              size={
                16
              }
              color="#2563EB"
            />

            <Text
              style={
                styles.draftMessage
              }
            >
              Draft quantities are saved, but the product still needs attention until the purchase order is placed.
            </Text>
          </View>
        ) : null}

        {productsOnOrder >
        0 ? (
          <View
            style={
              styles.orderedMessageContainer
            }
          >
            <Ionicons
              name="cube-outline"
              size={
                16
              }
              color="#B45309"
            />

            <Text
              style={
                styles.orderedMessage
              }
            >
              On-order quantities have already been purchased but are not part of physical stock until the order is received.
            </Text>
          </View>
        ) : null}

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
            Physical stock determines whether a product remains in this queue.
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

            <Pressable
              accessibilityRole="button"
              onPress={
                onOpenOrderManagement
              }
              style={({
                pressed,
              }) => [
                styles.emptyOrdersButton,

                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Ionicons
                name="file-tray-full-outline"
                size={
                  17
                }
                color="#20252B"
              />

              <Text
                style={
                  styles.emptyOrdersButtonText
                }
              >
                View Order Management
              </Text>
            </Pressable>
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
                draftQuantity={
                  draftQuantities.get(
                    item.product.id,
                  ) ??
                  0
                }
                orderedQuantity={
                  orderedQuantities.get(
                    item.product.id,
                  ) ??
                  0
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
    | "document-text-outline"
    | "cube-outline";

  tone?:
    | "normal"
    | "danger"
    | "draft"
    | "ordered";
}) {
  const color =
    tone ===
    "danger"
      ? "#B42318"
      : tone ===
          "draft"
        ? "#2563EB"
        : tone ===
            "ordered"
          ? "#B45309"
          : "#52606D";

  return (
    <View
      style={[
        styles.summaryCard,

        tone ===
          "danger" &&
          styles.summaryCardDanger,

        tone ===
          "draft" &&
          styles.summaryCardDraft,

        tone ===
          "ordered" &&
          styles.summaryCardOrdered,
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

          {
            color,
          },
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
  draftQuantity,
  orderedQuantity,
}: {
  item:
    ReorderItem;

  draftQuantity:
    number;

  orderedQuantity:
    number;
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
          "low_stock" &&
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
          styles.infoRow
        }
      >
        <View
          style={
            styles.infoBlock
          }
        >
          <Text
            style={
              styles.infoLabel
            }
          >
            Current Stock
          </Text>

          <Text
            style={[
              styles.infoValue,

              item.currentStock ===
                0 &&
                styles.outOfStockValue,
            ]}
          >
            {
              item.currentStock
            }
          </Text>
        </View>

        <View
          style={
            styles.infoBlock
          }
        >
          <Text
            style={
              styles.infoLabel
            }
          >
            Reorder At
          </Text>

          <Text
            style={
              styles.infoValue
            }
          >
            {
              item.reorderLevel
            }
          </Text>
        </View>

        <View
          style={[
            styles.infoBlock,
            styles.infoBlockRight,
          ]}
        >
          <Text
            style={
              styles.infoLabel
            }
          >
            Unit Cost
          </Text>

          <Text
            style={
              styles.unitCostValue
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

      {draftQuantity >
      0 ? (
        <View
          style={
            styles.draftBadgeRow
          }
        >
          <Ionicons
            name="document-text-outline"
            size={
              16
            }
            color="#2563EB"
          />

          <View
            style={
              styles.statusTextContainer
            }
          >
            <Text
              style={
                styles.draftBadgeText
              }
            >
              {draftQuantity} in Draft Order
            </Text>

            <Text
              style={
                styles.statusDescription
              }
            >
              Selected, but the purchase order has not been placed yet.
            </Text>
          </View>
        </View>
      ) : null}

      {orderedQuantity >
      0 ? (
        <View
          style={
            styles.orderedBadgeRow
          }
        >
          <Ionicons
            name="cube-outline"
            size={
              16
            }
            color="#B45309"
          />

          <View
            style={
              styles.statusTextContainer
            }
          >
            <Text
              style={
                styles.orderedBadgeText
              }
            >
              {orderedQuantity} On Order
            </Text>

            <Text
              style={
                styles.statusDescription
              }
            >
              Purchase order placed. Waiting for the stock to be received.
            </Text>
          </View>
        </View>
      ) : null}
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

    case "low_stock":
    default:
      return {
        label:
          "Low Stock",

        color:
          "#B45309",

        background:
          "#FFF7ED",
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

    summaryCardDanger: {
      borderColor:
        "#FECACA",

      backgroundColor:
        "#FFF8F7",
    },

    summaryCardDraft: {
      borderColor:
        "#BFDBFE",

      backgroundColor:
        "#EFF6FF",
    },

    summaryCardOrdered: {
      borderColor:
        "#FDE68A",

      backgroundColor:
        "#FFFBEB",
    },

    summaryValue: {
      marginTop:
        8,

      fontSize:
        23,

      fontWeight:
        "800",
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

    orderActions: {
      marginTop:
        18,

      gap:
        10,
    },

    createOrderButton: {
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
        13,

      backgroundColor:
        "#20252B",
    },

    createOrderButtonPressed: {
      backgroundColor:
        "#111827",
    },

    createOrderButtonText: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    orderManagementButton: {
      minHeight:
        65,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

      borderWidth:
        1,

      borderColor:
        "#D6DCE3",

      borderRadius:
        13,

      paddingHorizontal:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    orderManagementButtonPressed: {
      backgroundColor:
        "#F8FAFC",
    },

    orderManagementTextContainer: {
      flex:
        1,

      minWidth:
        0,
    },

    orderManagementTitle: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    orderManagementSubtitle: {
      marginTop:
        2,

      fontSize:
        10,

      lineHeight:
        14,

      color:
        "#7A838E",
    },

    draftMessageContainer: {
      marginTop:
        10,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        7,

      borderRadius:
        10,

      padding:
        10,

      backgroundColor:
        "#EFF6FF",
    },

    draftMessage: {
      flex:
        1,

      fontSize:
        10,

      lineHeight:
        15,

      color:
        "#64748B",
    },

    orderedMessageContainer: {
      marginTop:
        10,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        7,

      borderRadius:
        10,

      padding:
        10,

      backgroundColor:
        "#FFFBEB",
    },

    orderedMessage: {
      flex:
        1,

      fontSize:
        10,

      lineHeight:
        15,

      color:
        "#78614A",
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

    infoRow: {
      marginTop:
        14,

      flexDirection:
        "row",

      gap:
        8,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        12,
    },

    infoBlock: {
      flex:
        1,

      minWidth:
        0,
    },

    infoBlockRight: {
      alignItems:
        "flex-end",
    },

    infoLabel: {
      fontSize:
        9,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#8B949E",
    },

    infoValue: {
      marginTop:
        4,

      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    outOfStockValue: {
      color:
        "#B42318",
    },

    unitCostValue: {
      marginTop:
        4,

      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    draftBadgeRow: {
      marginTop:
        13,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        8,

      borderRadius:
        11,

      paddingHorizontal:
        10,

      paddingVertical:
        9,

      backgroundColor:
        "#EFF6FF",
    },

    orderedBadgeRow: {
      marginTop:
        9,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        8,

      borderRadius:
        11,

      paddingHorizontal:
        10,

      paddingVertical:
        9,

      backgroundColor:
        "#FFFBEB",
    },

    statusTextContainer: {
      flex:
        1,
    },

    draftBadgeText: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#2563EB",
    },

    orderedBadgeText: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#B45309",
    },

    statusDescription: {
      marginTop:
        2,

      fontSize:
        9,

      lineHeight:
        14,

      color:
        "#64748B",
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

    emptyOrdersButton: {
      marginTop:
        16,

      minHeight:
        42,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        7,

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

    emptyOrdersButtonText: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#20252B",
    },
  });