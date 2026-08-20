import {
  memo,
} from "react";

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

interface ProductCardProps {
  product:
    Product;

  latestDelivery?:
    ProductDeliverySummary;

  onUpdateInventory?: (
    product:
      Product,
  ) => void;

  onViewHistory?: (
    product:
      Product,
  ) => void;

  onEditProduct?: (
    product:
      Product,
  ) => void;

  onArchiveProduct?: (
    product:
      Product,
  ) => void;
}

function ProductCardComponent({
  product,
  latestDelivery,
  onUpdateInventory,
  onViewHistory,
  onEditProduct,
  onArchiveProduct,
}: ProductCardProps) {
  const isOutOfStock =
    product.currentStock <=
    0;

  const isLowStock =
    product.currentStock >
      0 &&
    product.currentStock <=
      product.reorderLevel;

  const isZeroReceipt =
    latestDelivery !==
      undefined &&
    latestDelivery.quantityReceived ===
      0;

  return (
    <View
      style={
        styles.card
      }
    >
      <View
        style={
          styles.headerRow
        }
      >
        <View
          style={
            styles.productHeaderContent
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
                styles.brand
              }
            >
              {
                product.brand
              }
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.stockBadge,

            isOutOfStock &&
              styles.stockBadgeDanger,

            isLowStock &&
              styles.stockBadgeWarning,
          ]}
        >
          <Text
            style={[
              styles.stockBadgeValue,

              isOutOfStock &&
                styles.stockBadgeValueDanger,

              isLowStock &&
                styles.stockBadgeValueWarning,
            ]}
          >
            {
              product.currentStock
            }
          </Text>

          <Text
            style={[
              styles.stockBadgeLabel,

              isOutOfStock &&
                styles.stockBadgeValueDanger,

              isLowStock &&
                styles.stockBadgeValueWarning,
            ]}
          >
            units
          </Text>
        </View>
      </View>

      <View
        style={
          styles.taxonomyRow
        }
      >
        <View
          style={
            styles.taxonomyChip
          }
        >
          <Text
            style={
              styles.taxonomyChipText
            }
          >
            {
              product.department
            }
          </Text>
        </View>

        <View
          style={
            styles.taxonomyChip
          }
        >
          <Text
            style={
              styles.taxonomyChipText
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
          styles.detailsSection
        }
      >
        <DetailRow
          label="Barcode"
          value={
            product.barcode
          }
        />

        <DetailRow
          label="Selling price"
          value={
            formatCurrency(
              product.unitPrice,
            )
          }
        />

        <DetailRow
          label="Unit cost"
          value={
            formatCurrency(
              product.unitCost,
            )
          }
        />

        <DetailRow
          label="Reorder level"
          value={`${product.reorderLevel} units`}
        />
      </View>

      {isOutOfStock ? (
        <View
          style={
            styles.dangerMessage
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={
              17
            }
            color="#B42318"
          />

          <Text
            style={
              styles.dangerMessageText
            }
          >
            Out of stock
          </Text>
        </View>
      ) : isLowStock ? (
        <View
          style={
            styles.warningMessage
          }
        >
          <Ionicons
            name="warning-outline"
            size={
              17
            }
            color="#9A6700"
          />

          <Text
            style={
              styles.warningMessageText
            }
          >
            Low stock — consider reordering
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.deliveryCard,

          isZeroReceipt &&
            styles.zeroDeliveryCard,
        ]}
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
              name={
                isZeroReceipt
                  ? "alert-circle-outline"
                  : "cube-outline"
              }
              size={
                18
              }
              color={
                isZeroReceipt
                  ? "#B45309"
                  : "#1D4ED8"
              }
            />

            <Text
              style={[
                styles.deliveryTitle,

                isZeroReceipt &&
                  styles.zeroDeliveryTitle,
              ]}
            >
              {isZeroReceipt
                ? "Latest Receiving"
                : "Latest Delivery"}
            </Text>
          </View>

          {latestDelivery ? (
            <Text
              style={
                styles.deliveryDate
              }
            >
              {formatDateTime(
                latestDelivery.receivedAt,
              )}
            </Text>
          ) : null}
        </View>

        {latestDelivery ? (
          <>
            {isZeroReceipt ? (
              <View
                style={
                  styles.zeroReceiptMessage
                }
              >
                <Ionicons
                  name="information-circle-outline"
                  size={
                    17
                  }
                  color="#B45309"
                />

                <View
                  style={
                    styles.zeroReceiptTextContainer
                  }
                >
                  <Text
                    style={
                      styles.zeroReceiptTitle
                    }
                  >
                    Stock received · 0 items
                  </Text>

                  <Text
                    style={
                      styles.zeroReceiptText
                    }
                  >
                    This delivery was reviewed, but no units of this product were received. Stock remained unchanged.
                  </Text>
                </View>
              </View>
            ) : null}

            <View
              style={
                styles.deliveryMetricsRow
              }
            >
              <DeliveryMetric
                label="Received"
                value={
                  isZeroReceipt
                    ? "0"
                    : `+${latestDelivery.quantityReceived}`
                }
                tone={
                  isZeroReceipt
                    ? "warning"
                    : "normal"
                }
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
                tone={
                  isZeroReceipt
                    ? "warning"
                    : "normal"
                }
              />
            </View>

            {latestDelivery.notes ? (
              <View
                style={[
                  styles.deliveryNote,

                  isZeroReceipt &&
                    styles.zeroDeliveryNote,
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={
                    15
                  }
                  color={
                    isZeroReceipt
                      ? "#B45309"
                      : "#52698E"
                  }
                />

                <Text
                  style={[
                    styles.deliveryNoteText,

                    isZeroReceipt &&
                      styles.zeroDeliveryNoteText,
                  ]}
                >
                  {
                    latestDelivery.notes
                  }
                </Text>
              </View>
            ) : null}
          </>
        ) : (
          <Text
            style={
              styles.noDeliveryText
            }
          >
            No delivery recorded yet
          </Text>
        )}
      </View>

      {onUpdateInventory ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Update inventory for ${product.name}`}
          onPress={() =>
            onUpdateInventory(
              product,
            )
          }
          style={({
            pressed,
          }) => [
            styles.inventoryButton,

            pressed &&
              styles.inventoryButtonPressed,
          ]}
        >
          <View
            style={
              styles.inventoryButtonContent
            }
          >
            <Ionicons
              name="cube-outline"
              size={
                21
              }
              color="#FFFFFF"
            />

            <View
              style={
                styles.inventoryButtonTextContainer
              }
            >
              <Text
                style={
                  styles.inventoryButtonTitle
                }
              >
                Update Inventory
              </Text>

              <Text
                style={
                  styles.inventoryButtonDescription
                }
              >
                Stock in · Sale · Return · Damage · Count
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={
              20
            }
            color="#FFFFFF"
          />
        </Pressable>
      ) : null}

      <View
        style={
          styles.actionDivider
        }
      />

      <View
        style={
          styles.actionRow
        }
      >
        {onViewHistory ? (
          <IconActionButton
            icon="time-outline"
            label="History"
            accessibilityLabel="View transaction history"
            onPress={() =>
              onViewHistory(
                product,
              )
            }
          />
        ) : null}

        {onEditProduct ? (
          <IconActionButton
            icon="pencil-outline"
            label="Edit"
            accessibilityLabel="Edit product"
            onPress={() =>
              onEditProduct(
                product,
              )
            }
          />
        ) : null}

        {onArchiveProduct ? (
          <IconActionButton
            icon="trash-outline"
            label="Archive"
            accessibilityLabel="Archive product"
            destructive
            onPress={() =>
              onArchiveProduct(
                product,
              )
            }
          />
        ) : null}
      </View>
    </View>
  );
}

export const ProductCard =
  memo(
    ProductCardComponent,

    (
      previous,
      next,
    ) =>
      previous.product.id ===
        next.product.id &&

      previous.product.barcode ===
        next.product.barcode &&

      previous.product.name ===
        next.product.name &&

      previous.product.brand ===
        next.product.brand &&

      previous.product.department ===
        next.product.department &&

      previous.product.category ===
        next.product.category &&

      previous.product.unitCost ===
        next.product.unitCost &&

      previous.product.unitPrice ===
        next.product.unitPrice &&

      previous.product.currentStock ===
        next.product.currentStock &&

      previous.product.reorderLevel ===
        next.product.reorderLevel &&

      previous.product.isActive ===
        next.product.isActive &&

      previous.product.updatedAt ===
        next.product.updatedAt &&

      deliveriesEqual(
        previous.latestDelivery,
        next.latestDelivery,
      ) &&

      previous.onUpdateInventory ===
        next.onUpdateInventory &&

      previous.onViewHistory ===
        next.onViewHistory &&

      previous.onEditProduct ===
        next.onEditProduct &&

      previous.onArchiveProduct ===
        next.onArchiveProduct,
  );

function deliveriesEqual(
  previous:
    ProductDeliverySummary | undefined,

  next:
    ProductDeliverySummary | undefined,
): boolean {
  if (
    previous ===
    next
  ) {
    return true;
  }

  if (
    !previous ||
    !next
  ) {
    return false;
  }

  return (
    previous.transactionId ===
      next.transactionId &&

    previous.productId ===
      next.productId &&

    previous.quantityReceived ===
      next.quantityReceived &&

    previous.stockBefore ===
      next.stockBefore &&

    previous.stockAfter ===
      next.stockAfter &&

    previous.unitCost ===
      next.unitCost &&

    previous.deliveryValue ===
      next.deliveryValue &&

    previous.source ===
      next.source &&

    previous.notes ===
      next.notes &&

    previous.receivedAt ===
      next.receivedAt
  );
}

interface DetailRowProps {
  label:
    string;

  value:
    string;
}

const DetailRow =
  memo(
    function DetailRow({
      label,
      value,
    }: DetailRowProps) {
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
    },
  );

interface DeliveryMetricProps {
  label:
    string;

  value:
    string;

  tone?:
    "normal" |
    "warning";
}

const DeliveryMetric =
  memo(
    function DeliveryMetric({
      label,
      value,
      tone =
        "normal",
    }: DeliveryMetricProps) {
      return (
        <View
          style={[
            styles.deliveryMetric,

            tone ===
              "warning" &&
              styles.deliveryMetricWarning,
          ]}
        >
          <Text
            style={[
              styles.deliveryMetricLabel,

              tone ===
                "warning" &&
                styles.deliveryMetricLabelWarning,
            ]}
          >
            {
              label
            }
          </Text>

          <Text
            style={[
              styles.deliveryMetricValue,

              tone ===
                "warning" &&
                styles.deliveryMetricValueWarning,
            ]}
          >
            {
              value
            }
          </Text>
        </View>
      );
    },
  );

interface IconActionButtonProps {
  icon:
    | "time-outline"
    | "pencil-outline"
    | "trash-outline";

  label:
    string;

  accessibilityLabel:
    string;

  destructive?:
    boolean;

  onPress:
    () => void;
}

const IconActionButton =
  memo(
    function IconActionButton({
      icon,
      label,
      accessibilityLabel,
      destructive =
        false,
      onPress,
    }: IconActionButtonProps) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            accessibilityLabel
          }
          onPress={
            onPress
          }
          style={({
            pressed,
          }) => [
            styles.iconActionButton,

            destructive &&
              styles.destructiveIconActionButton,

            pressed &&
              styles.iconActionButtonPressed,

            pressed &&
              destructive &&
              styles.destructiveIconActionButtonPressed,
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
              destructive
                ? "#B42318"
                : "#374151"
            }
          />

          <Text
            style={[
              styles.iconActionLabel,

              destructive &&
                styles.destructiveIconActionLabel,
            ]}
          >
            {
              label
            }
          </Text>
        </Pressable>
      );
    },
  );

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

    headerRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    productHeaderContent: {
      flex:
        1,

      marginRight:
        14,
    },

    productName: {
      fontSize:
        20,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    brand: {
      marginTop:
        4,

      fontSize:
        14,

      fontWeight:
        "600",

      color:
        "#6B7280",
    },

    stockBadge: {
      minWidth:
        64,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        14,

      paddingHorizontal:
        12,

      paddingVertical:
        8,

      backgroundColor:
        "#ECFDF3",
    },

    stockBadgeWarning: {
      backgroundColor:
        "#FFF8E8",
    },

    stockBadgeDanger: {
      backgroundColor:
        "#FFF1F0",
    },

    stockBadgeValue: {
      fontSize:
        19,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    stockBadgeLabel: {
      marginTop:
        1,

      fontSize:
        10,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#15803D",
    },

    stockBadgeValueWarning: {
      color:
        "#9A6700",
    },

    stockBadgeValueDanger: {
      color:
        "#B42318",
    },

    taxonomyRow: {
      marginTop:
        13,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        7,
    },

    taxonomyChip: {
      borderRadius:
        999,

      paddingHorizontal:
        10,

      paddingVertical:
        5,

      backgroundColor:
        "#F1F5F9",
    },

    taxonomyChipText: {
      fontSize:
        11,

      fontWeight:
        "700",

      color:
        "#52606D",
    },

    detailsSection: {
      marginTop:
        16,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        8,
    },

    detailRow: {
      minHeight:
        32,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    detailLabel: {
      marginRight:
        16,

      fontSize:
        13,

      color:
        "#6B7280",
    },

    detailValue: {
      flexShrink:
        1,

      fontSize:
        13,

      fontWeight:
        "700",

      textAlign:
        "right",

      color:
        "#20252B",
    },

    warningMessage: {
      marginTop:
        12,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        7,

      borderRadius:
        10,

      paddingHorizontal:
        11,

      paddingVertical:
        9,

      backgroundColor:
        "#FFF8E8",
    },

    warningMessageText: {
      flex:
        1,

      fontSize:
        12,

      fontWeight:
        "700",

      color:
        "#9A6700",
    },

    dangerMessage: {
      marginTop:
        12,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        7,

      borderRadius:
        10,

      paddingHorizontal:
        11,

      paddingVertical:
        9,

      backgroundColor:
        "#FFF1F0",
    },

    dangerMessageText: {
      flex:
        1,

      fontSize:
        12,

      fontWeight:
        "700",

      color:
        "#B42318",
    },

    deliveryCard: {
      marginTop:
        14,

      borderWidth:
        1,

      borderColor:
        "#D9E4F5",

      borderRadius:
        14,

      padding:
        13,

      backgroundColor:
        "#F8FBFF",
    },

    zeroDeliveryCard: {
      borderColor:
        "#FDE68A",

      backgroundColor:
        "#FFFBEB",
    },

    deliveryHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    deliveryTitleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        6,
    },

    deliveryTitle: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#334E84",
    },

    zeroDeliveryTitle: {
      color:
        "#92400E",
    },

    deliveryDate: {
      marginLeft:
        10,

      fontSize:
        10,

      fontWeight:
        "600",

      color:
        "#6B7280",
    },

    zeroReceiptMessage: {
      marginTop:
        11,

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
        "#FFF7ED",
    },

    zeroReceiptTextContainer: {
      flex:
        1,

      minWidth:
        0,
    },

    zeroReceiptTitle: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#92400E",
    },

    zeroReceiptText: {
      marginTop:
        3,

      fontSize:
        9,

      lineHeight:
        14,

      color:
        "#78614A",
    },

    deliveryMetricsRow: {
      marginTop:
        12,

      flexDirection:
        "row",

      gap:
        8,
    },

    deliveryMetric: {
      flex:
        1,

      borderRadius:
        10,

      padding:
        9,

      backgroundColor:
        "#FFFFFF",
    },

    deliveryMetricWarning: {
      backgroundColor:
        "#FFF7ED",
    },

    deliveryMetricLabel: {
      fontSize:
        10,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#7A838E",
    },

    deliveryMetricLabelWarning: {
      color:
        "#B45309",
    },

    deliveryMetricValue: {
      marginTop:
        4,

      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    deliveryMetricValueWarning: {
      color:
        "#B45309",
    },

    deliveryNote: {
      marginTop:
        10,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        7,

      borderTopWidth:
        1,

      borderTopColor:
        "#E2EAF5",

      paddingTop:
        10,
    },

    zeroDeliveryNote: {
      borderTopColor:
        "#FDE68A",
    },

    deliveryNoteText: {
      flex:
        1,

      fontSize:
        12,

      lineHeight:
        17,

      color:
        "#52698E",
    },

    zeroDeliveryNoteText: {
      color:
        "#92400E",
    },

    noDeliveryText: {
      marginTop:
        10,

      fontSize:
        12,

      color:
        "#6B7280",
    },

    inventoryButton: {
      marginTop:
        14,

      minHeight:
        62,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderRadius:
        14,

      paddingHorizontal:
        15,

      backgroundColor:
        "#20252B",
    },

    inventoryButtonPressed: {
      opacity:
        0.86,
    },

    inventoryButtonContent: {
      flex:
        1,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        11,
    },

    inventoryButtonTextContainer: {
      flex:
        1,
    },

    inventoryButtonTitle: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    inventoryButtonDescription: {
      marginTop:
        3,

      fontSize:
        10,

      color:
        "#D1D5DB",
    },

    actionDivider: {
      marginTop:
        14,

      height:
        1,

      backgroundColor:
        "#EEF0F2",
    },

    actionRow: {
      marginTop:
        10,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        6,
    },

    iconActionButton: {
      flex:
        1,

      minHeight:
        54,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        12,

      gap:
        4,

      backgroundColor:
        "#F8FAFC",
    },

    iconActionButtonPressed: {
      backgroundColor:
        "#E5E7EB",
    },

    destructiveIconActionButton: {
      backgroundColor:
        "#FFF7F6",
    },

    destructiveIconActionButtonPressed: {
      backgroundColor:
        "#FEE4E2",
    },

    iconActionLabel: {
      fontSize:
        10,

      fontWeight:
        "700",

      color:
        "#52606D",
    },

    destructiveIconActionLabel: {
      color:
        "#B42318",
    },
  });