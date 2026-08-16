import {
  useMemo,
  useState,
} from "react";

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
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  PRODUCT_DEPARTMENTS,
  type ProductDepartment,
} from "../constants/productTaxonomy";

import type {
  InventoryFilterState,
  InventorySortOption,
} from "../types/inventoryFilter";

interface InventoryToolbarProps {
  filters:
    InventoryFilterState;

  resultCount:
    number;

  totalCount:
    number;

  onFiltersChange: (
    filters:
      InventoryFilterState,
  ) => void;

  onClearFilters:
    () => void;
}

type PickerType =
  | "department"
  | "sort"
  | null;

interface SortOption {
  value:
    InventorySortOption;

  label:
    string;
}

const SORT_OPTIONS:
  SortOption[] = [
    {
      value:
        "name-asc",

      label:
        "Name · A to Z",
    },

    {
      value:
        "name-desc",

      label:
        "Name · Z to A",
    },

    {
      value:
        "stock-asc",

      label:
        "Stock · Low to High",
    },

    {
      value:
        "stock-desc",

      label:
        "Stock · High to Low",
    },

    {
      value:
        "price-asc",

      label:
        "Price · Low to High",
    },

    {
      value:
        "price-desc",

      label:
        "Price · High to Low",
    },
  ];

export function InventoryToolbar({
  filters,
  resultCount,
  totalCount,
  onFiltersChange,
  onClearFilters,
}: InventoryToolbarProps) {
  const [
    activePicker,
    setActivePicker,
  ] =
    useState<PickerType>(
      null,
    );

  const selectedSortLabel =
    useMemo(
      () =>
        SORT_OPTIONS.find(
          (
            option,
          ) =>
            option.value ===
            filters.sortBy,
        )?.label ??
        "Sort",

      [
        filters.sortBy,
      ],
    );

  const hasActiveFilters =
    filters.searchQuery.trim() !==
      "" ||
    filters.department !==
      "all" ||
    filters.lowStockOnly ||
    filters.sortBy !==
      "name-asc";

  function updateFilters(
    changes:
      Partial<InventoryFilterState>,
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
    updateFilters({
      department,
    });

    setActivePicker(
      null,
    );
  }

  function selectSort(
    sortBy:
      InventorySortOption,
  ): void {
    updateFilters({
      sortBy,
    });

    setActivePicker(
      null,
    );
  }

  return (
    <View
      style={
        styles.container
      }
    >
      <TextInput
        value={
          filters.searchQuery
        }
        onChangeText={(
          searchQuery,
        ) =>
          updateFilters({
            searchQuery,
          })
        }
        placeholder="Search products, brands, or barcodes"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={
          false
        }
        clearButtonMode="while-editing"
        returnKeyType="search"
        style={
          styles.searchInput
        }
      />

      <View
        style={
          styles.resultRow
        }
      >
        <Text
          style={
            styles.resultText
          }
          numberOfLines={
            1
          }
        >
          {resultCount ===
          totalCount
            ? `${totalCount} product${
                totalCount ===
                1
                  ? ""
                  : "s"
              }`
            : `${resultCount} of ${totalCount} products`}
        </Text>

        {hasActiveFilters ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={
              8
            }
            onPress={
              onClearFilters
            }
            style={({
              pressed,
            }) => [
              styles.clearButton,

              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Text
              style={
                styles.clearButtonText
              }
            >
              Reset
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View
        style={
          styles.filterRow
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            selected:
              filters.department !==
              "all",
          }}
          onPress={() =>
            setActivePicker(
              "department",
            )
          }
          style={({
            pressed,
          }) => [
            styles.filterButton,

            filters.department !==
              "all" &&
              styles.activeFilterButton,

            pressed &&
              styles.buttonPressed,
          ]}
        >
          <Text
            numberOfLines={
              1
            }
            style={[
              styles.filterButtonText,

              filters.department !==
                "all" &&
                styles.activeFilterButtonText,
            ]}
          >
            {filters.department ===
            "all"
              ? "Department"
              : filters.department}
          </Text>

          <Text
            style={[
              styles.filterChevron,

              filters.department !==
                "all" &&
                styles.activeFilterButtonText,
            ]}
          >
            ›
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            selected:
              filters.sortBy !==
              "name-asc",
          }}
          onPress={() =>
            setActivePicker(
              "sort",
            )
          }
          style={({
            pressed,
          }) => [
            styles.filterButton,

            filters.sortBy !==
              "name-asc" &&
              styles.activeFilterButton,

            pressed &&
              styles.buttonPressed,
          ]}
        >
          <Text
            numberOfLines={
              1
            }
            style={[
              styles.filterButtonText,

              filters.sortBy !==
                "name-asc" &&
                styles.activeFilterButtonText,
            ]}
          >
            {filters.sortBy ===
            "name-asc"
              ? "Sort"
              : selectedSortLabel}
          </Text>

          <Text
            style={[
              styles.filterChevron,

              filters.sortBy !==
                "name-asc" &&
                styles.activeFilterButtonText,
            ]}
          >
            ›
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.lowStockRow,

          filters.lowStockOnly &&
            styles.lowStockRowActive,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            selected:
              filters.lowStockOnly,
          }}
          onPress={() =>
            updateFilters({
              lowStockOnly:
                !filters.lowStockOnly,
            })
          }
          style={
            styles.lowStockTextContainer
          }
        >
          <Text
            style={
              styles.lowStockTitle
            }
          >
            Low Stock Only
          </Text>

          <Text
            style={
              styles.lowStockDescription
            }
          >
            Products at or below their reorder level
          </Text>
        </Pressable>

        <Switch
          value={
            filters.lowStockOnly
          }
          onValueChange={(
            lowStockOnly,
          ) =>
            updateFilters({
              lowStockOnly,
            })
          }
        />
      </View>

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
                    ? "Department"
                    : "Sort Inventory"}
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
                "department" ? (
                  <>
                    <PickerOption
                      label="All Departments"
                      selected={
                        filters.department ===
                        "all"
                      }
                      onPress={() =>
                        selectDepartment(
                          "all",
                        )
                      }
                    />

                    {PRODUCT_DEPARTMENTS.map(
                      (
                        department,
                      ) => (
                        <PickerOption
                          key={
                            department
                          }
                          label={
                            department
                          }
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
                  SORT_OPTIONS.map(
                    (
                      option,
                    ) => (
                      <PickerOption
                        key={
                          option.value
                        }
                        label={
                          option.label
                        }
                        selected={
                          filters.sortBy ===
                          option.value
                        }
                        onPress={() =>
                          selectSort(
                            option.value,
                          )
                        }
                      />
                    ),
                  )
                )}
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
        numberOfLines={
          2
        }
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
    container: {
      marginBottom:
        18,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        16,

      padding:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    searchInput: {
      minHeight:
        48,

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        12,

      paddingHorizontal:
        14,

      fontSize:
        15,

      color:
        "#111827",

      backgroundColor:
        "#F8FAFC",
    },

    resultRow: {
      marginTop:
        11,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    resultText: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        12,

      fontSize:
        12,

      fontWeight:
        "600",

      color:
        "#6B7280",
    },

    clearButton: {
      flexShrink:
        0,

      paddingHorizontal:
        6,

      paddingVertical:
        6,
    },

    clearButtonText: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#2563EB",
    },

    filterRow: {
      marginTop:
        12,

      flexDirection:
        "row",

      gap:
        10,
    },

    filterButton: {
      flex:
        1,

      minWidth:
        0,

      minHeight:
        44,

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
        11,

      paddingHorizontal:
        12,

      backgroundColor:
        "#FFFFFF",
    },

    activeFilterButton: {
      borderColor:
        "#20252B",

      backgroundColor:
        "#20252B",
    },

    filterButtonText: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        7,

      fontSize:
        12,

      fontWeight:
        "700",

      color:
        "#374151",
    },

    activeFilterButtonText: {
      color:
        "#FFFFFF",
    },

    filterChevron: {
      flexShrink:
        0,

      fontSize:
        20,

      color:
        "#6B7280",
    },

    lowStockRow: {
      marginTop:
        12,

      minHeight:
        62,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "transparent",

      borderRadius:
        12,

      paddingHorizontal:
        12,

      paddingVertical:
        9,

      backgroundColor:
        "#F8FAFC",
    },

    lowStockRowActive: {
      borderColor:
        "#FDE68A",

      backgroundColor:
        "#FFFBEB",
    },

    lowStockTextContainer: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        10,
    },

    lowStockTitle: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    lowStockDescription: {
      marginTop:
        3,

      fontSize:
        11,

      lineHeight:
        16,

      color:
        "#6B7280",
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
        15,

      lineHeight:
        20,

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