import {
  Ionicons,
} from "@expo/vector-icons";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  OrderProductCard,
} from "./OrderProductCard";

import type {
  OrderDraftItem,
} from "../types/orderDraft";

interface OrderPreviewProps {
  items:
    OrderDraftItem[];

  vendorName:
    string;

  notes:
    string;

  tax:
    string;

  orderNumber:
    string;

  onVendorNameChange:
    (
      value:
        string,
    ) => void;

  onNotesChange:
    (
      value:
        string,
    ) => void;

  onTaxChange:
    (
      value:
        string,
    ) => void;

  onIncrease:
    (
      productId:
        number,
    ) => void;

  onDecrease:
    (
      productId:
        number,
    ) => void;

  onRemove:
    (
      productId:
        number,
    ) => void;

  onAddMore:
    () => void;

  onSaveDraft:
    () => void;

  onPlaceOrder:
    () => void;

  isSaving?:
    boolean;

  isPlacing?:
    boolean;

  onClose:
    () => void;
}

export function OrderPreview({
  items,
  vendorName,
  notes,
  tax,
  orderNumber,
  onVendorNameChange,
  onNotesChange,
  onTaxChange,
  onIncrease,
  onDecrease,
  onRemove,
  onAddMore,
  onSaveDraft,
  onPlaceOrder,
  isSaving = false,
  isPlacing = false,
  onClose,
}: OrderPreviewProps) {
  const totalUnits =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.quantity,

      0,
    );

  const subtotal =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.quantity *
          item.product.unitCost,

      0,
    );

  const parsedTax =
    Number(
      tax,
    );

  const normalizedTax =
    Number.isFinite(
      parsedTax,
    ) &&
    parsedTax >=
      0
      ? parsedTax
      : 0;

  const finalTotal =
    subtotal +
    normalizedTax;

  const canPlaceOrder =
    items.length >
      0 &&
    vendorName.trim().length >
      0 &&
    !isPlacing &&
    !isSaving;

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
      <KeyboardAvoidingView
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
        style={
          styles.keyboardContainer
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={
              styles.header
            }
          >
            <View
              style={
                styles.headerText
              }
            >
              <Text
                style={
                  styles.title
                }
              >
                Purchase Order
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Review products, supplier information, and totals before placing the order.
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

          {items.length >
          0 ? (
            <>
              <View
                style={
                  styles.orderInfoCard
                }
              >
                <View
                  style={
                    styles.orderInfoRow
                  }
                >
                  <View
                    style={
                      styles.orderInfoBlock
                    }
                  >
                    <Text
                      style={
                        styles.orderInfoLabel
                      }
                    >
                      Purchase Order
                    </Text>

                    <Text
                      style={
                        styles.orderInfoValue
                      }
                    >
                      {
                        orderNumber ||
                        "Draft"
                      }
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.orderInfoBlock,
                      styles.orderInfoBlockRight,
                    ]}
                  >
                    <Text
                      style={
                        styles.orderInfoLabel
                      }
                    >
                      Order Date
                    </Text>

                    <Text
                      style={
                        styles.orderInfoValue
                      }
                    >
                      {
                        formatOrderDate()
                      }
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={
                  styles.formCard
                }
              >
                <Text
                  style={
                    styles.formSectionTitle
                  }
                >
                  Supplier Details
                </Text>

                <Text
                  style={
                    styles.label
                  }
                >
                  Vendor / Supplier
                </Text>

                <TextInput
                  value={
                    vendorName
                  }
                  onChangeText={
                    onVendorNameChange
                  }
                  placeholder="Example: Coca-Cola, PepsiCo, Walmart"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  autoCorrect={
                    false
                  }
                  style={
                    styles.input
                  }
                />

                <Text
                  style={
                    styles.fieldHint
                  }
                >
                  Vendor is required before placing the order.
                </Text>

                <Text
                  style={[
                    styles.label,
                    styles.notesLabel,
                  ]}
                >
                  Notes (Optional)
                </Text>

                <TextInput
                  value={
                    notes
                  }
                  onChangeText={
                    onNotesChange
                  }
                  placeholder="Example: Weekly beverage order"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                  style={[
                    styles.input,
                    styles.notesInput,
                  ]}
                />
              </View>

              <View
                style={
                  styles.summaryCard
                }
              >
                <View
                  style={
                    styles.summaryItem
                  }
                >
                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    Products
                  </Text>

                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    {
                      items.length
                    }
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryDivider
                  }
                />

                <View
                  style={
                    styles.summaryItem
                  }
                >
                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    Units
                  </Text>

                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    {
                      totalUnits
                    }
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryDivider
                  }
                />

                <View
                  style={
                    styles.summaryItem
                  }
                >
                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    Subtotal
                  </Text>

                  <Text
                    style={
                      styles.summaryCost
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
                      formatCurrency(
                        subtotal,
                      )
                    }
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.sectionHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Order Items
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Adjust quantity or remove products before saving.
                  </Text>
                </View>
              </View>

              {items.map(
                (
                  item,
                ) => (
                  <View
                    key={
                      item.product.id
                    }
                  >
                    <OrderProductCard
                      product={
                        item.product
                      }
                      quantity={
                        item.quantity
                      }
                      onIncrease={() =>
                        onIncrease(
                          item.product.id,
                        )
                      }
                      onDecrease={() =>
                        onDecrease(
                          item.product.id,
                        )
                      }
                      onRemove={() =>
                        onRemove(
                          item.product.id,
                        )
                      }
                    />

                    <View
                      style={
                        styles.lineTotalRow
                      }
                    >
                      <Text
                        style={
                          styles.lineTotalLabel
                        }
                      >
                        {formatCurrency(
                          item.product.unitCost,
                        )}{" "}
                        ×{" "}
                        {
                          item.quantity
                        }
                      </Text>

                      <Text
                        style={
                          styles.lineTotalValue
                        }
                      >
                        {
                          formatCurrency(
                            item.product.unitCost *
                              item.quantity,
                          )
                        }
                      </Text>
                    </View>
                  </View>
                ),
              )}

              <Pressable
                accessibilityRole="button"
                onPress={
                  onAddMore
                }
                style={({
                  pressed,
                }) => [
                  styles.addMoreButton,

                  pressed &&
                    styles.addMoreButtonPressed,
                ]}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={
                    19
                  }
                  color="#20252B"
                />

                <Text
                  style={
                    styles.addMoreButtonText
                  }
                >
                  Add More Products
                </Text>
              </Pressable>

              <View
                style={
                  styles.totalCard
                }
              >
                <View
                  style={
                    styles.totalRow
                  }
                >
                  <Text
                    style={
                      styles.totalLabel
                    }
                  >
                    Subtotal
                  </Text>

                  <Text
                    style={
                      styles.totalValue
                    }
                  >
                    {
                      formatCurrency(
                        subtotal,
                      )
                    }
                  </Text>
                </View>

                <View
                  style={
                    styles.taxSection
                  }
                >
                  <View
                    style={
                      styles.taxTextContainer
                    }
                  >
                    <Text
                      style={
                        styles.totalLabel
                      }
                    >
                      Tax
                    </Text>

                    <Text
                      style={
                        styles.taxHint
                      }
                    >
                      Optional estimated tax amount
                    </Text>
                  </View>

                  <View
                    style={
                      styles.taxInputWrapper
                    }
                  >
                    <Text
                      style={
                        styles.currencyPrefix
                      }
                    >
                      $
                    </Text>

                    <TextInput
                      value={
                        tax
                      }
                      onChangeText={
                        onTaxChange
                      }
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="decimal-pad"
                      style={
                        styles.taxInput
                      }
                    />
                  </View>
                </View>

                <View
                  style={
                    styles.finalTotalDivider
                  }
                />

                <View
                  style={
                    styles.finalTotalRow
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.finalTotalLabel
                      }
                    >
                      Estimated Total
                    </Text>

                    <Text
                      style={
                        styles.finalTotalHint
                      }
                    >
                      Final amount may differ from vendor invoice.
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.finalTotalValue
                    }
                  >
                    {
                      formatCurrency(
                        finalTotal,
                      )
                    }
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                disabled={
                  isSaving ||
                  isPlacing
                }
                onPress={
                  onSaveDraft
                }
                style={({
                  pressed,
                }) => [
                  styles.saveDraftButton,

                  pressed &&
                    !isSaving &&
                    !isPlacing &&
                    styles.saveDraftButtonPressed,

                  (
                    isSaving ||
                    isPlacing
                  ) &&
                    styles.disabledButton,
                ]}
              >
                <Ionicons
                  name="save-outline"
                  size={
                    18
                  }
                  color="#20252B"
                />

                <Text
                  style={
                    styles.saveDraftButtonText
                  }
                >
                  {isSaving
                    ? "Saving Draft…"
                    : "Save Draft"}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={
                  !canPlaceOrder
                }
                onPress={
                  onPlaceOrder
                }
                style={({
                  pressed,
                }) => [
                  styles.placeOrderButton,

                  pressed &&
                    canPlaceOrder &&
                    styles.placeOrderButtonPressed,

                  !canPlaceOrder &&
                    styles.disabledButton,
                ]}
              >
                <Text
                  style={
                    styles.placeOrderButtonText
                  }
                >
                  {isPlacing
                    ? "Placing Order…"
                    : "Place Order"}
                </Text>

                <Ionicons
                  name="checkmark-circle-outline"
                  size={
                    19
                  }
                  color="#FFFFFF"
                />
              </Pressable>
            </>
          ) : (
            <View
              style={
                styles.emptyCard
              }
            >
              <Ionicons
                name="cart-outline"
                size={
                  44
                }
                color="#9CA3AF"
              />

              <Text
                style={
                  styles.emptyTitle
                }
              >
                Order is empty
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                Add products before preparing the purchase order.
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={
                  onAddMore
                }
                style={
                  styles.emptyButton
                }
              >
                <Text
                  style={
                    styles.emptyButtonText
                  }
                >
                  Add Products
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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

function formatOrderDate():
  string {
  return new Date().toLocaleDateString(
    "en-CA",
    {
      year:
        "numeric",

      month:
        "short",

      day:
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

    keyboardContainer: {
      flex:
        1,
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

    headerText: {
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

    orderInfoCard: {
      marginTop:
        22,

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

    orderInfoRow: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      gap:
        16,
    },

    orderInfoBlock: {
      flex:
        1,

      minWidth:
        0,
    },

    orderInfoBlockRight: {
      alignItems:
        "flex-end",
    },

    orderInfoLabel: {
      fontSize:
        9,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      color:
        "#8B949E",
    },

    orderInfoValue: {
      marginTop:
        4,

      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    formCard: {
      marginTop:
        14,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        15,

      padding:
        15,

      backgroundColor:
        "#FFFFFF",
    },

    formSectionTitle: {
      marginBottom:
        14,

      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    label: {
      marginBottom:
        7,

      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#20252B",
    },

    input: {
      minHeight:
        48,

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        11,

      paddingHorizontal:
        13,

      fontSize:
        15,

      color:
        "#111827",

      backgroundColor:
        "#F8FAFC",
    },

    fieldHint: {
      marginTop:
        6,

      fontSize:
        10,

      lineHeight:
        15,

      color:
        "#8B949E",
    },

    notesLabel: {
      marginTop:
        16,
    },

    notesInput: {
      minHeight:
        92,

      paddingTop:
        12,

      paddingBottom:
        12,
    },

    summaryCard: {
      marginTop:
        14,

      flexDirection:
        "row",

      alignItems:
        "stretch",

      borderRadius:
        15,

      padding:
        15,

      backgroundColor:
        "#20252B",
    },

    summaryItem: {
      flex:
        1,

      minWidth:
        0,
    },

    summaryDivider: {
      width:
        1,

      marginHorizontal:
        12,

      backgroundColor:
        "#475569",
    },

    summaryLabel: {
      fontSize:
        9,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#CBD5E1",
    },

    summaryValue: {
      marginTop:
        4,

      fontSize:
        19,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    summaryCost: {
      marginTop:
        4,

      fontSize:
        17,

      fontWeight:
        "800",

      color:
        "#86EFAC",
    },

    sectionHeader: {
      marginTop:
        25,

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

    lineTotalRow: {
      marginTop:
        -7,

      marginBottom:
        13,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        4,
    },

    lineTotalLabel: {
      fontSize:
        11,

      color:
        "#8B949E",
    },

    lineTotalValue: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    addMoreButton: {
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

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        12,

      backgroundColor:
        "#FFFFFF",
    },

    addMoreButtonPressed: {
      backgroundColor:
        "#F1F5F9",
    },

    addMoreButtonText: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    totalCard: {
      marginTop:
        16,

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

    totalRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    totalLabel: {
      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#52606D",
    },

    totalValue: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    taxSection: {
      marginTop:
        15,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        12,
    },

    taxTextContainer: {
      flex:
        1,
    },

    taxHint: {
      marginTop:
        3,

      fontSize:
        9,

      lineHeight:
        13,

      color:
        "#8B949E",
    },

    taxInputWrapper: {
      width:
        120,

      minHeight:
        44,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        10,

      paddingHorizontal:
        11,

      backgroundColor:
        "#F8FAFC",
    },

    currencyPrefix: {
      marginRight:
        3,

      fontSize:
        14,

      fontWeight:
        "700",

      color:
        "#52606D",
    },

    taxInput: {
      flex:
        1,

      minWidth:
        0,

      paddingVertical:
        10,

      fontSize:
        14,

      textAlign:
        "right",

      color:
        "#111827",
    },

    finalTotalDivider: {
      height:
        1,

      marginVertical:
        15,

      backgroundColor:
        "#E5E7EB",
    },

    finalTotalRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-between",

      gap:
        12,
    },

    finalTotalLabel: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    finalTotalHint: {
      marginTop:
        3,

      maxWidth:
        210,

      fontSize:
        9,

      lineHeight:
        13,

      color:
        "#8B949E",
    },

    finalTotalValue: {
      flexShrink:
        0,

      fontSize:
        20,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    saveDraftButton: {
      marginTop:
        14,

      minHeight:
        48,

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
        12,

      backgroundColor:
        "#FFFFFF",
    },

    saveDraftButtonPressed: {
      backgroundColor:
        "#F1F5F9",
    },

    saveDraftButtonText: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    placeOrderButton: {
      marginTop:
        10,

      minHeight:
        51,

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

    placeOrderButtonPressed: {
      backgroundColor:
        "#111827",
    },

    placeOrderButtonText: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    disabledButton: {
      opacity:
        0.45,
    },

    emptyCard: {
      marginTop:
        40,

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#E5E7EB",

      borderRadius:
        17,

      paddingHorizontal:
        24,

      paddingVertical:
        45,

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
        5,

      fontSize:
        12,

      lineHeight:
        18,

      textAlign:
        "center",

      color:
        "#6B7280",
    },

    emptyButton: {
      marginTop:
        16,

      minHeight:
        42,

      justifyContent:
        "center",

      borderRadius:
        10,

      paddingHorizontal:
        16,

      backgroundColor:
        "#20252B",
    },

    emptyButtonText: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },
  });