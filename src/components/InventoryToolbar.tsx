import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  PRODUCT_DEPARTMENTS,
  type ProductDepartment,
} from "../constants/productTaxonomy";
import type {
  InventoryFilterState,
  InventorySortOption,
} from "../types/inventoryFilter";

interface InventoryToolbarProps {
  filters: InventoryFilterState;
  resultCount: number;
  totalCount: number;
  onFiltersChange: (
    filters: InventoryFilterState,
  ) => void;
  onClearFilters: () => void;
}

type PickerType =
  | "department"
  | "sort"
  | null;

interface SortOption {
  value: InventorySortOption;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  {
    value: "name-asc",
    label: "Name: A to Z",
  },
  {
    value: "name-desc",
    label: "Name: Z to A",
  },
  {
    value: "stock-asc",
    label: "Stock: Low to High",
  },
  {
    value: "stock-desc",
    label: "Stock: High to Low",
  },
  {
    value: "price-asc",
    label: "Price: Low to High",
  },
  {
    value: "price-desc",
    label: "Price: High to Low",
  },
];

export function InventoryToolbar({
  filters,
  resultCount,
  totalCount,
  onFiltersChange,
  onClearFilters,
}: InventoryToolbarProps) {
  const [activePicker, setActivePicker] =
    useState<PickerType>(null);

  const selectedSortLabel = useMemo(() => {
    return (
      SORT_OPTIONS.find(
        (option) =>
          option.value === filters.sortBy,
      )?.label ?? "Sort products"
    );
  }, [filters.sortBy]);

  const hasActiveFilters =
    filters.searchQuery.trim() !== "" ||
    filters.department !== "all" ||
    filters.lowStockOnly ||
    filters.sortBy !== "name-asc";

  function updateFilters(
    changes: Partial<InventoryFilterState>,
  ): void {
    onFiltersChange({
      ...filters,
      ...changes,
    });
  }

  function selectDepartment(
    department:
      | ProductDepartment
      | "all",
  ): void {
    updateFilters({ department });
    setActivePicker(null);
  }

  function selectSort(
    sortBy: InventorySortOption,
  ): void {
    updateFilters({ sortBy });
    setActivePicker(null);
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={filters.searchQuery}
        onChangeText={(searchQuery) =>
          updateFilters({ searchQuery })
        }
        placeholder="Search name, brand, or barcode"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
        style={styles.searchInput}
      />

      <View style={styles.resultRow}>
        <Text style={styles.resultText}>
          Showing {resultCount} of {totalCount} products
        </Text>

        {hasActiveFilters ? (
          <Pressable
            accessibilityRole="button"
            onPress={onClearFilters}
            style={({ pressed }) => [
              styles.clearButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Text style={styles.clearButtonText}>
              Clear filters
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            setActivePicker("department")
          }
          style={({ pressed }) => [
            styles.filterButton,
            filters.department !== "all" &&
              styles.activeFilterButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.filterButtonText,
              filters.department !== "all" &&
                styles.activeFilterButtonText,
            ]}
          >
            {filters.department === "all"
              ? "All departments"
              : filters.department}
          </Text>

          <Text
            style={[
              styles.filterChevron,
              filters.department !== "all" &&
                styles.activeFilterButtonText,
            ]}
          >
            ⌄
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            setActivePicker("sort")
          }
          style={({ pressed }) => [
            styles.filterButton,
            filters.sortBy !== "name-asc" &&
              styles.activeFilterButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.filterButtonText,
              filters.sortBy !== "name-asc" &&
                styles.activeFilterButtonText,
            ]}
          >
            {selectedSortLabel}
          </Text>

          <Text
            style={[
              styles.filterChevron,
              filters.sortBy !== "name-asc" &&
                styles.activeFilterButtonText,
            ]}
          >
            ⌄
          </Text>
        </Pressable>
      </View>

      <View style={styles.lowStockRow}>
        <View style={styles.lowStockTextContainer}>
          <Text style={styles.lowStockTitle}>
            Low-stock products only
          </Text>

          <Text style={styles.lowStockDescription}>
            Show products at or below their reorder level
          </Text>
        </View>

        <Switch
          value={filters.lowStockOnly}
          onValueChange={(lowStockOnly) =>
            updateFilters({ lowStockOnly })
          }
        />
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={activePicker !== null}
        onRequestClose={() =>
          setActivePicker(null)
        }
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activePicker === "department"
                  ? "Select department"
                  : "Sort inventory"}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setActivePicker(null)
                }
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>
                  Close
                </Text>
              </Pressable>
            </View>

            <ScrollView>
              {activePicker === "department" ? (
                <>
                  <PickerOption
                    label="All departments"
                    selected={
                      filters.department === "all"
                    }
                    onPress={() =>
                      selectDepartment("all")
                    }
                  />

                  {PRODUCT_DEPARTMENTS.map(
                    (department) => (
                      <PickerOption
                        key={department}
                        label={department}
                        selected={
                          filters.department ===
                          department
                        }
                        onPress={() =>
                          selectDepartment(
                            department,
                          )
                        }
                      />
                    ),
                  )}
                </>
              ) : (
                SORT_OPTIONS.map((option) => (
                  <PickerOption
                    key={option.value}
                    label={option.label}
                    selected={
                      filters.sortBy ===
                      option.value
                    }
                    onPress={() =>
                      selectSort(option.value)
                    }
                  />
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
        selected &&
          styles.pickerOptionSelected,
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
        <Text style={styles.selectedIndicator}>
          ✓
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E0E4E8",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#CBD2DA",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: "#F8FAFC",
  },
  resultRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultText: {
    flex: 1,
    marginRight: 12,
    fontSize: 13,
    color: "#5D6673",
  },
  clearButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#20252B",
  },
  filterRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  filterButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#CBD2DA",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  activeFilterButton: {
    borderColor: "#20252B",
    backgroundColor: "#20252B",
  },
  filterButtonText: {
    flex: 1,
    marginRight: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#20252B",
  },
  activeFilterButtonText: {
    color: "#FFFFFF",
  },
  filterChevron: {
    fontSize: 18,
    color: "#5D6673",
  },
  lowStockRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
  },
  lowStockTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  lowStockTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#20252B",
  },
  lowStockDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: "#6B7280",
  },
  buttonPressed: {
    opacity: 0.72,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  modalContent: {
    maxHeight: "72%",
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
    color: "#111827",
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
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  pickerOptionSelected: {
    backgroundColor: "#F1F5F9",
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