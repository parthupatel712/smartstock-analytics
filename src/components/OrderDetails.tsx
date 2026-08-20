import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useState,
} from "react";

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

import {
  exportPurchaseOrderExcel,
} from "../services/excelExportService";

import {
  exportPurchaseOrderPdf,
} from "../services/pdfExportService";

import {
  shareExportedReport,
} from "../services/reportSharingService";

import type {
  PurchaseOrderStatus,
  PurchaseOrderWithItems,
} from "../types/purchaseOrder";

interface OrderDetailsProps {
  purchaseOrder:
    PurchaseOrderWithItems;

  onReceiveOrder?:
    () => void;

  onClose:
    () => void;
}

type OrderExportType =
  | "pdf"
  | "xlsx"
  | null;

export function OrderDetails({
  purchaseOrder,
  onReceiveOrder,
  onClose,
}: OrderDetailsProps) {
  const {
    order,
    items,
  } =
    purchaseOrder;

  const [
    exporting,
    setExporting,
  ] =
    useState<OrderExportType>(
      null,
    );

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

  const totalReceivedUnits =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.receivedQuantity,
      0,
    );

  const totalMissingUnits =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        Math.max(
          item.quantity -
            item.receivedQuantity,
          0,
        ),
      0,
    );

  const receivedSubtotal =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.receivedQuantity *
          item.unitCost,
      0,
    );

  const notReceivedValue =
    items.reduce(
      (
        total,
        item,
      ) => {
        const missingQuantity =
          Math.max(
            item.quantity -
              item.receivedQuantity,
            0,
          );

        return (
          total +
          missingQuantity *
            item.unitCost
        );
      },
      0,
    );

  /*
   * Until actual invoice tax is stored
   * separately, received tax is estimated
   * proportionally from the original PO.
   */
  const receivedTax =
    order.subtotal >
    0
      ? order.tax *
        (
          receivedSubtotal /
          order.subtotal
        )
      : 0;

  const receivedTotal =
    receivedSubtotal +
    receivedTax;

  const isReceived =
    order.status ===
    "received";

  const isFullyReceived =
    isReceived &&
    totalMissingUnits ===
      0;

  const isReceivedWithShortage =
    isReceived &&
    totalMissingUnits >
      0;

  const isReceivingAvailable =
    (
      order.status ===
        "ordered" ||
      order.status ===
        "partially_received"
    ) &&
    Boolean(
      onReceiveOrder,
    );

  const statusDisplay =
    getStatusDisplay(
      order.status,
    );

  async function exportPdf():
    Promise<void> {
    if (
      exporting
    ) {
      return;
    }

    try {
      setExporting(
        "pdf",
      );

      const report =
        await exportPurchaseOrderPdf(
          purchaseOrder,
        );

      await shareExportedReport(
        report,
      );
    } catch (
      error
    ) {
      console.error(
        "Could not export purchase order PDF:",
        error,
      );

      Alert.alert(
        "PDF export failed",
        error instanceof Error
          ? error.message
          : "The purchase order PDF could not be generated.",
      );
    } finally {
      setExporting(
        null,
      );
    }
  }

  async function exportExcel():
    Promise<void> {
    if (
      exporting
    ) {
      return;
    }

    try {
      setExporting(
        "xlsx",
      );

      const report =
        await exportPurchaseOrderExcel(
          purchaseOrder,
        );

      await shareExportedReport(
        report,
      );
    } catch (
      error
    ) {
      console.error(
        "Could not export purchase order Excel file:",
        error,
      );

      Alert.alert(
        "Excel export failed",
        error instanceof Error
          ? error.message
          : "The purchase order spreadsheet could not be generated.",
      );
    } finally {
      setExporting(
        null,
      );
    }
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
              Order Details
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Review, receive, export, or share this purchase order.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            hitSlop={
              8
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
            styles.orderHeaderCard
          }
        >
          <View
            style={
              styles.orderNumberRow
            }
          >
            <View
              style={
                styles.orderNumberContainer
              }
            >
              <Text
                style={
                  styles.orderNumberLabel
                }
              >
                Purchase Order
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
            </View>

            <View
              style={[
                styles.statusBadge,

                {
                  backgroundColor:
                    statusDisplay.background,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,

                  {
                    color:
                      statusDisplay.color,
                  },
                ]}
              >
                {
                  statusDisplay.label
                }
              </Text>
            </View>
          </View>

          <View
            style={
              styles.vendorSection
            }
          >
            <View
              style={
                styles.vendorIcon
              }
            >
              <Ionicons
                name="business-outline"
                size={
                  20
                }
                color="#52606D"
              />
            </View>

            <View
              style={
                styles.vendorTextContainer
              }
            >
              <Text
                style={
                  styles.detailLabel
                }
              >
                Vendor / Supplier
              </Text>

              <Text
                style={
                  styles.vendorName
                }
              >
                {order.vendorName.trim()
                  ? order.vendorName
                  : "Not specified"}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={
            styles.infoGrid
          }
        >
          <InfoCard
            label="Products"
            value={
              items.length.toString()
            }
            icon="cube-outline"
          />

          <InfoCard
            label="Ordered Units"
            value={
              totalUnits.toString()
            }
            icon="layers-outline"
          />

          {isReceived ? (
            <>
              <InfoCard
                label="Received Units"
                value={
                  totalReceivedUnits.toString()
                }
                icon="checkmark-circle-outline"
              />

              <InfoCard
                label="Missing Units"
                value={
                  totalMissingUnits.toString()
                }
                icon="warning-outline"
              />
            </>
          ) : null}

          <InfoCard
            label="Created"
            value={
              formatDate(
                order.createdAt,
              )
            }
            icon="calendar-outline"
            compact
          />

          <InfoCard
            label={
              isReceived
                ? "Received"
                : "Ordered"
            }
            value={
              formatDate(
                isReceived
                  ? order.receivedAt
                  : order.orderedAt,
              )
            }
            icon="time-outline"
            compact
          />
        </View>

        {isReceivingAvailable ? (
          <Pressable
            accessibilityRole="button"
            onPress={
              onReceiveOrder
            }
            style={({
              pressed,
            }) => [
              styles.receiveButton,

              pressed &&
                styles.receiveButtonPressed,
            ]}
          >
            <Ionicons
              name="cube-outline"
              size={
                19
              }
              color="#FFFFFF"
            />

            <View
              style={
                styles.receiveButtonTextContainer
              }
            >
              <Text
                style={
                  styles.receiveButtonTitle
                }
              >
                Receive Order
              </Text>

              <Text
                style={
                  styles.receiveButtonSubtitle
                }
              >
                Scan invoice, upload a file, or review delivery manually.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={
                19
              }
              color="#FFFFFF"
            />
          </Pressable>
        ) : null}

        {isFullyReceived ? (
          <View
            style={
              styles.completedBanner
            }
          >
            <Ionicons
              name="checkmark-circle"
              size={
                25
              }
              color="#15803D"
            />

            <View
              style={
                styles.completedBannerContent
              }
            >
              <Text
                style={
                  styles.completedBannerTitle
                }
              >
                Fully Received
              </Text>

              <Text
                style={
                  styles.completedBannerText
                }
              >
                All {totalUnits} ordered units were delivered and recorded in inventory.
              </Text>
            </View>
          </View>
        ) : null}

        {isReceivedWithShortage ? (
          <View
            style={
              styles.shortageBanner
            }
          >
            <Ionicons
              name="checkmark-circle"
              size={
                25
              }
              color="#15803D"
            />

            <View
              style={
                styles.completedBannerContent
              }
            >
              <Text
                style={
                  styles.completedBannerTitle
                }
              >
                Received
              </Text>

              <Text
                style={
                  styles.completedBannerText
                }
              >
                {totalReceivedUnits} of {totalUnits} units were received.
              </Text>

              <View
                style={
                  styles.shortageBannerWarning
                }
              >
                <Ionicons
                  name="warning-outline"
                  size={
                    14
                  }
                  color="#B45309"
                />

                <Text
                  style={
                    styles.shortageBannerWarningText
                  }
                >
                  {totalMissingUnits}{" "}
                  {totalMissingUnits ===
                  1
                    ? "unit was"
                    : "units were"} not delivered.
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <View
          style={
            styles.exportCard
          }
        >
          <View
            style={
              styles.exportHeader
            }
          >
            <View
              style={
                styles.exportIcon
              }
            >
              <Ionicons
                name="share-outline"
                size={
                  20
                }
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.exportHeaderText
              }
            >
              <Text
                style={
                  styles.exportTitle
                }
              >
                Export & Share
              </Text>

              <Text
                style={
                  styles.exportSubtitle
                }
              >
                Generate this purchase order again anytime and share it through Mail, Messages, Files, or another app.
              </Text>
            </View>
          </View>

          <View
            style={
              styles.exportButtons
            }
          >
            <Pressable
              accessibilityRole="button"
              disabled={
                exporting !==
                null
              }
              onPress={() =>
                void exportPdf()
              }
              style={({
                pressed,
              }) => [
                styles.pdfButton,

                pressed &&
                  styles.exportButtonPressed,

                exporting !==
                  null &&
                  styles.exportButtonDisabled,
              ]}
            >
              {exporting ===
              "pdf" ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Ionicons
                  name="document-text-outline"
                  size={
                    18
                  }
                  color="#FFFFFF"
                />
              )}

              <Text
                style={
                  styles.pdfButtonText
                }
              >
                {exporting ===
                "pdf"
                  ? "Creating PDF…"
                  : "PDF / Share"}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={
                exporting !==
                null
              }
              onPress={() =>
                void exportExcel()
              }
              style={({
                pressed,
              }) => [
                styles.excelButton,

                pressed &&
                  styles.exportButtonPressed,

                exporting !==
                  null &&
                  styles.exportButtonDisabled,
              ]}
            >
              {exporting ===
              "xlsx" ? (
                <ActivityIndicator
                  size="small"
                  color="#15803D"
                />
              ) : (
                <Ionicons
                  name="grid-outline"
                  size={
                    18
                  }
                  color="#15803D"
                />
              )}

              <Text
                style={
                  styles.excelButtonText
                }
              >
                {exporting ===
                "xlsx"
                  ? "Creating Excel…"
                  : "Excel / Share"}
              </Text>
            </Pressable>
          </View>
        </View>

        {order.notes.trim() ? (
          <View
            style={
              styles.notesCard
            }
          >
            <View
              style={
                styles.notesHeader
              }
            >
              <Ionicons
                name="document-text-outline"
                size={
                  17
                }
                color="#52606D"
              />

              <Text
                style={
                  styles.notesTitle
                }
              >
                Order Notes
              </Text>
            </View>

            <Text
              style={
                styles.notesText
              }
            >
              {
                order.notes
              }
            </Text>
          </View>
        ) : null}

        {isReceived ? (
          <View
            style={
              styles.deliverySummaryCard
            }
          >
            <View
              style={
                styles.deliverySummaryHeader
              }
            >
              <View
                style={
                  styles.deliverySummaryIcon
                }
              >
                <Ionicons
                  name={
                    isFullyReceived
                      ? "checkmark-done-outline"
                      : "receipt-outline"
                  }
                  size={
                    21
                  }
                  color="#15803D"
                />
              </View>

              <View
                style={
                  styles.deliverySummaryHeaderText
                }
              >
                <Text
                  style={
                    styles.deliverySummaryTitle
                  }
                >
                  {isFullyReceived
                    ? "Full Delivery"
                    : "Delivery Summary"}
                </Text>

                <Text
                  style={
                    styles.deliverySummarySubtitle
                  }
                >
                  {isFullyReceived
                    ? "Everything ordered was physically received."
                    : "The order is complete, with missing quantities preserved in history."}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.deliverySummaryStats
              }
            >
              <ReceivingValue
                label="Ordered"
                value={
                  totalUnits
                }
              />

              <ReceivingValue
                label="Received"
                value={
                  totalReceivedUnits
                }
                success
              />

              <ReceivingValue
                label="Missing"
                value={
                  totalMissingUnits
                }
                warning={
                  totalMissingUnits >
                  0
                }
              />
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
            Products
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            Product details are preserved as a snapshot from when this purchase order was created.
          </Text>
        </View>

        {items.map(
          (
            item,
          ) => {
            const missingQuantity =
              Math.max(
                item.quantity -
                  item.receivedQuantity,
                0,
              );

            const receivedLineValue =
              item.receivedQuantity *
              item.unitCost;

            const wasNotDelivered =
              isReceived &&
              item.receivedQuantity ===
                0 &&
              item.quantity >
                0;

            const wasPartiallyDelivered =
              isReceived &&
              item.receivedQuantity >
                0 &&
              missingQuantity >
                0;

            const wasFullyDelivered =
              isReceived &&
              missingQuantity ===
                0;

            return (
              <View
                key={
                  item.id
                }
                style={[
                  styles.productCard,

                  isReceived &&
                    missingQuantity >
                      0 &&
                    styles.productCardMissing,
                ]}
              >
                <View
                  style={
                    styles.productHeader
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
                  </View>

                  {wasFullyDelivered ? (
                    <View
                      style={
                        styles.deliveredBadge
                      }
                    >
                      <Ionicons
                        name="checkmark"
                        size={
                          13
                        }
                        color="#15803D"
                      />

                      <Text
                        style={
                          styles.deliveredBadgeText
                        }
                      >
                        Received
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={
                        styles.quantityBadge
                      }
                    >
                      <Text
                        style={
                          styles.quantityBadgeText
                        }
                      >
                        Qty{" "}
                        {
                          item.quantity
                        }
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  style={
                    styles.productClassification
                  }
                  numberOfLines={
                    2
                  }
                >
                  {[
                    item.department,
                    item.category,
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(
                      " · ",
                    )}
                </Text>

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

                {isReceived ? (
                  <View
                    style={
                      styles.receivingSummary
                    }
                  >
                    <ReceivingValue
                      label="Ordered"
                      value={
                        item.quantity
                      }
                    />

                    <ReceivingValue
                      label="Received"
                      value={
                        item.receivedQuantity
                      }
                      success={
                        item.receivedQuantity >
                        0
                      }
                    />

                    <ReceivingValue
                      label="Missing"
                      value={
                        missingQuantity
                      }
                      warning={
                        missingQuantity >
                        0
                      }
                    />
                  </View>
                ) : null}

                {wasNotDelivered ? (
                  <View
                    style={
                      styles.notDeliveredCard
                    }
                  >
                    <Ionicons
                      name="warning-outline"
                      size={
                        16
                      }
                      color="#B45309"
                    />

                    <View
                      style={
                        styles.deliveryWarningContent
                      }
                    >
                      <Text
                        style={
                          styles.deliveryWarningTitle
                        }
                      >
                        Not Delivered
                      </Text>

                      <Text
                        style={
                          styles.notDeliveredText
                        }
                      >
                        0 of {item.quantity} units were received. Inventory stock was left unchanged.
                      </Text>
                    </View>
                  </View>
                ) : null}

                {wasPartiallyDelivered ? (
                  <View
                    style={
                      styles.partiallyDeliveredCard
                    }
                  >
                    <Ionicons
                      name="warning-outline"
                      size={
                        16
                      }
                      color="#B45309"
                    />

                    <View
                      style={
                        styles.deliveryWarningContent
                      }
                    >
                      <Text
                        style={
                          styles.deliveryWarningTitle
                        }
                      >
                        Partially Delivered
                      </Text>

                      <Text
                        style={
                          styles.notDeliveredText
                        }
                      >
                        {item.receivedQuantity} of {item.quantity} units were received. {missingQuantity}{" "}
                        {missingQuantity ===
                        1
                          ? "unit was"
                          : "units were"} missing.
                      </Text>
                    </View>
                  </View>
                ) : null}

                <View
                  style={
                    styles.productPricing
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.priceLabel
                      }
                    >
                      Unit Cost
                    </Text>

                    <Text
                      style={
                        styles.priceValue
                      }
                    >
                      {
                        formatCurrency(
                          item.unitCost,
                        )
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.calculationContainer
                    }
                  >
                    {isReceived ? (
                      <>
                        <Text
                          style={
                            styles.calculation
                          }
                        >
                          Received{" "}
                          {
                            item.receivedQuantity
                          }{" "}
                          ×{" "}
                          {
                            formatCurrency(
                              item.unitCost,
                            )
                          }
                        </Text>

                        <Text
                          style={[
                            styles.lineTotal,

                            item.receivedQuantity ===
                              0 &&
                              styles.zeroLineTotal,
                          ]}
                        >
                          {
                            formatCurrency(
                              receivedLineValue,
                            )
                          }
                        </Text>

                        <Text
                          style={
                            styles.originalLineTotal
                          }
                        >
                          Ordered value:{" "}
                          {
                            formatCurrency(
                              item.lineTotal,
                            )
                          }
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text
                          style={
                            styles.calculation
                          }
                        >
                          {formatCurrency(
                            item.unitCost,
                          )}{" "}
                          ×{" "}
                          {
                            item.quantity
                          }
                        </Text>

                        <Text
                          style={
                            styles.lineTotal
                          }
                        >
                          {
                            formatCurrency(
                              item.lineTotal,
                            )
                          }
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          },
        )}

        <View
          style={
            styles.totalCard
          }
        >
          {isReceived ? (
            <>
              <View
                style={
                  styles.totalSectionTitleRow
                }
              >
                <Text
                  style={
                    styles.totalSectionTitle
                  }
                >
                  Delivery Financial Summary
                </Text>
              </View>

              <View
                style={
                  styles.totalRow
                }
              >
                <Text
                  style={
                    styles.totalLabel
                  }
                >
                  Original Subtotal
                </Text>

                <Text
                  style={
                    styles.totalValue
                  }
                >
                  {
                    formatCurrency(
                      order.subtotal,
                    )
                  }
                </Text>
              </View>

              <View
                style={
                  styles.totalRow
                }
              >
                <Text
                  style={
                    styles.totalLabel
                  }
                >
                  Received Merchandise
                </Text>

                <Text
                  style={
                    styles.receivedValue
                  }
                >
                  {
                    formatCurrency(
                      receivedSubtotal,
                    )
                  }
                </Text>
              </View>

              <View
                style={
                  styles.totalRow
                }
              >
                <Text
                  style={[
                    styles.totalLabel,

                    totalMissingUnits >
                      0 &&
                      styles.notReceivedTotalLabel,
                  ]}
                >
                  Not Received Value
                </Text>

                <Text
                  style={[
                    styles.totalValue,

                    totalMissingUnits >
                      0 &&
                      styles.notReceivedTotalValue,
                  ]}
                >
                  {
                    formatCurrency(
                      notReceivedValue,
                    )
                  }
                </Text>
              </View>

              <View
                style={
                  styles.totalRow
                }
              >
                <Text
                  style={
                    styles.totalLabel
                  }
                >
                  Estimated Received Tax
                </Text>

                <Text
                  style={
                    styles.totalValue
                  }
                >
                  {
                    formatCurrency(
                      receivedTax,
                    )
                  }
                </Text>
              </View>

              <View
                style={
                  styles.originalOrderTotalRow
                }
              >
                <Text
                  style={
                    styles.originalOrderTotalLabel
                  }
                >
                  Original Order Total
                </Text>

                <Text
                  style={
                    styles.originalOrderTotalValue
                  }
                >
                  {
                    formatCurrency(
                      order.total,
                    )
                  }
                </Text>
              </View>

              <View
                style={
                  styles.totalDivider
                }
              />

              <View
                style={
                  styles.finalTotalRow
                }
              >
                <Text
                  style={
                    styles.finalTotalLabel
                  }
                >
                  Received Total
                </Text>

                <Text
                  style={
                    styles.finalTotalValue
                  }
                >
                  {
                    formatCurrency(
                      receivedTotal,
                    )
                  }
                </Text>
              </View>

              {totalMissingUnits >
              0 ? (
                <View
                  style={
                    styles.shortageSummary
                  }
                >
                  <Ionicons
                    name="warning-outline"
                    size={
                      17
                    }
                    color="#B45309"
                  />

                  <Text
                    style={
                      styles.shortageSummaryText
                    }
                  >
                    {totalMissingUnits}{" "}
                    {totalMissingUnits ===
                    1
                      ? "unit was"
                      : "units were"} not received. Missing merchandise has been excluded from the received total.
                  </Text>
                </View>
              ) : (
                <View
                  style={
                    styles.fullDeliverySummary
                  }
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={
                      17
                    }
                    color="#15803D"
                  />

                  <Text
                    style={
                      styles.fullDeliverySummaryText
                    }
                  >
                    Full delivery received. No merchandise value is missing.
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <View
                style={
                  styles.totalRow
                }
              >
                <Text
                  style={
                    styles.totalLabel
                  }
                >
                  Subtotal
                </Text>

                <Text
                  style={
                    styles.totalValue
                  }
                >
                  {
                    formatCurrency(
                      order.subtotal,
                    )
                  }
                </Text>
              </View>

              <View
                style={
                  styles.totalRow
                }
              >
                <Text
                  style={
                    styles.totalLabel
                  }
                >
                  Tax
                </Text>

                <Text
                  style={
                    styles.totalValue
                  }
                >
                  {
                    formatCurrency(
                      order.tax,
                    )
                  }
                </Text>
              </View>

              <View
                style={
                  styles.totalDivider
                }
              />

              <View
                style={
                  styles.finalTotalRow
                }
              >
                <Text
                  style={
                    styles.finalTotalLabel
                  }
                >
                  Order Total
                </Text>

                <Text
                  style={
                    styles.finalTotalValue
                  }
                >
                  {
                    formatCurrency(
                      order.total,
                    )
                  }
                </Text>
              </View>
            </>
          )}
        </View>

        {order.status ===
        "ordered" ? (
          <View
            style={
              styles.pendingCard
            }
          >
            <Ionicons
              name="cube-outline"
              size={
                18
              }
              color="#B45309"
            />

            <View
              style={
                styles.pendingTextContainer
              }
            >
              <Text
                style={
                  styles.pendingTitle
                }
              >
                Waiting to be received
              </Text>

              <Text
                style={
                  styles.pendingText
                }
              >
                This purchase order has been placed, but its quantities have not been added to physical inventory yet.
              </Text>
            </View>
          </View>
        ) : null}

        {order.status ===
        "partially_received" ? (
          <View
            style={
              styles.partialCard
            }
          >
            <Ionicons
              name="time-outline"
              size={
                18
              }
              color="#2563EB"
            />

            <View
              style={
                styles.pendingTextContainer
              }
            >
              <Text
                style={
                  styles.partialTitle
                }
              >
                Order partially received
              </Text>

              <Text
                style={
                  styles.partialText
                }
              >
                Some quantities have been received, but this purchase order still has outstanding merchandise.
              </Text>
            </View>
          </View>
        ) : null}

        {isFullyReceived ? (
          <View
            style={
              styles.receivedCard
            }
          >
            <Ionicons
              name="checkmark-circle"
              size={
                20
              }
              color="#15803D"
            />

            <View
              style={
                styles.pendingTextContainer
              }
            >
              <Text
                style={
                  styles.receivedTitle
                }
              >
                Fully Received
              </Text>

              <Text
                style={
                  styles.receivedText
                }
              >
                Every ordered quantity was received and added to inventory.
              </Text>
            </View>
          </View>
        ) : null}

        {isReceivedWithShortage ? (
          <View
            style={
              styles.receivedWithShortageCard
            }
          >
            <Ionicons
              name="checkmark-circle"
              size={
                20
              }
              color="#15803D"
            />

            <View
              style={
                styles.pendingTextContainer
              }
            >
              <Text
                style={
                  styles.receivedTitle
                }
              >
                Receiving Completed
              </Text>

              <Text
                style={
                  styles.receivedText
                }
              >
                Received quantities were added to inventory. Missing quantities remain recorded in this purchase order history.
              </Text>

              <View
                style={
                  styles.receivedMissingFooter
                }
              >
                <Ionicons
                  name="warning-outline"
                  size={
                    14
                  }
                  color="#B45309"
                />

                <Text
                  style={
                    styles.receivedMissingFooterText
                  }
                >
                  {totalMissingUnits}{" "}
                  {totalMissingUnits ===
                  1
                    ? "unit was"
                    : "units were"} missing from the delivery.
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCard({
  label,
  value,
  icon,
  compact =
    false,
}: {
  label:
    string;

  value:
    string;

  icon:
    | "cube-outline"
    | "layers-outline"
    | "calendar-outline"
    | "time-outline"
    | "checkmark-circle-outline"
    | "warning-outline";

  compact?:
    boolean;
}) {
  return (
    <View
      style={
        styles.infoCard
      }
    >
      <Ionicons
        name={
          icon
        }
        size={
          18
        }
        color="#52606D"
      />

      <Text
        style={
          styles.infoCardLabel
        }
      >
        {
          label
        }
      </Text>

      <Text
        style={[
          styles.infoCardValue,

          compact &&
            styles.infoCardValueCompact,
        ]}
        numberOfLines={
          1
        }
        adjustsFontSizeToFit
        minimumFontScale={
          0.7
        }
      >
        {
          value
        }
      </Text>
    </View>
  );
}

function ReceivingValue({
  label,
  value,
  success =
    false,
  warning =
    false,
}: {
  label:
    string;

  value:
    number;

  success?:
    boolean;

  warning?:
    boolean;
}) {
  return (
    <View
      style={
        styles.receivingValue
      }
    >
      <Text
        style={
          styles.receivingLabel
        }
      >
        {
          label
        }
      </Text>

      <Text
        style={[
          styles.receivingNumber,

          success &&
            styles.receivingNumberSuccess,

          warning &&
            styles.receivingNumberWarning,
        ]}
      >
        {
          value
        }
      </Text>
    </View>
  );
}

function getStatusDisplay(
  status:
    PurchaseOrderStatus,
): {
  label:
    string;

  color:
    string;

  background:
    string;
} {
  switch (
    status
  ) {
    case "draft":
      return {
        label:
          "Draft",

        color:
          "#2563EB",

        background:
          "#EFF6FF",
      };

    case "ordered":
      return {
        label:
          "Ordered",

        color:
          "#B45309",

        background:
          "#FFF7ED",
      };

    case "partially_received":
      return {
        label:
          "Partially Received",

        color:
          "#2563EB",

        background:
          "#EFF6FF",
      };

    case "received":
      return {
        label:
          "Received",

        color:
          "#15803D",

        background:
          "#ECFDF3",
      };

    case "cancelled":
      return {
        label:
          "Cancelled",

        color:
          "#B42318",

        background:
          "#FFF1F0",
      };

    default:
      return {
        label:
          "Unknown",

        color:
          "#52606D",

        background:
          "#F1F5F9",
      };
  }
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

function formatDate(
  value:
    string | null,
): string {
  if (
    !value
  ) {
    return "—";
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-CA",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    },
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

    orderHeaderCard: {
      marginTop:
        22,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        17,

      padding:
        16,

      backgroundColor:
        "#FFFFFF",
    },

    orderNumberRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        12,
    },

    orderNumberContainer: {
      flex:
        1,

      minWidth:
        0,
    },

    orderNumberLabel: {
      fontSize:
        9,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      letterSpacing:
        0.4,

      color:
        "#8B949E",
    },

    orderNumber: {
      marginTop:
        4,

      fontSize:
        19,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    statusBadge: {
      flexShrink:
        0,

      borderRadius:
        999,

      paddingHorizontal:
        10,

      paddingVertical:
        6,
    },

    statusText: {
      fontSize:
        10,

      fontWeight:
        "800",

      textTransform:
        "uppercase",
    },

    vendorSection: {
      marginTop:
        16,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        14,
    },

    vendorIcon: {
      width:
        40,

      height:
        40,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        20,

      backgroundColor:
        "#F1F5F9",
    },

    vendorTextContainer: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        10,
    },

    detailLabel: {
      fontSize:
        9,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#8B949E",
    },

    vendorName: {
      marginTop:
        3,

      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    infoGrid: {
      marginTop:
        14,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        10,
    },

    infoCard: {
      width:
        "48%",

      minHeight:
        91,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        14,

      padding:
        12,

      backgroundColor:
        "#FFFFFF",
    },

    infoCardLabel: {
      marginTop:
        7,

      fontSize:
        9,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#8B949E",
    },

    infoCardValue: {
      marginTop:
        3,

      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    infoCardValueCompact: {
      fontSize:
        13,
    },

    receiveButton: {
      marginTop:
        14,

      minHeight:
        62,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

      borderRadius:
        15,

      paddingHorizontal:
        14,

      paddingVertical:
        10,

      backgroundColor:
        "#20252B",
    },

    receiveButtonPressed: {
      backgroundColor:
        "#111827",
    },

    receiveButtonTextContainer: {
      flex:
        1,

      minWidth:
        0,
    },

    receiveButtonTitle: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    receiveButtonSubtitle: {
      marginTop:
        2,

      fontSize:
        9,

      lineHeight:
        14,

      color:
        "#CBD5E1",
    },

    completedBanner: {
      marginTop:
        14,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

      borderWidth:
        1,

      borderColor:
        "#BBF7D0",

      borderRadius:
        15,

      padding:
        13,

      backgroundColor:
        "#F7FEFA",
    },

    shortageBanner: {
      marginTop:
        14,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        10,

      borderWidth:
        1,

      borderColor:
        "#FDE68A",

      borderRadius:
        15,

      padding:
        13,

      backgroundColor:
        "#FFFBEB",
    },

    completedBannerContent: {
      flex:
        1,

      minWidth:
        0,
    },

    completedBannerTitle: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    completedBannerText: {
      marginTop:
        2,

      fontSize:
        10,

      lineHeight:
        15,

      color:
        "#52606D",
    },

    shortageBannerWarning: {
      marginTop:
        6,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,
    },

    shortageBannerWarningText: {
      flex:
        1,

      fontSize:
        10,

      fontWeight:
        "700",

      color:
        "#B45309",
    },

    exportCard: {
      marginTop:
        14,

      borderWidth:
        1,

      borderColor:
        "#BFDBFE",

      borderRadius:
        16,

      padding:
        14,

      backgroundColor:
        "#F8FBFF",
    },

    exportHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    exportIcon: {
      width:
        40,

      height:
        40,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        20,

      backgroundColor:
        "#EFF6FF",
    },

    exportHeaderText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        10,
    },

    exportTitle: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    exportSubtitle: {
      marginTop:
        3,

      fontSize:
        10,

      lineHeight:
        15,

      color:
        "#64748B",
    },

    exportButtons: {
      marginTop:
        13,

      flexDirection:
        "row",

      gap:
        9,
    },

    pdfButton: {
      flex:
        1,

      minHeight:
        44,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        6,

      borderRadius:
        11,

      backgroundColor:
        "#20252B",
    },

    pdfButtonText: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    excelButton: {
      flex:
        1,

      minHeight:
        44,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        6,

      borderWidth:
        1,

      borderColor:
        "#BBF7D0",

      borderRadius:
        11,

      backgroundColor:
        "#ECFDF3",
    },

    excelButtonText: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    exportButtonPressed: {
      opacity:
        0.75,
    },

    exportButtonDisabled: {
      opacity:
        0.55,
    },

    notesCard: {
      marginTop:
        14,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        14,

      padding:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    notesHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        6,
    },

    notesTitle: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    notesText: {
      marginTop:
        8,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#52606D",
    },

    deliverySummaryCard: {
      marginTop:
        14,

      borderWidth:
        1,

      borderColor:
        "#BBF7D0",

      borderRadius:
        16,

      padding:
        14,

      backgroundColor:
        "#F7FEFA",
    },

    deliverySummaryHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        9,
    },

    deliverySummaryIcon: {
      width:
        40,

      height:
        40,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        20,

      backgroundColor:
        "#ECFDF3",
    },

    deliverySummaryHeaderText: {
      flex:
        1,

      minWidth:
        0,
    },

    deliverySummaryTitle: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    deliverySummarySubtitle: {
      marginTop:
        2,

      fontSize:
        9,

      lineHeight:
        14,

      color:
        "#64748B",
    },

    deliverySummaryStats: {
      marginTop:
        12,

      flexDirection:
        "row",

      gap:
        8,
    },

    sectionHeader: {
      marginTop:
        26,

      marginBottom:
        12,
    },

    sectionTitle: {
      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    sectionSubtitle: {
      marginTop:
        4,

      maxWidth:
        340,

      fontSize:
        11,

      lineHeight:
        16,

      color:
        "#6B7280",
    },

    productCard: {
      marginBottom:
        12,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        16,

      padding:
        15,

      backgroundColor:
        "#FFFFFF",
    },

    productCardMissing: {
      borderColor:
        "#FDE68A",

      backgroundColor:
        "#FFFEFA",
    },

    productHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

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
        16,

      lineHeight:
        21,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    productBrand: {
      marginTop:
        3,

      fontSize:
        11,

      fontWeight:
        "600",

      color:
        "#6B7280",
    },

    quantityBadge: {
      flexShrink:
        0,

      borderRadius:
        999,

      paddingHorizontal:
        9,

      paddingVertical:
        5,

      backgroundColor:
        "#F1F5F9",
    },

    quantityBadgeText: {
      fontSize:
        10,

      fontWeight:
        "800",

      color:
        "#52606D",
    },

    deliveredBadge: {
      flexShrink:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        3,

      borderRadius:
        999,

      paddingHorizontal:
        9,

      paddingVertical:
        5,

      backgroundColor:
        "#ECFDF3",
    },

    deliveredBadgeText: {
      fontSize:
        9,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    productClassification: {
      marginTop:
        9,

      fontSize:
        11,

      color:
        "#64748B",
    },

    barcode: {
      marginTop:
        4,

      fontSize:
        10,

      color:
        "#8B949E",
    },

    receivingSummary: {
      marginTop:
        11,

      flexDirection:
        "row",

      gap:
        8,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        11,
    },

    receivingValue: {
      flex:
        1,

      minWidth:
        0,

      borderRadius:
        10,

      padding:
        9,

      backgroundColor:
        "#F8FAFC",
    },

    receivingLabel: {
      fontSize:
        8,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#94A3B8",
    },

    receivingNumber: {
      marginTop:
        3,

      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    receivingNumberSuccess: {
      color:
        "#15803D",
    },

    receivingNumberWarning: {
      color:
        "#B42318",
    },

    notDeliveredCard: {
      marginTop:
        10,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        7,

      borderWidth:
        1,

      borderColor:
        "#FDE68A",

      borderRadius:
        10,

      padding:
        9,

      backgroundColor:
        "#FFFBEB",
    },

    partiallyDeliveredCard: {
      marginTop:
        10,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        7,

      borderWidth:
        1,

      borderColor:
        "#FDE68A",

      borderRadius:
        10,

      padding:
        9,

      backgroundColor:
        "#FFFBEB",
    },

    deliveryWarningContent: {
      flex:
        1,
    },

    deliveryWarningTitle: {
      fontSize:
        10,

      fontWeight:
        "800",

      color:
        "#92400E",
    },

    notDeliveredText: {
      marginTop:
        2,

      fontSize:
        9,

      lineHeight:
        14,

      color:
        "#92400E",
    },

    productPricing: {
      marginTop:
        13,

      flexDirection:
        "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-between",

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        11,
    },

    priceLabel: {
      fontSize:
        9,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#8B949E",
    },

    priceValue: {
      marginTop:
        3,

      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    calculationContainer: {
      alignItems:
        "flex-end",
    },

    calculation: {
      fontSize:
        9,

      color:
        "#8B949E",
    },

    lineTotal: {
      marginTop:
        3,

      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    zeroLineTotal: {
      color:
        "#B42318",
    },

    originalLineTotal: {
      marginTop:
        3,

      fontSize:
        8,

      color:
        "#94A3B8",
    },

    totalCard: {
      marginTop:
        6,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        16,

      padding:
        16,

      backgroundColor:
        "#FFFFFF",
    },

    totalSectionTitleRow: {
      marginBottom:
        14,
    },

    totalSectionTitle: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    totalRow: {
      marginBottom:
        10,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        10,
    },

    totalLabel: {
      flex:
        1,

      fontSize:
        13,

      color:
        "#64748B",
    },

    totalValue: {
      fontSize:
        14,

      fontWeight:
        "700",

      color:
        "#20252B",
    },

    receivedValue: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    notReceivedTotalLabel: {
      color:
        "#B42318",
    },

    notReceivedTotalValue: {
      color:
        "#B42318",
    },

    originalOrderTotalRow: {
      marginTop:
        2,

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
        10,
    },

    originalOrderTotalLabel: {
      fontSize:
        11,

      color:
        "#94A3B8",
    },

    originalOrderTotalValue: {
      fontSize:
        12,

      fontWeight:
        "700",

      color:
        "#64748B",
    },

    totalDivider: {
      height:
        1,

      marginTop:
        12,

      marginBottom:
        13,

      backgroundColor:
        "#E5E7EB",
    },

    finalTotalRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    finalTotalLabel: {
      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    finalTotalValue: {
      fontSize:
        21,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    shortageSummary: {
      marginTop:
        14,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        7,

      borderWidth:
        1,

      borderColor:
        "#FDE68A",

      borderRadius:
        11,

      padding:
        10,

      backgroundColor:
        "#FFFBEB",
    },

    shortageSummaryText: {
      flex:
        1,

      fontSize:
        10,

      lineHeight:
        15,

      fontWeight:
        "700",

      color:
        "#92400E",
    },

    fullDeliverySummary: {
      marginTop:
        14,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        7,

      borderWidth:
        1,

      borderColor:
        "#BBF7D0",

      borderRadius:
        11,

      padding:
        10,

      backgroundColor:
        "#F7FEFA",
    },

    fullDeliverySummaryText: {
      flex:
        1,

      fontSize:
        10,

      lineHeight:
        15,

      fontWeight:
        "700",

      color:
        "#166534",
    },

    pendingCard: {
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
        "#FDE68A",

      borderRadius:
        14,

      padding:
        13,

      backgroundColor:
        "#FFFBEB",
    },

    pendingTextContainer: {
      flex:
        1,
    },

    pendingTitle: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#92400E",
    },

    pendingText: {
      marginTop:
        3,

      fontSize:
        10,

      lineHeight:
        15,

      color:
        "#78614A",
    },

    partialCard: {
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
        "#BFDBFE",

      borderRadius:
        14,

      padding:
        13,

      backgroundColor:
        "#F8FBFF",
    },

    partialTitle: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#1D4ED8",
    },

    partialText: {
      marginTop:
        3,

      fontSize:
        10,

      lineHeight:
        15,

      color:
        "#52606D",
    },

    receivedCard: {
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
        14,

      padding:
        13,

      backgroundColor:
        "#F7FEFA",
    },

    receivedWithShortageCard: {
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
        "#FDE68A",

      borderRadius:
        14,

      padding:
        13,

      backgroundColor:
        "#FFFBEB",
    },

    receivedTitle: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#166534",
    },

    receivedText: {
      marginTop:
        3,

      fontSize:
        10,

      lineHeight:
        15,

      color:
        "#52606D",
    },

    receivedMissingFooter: {
      marginTop:
        7,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,
    },

    receivedMissingFooterText: {
      flex:
        1,

      fontSize:
        9,

      fontWeight:
        "700",

      color:
        "#B45309",
    },
  });