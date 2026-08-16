import {
  Ionicons,
} from "@expo/vector-icons";

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import type {
  Product,
} from "../types/product";

interface ArchivedProductsProps {
  products:
    Product[];

  onRestore: (
    product:
      Product,
  ) => void;

  onClose:
    () => void;
}

export function ArchivedProducts({
  products,
  onRestore,
  onClose,
}: ArchivedProductsProps) {
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
      <FlatList
        data={
          products
        }
        keyExtractor={(
          product,
        ) =>
          product.id.toString()
        }
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        ListHeaderComponent={
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
                Archived
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                {products.length} archived product
                {products.length ===
                1
                  ? ""
                  : "s"}
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
        }
        renderItem={({
          item,
        }) => (
          <ArchivedProductCard
            product={
              item
            }
            onRestore={() =>
              onRestore(
                item,
              )
            }
          />
        )}
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <Ionicons
              name="archive-outline"
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
              No archived products
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Products you archive will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function ArchivedProductCard({
  product,
  onRestore,
}: {
  product:
    Product;

  onRestore:
    () => void;
}) {
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
          styles.cardHeader
        }
      >
        <View
          style={
            styles.cardTextContainer
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
                styles.productMeta
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
          style={
            styles.archivedBadge
          }
        >
          <Text
            style={
              styles.archivedBadgeText
            }
            numberOfLines={
              1
            }
          >
            Archived
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
          label="Stock"
          value={`${product.currentStock} units`}
        />

        <DetailRow
          label="Selling price"
          value={
            formatCurrency(
              product.unitPrice,
            )
          }
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Restore ${product.name}`}
        onPress={
          onRestore
        }
        style={({
          pressed,
        }) => [
          styles.restoreButton,

          pressed &&
            styles.restoreButtonPressed,
        ]}
      >
        <Ionicons
          name="arrow-undo-outline"
          size={
            19
          }
          color="#15803D"
        />

        <Text
          style={
            styles.restoreButtonText
          }
        >
          Restore
        </Text>
      </Pressable>
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

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      marginBottom:
        18,
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

    card: {
      marginBottom:
        14,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        16,

      padding:
        16,

      backgroundColor:
        "#FFFFFF",
    },

    cardHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    cardTextContainer: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        12,
    },

    productName: {
      flexShrink:
        1,

      fontSize:
        18,

      lineHeight:
        23,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    productMeta: {
      marginTop:
        4,

      fontSize:
        12,

      lineHeight:
        17,

      color:
        "#6B7280",
    },

    archivedBadge: {
      flexShrink:
        0,

      alignSelf:
        "flex-start",

      borderRadius:
        999,

      paddingHorizontal:
        10,

      paddingVertical:
        5,

      backgroundColor:
        "#F3F4F6",
    },

    archivedBadgeText: {
      fontSize:
        11,

      fontWeight:
        "700",

      color:
        "#6B7280",
    },

    details: {
      marginTop:
        14,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        8,
    },

    detailRow: {
      minHeight:
        31,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        12,
    },

    detailLabel: {
      flexShrink:
        0,

      fontSize:
        13,

      color:
        "#6B7280",
    },

    detailValue: {
      flex:
        1,

      minWidth:
        0,

      fontSize:
        13,

      fontWeight:
        "700",

      textAlign:
        "right",

      color:
        "#20252B",
    },

    restoreButton: {
      marginTop:
        14,

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
        12,

      backgroundColor:
        "#ECFDF3",
    },

    restoreButtonPressed: {
      backgroundColor:
        "#D1FAE5",
    },

    restoreButtonText: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    emptyContainer: {
      paddingVertical:
        80,

      alignItems:
        "center",
    },

    emptyTitle: {
      marginTop:
        12,

      fontSize:
        19,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    emptyText: {
      marginTop:
        5,

      maxWidth:
        280,

      fontSize:
        13,

      lineHeight:
        19,

      textAlign:
        "center",

      color:
        "#6B7280",
    },
  });