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

interface OrderProductCardProps {
  product:
    Product;

  quantity:
    number;

  onIncrease:
    () => void;

  onDecrease:
    () => void;

  onAdd?:
    () => void;

  onRemove?:
    () => void;

  showAddButton?:
    boolean;
}

export function OrderProductCard({
  product,
  quantity,
  onIncrease,
  onDecrease,
  onAdd,
  onRemove,
  showAddButton = false,
}: OrderProductCardProps) {
  const estimatedCost =
    quantity *
    product.unitCost;

  const productDetails = [
    product.brand.trim(),
    product.department,
    product.category,
  ]
    .filter(
      Boolean,
    )
    .join(
      " · ",
    );

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

        {product.currentStock ===
        0 ? (
          <View
            style={
              styles.outOfStockBadge
            }
          >
            <Text
              style={
                styles.outOfStockText
              }
            >
              Out
            </Text>
          </View>
        ) : product.currentStock <=
          product.reorderLevel ? (
          <View
            style={
              styles.lowStockBadge
            }
          >
            <Text
              style={
                styles.lowStockText
              }
            >
              Low
            </Text>
          </View>
        ) : null}
      </View>

      <View
        style={
          styles.barcodeRow
        }
      >
        <Ionicons
          name="barcode-outline"
          size={
            15
          }
          color="#7A838E"
        />

        <Text
          style={
            styles.barcode
          }
          numberOfLines={
            1
          }
        >
          {
            product.barcode
          }
        </Text>
      </View>

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
            Stock
          </Text>

          <Text
            style={
              styles.infoValue
            }
          >
            {
              product.currentStock
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
            Unit Cost
          </Text>

          <Text
            style={
              styles.infoValue
            }
          >
            {
              formatCurrency(
                product.unitCost,
              )
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
            Estimated
          </Text>

          <Text
            style={
              styles.estimatedValue
            }
          >
            {
              formatCurrency(
                estimatedCost,
              )
            }
          </Text>
        </View>
      </View>

      <View
        style={
          styles.actions
        }
      >
        <View
          style={
            styles.quantityControl
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Decrease quantity for ${product.name}`}
            disabled={
              quantity <=
              0
            }
            onPress={
              onDecrease
            }
            style={({
              pressed,
            }) => [
              styles.quantityButton,

              quantity <=
                0 &&
                styles.quantityButtonDisabled,

              pressed &&
                quantity >
                  0 &&
                styles.quantityButtonPressed,
            ]}
          >
            <Ionicons
              name="remove"
              size={
                19
              }
              color="#20252B"
            />
          </Pressable>

          <Text
            style={
              styles.quantity
            }
          >
            {
              quantity
            }
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Increase quantity for ${product.name}`}
            onPress={
              onIncrease
            }
            style={({
              pressed,
            }) => [
              styles.quantityButton,

              pressed &&
                styles.quantityButtonPressed,
            ]}
          >
            <Ionicons
              name="add"
              size={
                19
              }
              color="#20252B"
            />
          </Pressable>
        </View>

        {showAddButton &&
        onAdd ? (
          <Pressable
            accessibilityRole="button"
            disabled={
              quantity <=
              0
            }
            onPress={
              onAdd
            }
            style={({
              pressed,
            }) => [
              styles.addButton,

              quantity <=
                0 &&
                styles.addButtonDisabled,

              pressed &&
                quantity >
                  0 &&
                styles.addButtonPressed,
            ]}
          >
            <Text
              style={
                styles.addButtonText
              }
            >
              Add
            </Text>
          </Pressable>
        ) : null}

        {onRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${product.name} from order`}
            onPress={
              onRemove
            }
            style={({
              pressed,
            }) => [
              styles.removeButton,

              pressed &&
                styles.removeButtonPressed,
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={
                18
              }
              color="#B42318"
            />
          </Pressable>
        ) : null}
      </View>
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
    card: {
      marginBottom:
        11,

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

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    productText: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        8,
    },

    productName: {
      fontSize:
        15,

      lineHeight:
        20,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    productDetails: {
      marginTop:
        3,

      fontSize:
        11,

      lineHeight:
        15,

      color:
        "#6B7280",
    },

    outOfStockBadge: {
      borderRadius:
        999,

      paddingHorizontal:
        8,

      paddingVertical:
        4,

      backgroundColor:
        "#FFF1F0",
    },

    outOfStockText: {
      fontSize:
        9,

      fontWeight:
        "800",

      color:
        "#B42318",
    },

    lowStockBadge: {
      borderRadius:
        999,

      paddingHorizontal:
        8,

      paddingVertical:
        4,

      backgroundColor:
        "#FFF7ED",
    },

    lowStockText: {
      fontSize:
        9,

      fontWeight:
        "800",

      color:
        "#B45309",
    },

    barcodeRow: {
      marginTop:
        8,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,
    },

    barcode: {
      flex:
        1,

      minWidth:
        0,

      fontSize:
        10,

      fontWeight:
        "600",

      color:
        "#7A838E",
    },

    infoRow: {
      marginTop:
        11,

      flexDirection:
        "row",

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        10,
    },

    infoBlock: {
      flex:
        1,

      minWidth:
        0,
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
        3,

      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    estimatedValue: {
      marginTop:
        3,

      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    actions: {
      marginTop:
        12,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        10,
    },

    quantityControl: {
      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#D6DCE3",

      borderRadius:
        10,

      overflow:
        "hidden",
    },

    quantityButton: {
      width:
        40,

      height:
        40,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F8FAFC",
    },

    quantityButtonPressed: {
      backgroundColor:
        "#E5E7EB",
    },

    quantityButtonDisabled: {
      opacity:
        0.4,
    },

    quantity: {
      minWidth:
        42,

      textAlign:
        "center",

      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    addButton: {
      minHeight:
        40,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        10,

      paddingHorizontal:
        18,

      backgroundColor:
        "#20252B",
    },

    addButtonPressed: {
      backgroundColor:
        "#111827",
    },

    addButtonDisabled: {
      opacity:
        0.4,
    },

    addButtonText: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    removeButton: {
      width:
        40,

      height:
        40,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#FECACA",

      borderRadius:
        10,

      backgroundColor:
        "#FFF8F7",
    },

    removeButtonPressed: {
      backgroundColor:
        "#FEF2F2",
    },
  });