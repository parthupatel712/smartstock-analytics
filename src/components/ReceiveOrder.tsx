import {
  Ionicons,
} from "@expo/vector-icons";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import type {
  ImportDocument,
} from "../types/importDocument";

import type {
  PurchaseOrderWithItems,
} from "../types/purchaseOrder";

interface ReceiveOrderProps {
  purchaseOrder:
    PurchaseOrderWithItems;

  isProcessing:
    boolean;

  onTakePhoto:
    () => void;

  onChooseImage:
    () => void;

  onChooseFile:
    () => void;

  onManualReview:
    () => void;

  onClose:
    () => void;
}

export function ReceiveOrder({
  purchaseOrder,
  isProcessing,
  onTakePhoto,
  onChooseImage,
  onChooseFile,
  onManualReview,
  onClose,
}: ReceiveOrderProps) {
  const {
    order,
    items,
  } =
    purchaseOrder;

  const totalUnits =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.quantity,
      0,
    );

  function showImportOptions():
    void {
    if (
      isProcessing
    ) {
      return;
    }

    Alert.alert(
      "Import Invoice",
      "Choose where the invoice or delivery document is stored.",
      [
        {
          text:
            "Photo Library",

          onPress:
            onChooseImage,
        },

        {
          text:
            "PDF / Excel / File",

          onPress:
            onChooseFile,
        },

        {
          text:
            "Cancel",

          style:
            "cancel",
        },
      ],
    );
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
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.headerText
            }
          >
            <Text
              style={
                styles.title
              }
            >
              Receive Order
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Scan or import the vendor invoice, then verify what actually arrived.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            hitSlop={
              8
            }
            disabled={
              isProcessing
            }
            onPress={
              onClose
            }
            style={({
              pressed,
            }) => [
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
              Close
            </Text>
          </Pressable>
        </View>

        <View
          style={
            styles.orderCard
          }
        >
          <View
            style={
              styles.orderTop
            }
          >
            <View
              style={
                styles.orderIcon
              }
            >
              <Ionicons
                name="cube-outline"
                size={
                  22
                }
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.orderIdentity
              }
            >
              <Text
                style={
                  styles.orderLabel
                }
              >
                PURCHASE ORDER
              </Text>

              <Text
                style={
                  styles.orderNumber
                }
              >
                {
                  order.orderNumber
                }
              </Text>

              <Text
                style={
                  styles.vendorName
                }
              >
                {
                  order.vendorName
                }
              </Text>
            </View>

            <View
              style={
                styles.statusBadge
              }
            >
              <Text
                style={
                  styles.statusText
                }
              >
                {
                  order.status ===
                  "partially_received"
                    ? "Partial"
                    : "Ordered"
                }
              </Text>
            </View>
          </View>

          <View
            style={
              styles.summaryRow
            }
          >
            <SummaryValue
              label="Products"
              value={
                items.length.toString()
              }
            />

            <SummaryValue
              label="Ordered Units"
              value={
                totalUnits.toString()
              }
            />

            <SummaryValue
              label="PO Total"
              value={
                formatCurrency(
                  order.total,
                )
              }
              right
            />
          </View>
        </View>

        <View
          style={
            styles.infoCard
          }
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={
              20
            }
            color="#15803D"
          />

          <View
            style={
              styles.infoText
            }
          >
            <Text
              style={
                styles.infoTitle
              }
            >
              Inventory remains unchanged
            </Text>

            <Text
              style={
                styles.infoDescription
              }
            >
              SmartStock will first read and compare the delivery against this purchase order. Stock changes happen only after your final confirmation.
            </Text>
          </View>
        </View>

        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            How did you receive the invoice?
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            Choose the fastest option available. All methods lead to the same review process.
          </Text>
        </View>

        <ReceiveMethod
          title="Scan Invoice"
          description="Take a clear photo of the invoice or delivery slip."
          icon="camera-outline"
          primary
          disabled={
            isProcessing
          }
          onPress={
            onTakePhoto
          }
        />

        <ReceiveMethod
          title="Import Invoice"
          description="Choose a photo, PDF, Excel sheet, or another supported document."
          icon="document-attach-outline"
          disabled={
            isProcessing
          }
          onPress={
            showImportOptions
          }
        />

        <ReceiveMethod
          title="Manual Review"
          description="No invoice available? Review the ordered products and enter what arrived manually."
          icon="create-outline"
          disabled={
            isProcessing
          }
          onPress={
            onManualReview
          }
        />

        {isProcessing ? (
          <View
            style={
              styles.processingCard
            }
          >
            <ActivityIndicator
              size="small"
              color="#2563EB"
            />

            <View
              style={
                styles.processingText
              }
            >
              <Text
                style={
                  styles.processingTitle
                }
              >
                Preparing invoice…
              </Text>

              <Text
                style={
                  styles.processingDescription
                }
              >
                Reading the selected document and preparing the review screen.
              </Text>
            </View>
          </View>
        ) : null}

        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Expected Products
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            These are the products SmartStock will compare against the invoice.
          </Text>
        </View>

        {items.map(
          (
            item,
          ) => (
            <View
              key={
                item.id
              }
              style={
                styles.productCard
              }
            >
              <View
                style={
                  styles.productTop
                }
              >
                <View
                  style={
                    styles.productIdentity
                  }
                >
                  <Text
                    style={
                      styles.productName
                    }
                    numberOfLines={
                      2
                    }
                  >
                    {
                      item.productName
                    }
                  </Text>

                  {item.brand.trim() ? (
                    <Text
                      style={
                        styles.productBrand
                      }
                    >
                      {
                        item.brand
                      }
                    </Text>
                  ) : null}

                  <Text
                    style={
                      styles.barcode
                    }
                  >
                    Barcode:{" "}
                    {item.barcode.trim()
                      ? item.barcode
                      : "Not available"}
                  </Text>
                </View>

                <View
                  style={
                    styles.quantityBadge
                  }
                >
                  <Text
                    style={
                      styles.quantityBadgeLabel
                    }
                  >
                    Expected
                  </Text>

                  <Text
                    style={
                      styles.quantityBadgeValue
                    }
                  >
                    {
                      item.quantity
                    }
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.productFooter
                }
              >
                <Text
                  style={
                    styles.productCostLabel
                  }
                >
                  Ordered unit cost
                </Text>

                <Text
                  style={
                    styles.productCost
                  }
                >
                  {
                    formatCurrency(
                      item.unitCost,
                    )
                  }
                </Text>
              </View>
            </View>
          ),
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ReceiveMethod({
  title,
  description,
  icon,
  primary =
    false,
  disabled,
  onPress,
}: {
  title:
    string;

  description:
    string;

  icon:
    | "camera-outline"
    | "document-attach-outline"
    | "create-outline";

  primary?:
    boolean;

  disabled:
    boolean;

  onPress:
    () => void;
}) {
  return (
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
        styles.methodCard,

        primary &&
          styles.methodCardPrimary,

        pressed &&
          styles.methodCardPressed,

        disabled &&
          styles.disabled,
      ]}
    >
      <View
        style={[
          styles.methodIcon,

          primary &&
            styles.methodIconPrimary,
        ]}
      >
        <Ionicons
          name={
            icon
          }
          size={
            23
          }
          color={
            primary
              ? "#FFFFFF"
              : "#52606D"
          }
        />
      </View>

      <View
        style={
          styles.methodText
        }
      >
        <Text
          style={
            styles.methodTitle
          }
        >
          {
            title
          }
        </Text>

        <Text
          style={
            styles.methodDescription
          }
        >
          {
            description
          }
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={
          20
        }
        color="#94A3B8"
      />
    </Pressable>
  );
}

function SummaryValue({
  label,
  value,
  right =
    false,
}: {
  label:
    string;

  value:
    string;

  right?:
    boolean;
}) {
  return (
    <View
      style={[
        styles.summaryValue,

        right &&
          styles.summaryValueRight,
      ]}
    >
      <Text
        style={
          styles.summaryLabel
        }
      >
        {
          label
        }
      </Text>

      <Text
        style={
          styles.summaryNumber
        }
        numberOfLines={
          1
        }
        adjustsFontSizeToFit
      >
        {
          value
        }
      </Text>
    </View>
  );
}

const currencyFormatter =
  new Intl.NumberFormat(
    "en-CA",
    {
      style:
        "currency",

      currency:
        "CAD",

      maximumFractionDigits:
        2,
    },
  );

function formatCurrency(
  value:
    number,
): string {
  return currencyFormatter.format(
    value,
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

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    headerText: {
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
        5,

      maxWidth:
        320,

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
        0.72,
    },

    orderCard: {
      marginTop:
        22,

      borderWidth:
        1,

      borderColor:
        "#BFDBFE",

      borderRadius:
        17,

      padding:
        15,

      backgroundColor:
        "#FFFFFF",
    },

    orderTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,
    },

    orderIcon: {
      width:
        44,

      height:
        44,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        14,

      backgroundColor:
        "#EFF6FF",
    },

    orderIdentity: {
      flex:
        1,

      minWidth:
        0,
    },

    orderLabel: {
      fontSize:
        8,

      fontWeight:
        "800",

      color:
        "#94A3B8",
    },

    orderNumber: {
      marginTop:
        2,

      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    vendorName: {
      marginTop:
        2,

      fontSize:
        10,

      color:
        "#64748B",
    },

    statusBadge: {
      borderRadius:
        999,

      paddingHorizontal:
        9,

      paddingVertical:
        5,

      backgroundColor:
        "#FFF7ED",
    },

    statusText: {
      fontSize:
        9,

      fontWeight:
        "800",

      color:
        "#B45309",
    },

    summaryRow: {
      marginTop:
        14,

      flexDirection:
        "row",

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        12,

      gap:
        8,
    },

    summaryValue: {
      flex:
        1,
    },

    summaryValueRight: {
      alignItems:
        "flex-end",
    },

    summaryLabel: {
      fontSize:
        8,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#94A3B8",
    },

    summaryNumber: {
      marginTop:
        3,

      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    infoCard: {
      marginTop:
        14,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        9,

      borderWidth:
        1,

      borderColor:
        "#BBF7D0",

      borderRadius:
        13,

      padding:
        12,

      backgroundColor:
        "#F7FEFA",
    },

    infoText: {
      flex:
        1,
    },

    infoTitle: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#166534",
    },

    infoDescription: {
      marginTop:
        3,

      fontSize:
        9,

      lineHeight:
        15,

      color:
        "#4B6B55",
    },

    sectionHeader: {
      marginTop:
        26,

      marginBottom:
        11,
    },

    sectionTitle: {
      fontSize:
        17,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    sectionSubtitle: {
      marginTop:
        4,

      fontSize:
        11,

      lineHeight:
        16,

      color:
        "#6B7280",
    },

    methodCard: {
      marginBottom:
        10,

      minHeight:
        78,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        11,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        15,

      padding:
        12,

      backgroundColor:
        "#FFFFFF",
    },

    methodCardPrimary: {
      borderColor:
        "#BFDBFE",
    },

    methodCardPressed: {
      backgroundColor:
        "#F8FAFC",
    },

    methodIcon: {
      width:
        44,

      height:
        44,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        14,

      backgroundColor:
        "#F1F5F9",
    },

    methodIconPrimary: {
      backgroundColor:
        "#20252B",
    },

    methodText: {
      flex:
        1,

      minWidth:
        0,
    },

    methodTitle: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    methodDescription: {
      marginTop:
        3,

      fontSize:
        9,

      lineHeight:
        14,

      color:
        "#64748B",
    },

    disabled: {
      opacity:
        0.5,
    },

    processingCard: {
      marginTop:
        4,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

      borderRadius:
        12,

      padding:
        12,

      backgroundColor:
        "#EFF6FF",
    },

    processingText: {
      flex:
        1,
    },

    processingTitle: {
      fontSize:
        10,

      fontWeight:
        "800",

      color:
        "#1D4ED8",
    },

    processingDescription: {
      marginTop:
        2,

      fontSize:
        9,

      lineHeight:
        14,

      color:
        "#64748B",
    },

    productCard: {
      marginBottom:
        10,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        15,

      padding:
        13,

      backgroundColor:
        "#FFFFFF",
    },

    productTop: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        10,
    },

    productIdentity: {
      flex:
        1,

      minWidth:
        0,
    },

    productName: {
      fontSize:
        13,

      lineHeight:
        18,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    productBrand: {
      marginTop:
        3,

      fontSize:
        9,

      color:
        "#64748B",
    },

    barcode: {
      marginTop:
        4,

      fontSize:
        8,

      color:
        "#94A3B8",
    },

    quantityBadge: {
      minWidth:
        61,

      alignItems:
        "center",

      borderRadius:
        10,

      paddingHorizontal:
        9,

      paddingVertical:
        6,

      backgroundColor:
        "#F1F5F9",
    },

    quantityBadgeLabel: {
      fontSize:
        7,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#94A3B8",
    },

    quantityBadgeValue: {
      marginTop:
        2,

      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    productFooter: {
      marginTop:
        10,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        9,
    },

    productCostLabel: {
      fontSize:
        8,

      color:
        "#94A3B8",
    },

    productCost: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#20252B",
    },
  });