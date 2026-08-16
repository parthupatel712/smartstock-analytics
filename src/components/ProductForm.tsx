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

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  getCategoriesForDepartment,
  PRODUCT_DEPARTMENTS,
  type ProductDepartment,
} from "../constants/productTaxonomy";

import type {
  ProductFormErrors,
  ProductFormValues,
} from "../types/productForm";

import {
  validateProductForm,
} from "../utils/validateProductForm";

interface ProductFormProps {
  onSubmit: (
    values:
      ProductFormValues,
  ) => Promise<void>;

  isSubmitting?:
    boolean;

  initialBarcode?:
    string;
}

type PickerType =
  | "department"
  | "category"
  | null;

const INITIAL_VALUES:
  ProductFormValues = {
    barcode:
      "",

    name:
      "",

    department:
      "",

    category:
      "",

    brand:
      "",

    unitCost:
      "",

    unitPrice:
      "",

    currentStock:
      "0",

    reorderLevel:
      "5",
  };

export function ProductForm({
  onSubmit,
  isSubmitting = false,
  initialBarcode = "",
}: ProductFormProps) {
  const [
    values,
    setValues,
  ] =
    useState<ProductFormValues>({
      ...INITIAL_VALUES,

      barcode:
        initialBarcode,
    });

  const [
    errors,
    setErrors,
  ] =
    useState<ProductFormErrors>(
      {},
    );

  const [
    activePicker,
    setActivePicker,
  ] =
    useState<PickerType>(
      null,
    );

  const wasBarcodeScanned =
    initialBarcode.trim() !==
    "";

  const availableCategories =
    useMemo(
      () => {
        if (
          !values.department
        ) {
          return [];
        }

        return getCategoriesForDepartment(
          values.department as ProductDepartment,
        );
      },
      [
        values.department,
      ],
    );

  function updateField(
    field:
      keyof ProductFormValues,
    value:
      string,
  ): void {
    setValues(
      (
        currentValues,
      ) => ({
        ...currentValues,

        [field]:
          value,
      }),
    );

    setErrors(
      (
        currentErrors,
      ) => ({
        ...currentErrors,

        [field]:
          undefined,
      }),
    );
  }

  function selectDepartment(
    department:
      ProductDepartment,
  ): void {
    setValues(
      (
        currentValues,
      ) => ({
        ...currentValues,

        department,

        category:
          "",
      }),
    );

    setErrors(
      (
        currentErrors,
      ) => ({
        ...currentErrors,

        department:
          undefined,

        category:
          undefined,
      }),
    );

    setActivePicker(
      null,
    );
  }

  function selectCategory(
    category:
      string,
  ): void {
    updateField(
      "category",
      category,
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

    const normalizedValues:
      ProductFormValues = {
        ...values,

        barcode:
          values.barcode.trim(),

        name:
          values.name.trim(),

        brand:
          values.brand.trim(),
      };

    const validation =
      validateProductForm(
        normalizedValues,
      );

    if (
      !validation.isValid
    ) {
      setErrors(
        validation.errors,
      );

      return;
    }

    await onSubmit(
      normalizedValues,
    );
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
        styles.keyboardContainer
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
        <Text
          style={
            styles.title
          }
        >
          Add Product
        </Text>

        <Text
          style={
            styles.description
          }
        >
          Add the basic product details and starting inventory information.
        </Text>

        {wasBarcodeScanned ? (
          <View
            style={
              styles.scannedBarcodeCard
            }
          >
            <View
              style={
                styles.scannedBarcodeHeader
              }
            >
              <Text
                style={
                  styles.scannedBarcodeLabel
                }
              >
                Barcode scanned
              </Text>

              <View
                style={
                  styles.scannedBadge
                }
              >
                <Text
                  style={
                    styles.scannedBadgeText
                  }
                >
                  Camera
                </Text>
              </View>
            </View>

            <Text
              style={
                styles.scannedBarcodeValue
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
                values.barcode
              }
            </Text>

            <Text
              style={
                styles.scannedBarcodeHint
              }
            >
              Confirm the barcode below before saving the product.
            </Text>
          </View>
        ) : null}

        <Text
          style={
            styles.sectionLabel
          }
        >
          Product Details
        </Text>

        <FormField
          label="Barcode"
          value={
            values.barcode
          }
          onChangeText={(
            value,
          ) =>
            updateField(
              "barcode",
              value,
            )
          }
          placeholder="Example: 012345678905"
          keyboardType="number-pad"
          error={
            errors.barcode
          }
        />

        <FormField
          label="Product Name"
          value={
            values.name
          }
          onChangeText={(
            value,
          ) =>
            updateField(
              "name",
              value,
            )
          }
          placeholder="Example: Coca-Cola Zero 355 mL"
          error={
            errors.name
          }
          autoCapitalize="words"
        />

        <FormField
          label="Brand"
          optional
          value={
            values.brand
          }
          onChangeText={(
            value,
          ) =>
            updateField(
              "brand",
              value,
            )
          }
          placeholder="Example: Coca-Cola"
          error={
            errors.brand
          }
          autoCapitalize="words"
        />

        <DropdownField
          label="Department"
          value={
            values.department
          }
          placeholder="Select department"
          error={
            errors.department
          }
          onPress={() =>
            setActivePicker(
              "department",
            )
          }
        />

        <DropdownField
          label="Category"
          value={
            values.category
          }
          placeholder={
            values.department
              ? "Select category"
              : "Select department first"
          }
          error={
            errors.category
          }
          disabled={
            !values.department
          }
          onPress={() =>
            setActivePicker(
              "category",
            )
          }
        />

        <Text
          style={
            styles.sectionLabel
          }
        >
          Pricing
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
                values.unitCost
              }
              onChangeText={(
                value,
              ) =>
                updateField(
                  "unitCost",
                  value,
                )
              }
              placeholder="0.00"
              keyboardType="decimal-pad"
              error={
                errors.unitCost
              }
              compact
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
                values.unitPrice
              }
              onChangeText={(
                value,
              ) =>
                updateField(
                  "unitPrice",
                  value,
                )
              }
              placeholder="0.00"
              keyboardType="decimal-pad"
              error={
                errors.unitPrice
              }
              compact
            />
          </View>
        </View>

        <Text
          style={
            styles.sectionLabel
          }
        >
          Inventory Setup
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
              label="Opening Stock"
              value={
                values.currentStock
              }
              onChangeText={(
                value,
              ) =>
                updateField(
                  "currentStock",
                  value,
                )
              }
              placeholder="0"
              keyboardType="number-pad"
              error={
                errors.currentStock
              }
              compact
            />
          </View>

          <View
            style={
              styles.doubleField
            }
          >
            <FormField
              label="Reorder Level"
              value={
                values.reorderLevel
              }
              onChangeText={(
                value,
              ) =>
                updateField(
                  "reorderLevel",
                  value,
                )
              }
              placeholder="5"
              keyboardType="number-pad"
              error={
                errors.reorderLevel
              }
              compact
            />
          </View>
        </View>

        <View
          style={
            styles.inventoryHintCard
          }
        >
          <Text
            style={
              styles.inventoryHintTitle
            }
          >
            Opening stock
          </Text>

          <Text
            style={
              styles.inventoryHintText
            }
          >
            If you enter opening stock, SmartStock records it as the product's first Stock In transaction so the inventory history remains complete.
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
              !isSubmitting &&
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
              ? "Saving…"
              : "Save Product"}
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
                        department,
                      ) => {
                        const isSelected =
                          values.department ===
                          department;

                        return (
                          <PickerOption
                            key={
                              department
                            }
                            label={
                              department
                            }
                            selected={
                              isSelected
                            }
                            onPress={() =>
                              selectDepartment(
                                department,
                              )
                            }
                          />
                        );
                      },
                    )
                  : availableCategories.map(
                      (
                        category,
                      ) => {
                        const isSelected =
                          values.category ===
                          category;

                        return (
                          <PickerOption
                            key={
                              category
                            }
                            label={
                              category
                            }
                            selected={
                              isSelected
                            }
                            onPress={() =>
                              selectCategory(
                                category,
                              )
                            }
                          />
                        );
                      },
                    )}
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

interface FormFieldProps {
  label:
    string;

  value:
    string;

  onChangeText: (
    value:
      string,
  ) => void;

  placeholder:
    string;

  keyboardType?:
    React.ComponentProps<
      typeof TextInput
    >["keyboardType"];

  autoCapitalize?:
    React.ComponentProps<
      typeof TextInput
    >["autoCapitalize"];

  error?:
    string;

  optional?:
    boolean;

  compact?:
    boolean;
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  optional = false,
  compact = false,
}: FormFieldProps) {
  return (
    <View
      style={[
        styles.fieldContainer,

        compact &&
          styles.compactFieldContainer,
      ]}
    >
      <View
        style={
          styles.fieldLabelRow
        }
      >
        <Text
          style={
            styles.label
          }
          numberOfLines={
            2
          }
        >
          {
            label
          }
        </Text>

        {optional ? (
          <Text
            style={
              styles.optionalLabel
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
        placeholderTextColor="#9CA3AF"
        keyboardType={
          keyboardType
        }
        autoCapitalize={
          autoCapitalize
        }
        autoCorrect={
          false
        }
        style={[
          styles.input,

          error &&
            styles.inputError,
        ]}
      />

      {error ? (
        <Text
          style={
            styles.errorText
          }
        >
          {
            error
          }
        </Text>
      ) : null}
    </View>
  );
}

interface DropdownFieldProps {
  label:
    string;

  value:
    string;

  placeholder:
    string;

  onPress:
    () => void;

  error?:
    string;

  disabled?:
    boolean;
}

function DropdownField({
  label,
  value,
  placeholder,
  onPress,
  error,
  disabled = false,
}: DropdownFieldProps) {
  return (
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
          label
        }
      </Text>

      <Pressable
        accessibilityRole="button"
        disabled={
          disabled
        }
        onPress={
          onPress
        }
        style={({
          pressed,
        }) => [
          styles.dropdownButton,

          disabled &&
            styles.dropdownButtonDisabled,

          error &&
            styles.inputError,

          pressed &&
            !disabled &&
            styles.buttonPressed,
        ]}
      >
        <Text
          style={[
            styles.dropdownText,

            !value &&
              styles.dropdownPlaceholder,

            disabled &&
              styles.dropdownTextDisabled,
          ]}
          numberOfLines={
            2
          }
        >
          {value ||
            placeholder}
        </Text>

        <Text
          style={
            styles.dropdownIcon
          }
        >
          ›
        </Text>
      </Pressable>

      {error ? (
        <Text
          style={
            styles.errorText
          }
        >
          {
            error
          }
        </Text>
      ) : null}
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
    keyboardContainer: {
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
        50,
    },

    title: {
      fontSize:
        28,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    description: {
      marginTop:
        6,

      marginBottom:
        8,

      maxWidth:
        340,

      fontSize:
        13,

      lineHeight:
        19,

      color:
        "#5D6673",
    },

    scannedBarcodeCard: {
      marginTop:
        18,

      borderWidth:
        1,

      borderColor:
        "#BFDBFE",

      borderRadius:
        14,

      padding:
        14,

      backgroundColor:
        "#EFF6FF",
    },

    scannedBarcodeHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        10,
    },

    scannedBarcodeLabel: {
      flex:
        1,

      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#1D4ED8",
    },

    scannedBadge: {
      flexShrink:
        0,

      borderRadius:
        999,

      paddingHorizontal:
        8,

      paddingVertical:
        4,

      backgroundColor:
        "#DBEAFE",
    },

    scannedBadgeText: {
      fontSize:
        9,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      color:
        "#1D4ED8",
    },

    scannedBarcodeValue: {
      marginTop:
        7,

      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    scannedBarcodeHint: {
      marginTop:
        4,

      fontSize:
        11,

      lineHeight:
        16,

      color:
        "#52698E",
    },

    sectionLabel: {
      marginTop:
        24,

      marginBottom:
        2,

      fontSize:
        12,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      letterSpacing:
        0.4,

      color:
        "#6B7280",
    },

    fieldContainer: {
      marginTop:
        16,
    },

    compactFieldContainer: {
      flex:
        1,
    },

    fieldLabelRow: {
      minHeight:
        20,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      marginBottom:
        7,

      gap:
        6,
    },

    label: {
      flex:
        1,

      minWidth:
        0,

      fontSize:
        13,

      lineHeight:
        18,

      fontWeight:
        "700",

      color:
        "#374151",
    },

    optionalLabel: {
      flexShrink:
        0,

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

    inputError: {
      borderColor:
        "#B42318",
    },

    errorText: {
      marginTop:
        6,

      fontSize:
        12,

      lineHeight:
        17,

      color:
        "#B42318",
    },

    dropdownButton: {
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

    dropdownButtonDisabled: {
      backgroundColor:
        "#ECEFF3",
    },

    dropdownText: {
      flex:
        1,

      minWidth:
        0,

      fontSize:
        16,

      lineHeight:
        21,

      color:
        "#20252B",
    },

    dropdownPlaceholder: {
      color:
        "#8B949E",
    },

    dropdownTextDisabled: {
      color:
        "#9AA3AD",
    },

    dropdownIcon: {
      flexShrink:
        0,

      marginLeft:
        12,

      fontSize:
        24,

      color:
        "#5D6673",
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

    inventoryHintCard: {
      marginTop:
        18,

      borderRadius:
        12,

      padding:
        13,

      backgroundColor:
        "#F1F5F9",
    },

    inventoryHintTitle: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#374151",
    },

    inventoryHintText: {
      marginTop:
        4,

      fontSize:
        11,

      lineHeight:
        17,

      color:
        "#64748B",
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
        14,

      backgroundColor:
        "#20252B",
    },

    submitButtonPressed: {
      backgroundColor:
        "#111827",
    },

    submitButtonDisabled: {
      opacity:
        0.55,
    },

    submitButtonText: {
      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    buttonPressed: {
      opacity:
        0.72,
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

      lineHeight:
        26,

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