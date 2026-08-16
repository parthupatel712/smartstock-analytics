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

interface ArchivedProductsProps {
  products:
    Product[];

  onRestore: (
    product:
      Product,
  ) => void;

  onDelete: (
    product:
      Product,
  ) => void;
}

export function ArchivedProducts({
  products,
  onRestore,
  onDelete,
}: ArchivedProductsProps) {
  if (
    products.length ===
    0
  ) {
    return (
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
    );
  }

  return (
    <View>
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
          Archived Products
        </Text>

        <Text
          style={
            styles.sectionSubtitle
          }
        >
          {products.length} archived product
          {products.length ===
          1
            ? ""
            : "s"}
        </Text>
      </View>

      {products.map(
        (
          product,
        ) => (
          <ArchivedProductCard
            key={
              product.id
            }
            product={
              product
            }
            onRestore={() =>
              onRestore(
                product,
              )
            }
            onDelete={() =>
              onDelete(
                product,
              )
            }
          />
        ),
      )}
    </View>
  );
}

function ArchivedProductCard({
  product,
  onRestore,
  onDelete,
}: {
  product:
    Product;

  onRestore:
    () => void;

  onDelete:
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
          label="Unit Cost"
          value={
            formatCurrency(
              product.unitCost,
            )
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
      </View>

      <View
        style={
          styles.actionsRow
        }
      >
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
              18
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${product.name} permanently`}
          onPress={
            onDelete
          }
          style={({
            pressed,
          }) => [
            styles.deleteButton,

            pressed &&
              styles.deleteButtonPressed,
          ]}
        >
          <Ionicons
            name="trash-outline"
            size={
              18
            }
            color="#B42318"
          />

          <Text
            style={
              styles.deleteButtonText
            }
          >
            Delete
          </Text>
        </Pressable>
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
    sectionHeader: {
      marginTop:
        22,

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

      color:
        "#6B7280",
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
        17,

      lineHeight:
        22,

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
        10,

      fontWeight:
        "800",

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
        12,

      color:
        "#6B7280",
    },

    detailValue: {
      flex:
        1,

      minWidth:
        0,

      fontSize:
        12,

      fontWeight:
        "700",

      textAlign:
        "right",

      color:
        "#20252B",
    },

    actionsRow: {
      marginTop:
        14,

      flexDirection:
        "row",

      gap:
        10,
    },

    restoreButton: {
      flex:
        1,

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
        "#ECFDF3",
    },

    restoreButtonPressed: {
      backgroundColor:
        "#D1FAE5",
    },

    restoreButtonText: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    deleteButton: {
      flex:
        1,

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

      borderWidth:
        1,

      borderColor:
        "#FECACA",

      borderRadius:
        11,

      backgroundColor:
        "#FFF8F7",
    },

    deleteButtonPressed: {
      backgroundColor:
        "#FEF2F2",
    },

    deleteButtonText: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#B42318",
    },

    emptyContainer: {
      marginTop:
        30,

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#E5E7EB",

      borderRadius:
        18,

      paddingHorizontal:
        24,

      paddingVertical:
        55,

      backgroundColor:
        "#FFFFFF",
    },

    emptyTitle: {
      marginTop:
        12,

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
        13,

      lineHeight:
        19,

      textAlign:
        "center",

      color:
        "#6B7280",
    },
  });