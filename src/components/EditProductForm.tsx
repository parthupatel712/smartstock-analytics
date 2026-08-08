import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  getCategoriesForDepartment,
  PRODUCT_DEPARTMENTS,
  type ProductCategory,
  type ProductDepartment,
} from "../constants/productTaxonomy";

import type { Product } from "../types/product";
import type { UpdateProductInput } from "../types/productUpdate";

interface EditProductFormProps {
  product: Product;
  isSubmitting?: boolean;

  onCancel: () => void;

  onSubmit: (
    input: UpdateProductInput,
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
  const [barcode, setBarcode] =
    useState(product.barcode);

  const [name, setName] =
    useState(product.name);

  const [brand, setBrand] =
    useState(product.brand);

  const [
    department,
    setDepartment,
  ] = useState<ProductDepartment>(
    product.department,
  );

  const [
    category,
    setCategory,
  ] = useState<ProductCategory>(
    product.category,
  );

  const [unitCost, setUnitCost] =
    useState(
      product.unitCost.toString(),
    );

  const [unitPrice, setUnitPrice] =
    useState(
      product.unitPrice.toString(),
    );

  const [
    reorderLevel,
    setReorderLevel,
  ] = useState(
    product.reorderLevel.toString(),
  );

  const [
    activePicker,
    setActivePicker,
  ] = useState<PickerType>(null);

  const availableCategories =
    useMemo(
      () =>
        getCategoriesForDepartment(
          department,
        ),
      [department],
    );

  function selectDepartment(
    nextDepartment: ProductDepartment,
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
        (nextCategory) =>
          nextCategory === category,
      );

    if (
      !categoryStillValid &&
      nextCategories.length > 0
    ) {
      setCategory(
        nextCategories[0],
      );
    }

    setActivePicker(null);
  }

  function selectCategory(
    nextCategory: ProductCategory,
  ): void {
    setCategory(nextCategory);
    setActivePicker(null);
  }

  async function handleSubmit(): Promise<void> {
    if (isSubmitting) {
      return;
    }

    const cleanBarcode =
      barcode.trim();

    const cleanName =
      name.trim();

    const cleanBrand =
      brand.trim();

    if (!cleanName) {
      Alert.alert(
        "Product name required",
        "Enter a product name before saving.",
      );

      return;
    }

    if (!cleanBrand) {
      Alert.alert(
        "Brand required",
        "Enter a brand before saving.",
      );

      return;
    }

    if (!cleanBarcode) {
      Alert.alert(
        "Barcode required",
        "Enter a barcode before saving.",
      );

      return;
    }

    const parsedUnitCost =
      Number(unitCost);

    const parsedUnitPrice =
      Number(unitPrice);

    const parsedReorderLevel =
      Number(reorderLevel);

    if (
      !Number.isFinite(
        parsedUnitCost,
      ) ||
      parsedUnitCost < 0
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
      parsedUnitPrice < 0
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
      parsedReorderLevel < 0
    ) {
      Alert.alert(
        "Invalid reorder level",
        "Reorder level must be a whole number of zero or greater.",
      );

      return;
    }

    await onSubmit({
      productId: product.id,

      barcode: cleanBarcode,
      name: cleanName,
      brand: cleanBrand,

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
      style={styles.screen}
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
          style={styles.headerRow}
        >
          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text style={styles.title}>
              Edit Product
            </Text>

            <Text
              style={styles.subtitle}
            >
              Update product details without changing inventory history.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            style={({ pressed }) => [
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
              Cancel
            </Text>
          </Pressable>
        </View>

        <View
          style={
            styles.stockSummaryCard
          }
        >
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
            {product.currentStock}{" "}
            units
          </Text>

          <Text
            style={
              styles.stockSummaryMessage
            }
          >
            Stock cannot be changed from Edit Product. Use an inventory transaction so every stock change remains recorded.
          </Text>
        </View>

        <FormField
          label="Product Name"
          value={name}
          onChangeText={setName}
          placeholder="Product name"
          autoCapitalize="words"
        />

        <FormField
          label="Brand"
          value={brand}
          onChangeText={setBrand}
          placeholder="Brand"
          autoCapitalize="words"
        />

        <View
          style={
            styles.fieldContainer
          }
        >
          <Text
            style={styles.fieldLabel}
          >
            Department
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              setActivePicker(
                "department",
              )
            }
            style={({ pressed }) => [
              styles.selector,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Text
              style={
                styles.selectorText
              }
            >
              {department}
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
            style={styles.fieldLabel}
          >
            Category
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              setActivePicker(
                "category",
              )
            }
            style={({ pressed }) => [
              styles.selector,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Text
              style={
                styles.selectorText
              }
            >
              {category}
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
          value={barcode}
          onChangeText={setBarcode}
          placeholder="Barcode"
          keyboardType="number-pad"
          autoCapitalize="none"
        />

        <Text
          style={
            styles.barcodeHint
          }
        >
          Change the barcode only if the product barcode itself has changed.
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
              value={unitCost}
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
              value={unitPrice}
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
          value={reorderLevel}
          onChangeText={
            setReorderLevel
          }
          placeholder="0"
          keyboardType="number-pad"
        />

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() =>
            void handleSubmit()
          }
          style={({ pressed }) => [
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
              ? "Saving Changes…"
              : "Save Changes"}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={
          activePicker !== null
        }
        onRequestClose={() =>
          setActivePicker(null)
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
                {activePicker ===
                "department"
                  ? "Select Department"
                  : "Select Category"}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setActivePicker(
                    null,
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
      </Modal>
    </SafeAreaView>
  );
}

interface FormFieldProps {
  label: string;
  value: string;

  placeholder?: string;

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
    value: string,
  ) => void;
}

function FormField({
  label,
  value,
  placeholder,
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
      <Text
        style={styles.fieldLabel}
      >
        {label}
      </Text>

      <TextInput
        value={value}
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
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

interface PickerOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function PickerOption({
  label,
  selected,
  onPress,
}: PickerOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
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
        {label}
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
      flex: 1,
      backgroundColor:
        "#F4F6F8",
    },

    content: {
      padding: 18,
      paddingBottom: 50,
    },

    headerRow: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
    },

    headerTextContainer: {
      flex: 1,
      marginRight: 16,
    },

    title: {
      fontSize: 30,
      fontWeight: "800",
      color: "#111827",
    },

    subtitle: {
      marginTop: 6,
      fontSize: 14,
      lineHeight: 20,
      color: "#6B7280",
    },

    closeButton: {
      borderWidth: 1,
      borderColor:
        "#CBD2DA",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 9,
      backgroundColor:
        "#FFFFFF",
    },

    closeButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#20252B",
    },

    buttonPressed: {
      opacity: 0.7,
    },

    stockSummaryCard: {
      marginTop: 22,
      borderWidth: 1,
      borderColor:
        "#D9E4F5",
      borderRadius: 16,
      padding: 16,
      backgroundColor:
        "#EFF6FF",
    },

    stockSummaryLabel: {
      fontSize: 12,
      fontWeight: "700",
      textTransform:
        "uppercase",
      color: "#4B67A1",
    },

    stockSummaryValue: {
      marginTop: 5,
      fontSize: 25,
      fontWeight: "800",
      color: "#1D4ED8",
    },

    stockSummaryMessage: {
      marginTop: 8,
      fontSize: 12,
      lineHeight: 18,
      color: "#52698E",
    },

    fieldContainer: {
      marginTop: 18,
    },

    fieldLabel: {
      marginBottom: 7,
      fontSize: 13,
      fontWeight: "700",
      color: "#374151",
    },

    input: {
      minHeight: 50,
      borderWidth: 1,
      borderColor:
        "#CBD2DA",
      borderRadius: 12,
      paddingHorizontal: 14,
      fontSize: 16,
      color: "#111827",
      backgroundColor:
        "#FFFFFF",
    },

    selector: {
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      borderWidth: 1,
      borderColor:
        "#CBD2DA",
      borderRadius: 12,
      paddingHorizontal: 14,
      backgroundColor:
        "#FFFFFF",
    },

    selectorText: {
      flex: 1,
      fontSize: 16,
      color: "#111827",
    },

    selectorChevron: {
      marginLeft: 12,
      fontSize: 24,
      color: "#7A838E",
    },

    barcodeHint: {
      marginTop: 7,
      fontSize: 12,
      lineHeight: 17,
      color: "#6B7280",
    },

    doubleFieldRow: {
      flexDirection: "row",
      gap: 12,
    },

    doubleField: {
      flex: 1,
    },

    saveButton: {
      marginTop: 28,
      minHeight: 52,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius: 14,
      backgroundColor:
        "#20252B",
    },

    saveButtonPressed: {
      backgroundColor:
        "#111827",
    },

    saveButtonDisabled: {
      opacity: 0.5,
    },

    saveButtonText: {
      fontSize: 16,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    modalBackdrop: {
      flex: 1,
      justifyContent:
        "flex-end",
      backgroundColor:
        "rgba(0, 0, 0, 0.35)",
    },

    modalContent: {
      maxHeight: "72%",
      borderTopLeftRadius:
        22,
      borderTopRightRadius:
        22,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 34,
      backgroundColor:
        "#FFFFFF",
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 10,
    },

    modalTitle: {
      flex: 1,
      marginRight: 12,
      fontSize: 21,
      fontWeight: "800",
      color: "#111827",
    },

    modalCloseButton: {
      paddingHorizontal: 8,
      paddingVertical: 8,
    },

    modalCloseText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#20252B",
    },

    pickerOption: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      borderBottomWidth: 1,
      borderBottomColor:
        "#E5E7EB",
      paddingHorizontal: 8,
      paddingVertical: 14,
    },

    pickerOptionSelected: {
      backgroundColor:
        "#F1F5F9",
    },

    pickerOptionPressed: {
      opacity: 0.7,
    },

    pickerOptionText: {
      flex: 1,
      marginRight: 12,
      fontSize: 16,
      color: "#20252B",
    },

    pickerOptionTextSelected: {
      fontWeight: "800",
    },

    selectedIndicator: {
      fontSize: 17,
      fontWeight: "800",
      color: "#15803D",
    },
  });