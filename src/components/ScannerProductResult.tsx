import {
  Ionicons,
} from "@expo/vector-icons";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type {
  Product,
} from "../types/product";

import type {
  ProductDeliverySummary,
} from "../types/productDelivery";

interface ScannerProductResultProps {
  product:
    Product;

  latestDelivery?:
    ProductDeliverySummary;

  onUpdateInventory:
    (
      product:
        Product,
    ) => void;

  onViewHistory:
    (
      product:
        Product,
    ) => void;

  onEditProduct:
    (
      product:
        Product,
    ) => void;

  onArchiveProduct:
    (
      product:
        Product,
    ) => void;
}

export function ScannerProductResult({
  product,
  latestDelivery,
  onUpdateInventory,
  onViewHistory,
  onEditProduct,
  onArchiveProduct,
}: ScannerProductResultProps) {
  const isOutOfStock =
    product.currentStock <=
    0;

  const isLowStock =
    product.currentStock >
      0 &&
    product.currentStock <=
      product.reorderLevel;

  return (
    <View
      style={
        styles.card
      }
    >
      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.productIdentity
          }
        >
          <View
            style={
              styles.productIcon
            }
          >
            <Ionicons
              name="cube-outline"
              size={
                22
              }
              color="#2563EB"
            />
          </View>

          <View
            style={
              styles.productText
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
                product.name
              }
            </Text>

            {product.brand.trim() ? (
              <Text
                style={
                  styles.productBrand
                }
                numberOfLines={
                  1
                }
              >
                {
                  product.brand
                }
              </Text>
            ) : null}
          </View>
        </View>

        <View
          style={[
            styles.stockBadge,

            isLowStock &&
              styles.stockBadgeWarning,

            isOutOfStock &&
              styles.stockBadgeDanger,
          ]}
        >
          <Text
            style={[
              styles.stockValue,

              isLowStock &&
                styles.stockValueWarning,

              isOutOfStock &&
                styles.stockValueDanger,
            ]}
          >
            {
              product.currentStock
            }
          </Text>

          <Text
            style={[
              styles.stockLabel,

              isLowStock &&
                styles.stockValueWarning,

              isOutOfStock &&
                styles.stockValueDanger,
            ]}
          >
            stock
          </Text>
        </View>
      </View>

      <View
        style={
          styles.classificationRow
        }
      >
        <View
          style={
            styles.chip
          }
        >
          <Text
            style={
              styles.chipText
            }
            numberOfLines={
              1
            }
          >
            {
              product.department
            }
          </Text>
        </View>

        <View
          style={
            styles.chip
          }
        >
          <Text
            style={
              styles.chipText
            }
            numberOfLines={
              1
            }
          >
            {
              product.category
            }
          </Text>
        </View>
      </View>

      <View
        style={
          styles.details
        }
      >
        <DetailRow
          label="Barcode"
          value={
            product.barcode
          }
        />

        <DetailRow
          label="Selling Price"
          value={
            formatCurrency(
              product.unitPrice,
            )
          }
        />

        <DetailRow
          label="Unit Cost"
          value={
            formatCurrency(
              product.unitCost,
            )
          }
        />

        <DetailRow
          label="Reorder At"
          value={`${product.reorderLevel} units`}
        />
      </View>

      {isOutOfStock ? (
        <View
          style={
            styles.stockAlertDanger
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={
              16
            }
            color="#B42318"
          />

          <Text
            style={
              styles.stockAlertDangerText
            }
          >
            Out of stock
          </Text>
        </View>
      ) : isLowStock ? (
        <View
          style={
            styles.stockAlertWarning
          }
        >
          <Ionicons
            name="warning-outline"
            size={
              16
            }
            color="#B45309"
          />

          <Text
            style={
              styles.stockAlertWarningText
            }
          >
            Low stock — reorder soon
          </Text>
        </View>
      ) : null}

      {latestDelivery ? (
        <View
          style={
            styles.deliveryCard
          }
        >
          <View
            style={
              styles.deliveryHeader
            }
          >
            <View
              style={
                styles.deliveryTitleRow
              }
            >
              <Ionicons
                name="cube-outline"
                size={
                  15
                }
                color="#2563EB"
              />

              <Text
                style={
                  styles.deliveryTitle
                }
              >
                Latest Delivery
              </Text>
            </View>

            <Text
              style={
                styles.deliveryDate
              }
            >
              {
                formatDateTime(
                  latestDelivery.receivedAt,
                )
              }
            </Text>
          </View>

          <View
            style={
              styles.deliveryMetrics
            }
          >
            <DeliveryMetric
              label="Received"
              value={`+${latestDelivery.quantityReceived}`}
            />

            <DeliveryMetric
              label="Stock"
              value={`${latestDelivery.stockBefore} → ${latestDelivery.stockAfter}`}
            />

            <DeliveryMetric
              label="Value"
              value={
                formatCurrency(
                  latestDelivery.deliveryValue,
                )
              }
            />
          </View>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() =>
          onUpdateInventory(
            product,
          )
        }
        style={({
          pressed,
        }) => [
          styles.updateButton,

          pressed &&
            styles.updateButtonPressed,
        ]}
      >
        <Ionicons
          name="swap-vertical-outline"
          size={
            19
          }
          color="#FFFFFF"
        />

        <View
          style={
            styles.updateButtonText
          }
        >
          <Text
            style={
              styles.updateButtonTitle
            }
          >
            Update Inventory
          </Text>

          <Text
            style={
              styles.updateButtonSubtitle
            }
          >
            Stock In · Sale · Return · Damage · Count
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={
            18
          }
          color="#FFFFFF"
        />
      </Pressable>

      <View
        style={
          styles.actionRow
        }
      >
        <ActionButton
          icon="time-outline"
          label="History"
          onPress={() =>
            onViewHistory(
              product,
            )
          }
        />

        <ActionButton
          icon="pencil-outline"
          label="Edit"
          onPress={() =>
            onEditProduct(
              product,
            )
          }
        />

        <ActionButton
          icon="archive-outline"
          label="Archive"
          destructive
          onPress={() =>
            onArchiveProduct(
              product,
            )
          }
        />
      </View>
    </View>
  );
}

function DetailRow({
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
        styles.detailRow
      }
    >
      <Text
        style={
          styles.detailLabel
        }
      >
        {
          label
        }
      </Text>

      <Text
        style={
          styles.detailValue
        }
        numberOfLines={
          1
        }
      >
        {
          value
        }
      </Text>
    </View>
  );
}

function DeliveryMetric({
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
        styles.deliveryMetric
      }
    >
      <Text
        style={
          styles.deliveryMetricLabel
        }
      >
        {
          label
        }
      </Text>

      <Text
        style={
          styles.deliveryMetricValue
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

function ActionButton({
  icon,
  label,
  destructive =
    false,
  onPress,
}: {
  icon:
    | "time-outline"
    | "pencil-outline"
    | "archive-outline";

  label:
    string;

  destructive?:
    boolean;

  onPress:
    () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.actionButton,

        destructive &&
          styles.actionButtonDestructive,

        pressed &&
          styles.actionButtonPressed,
      ]}
    >
      <Ionicons
        name={
          icon
        }
        size={
          18
        }
        color={
          destructive
            ? "#B42318"
            : "#52606D"
        }
      />

      <Text
        style={[
          styles.actionButtonLabel,

          destructive &&
            styles.actionButtonLabelDestructive,
        ]}
      >
        {
          label
        }
      </Text>
    </Pressable>
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

function formatDateTime(
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

  return date.toLocaleString(
    "en-CA",
    {
      month:
        "short",

      day:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    },
  );
}

const styles =
  StyleSheet.create({
    card: {
      borderWidth:
        1,

      borderColor:
        "#DCE3EA",

      borderRadius:
        18,

      padding:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    productIdentity: {
      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      marginRight:
        10,
    },

    productIcon: {
      width:
        44,

      height:
        44,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        14,

      backgroundColor:
        "#EFF6FF",
    },

    productText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        10,
    },

    productName: {
      fontSize:
        16,

      lineHeight:
        20,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    productBrand: {
      marginTop:
        3,

      fontSize:
        11,

      fontWeight:
        "600",

      color:
        "#64748B",
    },

    stockBadge: {
      minWidth:
        57,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        13,

      paddingHorizontal:
        10,

      paddingVertical:
        7,

      backgroundColor:
        "#ECFDF3",
    },

    stockBadgeWarning: {
      backgroundColor:
        "#FFF7ED",
    },

    stockBadgeDanger: {
      backgroundColor:
        "#FFF1F0",
    },

    stockValue: {
      fontSize:
        17,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    stockLabel: {
      marginTop:
        1,

      fontSize:
        8,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      color:
        "#15803D",
    },

    stockValueWarning: {
      color:
        "#B45309",
    },

    stockValueDanger: {
      color:
        "#B42318",
    },

    classificationRow: {
      marginTop:
        11,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        6,
    },

    chip: {
      maxWidth:
        "48%",

      borderRadius:
        999,

      paddingHorizontal:
        9,

      paddingVertical:
        4,

      backgroundColor:
        "#F1F5F9",
    },

    chipText: {
      fontSize:
        9,

      fontWeight:
        "700",

      color:
        "#52606D",
    },

    details: {
      marginTop:
        12,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        6,
    },

    detailRow: {
      minHeight:
        29,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    detailLabel: {
      marginRight:
        12,

      fontSize:
        11,

      color:
        "#6B7280",
    },

    detailValue: {
      flexShrink:
        1,

      fontSize:
        11,

      fontWeight:
        "800",

      textAlign:
        "right",

      color:
        "#20252B",
    },

    stockAlertWarning: {
      marginTop:
        10,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        6,

      borderRadius:
        10,

      paddingHorizontal:
        10,

      paddingVertical:
        8,

      backgroundColor:
        "#FFF7ED",
    },

    stockAlertWarningText: {
      flex:
        1,

      fontSize:
        10,

      fontWeight:
        "800",

      color:
        "#B45309",
    },

    stockAlertDanger: {
      marginTop:
        10,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        6,

      borderRadius:
        10,

      paddingHorizontal:
        10,

      paddingVertical:
        8,

      backgroundColor:
        "#FFF1F0",
    },

    stockAlertDangerText: {
      flex:
        1,

      fontSize:
        10,

      fontWeight:
        "800",

      color:
        "#B42318",
    },

    deliveryCard: {
      marginTop:
        10,

      borderWidth:
        1,

      borderColor:
        "#DBEAFE",

      borderRadius:
        12,

      padding:
        10,

      backgroundColor:
        "#F8FBFF",
    },

    deliveryHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        8,
    },

    deliveryTitleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,
    },

    deliveryTitle: {
      fontSize:
        10,

      fontWeight:
        "800",

      color:
        "#334E84",
    },

    deliveryDate: {
      flexShrink:
        1,

      fontSize:
        8,

      fontWeight:
        "600",

      textAlign:
        "right",

      color:
        "#64748B",
    },

    deliveryMetrics: {
      marginTop:
        8,

      flexDirection:
        "row",

      gap:
        6,
    },

    deliveryMetric: {
      flex:
        1,

      minWidth:
        0,

      borderRadius:
        9,

      padding:
        7,

      backgroundColor:
        "#FFFFFF",
    },

    deliveryMetricLabel: {
      fontSize:
        7,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      color:
        "#94A3B8",
    },

    deliveryMetricValue: {
      marginTop:
        3,

      fontSize:
        10,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    updateButton: {
      marginTop:
        12,

      minHeight:
        52,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius:
        13,

      paddingHorizontal:
        12,

      backgroundColor:
        "#20252B",
    },

    updateButtonPressed: {
      backgroundColor:
        "#111827",
    },

    updateButtonText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        9,
    },

    updateButtonTitle: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    updateButtonSubtitle: {
      marginTop:
        2,

      fontSize:
        8,

      color:
        "#CBD5E1",
    },

    actionRow: {
      marginTop:
        8,

      flexDirection:
        "row",

      gap:
        7,
    },

    actionButton: {
      flex:
        1,

      minHeight:
        45,

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        3,

      borderRadius:
        11,

      backgroundColor:
        "#F8FAFC",
    },

    actionButtonDestructive: {
      backgroundColor:
        "#FFF7F6",
    },

    actionButtonPressed: {
      opacity:
        0.65,
    },

    actionButtonLabel: {
      fontSize:
        8,

      fontWeight:
        "800",

      color:
        "#52606D",
    },

    actionButtonLabelDestructive: {
      color:
        "#B42318",
    },
  });