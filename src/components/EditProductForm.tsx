import {
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Modal,
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
  getCategoriesForDepartment,
  PRODUCT_DEPARTMENTS,
  type ProductCategory,
  type ProductDepartment,
} from "../constants/productTaxonomy";

import type {
  Product,
} from "../types/product";

import type {
  UpdateProductInput,
} from "../types/productUpdate";

interface EditProductFormProps {
  product:
    Product;

  isSubmitting?:
    boolean;

  onCancel:
    () => void;

  onSubmit: (
    input:
      UpdateProductInput,
  ) => Promise<void> | void;
}

type PickerType =
  | "department"
  | "category"
  | null;

export function EditProductForm({
  product,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: EditProductFormProps) {
  const [
    barcode,
    setBarcode,
  ] =
    useState(
      product.barcode,
    );

  const [
    name,
    setName,
  ] =
    useState(
      product.name,
    );

  const [
    brand,
    setBrand,
  ] =
    useState(
      product.brand ?? "",
    );

  const [
    department,
    setDepartment,
  ] =
    useState<ProductDepartment>(
      product.department,
    );

  const [
    category,
    setCategory,
  ] =
    useState<ProductCategory>(
      product.category,
    );

  const [
    unitCost,
    setUnitCost,
  ] =
    useState(
      product.unitCost.toString(),
    );

  const [
    unitPrice,
    setUnitPrice,
  ] =
    useState(
      product.unitPrice.toString(),
    );

  const [
    reorderLevel,
    setReorderLevel,
  ] =
    useState(
      product.reorderLevel.toString(),
    );

  const [
    activePicker,
    setActivePicker,
  ] =
    useState<PickerType>(
      null,
    );

  const availableCategories =
    useMemo(
      () =>
        getCategoriesForDepartment(
          department,
        ),

      [
        department,
      ],
    );

  function selectDepartment(
    nextDepartment:
      ProductDepartment,
  ): void {
    const nextCategories =
      getCategoriesForDepartment(
        nextDepartment,
      );

    setDepartment(
      nextDepartment,
    );

    const categoryStillValid =
      nextCategories.some(
        (
          nextCategory,
        ) =>
          nextCategory ===
          category,
      );

    if (
      !categoryStillValid &&
      nextCategories.length >
        0
    ) {
      setCategory(
        nextCategories[0],
      );
    }

    setActivePicker(
      null,
    );
  }

  function selectCategory(
    nextCategory:
      ProductCategory,
  ): void {
    setCategory(
      nextCategory,
    );

    setActivePicker(
      null,
    );
  }

  async function handleSubmit():
    Promise<void> {
    if (
      isSubmitting
    ) {
      return;
    }

    const cleanBarcode =
      barcode.trim();

    const cleanName =
      name.trim();

    const cleanBrand =
      brand.trim();

    if (
      !cleanName
    ) {
      Alert.alert(
        "Product name required",
        "Enter a product name before saving.",
      );

      return;
    }

    if (
      !cleanBarcode
    ) {
      Alert.alert(
        "Barcode required",
        "Enter a barcode before saving.",
      );

      return;
    }

    const parsedUnitCost =
      Number(
        unitCost,
      );

    const parsedUnitPrice =
      Number(
        unitPrice,
      );

    const parsedReorderLevel =
      Number(
        reorderLevel,
      );

    if (
      !Number.isFinite(
        parsedUnitCost,
      ) ||
      parsedUnitCost <
        0
    ) {
      Alert.alert(
        "Invalid unit cost",
        "Unit cost must be zero or greater.",
      );

      return;
    }

    if (
      !Number.isFinite(
        parsedUnitPrice,
      ) ||
      parsedUnitPrice <
        0
    ) {
      Alert.alert(
        "Invalid selling price",
        "Selling price must be zero or greater.",
      );

      return;
    }

    if (
      !Number.isInteger(
        parsedReorderLevel,
      ) ||
      parsedReorderLevel <
        0
    ) {
      Alert.alert(
        "Invalid reorder level",
        "Reorder level must be a whole number of zero or greater.",
      );

      return;
    }

    await onSubmit({
      productId:
        product.id,

      barcode:
        cleanBarcode,

      name:
        cleanName,

      brand:
        cleanBrand,

      department,

      category,

      unitCost:
        parsedUnitCost,

      unitPrice:
        parsedUnitPrice,

      reorderLevel:
        parsedReorderLevel,
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
        styles.screen
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
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
              Edit Product
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Update product details without changing stock history.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel product editing"
            hitSlop={
              10
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
              styles.closeButton,

              pressed &&
                !isSubmitting &&
                styles.buttonPressed,

              isSubmitting &&
                styles.closeButtonDisabled,
            ]}
          >
            <Text
              style={
                styles.closeButtonText
              }
            >
              Cancel
            </Text>
          </Pressable>
        </View>

        <View
          style={
            styles.stockSummaryCard
          }
        >
          <View
            style={
              styles.stockSummaryHeader
            }
          >
            <View>
              <Text
                style={
                  styles.stockSummaryLabel
                }
              >
                Current Stock
              </Text>

              <Text
                style={
                  styles.stockSummaryValue
                }
              >
                {
                  product.currentStock
                }{" "}
                units
              </Text>
            </View>

            <View
              style={
                styles.lockBadge
              }
            >
              <Text
                style={
                  styles.lockBadgeText
                }
              >
                Stock locked
              </Text>
            </View>
          </View>

          <Text
            style={
              styles.stockSummaryMessage
            }
          >
            Stock is not edited here. Use Update Inventory so every stock change stays in history and analytics.
          </Text>
        </View>

        <FormField
          label="Product Name"
          value={
            name
          }
          onChangeText={
            setName
          }
          placeholder="Product name"
          autoCapitalize="words"
        />

        <FormField
          label="Brand"
          optional
          value={
            brand
          }
          onChangeText={
            setBrand
          }
          placeholder="e.g. Coca-Cola"
          autoCapitalize="words"
        />

        <View
          style={
            styles.fieldContainer
          }
        >
          <Text
            style={
              styles.fieldLabel
            }
          >
            Department
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select product department"
            onPress={() =>
              setActivePicker(
                "department",
              )
            }
            style={({
              pressed,
            }) => [
              styles.selector,

              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Text
              style={
                styles.selectorText
              }
              numberOfLines={
                2
              }
            >
              {
                department
              }
            </Text>

            <Text
              style={
                styles.selectorChevron
              }
            >
              ›
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
              styles.fieldLabel
            }
          >
            Category
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select product category"
            onPress={() =>
              setActivePicker(
                "category",
              )
            }
            style={({
              pressed,
            }) => [
              styles.selector,

              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Text
              style={
                styles.selectorText
              }
              numberOfLines={
                2
              }
            >
              {
                category
              }
            </Text>

            <Text
              style={
                styles.selectorChevron
              }
            >
              ›
            </Text>
          </Pressable>
        </View>

        <FormField
          label="Barcode"
          value={
            barcode
          }
          onChangeText={
            setBarcode
          }
          placeholder="Barcode"
          keyboardType="number-pad"
          autoCapitalize="none"
        />

        <Text
          style={
            styles.barcodeHint
          }
        >
          Change this only if the barcode assigned to the product has actually changed.
        </Text>

        <View
          style={
            styles.doubleFieldRow
          }
        >
          <View
            style={
              styles.doubleField
            }
          >
            <FormField
              label="Unit Cost"
              value={
                unitCost
              }
              onChangeText={
                setUnitCost
              }
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>

          <View
            style={
              styles.doubleField
            }
          >
            <FormField
              label="Selling Price"
              value={
                unitPrice
              }
              onChangeText={
                setUnitPrice
              }
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <FormField
          label="Reorder Level"
          value={
            reorderLevel
          }
          onChangeText={
            setReorderLevel
          }
          placeholder="0"
          keyboardType="number-pad"
        />

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
            styles.saveButton,

            pressed &&
              !isSubmitting &&
              styles.saveButtonPressed,

            isSubmitting &&
              styles.saveButtonDisabled,
          ]}
        >
          <Text
            style={
              styles.saveButtonText
            }
          >
            {isSubmitting
              ? "Saving…"
              : "Save Changes"}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={
          activePicker !==
          null
        }
        onRequestClose={() =>
          setActivePicker(
            null,
          )
        }
      >
        <SafeAreaView
          edges={[
            "bottom",
          ]}
          style={
            styles.modalSafeArea
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
                  numberOfLines={
                    2
                  }
                >
                  {activePicker ===
                  "department"
                    ? "Select Department"
                    : "Select Category"}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  hitSlop={
                    10
                  }
                  onPress={() =>
                    setActivePicker(
                      null,
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.modalCloseButton,

                    pressed &&
                      styles.buttonPressed,
                  ]}
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

              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                {activePicker ===
                "department"
                  ? PRODUCT_DEPARTMENTS.map(
                      (
                        option,
                      ) => (
                        <PickerOption
                          key={
                            option
                          }
                          label={
                            option
                          }
                          selected={
                            option ===
                            department
                          }
                          onPress={() =>
                            selectDepartment(
                              option,
                            )
                          }
                        />
                      ),
                    )
                  : availableCategories.map(
                      (
                        option,
                      ) => (
                        <PickerOption
                          key={
                            option
                          }
                          label={
                            option
                          }
                          selected={
                            option ===
                            category
                          }
                          onPress={() =>
                            selectCategory(
                              option,
                            )
                          }
                        />
                      ),
                    )}
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

interface FormFieldProps {
  label:
    string;

  value:
    string;

  placeholder?:
    string;

  optional?:
    boolean;

  keyboardType?:
    | "default"
    | "number-pad"
    | "decimal-pad";

  autoCapitalize?:
    | "none"
    | "sentences"
    | "words"
    | "characters";

  onChangeText: (
    value:
      string,
  ) => void;
}

function FormField({
  label,
  value,
  placeholder,
  optional = false,
  keyboardType = "default",
  autoCapitalize = "none",
  onChangeText,
}: FormFieldProps) {
  return (
    <View
      style={
        styles.fieldContainer
      }
    >
      <View
        style={
          styles.fieldLabelRow
        }
      >
        <Text
          style={
            styles.fieldLabel
          }
        >
          {
            label
          }
        </Text>

        {optional ? (
          <Text
            style={
              styles.optionalText
            }
          >
            Optional
          </Text>
        ) : null}
      </View>

      <TextInput
        value={
          value
        }
        onChangeText={
          onChangeText
        }
        placeholder={
          placeholder
        }
        keyboardType={
          keyboardType
        }
        autoCapitalize={
          autoCapitalize
        }
        autoCorrect={
          false
        }
        style={
          styles.input
        }
      />
    </View>
  );
}

interface PickerOptionProps {
  label:
    string;

  selected:
    boolean;

  onPress:
    () => void;
}

function PickerOption({
  label,
  selected,
  onPress,
}: PickerOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        selected,
      }}
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.pickerOption,

        selected &&
          styles.pickerOptionSelected,

        pressed &&
          styles.pickerOptionPressed,
      ]}
    >
      <Text
        style={[
          styles.pickerOptionText,

          selected &&
            styles.pickerOptionTextSelected,
        ]}
      >
        {
          label
        }
      </Text>

      {selected ? (
        <Text
          style={
            styles.selectedIndicator
          }
        >
          ✓
        </Text>
      ) : null}
    </Pressable>
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

    closeButtonDisabled: {
      opacity:
        0.5,
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
        0.7,
    },

    stockSummaryCard: {
      marginTop:
        22,

      borderWidth:
        1,

      borderColor:
        "#D9E4F5",

      borderRadius:
        16,

      padding:
        16,

      backgroundColor:
        "#EFF6FF",
    },

    stockSummaryHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        12,
    },

    stockSummaryLabel: {
      fontSize:
        11,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#4B67A1",
    },

    stockSummaryValue: {
      marginTop:
        5,

      fontSize:
        25,

      fontWeight:
        "800",

      color:
        "#1D4ED8",
    },

    stockSummaryMessage: {
      marginTop:
        9,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#52698E",
    },

    lockBadge: {
      flexShrink:
        0,

      borderRadius:
        999,

      paddingHorizontal:
        9,

      paddingVertical:
        5,

      backgroundColor:
        "#DBEAFE",
    },

    lockBadgeText: {
      fontSize:
        10,

      fontWeight:
        "800",

      color:
        "#1D4ED8",
    },

    fieldContainer: {
      marginTop:
        18,
    },

    fieldLabelRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        7,
    },

    fieldLabel: {
      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#374151",
    },

    optionalText: {
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
        "#CBD2DA",

      borderRadius:
        12,

      paddingHorizontal:
        14,

      fontSize:
        16,

      color:
        "#111827",

      backgroundColor:
        "#FFFFFF",
    },

    selector: {
      minHeight:
        50,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        12,

      paddingHorizontal:
        14,

      paddingVertical:
        10,

      backgroundColor:
        "#FFFFFF",
    },

    selectorText: {
      flex:
        1,

      minWidth:
        0,

      fontSize:
        16,

      lineHeight:
        21,

      color:
        "#111827",
    },

    selectorChevron: {
      flexShrink:
        0,

      marginLeft:
        12,

      fontSize:
        24,

      color:
        "#7A838E",
    },

    barcodeHint: {
      marginTop:
        7,

      fontSize:
        11,

      lineHeight:
        17,

      color:
        "#6B7280",
    },

    doubleFieldRow: {
      flexDirection:
        "row",

      gap:
        12,
    },

    doubleField: {
      flex:
        1,

      minWidth:
        0,
    },

    saveButton: {
      marginTop:
        28,

      minHeight:
        52,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        14,

      backgroundColor:
        "#20252B",
    },

    saveButtonPressed: {
      backgroundColor:
        "#111827",
    },

    saveButtonDisabled: {
      opacity:
        0.5,
    },

    saveButtonText: {
      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    modalSafeArea: {
      flex:
        1,

      backgroundColor:
        "transparent",
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
        22,

      borderTopRightRadius:
        22,

      paddingHorizontal:
        20,

      paddingTop:
        18,

      paddingBottom:
        18,

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
        10,
    },

    modalTitle: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        12,

      fontSize:
        21,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    modalCloseButton: {
      flexShrink:
        0,

      paddingHorizontal:
        8,

      paddingVertical:
        8,
    },

    modalCloseText: {
      fontSize:
        14,

      fontWeight:
        "700",

      color:
        "#20252B",
    },

    pickerOption: {
      minHeight:
        54,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderBottomWidth:
        1,

      borderBottomColor:
        "#E5E7EB",

      paddingHorizontal:
        8,

      paddingVertical:
        14,
    },

    pickerOptionSelected: {
      backgroundColor:
        "#F1F5F9",
    },

    pickerOptionPressed: {
      opacity:
        0.7,
    },

    pickerOptionText: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        12,

      fontSize:
        16,

      lineHeight:
        21,

      color:
        "#20252B",
    },

    pickerOptionTextSelected: {
      fontWeight:
        "800",
    },

    selectedIndicator: {
      flexShrink:
        0,

      fontSize:
        17,

      fontWeight:
        "800",

      color:
        "#15803D",
    },
  });