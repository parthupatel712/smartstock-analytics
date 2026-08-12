import {
  useMemo,
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { Product } from "../types/product";

import type {
  CreateInventoryTransactionInput,
  InventoryTransactionType,
} from "../types/inventoryTransaction";

interface InventoryTransactionFormProps {
  product: Product;

  isSubmitting?: boolean;

  /*
   * Optional starting values.
   *
   * Normal inventory updates do not
   * need to provide these.
   *
   * Reorder Management can provide:
   *
   * transaction type = stock_in
   * quantity = suggested reorder amount
   */
  initialTransactionType?:
    InventoryTransactionType;

  initialQuantity?:
    number;

  onCancel: () => void;

  onSubmit: (
    input:
      CreateInventoryTransactionInput,
  ) => Promise<void>;
}

interface TransactionOption {
  type:
    InventoryTransactionType;

  label:
    string;

  description:
    string;
}

const TRANSACTION_OPTIONS:
  TransactionOption[] = [
    {
      type:
        "stock_in",

      label:
        "Stock In",

      description:
        "Receive new inventory.",
    },

    {
      type:
        "sale",

      label:
        "Sale / Stock Out",

      description:
        "Remove stock after a sale.",
    },

    {
      type:
        "return",

      label:
        "Customer Return",

      description:
        "Add returned stock back.",
    },

    {
      type:
        "damage",

      label:
        "Damage",

      description:
        "Remove damaged or expired stock.",
    },

    {
      type:
        "adjustment",

      label:
        "Physical Count",

      description:
        "Set stock to the counted quantity.",
    },
  ];

export function InventoryTransactionForm({
  product,

  isSubmitting = false,

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
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    isPickerVisible,
    setIsPickerVisible,
  ] =
    useState(
      false,
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
      ? "Enter current physical count"
      : "Enter quantity";

  const isReorderPrefill =
    initialQuantity !==
      undefined &&
    initialTransactionType ===
      "stock_in";

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
      parsedQuantity < 0
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

  async function handleSubmit(): Promise<void> {
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
    <KeyboardAvoidingView
      behavior={
        Platform.OS ===
        "ios"
          ? "padding"
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
              {product.brand}
              {" · "}
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
            onPress={
              onCancel
            }
            style={
              styles.cancelButton
            }
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
            }{" "}
            units
          </Text>

          <View
            style={
              styles.stockMetaRow
            }
          >
            <View>
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
            </View>

            <View
              style={
                styles.stockMetaRight
              }
            >
              <Text
                style={
                  styles.stockMetaLabel
                }
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

        {isReorderPrefill ? (
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
              Reorder suggestion applied
            </Text>

            <Text
              style={
                styles.reorderSuggestionText
              }
            >
              SmartStock prefilled{" "}
              {
                initialQuantity
              }{" "}
              units to bring this product toward its target stock level.
            </Text>

            <Text
              style={
                styles.reorderSuggestionHint
              }
            >
              You can change the quantity before saving.
            </Text>
          </View>
        ) : null}

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
            Transaction type
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              setIsPickerVisible(
                true,
              )
            }
            style={
              styles.dropdownButton
            }
          >
            <View
              style={
                styles.dropdownTextContainer
              }
            >
              <Text
                style={
                  styles.dropdownValue
                }
              >
                {
                  selectedOption.label
                }
              </Text>

              <Text
                style={
                  styles.dropdownDescription
                }
              >
                {
                  selectedOption.description
                }
              </Text>
            </View>

            <Text
              style={
                styles.dropdownIcon
              }
            >
              ⌄
            </Text>
          </Pressable>
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
          style={
            styles.fieldContainer
          }
        >
          <Text
            style={
              styles.label
            }
          >
            Notes (optional)
          </Text>

          <TextInput
            value={
              notes
            }
            onChangeText={
              setNotes
            }
            placeholder="Example: Supplier delivery or damaged package"
            multiline
            numberOfLines={
              4
            }
            textAlignVertical="top"
            style={[
              styles.input,
              styles.notesInput,
            ]}
          />
        </View>

        <View
          style={
            styles.previewCard
          }
        >
          <Text
            style={
              styles.previewTitle
            }
          >
            Stock impact
          </Text>

          <Text
            style={
              styles.previewText
            }
          >
            {getStockImpactMessage(
              transactionType,
              product.currentStock,
              quantity,
            )}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={
            isSubmitting
          }
          onPress={() =>
            void handleSubmit()
          }
          style={({
            pressed,
          }) => [
            styles.submitButton,

            pressed &&
              styles.submitButtonPressed,

            isSubmitting &&
              styles.submitButtonDisabled,
          ]}
        >
          <Text
            style={
              styles.submitButtonText
            }
          >
            {isSubmitting
              ? "Saving transaction…"
              : "Save transaction"}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={
          isPickerVisible
        }
        onRequestClose={() =>
          setIsPickerVisible(
            false,
          )
        }
      >
        <View
          style={
            styles.modalBackdrop
          }
        >
          <View
            style={
              styles.modalContent
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                Select transaction type
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setIsPickerVisible(
                    false,
                  )
                }
                style={
                  styles.modalCloseButton
                }
              >
                <Text
                  style={
                    styles.modalCloseText
                  }
                >
                  Close
                </Text>
              </Pressable>
            </View>

            <ScrollView>
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
                      key={
                        option.type
                      }
                      onPress={() => {
                        setTransactionType(
                          option.type,
                        );

                        /*
                         * Clear the prefilled
                         * reorder quantity if
                         * the user intentionally
                         * changes transaction type.
                         */
                        setQuantity(
                          "",
                        );

                        setErrorMessage(
                          "",
                        );

                        setIsPickerVisible(
                          false,
                        );
                      }}
                      style={[
                        styles.option,

                        isSelected &&
                          styles.optionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLabel,

                          isSelected &&
                            styles.optionLabelSelected,
                        ]}
                      >
                        {
                          option.label
                        }
                      </Text>

                      <Text
                        style={
                          styles.optionDescription
                        }
                      >
                        {
                          option.description
                        }
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function getStockImpactMessage(
  transactionType:
    InventoryTransactionType,

  currentStock:
    number,

  quantityValue:
    string,
): string {
  const quantity =
    Number(
      quantityValue,
    );

  if (
    quantityValue.trim() ===
      "" ||
    !Number.isInteger(
      quantity,
    ) ||
    quantity < 0
  ) {
    return "Enter a valid quantity to preview the new stock.";
  }

  switch (
    transactionType
  ) {
    case "stock_in":
    case "return":
      return `${currentStock} → ${
        currentStock +
        quantity
      } units`;

    case "sale":
    case "damage":
      return `${currentStock} → ${
        currentStock -
        quantity
      } units`;

    case "adjustment":
      return `${currentStock} → ${quantity} units`;

    default:
      return "Stock impact unavailable.";
  }
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
        20,

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

      marginRight:
        14,
    },

    title: {
      fontSize:
        30,

      fontWeight:
        "800",
    },

    productName: {
      marginTop:
        8,

      fontSize:
        18,

      fontWeight:
        "700",
    },

    productDetails: {
      marginTop:
        4,

      fontSize:
        14,

      lineHeight:
        20,

      color:
        "#5D6673",
    },

    cancelButton: {
      borderWidth:
        1,

      borderColor:
        "#C8CED6",

      borderRadius:
        10,

      paddingHorizontal:
        14,

      paddingVertical:
        9,

      backgroundColor:
        "#FFFFFF",
    },

    cancelButtonText: {
      fontWeight:
        "700",

      color:
        "#20252B",
    },

    stockCard: {
      marginTop:
        24,

      marginBottom:
        18,

      borderRadius:
        14,

      padding:
        18,

      backgroundColor:
        "#FFFFFF",
    },

    stockLabel: {
      fontSize:
        14,

      color:
        "#5D6673",
    },

    stockValue: {
      marginTop:
        6,

      fontSize:
        28,

      fontWeight:
        "800",
    },

    stockMetaRow: {
      marginTop:
        16,

      paddingTop:
        13,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      flexDirection:
        "row",

      justifyContent:
        "space-between",
    },

    stockMetaRight: {
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
        15,

      fontWeight:
        "800",

      color:
        "#374151",
    },

    reorderSuggestionCard: {
      marginBottom:
        20,

      borderWidth:
        1,

      borderColor:
        "#BFDBFE",

      borderRadius:
        13,

      padding:
        14,

      backgroundColor:
        "#EFF6FF",
    },

    reorderSuggestionTitle: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#1D4ED8",
    },

    reorderSuggestionText: {
      marginTop:
        5,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#374151",
    },

    reorderSuggestionHint: {
      marginTop:
        5,

      fontSize:
        10,

      color:
        "#7A838E",
    },

    fieldContainer: {
      marginBottom:
        18,
    },

    label: {
      marginBottom:
        7,

      fontSize:
        15,

      fontWeight:
        "600",
    },

    input: {
      minHeight:
        48,

      borderWidth:
        1,

      borderColor:
        "#C8CED6",

      borderRadius:
        10,

      paddingHorizontal:
        14,

      fontSize:
        16,

      backgroundColor:
        "#FFFFFF",
    },

    inputError: {
      borderColor:
        "#B42318",
    },

    notesInput: {
      minHeight:
        110,

      paddingTop:
        12,
    },

    errorText: {
      marginTop:
        6,

      fontSize:
        13,

      color:
        "#B42318",
    },

    dropdownButton: {
      minHeight:
        62,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderWidth:
        1,

      borderColor:
        "#C8CED6",

      borderRadius:
        10,

      paddingHorizontal:
        14,

      paddingVertical:
        10,

      backgroundColor:
        "#FFFFFF",
    },

    dropdownTextContainer: {
      flex:
        1,
    },

    dropdownValue: {
      fontSize:
        16,

      fontWeight:
        "700",
    },

    dropdownDescription: {
      marginTop:
        3,

      fontSize:
        13,

      color:
        "#5D6673",
    },

    dropdownIcon: {
      marginLeft:
        12,

      fontSize:
        22,

      color:
        "#5D6673",
    },

    previewCard: {
      marginBottom:
        18,

      borderRadius:
        12,

      padding:
        16,

      backgroundColor:
        "#EAF2FF",
    },

    previewTitle: {
      fontSize:
        14,

      fontWeight:
        "700",
    },

    previewText: {
      marginTop:
        6,

      fontSize:
        16,

      fontWeight:
        "700",
    },

    submitButton: {
      minHeight:
        50,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        12,

      backgroundColor:
        "#20252B",
    },

    submitButtonPressed: {
      opacity:
        0.85,
    },

    submitButtonDisabled: {
      opacity:
        0.55,
    },

    submitButtonText: {
      fontSize:
        16,

      fontWeight:
        "700",

      color:
        "#FFFFFF",
    },

    modalBackdrop: {
      flex:
        1,

      justifyContent:
        "flex-end",

      backgroundColor:
        "rgba(0, 0, 0, 0.35)",
    },

    modalContent: {
      maxHeight:
        "72%",

      borderTopLeftRadius:
        20,

      borderTopRightRadius:
        20,

      paddingHorizontal:
        20,

      paddingTop:
        18,

      paddingBottom:
        32,

      backgroundColor:
        "#FFFFFF",
    },

    modalHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        12,
    },

    modalTitle: {
      fontSize:
        22,

      fontWeight:
        "800",
    },

    modalCloseButton: {
      paddingHorizontal:
        10,

      paddingVertical:
        8,
    },

    modalCloseText: {
      fontSize:
        15,

      fontWeight:
        "700",

      color:
        "#20252B",
    },

    option: {
      borderBottomWidth:
        1,

      borderBottomColor:
        "#E5E7EB",

      paddingHorizontal:
        8,

      paddingVertical:
        16,
    },

    optionSelected: {
      backgroundColor:
        "#F1F5F9",
    },

    optionLabel: {
      fontSize:
        16,

      fontWeight:
        "700",
    },

    optionLabelSelected: {
      fontWeight:
        "800",
    },

    optionDescription: {
      marginTop:
        4,

      fontSize:
        13,

      color:
        "#5D6673",
    },
  });