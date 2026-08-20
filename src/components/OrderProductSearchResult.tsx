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

interface OrderProductSearchResultProps {
  product:
    Product;

  alreadyAdded?:
    boolean;

  onPress:
    () => void;
}

export function OrderProductSearchResult({
  product,
  alreadyAdded = false,
  onPress,
}: OrderProductSearchResultProps) {
  const productDetails = [
    product.brand.trim(),
    product.category,
  ]
    .filter(
      Boolean,
    )
    .join(
      " · ",
    );

  const isOutOfStock =
    product.currentStock ===
    0;

  const isLowStock =
    product.currentStock >
      0 &&
    product.currentStock <=
      product.reorderLevel;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={
        alreadyAdded
      }
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.container,

        pressed &&
          !alreadyAdded &&
          styles.containerPressed,

        alreadyAdded &&
          styles.containerDisabled,
      ]}
    >
      <View
        style={
          styles.iconContainer
        }
      >
        <Ionicons
          name="cube-outline"
          size={
            20
          }
          color="#52606D"
        />
      </View>

      <View
        style={
          styles.productText
        }
      >
        <View
          style={
            styles.nameRow
          }
        >
          <Text
            style={
              styles.productName
            }
            numberOfLines={
              1
            }
          >
            {
              product.name
            }
          </Text>

          {isOutOfStock ? (
            <View
              style={
                styles.outBadge
              }
            >
              <Text
                style={
                  styles.outBadgeText
                }
              >
                OUT
              </Text>
            </View>
          ) : isLowStock ? (
            <View
              style={
                styles.lowBadge
              }
            >
              <Text
                style={
                  styles.lowBadgeText
                }
              >
                LOW
              </Text>
            </View>
          ) : null}
        </View>

        {productDetails ? (
          <Text
            style={
              styles.productDetails
            }
            numberOfLines={
              1
            }
          >
            {
              productDetails
            }
          </Text>
        ) : null}

        <View
          style={
            styles.barcodeRow
          }
        >
          <Ionicons
            name="barcode-outline"
            size={
              13
            }
            color="#8B949E"
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
      </View>

      <View
        style={
          styles.rightColumn
        }
      >
        <Text
          style={
            styles.unitCost
          }
        >
          {
            formatCurrency(
              product.unitCost,
            )
          }
        </Text>

        <Text
          style={
            styles.stockText
          }
        >
          Stock {product.currentStock}
        </Text>

        {alreadyAdded ? (
          <View
            style={
              styles.addedBadge
            }
          >
            <Ionicons
              name="checkmark"
              size={
                12
              }
              color="#15803D"
            />

            <Text
              style={
                styles.addedText
              }
            >
              Added
            </Text>
          </View>
        ) : (
          <Ionicons
            name="add-circle-outline"
            size={
              22
            }
            color="#20252B"
          />
        )}
      </View>
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

const styles =
  StyleSheet.create({
    container: {
      minHeight:
        82,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        1,

      borderBottomColor:
        "#EEF0F2",

      paddingHorizontal:
        12,

      paddingVertical:
        10,

      backgroundColor:
        "#FFFFFF",
    },

    containerPressed: {
      backgroundColor:
        "#F8FAFC",
    },

    containerDisabled: {
      opacity:
        0.58,
    },

    iconContainer: {
      width:
        38,

      height:
        38,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        10,

      backgroundColor:
        "#F1F5F9",
    },

    productText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        10,

      marginRight:
        10,
    },

    nameRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        6,
    },

    productName: {
      flex:
        1,

      minWidth:
        0,

      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    productDetails: {
      marginTop:
        3,

      fontSize:
        10,

      color:
        "#6B7280",
    },

    barcodeRow: {
      marginTop:
        4,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        4,
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
        "#8B949E",
    },

    rightColumn: {
      flexShrink:
        0,

      alignItems:
        "flex-end",
    },

    unitCost: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    stockText: {
      marginTop:
        2,

      marginBottom:
        5,

      fontSize:
        9,

      color:
        "#8B949E",
    },

    outBadge: {
      flexShrink:
        0,

      borderRadius:
        999,

      paddingHorizontal:
        6,

      paddingVertical:
        2,

      backgroundColor:
        "#FFF1F0",
    },

    outBadgeText: {
      fontSize:
        8,

      fontWeight:
        "800",

      color:
        "#B42318",
    },

    lowBadge: {
      flexShrink:
        0,

      borderRadius:
        999,

      paddingHorizontal:
        6,

      paddingVertical:
        2,

      backgroundColor:
        "#FFF7ED",
    },

    lowBadgeText: {
      fontSize:
        8,

      fontWeight:
        "800",

      color:
        "#B45309",
    },

    addedBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        2,

      borderRadius:
        999,

      paddingHorizontal:
        6,

      paddingVertical:
        3,

      backgroundColor:
        "#ECFDF3",
    },

    addedText: {
      fontSize:
        9,

      fontWeight:
        "800",

      color:
        "#15803D",
    },
  });