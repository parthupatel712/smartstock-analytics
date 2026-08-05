import { useState } from "react";
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

import type {
  ProductFormErrors,
  ProductFormValues,
} from "../types/productForm";
import { validateProductForm } from "../utils/validateProductForm";

interface ProductFormProps {
  onSubmit: (values: ProductFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const INITIAL_VALUES: ProductFormValues = {
  barcode: "",
  name: "",
  category: "",
  unitCost: "",
  unitPrice: "",
  currentStock: "0",
  reorderLevel: "5",
};

export function ProductForm({
  onSubmit,
  isSubmitting = false,
}: ProductFormProps) {
  const [values, setValues] =
    useState<ProductFormValues>(INITIAL_VALUES);

  const [errors, setErrors] =
    useState<ProductFormErrors>({});

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
          Enter the product details below. Barcode scanning will be
          added in a later feature.
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
          placeholder="Example: Sparkling Water"
          error={errors.name}
        />

        <FormField
          label="Category"
          value={values.category}
          onChangeText={(value) =>
            updateField("category", value)
          }
          placeholder="Example: Beverages"
          error={errors.category}
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
  error?: string;
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
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
        autoCapitalize="none"
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