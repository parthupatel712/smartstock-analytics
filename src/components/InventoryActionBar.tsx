import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useState,
} from "react";

interface InventoryActionBarProps {
  onDashboard:
    () => void;

  onReorder:
    () => void;

  onStockHistory:
    () => void;

  onAnalytics:
    () => void;

  onScanBarcode:
    () => void;

  onAddProductManually:
    () => void;

  onImport:
    () => void;

  onExport:
    () => void;
}

export function InventoryActionBar({
  onDashboard,
  onReorder,
  onStockHistory,
  onAnalytics,
  onScanBarcode,
  onAddProductManually,
  onImport,
  onExport,
}: InventoryActionBarProps) {
  const [
    isAddProductMenuVisible,
    setIsAddProductMenuVisible,
  ] =
    useState(
      false,
    );

  function closeAddProductMenu():
    void {
    setIsAddProductMenuVisible(
      false,
    );
  }

  function handleScanBarcode():
    void {
    closeAddProductMenu();

    onScanBarcode();
  }

  function handleManualEntry():
    void {
    closeAddProductMenu();

    onAddProductManually();
  }

  return (
    <>
      <View
        style={
          styles.wrapper
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.actionMenu
          }
        >
          <ActionItem
            label="Dashboard"
            onPress={
              onDashboard
            }
          />

          <ActionItem
            label="Reorder"
            onPress={
              onReorder
            }
          />

          <ActionItem
            label="Stock History"
            onPress={
              onStockHistory
            }
          />

          <ActionItem
            label="Analytics"
            onPress={
              onAnalytics
            }
          />

          <ActionItem
            label="Add Product"
            onPress={() =>
              setIsAddProductMenuVisible(
                true,
              )
            }
          />

          <ActionItem
            label="Import"
            onPress={
              onImport
            }
          />

          <ActionItem
            label="Export Reports"
            onPress={
              onExport
            }
          />
        </ScrollView>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={
          isAddProductMenuVisible
        }
        onRequestClose={
          closeAddProductMenu
        }
      >
        <Pressable
          onPress={
            closeAddProductMenu
          }
          style={
            styles.modalBackdrop
          }
        >
          <Pressable
            onPress={() => {
              // Prevent closing when
              // pressing inside the sheet.
            }}
            style={
              styles.modalContent
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalHeaderText
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Add Product
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Choose how you want to add the product.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close add product menu"
                hitSlop={
                  10
                }
                onPress={
                  closeAddProductMenu
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

            <ProductEntryOption
              title="Scan Barcode"
              description="Use the camera to scan a product barcode."
              onPress={
                handleScanBarcode
              }
            />

            <ProductEntryOption
              title="Enter Manually"
              description="Enter the barcode and product details yourself."
              onPress={
                handleManualEntry
              }
            />

            <Pressable
              accessibilityRole="button"
              onPress={
                closeAddProductMenu
              }
              style={({
                pressed,
              }) => [
                styles.cancelButton,

                pressed &&
                  styles.buttonPressed,
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
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

interface ActionItemProps {
  label:
    string;

  onPress:
    () => void;
}

function ActionItem({
  label,
  onPress,
}: ActionItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.actionItem,

        pressed &&
          styles.actionItemPressed,
      ]}
    >
      <Text
        style={
          styles.actionItemText
        }
      >
        {
          label
        }
      </Text>
    </Pressable>
  );
}

interface ProductEntryOptionProps {
  title:
    string;

  description:
    string;

  onPress:
    () => void;
}

function ProductEntryOption({
  title,
  description,
  onPress,
}: ProductEntryOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.productEntryOption,

        pressed &&
          styles.productEntryOptionPressed,
      ]}
    >
      <View
        style={
          styles.productEntryText
        }
      >
        <Text
          style={
            styles.productEntryTitle
          }
        >
          {
            title
          }
        </Text>

        <Text
          style={
            styles.productEntryDescription
          }
        >
          {
            description
          }
        </Text>
      </View>

      <Text
        style={
          styles.chevron
        }
      >
        ›
      </Text>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    wrapper: {
      marginTop:
        18,

      marginHorizontal:
        -16,

      backgroundColor:
        "#FFFFFF",
    },

    actionMenu: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        8,
    },

    actionItem: {
      minHeight:
        54,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        20,

      backgroundColor:
        "#FFFFFF",
    },

    actionItemPressed: {
      backgroundColor:
        "#EEF1F3",
    },

    actionItemText: {
      fontSize:
        13,

      fontWeight:
        "800",

      letterSpacing:
        0.3,

      color:
        "#7A858B",
    },

    modalBackdrop: {
      flex:
        1,

      justifyContent:
        "flex-end",

      backgroundColor:
        "rgba(0, 0, 0, 0.38)",
    },

    modalContent: {
      borderTopLeftRadius:
        22,

      borderTopRightRadius:
        22,

      paddingHorizontal:
        18,

      paddingTop:
        18,

      paddingBottom:
        30,

      backgroundColor:
        "#FFFFFF",
    },

    modalHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      marginBottom:
        16,
    },

    modalHeaderText: {
      flex:
        1,

      marginRight:
        14,
    },

    modalTitle: {
      fontSize:
        23,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    modalSubtitle: {
      marginTop:
        5,

      fontSize:
        13,

      lineHeight:
        19,

      color:
        "#6B7280",
    },

    modalCloseButton: {
      paddingHorizontal:
        8,

      paddingVertical:
        7,
    },

    modalCloseText: {
      fontSize:
        14,

      fontWeight:
        "700",

      color:
        "#20252B",
    },

    productEntryOption: {
      minHeight:
        76,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        15,

      paddingHorizontal:
        15,

      paddingVertical:
        13,

      marginBottom:
        10,

      backgroundColor:
        "#FFFFFF",
    },

    productEntryOptionPressed: {
      backgroundColor:
        "#F8FAFC",
    },

    productEntryText: {
      flex:
        1,

      marginRight:
        12,
    },

    productEntryTitle: {
      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    productEntryDescription: {
      marginTop:
        4,

      fontSize:
        12,

      lineHeight:
        17,

      color:
        "#6B7280",
    },

    chevron: {
      fontSize:
        27,

      color:
        "#9CA3AF",
    },

    cancelButton: {
      minHeight:
        46,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        4,

      borderRadius:
        12,

      backgroundColor:
        "#F3F4F6",
    },

    cancelButtonText: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#374151",
    },

    buttonPressed: {
      opacity:
        0.7,
    },
  });