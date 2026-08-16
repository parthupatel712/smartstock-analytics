import {
  useMemo,
  useState,
} from "react";

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

import type {
  Product,
} from "../types/product";

import type {
  CreateInventoryTransactionInput,
  InventoryTransactionType,
} from "../types/inventoryTransaction";

interface InventoryTransactionFormProps {
  product:
    Product;

  isSubmitting?:
    boolean;

  initialTransactionType?:
    InventoryTransactionType;

  initialQuantity?:
    number;

  onCancel:
    () => void;

  onSubmit:
    (
      input:
        CreateInventoryTransactionInput,
    ) => Promise<void>;
}

interface TransactionOption {
  type:
    InventoryTransactionType;

  label:
    string;

  shortDescription:
    string;
}

const TRANSACTION_OPTIONS:
  TransactionOption[] = [
    {
      type:
        "stock_in",

      label:
        "Stock In",

      shortDescription:
        "Add delivered stock",
    },

    {
      type:
        "sale",

      label:
        "Sale",

      shortDescription:
        "Remove sold units",
    },

    {
      type:
        "return",

      label:
        "Return",

      shortDescription:
        "Add customer return",
    },

    {
      type:
        "damage",

      label:
        "Damage",

      shortDescription:
        "Remove damaged stock",
    },

    {
      type:
        "adjustment",

      label:
        "Physical Count",

      shortDescription:
        "Set actual stock",
    },
  ];

export function InventoryTransactionForm({
  product,

  isSubmitting =
    false,

  initialTransactionType =
    "stock_in",

  initialQuantity,

  onCancel,

  onSubmit,
}: InventoryTransactionFormProps) {
  const [
    transactionType,
    setTransactionType,
  ] =
    useState<InventoryTransactionType>(
      initialTransactionType,
    );

  const [
    quantity,
    setQuantity,
  ] =
    useState(
      initialQuantity !==
        undefined
        ? initialQuantity.toString()
        : "",
    );

  const [
    notes,
    setNotes,
  ] =
    useState(
      "",
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState(
      "",
    );

  const selectedOption =
    useMemo(
      () =>
        TRANSACTION_OPTIONS.find(
          (
            option,
          ) =>
            option.type ===
            transactionType,
        ) ??
        TRANSACTION_OPTIONS[0],

      [
        transactionType,
      ],
    );

  const quantityLabel =
    transactionType ===
    "adjustment"
      ? "Counted stock"
      : "Quantity";

  const quantityPlaceholder =
    transactionType ===
    "adjustment"
      ? "Enter actual stock count"
      : "Enter quantity";

  const isReorderPrefill =
    initialQuantity !==
      undefined &&
    initialTransactionType ===
      "stock_in";

  const stockImpact =
    useMemo(
      () =>
        getStockImpact(
          transactionType,
          product.currentStock,
          quantity,
        ),

      [
        product.currentStock,
        quantity,
        transactionType,
      ],
    );

  function changeTransactionType(
    nextType:
      InventoryTransactionType,
  ): void {
    if (
      nextType ===
      transactionType
    ) {
      return;
    }

    setTransactionType(
      nextType,
    );

    setQuantity(
      "",
    );

    setErrorMessage(
      "",
    );
  }

  function validateQuantity():
    number | null {
    if (
      quantity.trim() ===
      ""
    ) {
      setErrorMessage(
        `${quantityLabel} is required.`,
      );

      return null;
    }

    const parsedQuantity =
      Number(
        quantity,
      );

    if (
      !Number.isInteger(
        parsedQuantity,
      ) ||
      parsedQuantity <
        0
    ) {
      setErrorMessage(
        `${quantityLabel} must be a non-negative whole number.`,
      );

      return null;
    }

    if (
      transactionType !==
        "adjustment" &&
      parsedQuantity ===
        0
    ) {
      setErrorMessage(
        "Quantity must be greater than zero.",
      );

      return null;
    }

    if (
      (
        transactionType ===
          "sale" ||
        transactionType ===
          "damage"
      ) &&
      parsedQuantity >
        product.currentStock
    ) {
      setErrorMessage(
        `Only ${product.currentStock} units are available.`,
      );

      return null;
    }

    return parsedQuantity;
  }

  async function handleSubmit():
    Promise<void> {
    setErrorMessage(
      "",
    );

    const parsedQuantity =
      validateQuantity();

    if (
      parsedQuantity ===
      null
    ) {
      return;
    }

    await onSubmit({
      productId:
        product.id,

      transactionType,

      quantity:
        parsedQuantity,

      source:
        "manual",

      notes:
        notes.trim() ||
        undefined,
    });
  }

  return (
    <SafeAreaView
      edges={[
        "top",
        "left",
        "right",
        "bottom",
      ]}
      style={
        styles.safeArea
      }
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
        keyboardVerticalOffset={
          Platform.OS ===
          "ios"
            ? 0
            : undefined
        }
        style={
          styles.screen
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
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
                Update Inventory
              </Text>

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

              <Text
                style={
                  styles.productDetails
                }
              >
                {product.brand.trim()
                  ? `${product.brand} · `
                  : ""}
                {
                  product.department
                }
                {" · "}
                {
                  product.category
                }
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel inventory update"
              hitSlop={
                14
              }
              disabled={
                isSubmitting
              }
              onPress={
                onCancel
              }
              style={({
                pressed,
              }) => [
                styles.cancelButton,

                pressed &&
                  styles.cancelButtonPressed,

                isSubmitting &&
                  styles.cancelButtonDisabled,
              ]}
            >
              <Text
                style={
                  styles.cancelButtonText
                }
              >
                Cancel
              </Text>
            </Pressable>
          </View>

          <View
            style={
              styles.stockCard
            }
          >
            <View
              style={
                styles.stockPrimaryRow
              }
            >
              <View>
                <Text
                  style={
                    styles.stockLabel
                  }
                >
                  Current stock
                </Text>

                <Text
                  style={
                    styles.stockValue
                  }
                >
                  {
                    product.currentStock
                  }
                </Text>

                <Text
                  style={
                    styles.stockUnit
                  }
                >
                  units
                </Text>
              </View>

              <View
                style={
                  styles.stockRightColumn
                }
              >
                <Text
                  style={
                    styles.stockMetaLabel
                  }
                >
                  Reorder level
                </Text>

                <Text
                  style={
                    styles.stockMetaValue
                  }
                >
                  {
                    product.reorderLevel
                  }
                </Text>

                <Text
                  style={[
                    styles.stockMetaLabel,
                    styles.targetStockLabel,
                  ]}
                >
                  Target stock
                </Text>

                <Text
                  style={
                    styles.stockMetaValue
                  }
                >
                  {
                    product.reorderLevel *
                    2
                  }
                </Text>
              </View>
            </View>
          </View>

          {isReorderPrefill &&
          transactionType ===
            "stock_in" ? (
            <View
              style={
                styles.reorderSuggestionCard
              }
            >
              <Text
                style={
                  styles.reorderSuggestionTitle
                }
              >
                Suggested quantity applied
              </Text>

              <Text
                style={
                  styles.reorderSuggestionText
                }
              >
                {
                  initialQuantity
                }{" "}
                units were prefilled to move this product toward its target stock.
              </Text>
            </View>
          ) : null}

          <View
            style={
              styles.section
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              What happened?
            </Text>

            <Text
              style={
                styles.sectionDescription
              }
            >
              Choose one inventory action.
            </Text>

            <View
              style={
                styles.transactionGrid
              }
            >
              {TRANSACTION_OPTIONS.map(
                (
                  option,
                ) => {
                  const isSelected =
                    option.type ===
                    transactionType;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{
                        selected:
                          isSelected,
                      }}
                      key={
                        option.type
                      }
                      onPress={() =>
                        changeTransactionType(
                          option.type,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.transactionOption,

                        isSelected &&
                          styles.transactionOptionSelected,

                        pressed &&
                          !isSelected &&
                          styles.transactionOptionPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.transactionOptionLabel,

                          isSelected &&
                            styles.transactionOptionLabelSelected,
                        ]}
                      >
                        {
                          option.label
                        }
                      </Text>

                      <Text
                        style={[
                          styles.transactionOptionDescription,

                          isSelected &&
                            styles.transactionOptionDescriptionSelected,
                        ]}
                      >
                        {
                          option.shortDescription
                        }
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>
          </View>

          <View
            style={
              styles.selectedActionCard
            }
          >
            <Text
              style={
                styles.selectedActionLabel
              }
            >
              Selected
            </Text>

            <Text
              style={
                styles.selectedActionValue
              }
            >
              {
                selectedOption.label
              }
            </Text>

            <Text
              style={
                styles.selectedActionDescription
              }
            >
              {
                getTransactionExplanation(
                  transactionType,
                )
              }
            </Text>
          </View>

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text
              style={
                styles.label
              }
            >
              {
                quantityLabel
              }
            </Text>

            <TextInput
              value={
                quantity
              }
              onChangeText={(
                value,
              ) => {
                setQuantity(
                  value,
                );

                setErrorMessage(
                  "",
                );
              }}
              placeholder={
                quantityPlaceholder
              }
              keyboardType="number-pad"
              returnKeyType="done"
              selectTextOnFocus
              style={[
                styles.input,

                errorMessage
                  ? styles.inputError
                  : undefined,
              ]}
            />

            {errorMessage ? (
              <Text
                style={
                  styles.errorText
                }
              >
                {
                  errorMessage
                }
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.previewCard,

              stockImpact.isInvalid &&
                styles.previewCardWarning,
            ]}
          >
            <Text
              style={
                styles.previewLabel
              }
            >
              Stock after this update
            </Text>

            <Text
              style={[
                styles.previewValue,

                stockImpact.isInvalid &&
                  styles.previewValueWarning,
              ]}
            >
              {
                stockImpact.message
              }
            </Text>
          </View>

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Notes
            </Text>

            <Text
              style={
                styles.optionalLabel
              }
            >
              Optional
            </Text>

            <TextInput
              value={
                notes
              }
              onChangeText={
                setNotes
              }
              placeholder={
                getNotesPlaceholder(
                  transactionType,
                )
              }
              multiline
              numberOfLines={
                3
              }
              textAlignVertical="top"
              style={[
                styles.input,
                styles.notesInput,
              ]}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={
              isSubmitting ||
              stockImpact.isInvalid
            }
            onPress={() =>
              void handleSubmit()
            }
            style={({
              pressed,
            }) => [
              styles.submitButton,

              pressed &&
                !isSubmitting &&
                !stockImpact.isInvalid &&
                styles.submitButtonPressed,

              (
                isSubmitting ||
                stockImpact.isInvalid
              ) &&
                styles.submitButtonDisabled,
            ]}
          >
            <Text
              style={
                styles.submitButtonText
              }
            >
              {isSubmitting
                ? "Saving…"
                : getSubmitButtonLabel(
                    transactionType,
                  )}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getTransactionExplanation(
  transactionType:
    InventoryTransactionType,
): string {
  switch (
    transactionType
  ) {
    case "stock_in":
      return "Adds received inventory to the current stock.";

    case "sale":
      return "Removes units that were sold.";

    case "return":
      return "Adds sellable customer-returned units back into stock.";

    case "damage":
      return "Removes damaged, broken, or expired units.";

    case "adjustment":
      return "Replaces the current stock with the actual physical count.";

    default:
      return "";
  }
}

function getNotesPlaceholder(
  transactionType:
    InventoryTransactionType,
): string {
  switch (
    transactionType
  ) {
    case "stock_in":
      return "Example: Supplier delivery";

    case "sale":
      return "Example: Manual sale adjustment";

    case "return":
      return "Example: Unopened customer return";

    case "damage":
      return "Example: Expired or damaged package";

    case "adjustment":
      return "Example: Shelf count completed";

    default:
      return "Add a note";
  }
}

function getSubmitButtonLabel(
  transactionType:
    InventoryTransactionType,
): string {
  switch (
    transactionType
  ) {
    case "stock_in":
      return "Add Stock";

    case "sale":
      return "Record Sale";

    case "return":
      return "Record Return";

    case "damage":
      return "Record Damage";

    case "adjustment":
      return "Save Physical Count";

    default:
      return "Save";
  }
}

interface StockImpactResult {
  message:
    string;

  isInvalid:
    boolean;
}

function getStockImpact(
  transactionType:
    InventoryTransactionType,

  currentStock:
    number,

  quantityValue:
    string,
): StockImpactResult {
  if (
    quantityValue.trim() ===
    ""
  ) {
    return {
      message:
        "Enter a quantity",

      isInvalid:
        false,
    };
  }

  const quantity =
    Number(
      quantityValue,
    );

  if (
    !Number.isInteger(
      quantity,
    ) ||
    quantity <
      0
  ) {
    return {
      message:
        "Enter a valid whole number",

      isInvalid:
        true,
    };
  }

  if (
    transactionType !==
      "adjustment" &&
    quantity ===
      0
  ) {
    return {
      message:
        "Quantity must be greater than zero",

      isInvalid:
        true,
    };
  }

  switch (
    transactionType
  ) {
    case "stock_in":
    case "return":
      return {
        message:
          `${currentStock} → ${
            currentStock +
            quantity
          } units`,

        isInvalid:
          false,
      };

    case "sale":
    case "damage": {
      const stockAfter =
        currentStock -
        quantity;

      if (
        stockAfter <
        0
      ) {
        return {
          message:
            `Only ${currentStock} units available`,

          isInvalid:
            true,
        };
      }

      return {
        message:
          `${currentStock} → ${stockAfter} units`,

        isInvalid:
          false,
      };
    }

    case "adjustment":
      return {
        message:
          `${currentStock} → ${quantity} units`,

        isInvalid:
          false,
      };

    default:
      return {
        message:
          "Stock impact unavailable",

        isInvalid:
          true,
      };
  }
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex:
        1,

      backgroundColor:
        "#F4F6F8",
    },

    screen: {
      flex:
        1,

      backgroundColor:
        "#F4F6F8",
    },

    content: {
      paddingHorizontal:
        20,

      paddingTop:
        10,

      paddingBottom:
        48,
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
        14,
    },

    title: {
      fontSize:
        28,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    productName: {
      marginTop:
        7,

      fontSize:
        17,

      lineHeight:
        22,

      fontWeight:
        "700",

      color:
        "#20252B",
    },

    productDetails: {
      marginTop:
        4,

      fontSize:
        13,

      lineHeight:
        19,

      color:
        "#6B7280",
    },

    cancelButton: {
      minWidth:
        78,

      minHeight:
        44,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#C8CED6",

      borderRadius:
        10,

      paddingHorizontal:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    cancelButtonPressed: {
      backgroundColor:
        "#F3F4F6",
    },

    cancelButtonDisabled: {
      opacity:
        0.55,
    },

    cancelButtonText: {
      fontSize:
        14,

      fontWeight:
        "700",

      color:
        "#20252B",
    },

    stockCard: {
      marginTop:
        22,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        16,

      padding:
        17,

      backgroundColor:
        "#FFFFFF",
    },

    stockPrimaryRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    stockLabel: {
      fontSize:
        12,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#6B7280",
    },

    stockValue: {
      marginTop:
        4,

      fontSize:
        34,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    stockUnit: {
      marginTop:
        -2,

      fontSize:
        12,

      color:
        "#6B7280",
    },

    stockRightColumn: {
      alignItems:
        "flex-end",
    },

    stockMetaLabel: {
      fontSize:
        10,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#8B949E",
    },

    stockMetaValue: {
      marginTop:
        3,

      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#374151",
    },

    targetStockLabel: {
      marginTop:
        12,
    },

    reorderSuggestionCard: {
      marginTop:
        12,

      borderWidth:
        1,

      borderColor:
        "#BFDBFE",

      borderRadius:
        12,

      padding:
        13,

      backgroundColor:
        "#EFF6FF",
    },

    reorderSuggestionTitle: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#1D4ED8",
    },

    reorderSuggestionText: {
      marginTop:
        4,

      fontSize:
        11,

      lineHeight:
        17,

      color:
        "#52606D",
    },

    section: {
      marginTop:
        22,
    },

    sectionTitle: {
      fontSize:
        17,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    sectionDescription: {
      marginTop:
        4,

      fontSize:
        12,

      color:
        "#6B7280",
    },

    transactionGrid: {
      marginTop:
        12,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        9,
    },

    transactionOption: {
      width:
        "48%",

      minHeight:
        70,

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#D9DEE5",

      borderRadius:
        13,

      paddingHorizontal:
        12,

      paddingVertical:
        10,

      backgroundColor:
        "#FFFFFF",
    },

    transactionOptionSelected: {
      borderColor:
        "#20252B",

      backgroundColor:
        "#20252B",
    },

    transactionOptionPressed: {
      backgroundColor:
        "#F3F4F6",
    },

    transactionOptionLabel: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    transactionOptionLabelSelected: {
      color:
        "#FFFFFF",
    },

    transactionOptionDescription: {
      marginTop:
        4,

      fontSize:
        10,

      lineHeight:
        14,

      color:
        "#6B7280",
    },

    transactionOptionDescriptionSelected: {
      color:
        "#D1D5DB",
    },

    selectedActionCard: {
      marginTop:
        12,

      borderRadius:
        12,

      padding:
        13,

      backgroundColor:
        "#ECEFF3",
    },

    selectedActionLabel: {
      fontSize:
        9,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      color:
        "#7A838E",
    },

    selectedActionValue: {
      marginTop:
        3,

      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    selectedActionDescription: {
      marginTop:
        4,

      fontSize:
        11,

      lineHeight:
        16,

      color:
        "#5D6673",
    },

    fieldContainer: {
      marginTop:
        20,
    },

    label: {
      marginBottom:
        7,

      fontSize:
        14,

      fontWeight:
        "700",

      color:
        "#111827",
    },

    optionalLabel: {
      marginTop:
        -5,

      marginBottom:
        7,

      fontSize:
        10,

      color:
        "#8B949E",
    },

    input: {
      minHeight:
        50,

      borderWidth:
        1,

      borderColor:
        "#C8CED6",

      borderRadius:
        11,

      paddingHorizontal:
        14,

      fontSize:
        17,

      backgroundColor:
        "#FFFFFF",

      color:
        "#111827",
    },

    inputError: {
      borderColor:
        "#B42318",
    },

    notesInput: {
      minHeight:
        92,

      paddingTop:
        12,

      fontSize:
        15,
    },

    errorText: {
      marginTop:
        6,

      fontSize:
        12,

      fontWeight:
        "600",

      color:
        "#B42318",
    },

    previewCard: {
      marginTop:
        14,

      borderRadius:
        12,

      padding:
        14,

      backgroundColor:
        "#EAF2FF",
    },

    previewCardWarning: {
      backgroundColor:
        "#FFF1F0",
    },

    previewLabel: {
      fontSize:
        10,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      color:
        "#52698E",
    },

    previewValue: {
      marginTop:
        5,

      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    previewValueWarning: {
      color:
        "#B42318",
    },

    submitButton: {
      marginTop:
        24,

      minHeight:
        52,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        13,

      paddingHorizontal:
        18,

      backgroundColor:
        "#20252B",
    },

    submitButtonPressed: {
      opacity:
        0.86,
    },

    submitButtonDisabled: {
      opacity:
        0.45,
    },

    submitButtonText: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },
  });