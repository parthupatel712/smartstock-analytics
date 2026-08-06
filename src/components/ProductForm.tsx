import { useMemo, useState } from "react";
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
  getCategoriesForDepartment,
  PRODUCT_DEPARTMENTS,
  type ProductDepartment,
} from "../constants/productTaxonomy";
import type {
  ProductFormErrors,
  ProductFormValues,
} from "../types/productForm";
import { validateProductForm } from "../utils/validateProductForm";

interface ProductFormProps {
  onSubmit: (values: ProductFormValues) => Promise<void>;
  isSubmitting?: boolean;
  initialBarcode?: string;
}

type PickerType = "department" | "category" | null;

const INITIAL_VALUES: ProductFormValues = {
  barcode: "",
  name: "",
  department: "",
  category: "",
  brand: "",
  unitCost: "",
  unitPrice: "",
  currentStock: "0",
  reorderLevel: "5",
};

export function ProductForm({
  onSubmit,
  isSubmitting = false,
  initialBarcode = "",
}: ProductFormProps) {
  const [values, setValues] =
    useState<ProductFormValues>({
      ...INITIAL_VALUES,
      barcode: initialBarcode,
    });

  const [errors, setErrors] =
    useState<ProductFormErrors>({});

  const [activePicker, setActivePicker] =
    useState<PickerType>(null);

  const availableCategories = useMemo(() => {
    if (!values.department) {
      return [];
    }

    return getCategoriesForDepartment(
      values.department as ProductDepartment,
    );
  }, [values.department]);

  function updateField(
    field: keyof ProductFormValues,
    value: string,
  ): void {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  function selectDepartment(
    department: ProductDepartment,
  ): void {
    setValues((currentValues) => ({
      ...currentValues,
      department,
      category: "",
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      department: undefined,
      category: undefined,
    }));

    setActivePicker(null);
  }

  function selectCategory(category: string): void {
    updateField("category", category);
    setActivePicker(null);
  }

  async function handleSubmit(): Promise<void> {
    const validation = validateProductForm(values);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await onSubmit(values);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add Product</Text>

        <Text style={styles.description}>
          Enter the remaining product details below.
        </Text>

        <FormField
          label="Barcode"
          value={values.barcode}
          onChangeText={(value) =>
            updateField("barcode", value)
          }
          placeholder="Example: 012345678905"
          keyboardType="number-pad"
          error={errors.barcode}
        />

        <FormField
          label="Product name"
          value={values.name}
          onChangeText={(value) =>
            updateField("name", value)
          }
          placeholder="Example: Coca-Cola Zero 355 mL"
          error={errors.name}
          autoCapitalize="words"
        />

        <DropdownField
          label="Department"
          value={values.department}
          placeholder="Select a department"
          error={errors.department}
          onPress={() => setActivePicker("department")}
        />

        <DropdownField
          label="Category"
          value={values.category}
          placeholder={
            values.department
              ? "Select a category"
              : "Select department first"
          }
          error={errors.category}
          disabled={!values.department}
          onPress={() => setActivePicker("category")}
        />

        <FormField
          label="Brand"
          value={values.brand}
          onChangeText={(value) =>
            updateField("brand", value)
          }
          placeholder="Example: Coca-Cola"
          error={errors.brand}
          autoCapitalize="words"
        />

        <FormField
          label="Unit cost"
          value={values.unitCost}
          onChangeText={(value) =>
            updateField("unitCost", value)
          }
          placeholder="0.00"
          keyboardType="decimal-pad"
          error={errors.unitCost}
        />

        <FormField
          label="Unit price"
          value={values.unitPrice}
          onChangeText={(value) =>
            updateField("unitPrice", value)
          }
          placeholder="0.00"
          keyboardType="decimal-pad"
          error={errors.unitPrice}
        />

        <FormField
          label="Opening stock"
          value={values.currentStock}
          onChangeText={(value) =>
            updateField("currentStock", value)
          }
          placeholder="0"
          keyboardType="number-pad"
          error={errors.currentStock}
        />

        <FormField
          label="Reorder level"
          value={values.reorderLevel}
          onChangeText={(value) =>
            updateField("reorderLevel", value)
          }
          placeholder="5"
          keyboardType="number-pad"
          error={errors.reorderLevel}
        />

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => void handleSubmit()}
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
            isSubmitting && styles.submitButtonDisabled,
          ]}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Saving product…" : "Save product"}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={activePicker !== null}
        onRequestClose={() => setActivePicker(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activePicker === "department"
                  ? "Select department"
                  : "Select category"}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => setActivePicker(null)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>
                  Close
                </Text>
              </Pressable>
            </View>

            <ScrollView>
              {activePicker === "department"
                ? PRODUCT_DEPARTMENTS.map((department) => {
                    const isSelected =
                      values.department === department;

                    return (
                      <PickerOption
                        key={department}
                        label={department}
                        selected={isSelected}
                        onPress={() =>
                          selectDepartment(department)
                        }
                      />
                    );
                  })
                : availableCategories.map((category) => {
                    const isSelected =
                      values.category === category;

                    return (
                      <PickerOption
                        key={category}
                        label={category}
                        selected={isSelected}
                        onPress={() =>
                          selectCategory(category)
                        }
                      />
                    );
                  })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: React.ComponentProps<
    typeof TextInput
  >["keyboardType"];
  autoCapitalize?: React.ComponentProps<
    typeof TextInput
  >["autoCapitalize"];
  error?: string;
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
}: FormFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          error && styles.inputError,
        ]}
      />

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

interface DropdownFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  error?: string;
  disabled?: boolean;
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
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.dropdownButton,
          disabled && styles.dropdownButtonDisabled,
          error && styles.inputError,
        ]}
      >
        <Text
          style={[
            styles.dropdownText,
            !value && styles.dropdownPlaceholder,
            disabled && styles.dropdownTextDisabled,
          ]}
        >
          {value || placeholder}
        </Text>

        <Text style={styles.dropdownIcon}>⌄</Text>
      </Pressable>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
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
      style={[
        styles.pickerOption,
        selected && styles.pickerOptionSelected,
      ]}
    >
      <Text
        style={[
          styles.pickerOptionText,
          selected && styles.pickerOptionTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
  },
  description: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 15,
    lineHeight: 22,
    color: "#5D6673",
  },
  fieldContainer: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 7,
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#C8CED6",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#B42318",
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: "#B42318",
  },
  dropdownButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#C8CED6",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  dropdownButtonDisabled: {
    backgroundColor: "#ECEFF3",
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: "#20252B",
  },
  dropdownPlaceholder: {
    color: "#8B949E",
  },
  dropdownTextDisabled: {
    color: "#9AA3AD",
  },
  dropdownIcon: {
    marginLeft: 12,
    fontSize: 22,
    color: "#5D6673",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  modalContent: {
    maxHeight: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  modalCloseButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#20252B",
  },
  pickerOption: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  pickerOptionSelected: {
    backgroundColor: "#F1F5F9",
  },
  pickerOptionText: {
    fontSize: 16,
    color: "#20252B",
  },
  pickerOptionTextSelected: {
    fontWeight: "800",
  },
  submitButton: {
    marginTop: 8,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#20252B",
  },
  submitButtonPressed: {
    opacity: 0.85,
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});