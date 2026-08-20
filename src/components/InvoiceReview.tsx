import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useMemo,
  useState,
} from "react";

import {
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
  canConfirmInvoiceLines,
  getInvoiceReviewSummary,
} from "../services/invoiceReviewService";

import type {
  InvoiceImportedLine,
  InvoiceImportResult,
  InvoiceLineStatus,
} from "../types/invoiceImport";

interface InvoiceReviewProps {
  result:
    InvoiceImportResult;

  onChangeResult:
    (
      result:
        InvoiceImportResult,
    ) => void;

  onConfirm:
    (
      result:
        InvoiceImportResult,
    ) => void;

  onClose:
    () => void;
}

type ReviewFilter =
  | "all"
  | "attention"
  | "matched";

export function InvoiceReview({
  result,
  onChangeResult,
  onConfirm,
  onClose,
}: InvoiceReviewProps) {
  const [
    filter,
    setFilter,
  ] =
    useState<ReviewFilter>(
      "all",
    );

  const isManualReview =
    result.rawText.startsWith(
      "Manual receiving review:",
    );

  const summary =
    useMemo(
      () =>
        getInvoiceReviewSummary(
          result.lines,
        ),
      [
        result.lines,
      ],
    );

  const filteredLines =
    useMemo(
      () => {
        switch (
          filter
        ) {
          case "attention":
            return result.lines.filter(
              (
                line,
              ) =>
                line.status !==
                  "matched" ||
                line.warnings.length >
                  0 ||
                !line.reviewed,
            );

          case "matched":
            return result.lines.filter(
              (
                line,
              ) =>
                line.status ===
                  "matched",
            );

          case "all":
          default:
            return result.lines;
        }
      },
      [
        filter,
        result.lines,
      ],
    );

  const canConfirm =
    canConfirmInvoiceLines(
      result.lines,
    );

  function updateLine(
    lineId:
      string,

    updater:
      (
        line:
          InvoiceImportedLine,
      ) => InvoiceImportedLine,
  ): void {
    onChangeResult({
      ...result,

      lines:
        result.lines.map(
          (
            line,
          ) =>
            line.id ===
            lineId
              ? updater(
                  line,
                )
              : line,
        ),
    });
  }

  function changeConfirmedQuantity(
    line:
      InvoiceImportedLine,

    change:
      number,
  ): void {
    const current =
      line.confirmedQuantity ??
      line.quantity ??
      0;

    const next =
      Math.max(
        0,
        current +
          change,
      );

    updateLine(
      line.id,
      (
        currentLine,
      ) => ({
        ...currentLine,

        confirmedQuantity:
          next,

        reviewed:
          true,

        status:
          resolveReviewedStatus({
            ...currentLine,

            confirmedQuantity:
              next,
          }),
      }),
    );
  }

  function updateQuantityText(
    line:
      InvoiceImportedLine,

    value:
      string,
  ): void {
    const normalized =
      value.replace(
        /[^0-9]/g,
        "",
      );

    const quantity =
      normalized ===
      ""
        ? null
        : Number(
            normalized,
          );

    updateLine(
      line.id,
      (
        currentLine,
      ) => ({
        ...currentLine,

        confirmedQuantity:
          quantity,

        reviewed:
          quantity !==
          null,

        status:
          quantity ===
          null
            ? currentLine.status
            : resolveReviewedStatus({
                ...currentLine,

                confirmedQuantity:
                  quantity,
              }),
      }),
    );
  }

  function updateCostText(
    line:
      InvoiceImportedLine,

    value:
      string,
  ): void {
    const normalized =
      value
        .replace(
          "$",
          "",
        )
        .replace(
          ",",
          "",
        )
        .replace(
          /[^0-9.]/g,
          "",
        );

    const parsed =
      normalized ===
      ""
        ? null
        : Number(
            normalized,
          );

    const confirmedCost =
      parsed !==
        null &&
      Number.isFinite(
        parsed,
      )
        ? parsed
        : null;

    updateLine(
      line.id,
      (
        currentLine,
      ) => ({
        ...currentLine,

        confirmedUnitCost:
          confirmedCost,

        reviewed:
          true,

        status:
          resolveReviewedStatus({
            ...currentLine,

            confirmedUnitCost:
              confirmedCost,
          }),
      }),
    );
  }

  function markReviewed(
    line:
      InvoiceImportedLine,
  ): void {
    const confirmedQuantity =
      line.confirmedQuantity ??
      line.quantity ??
      0;

    const confirmedUnitCost =
      line.confirmedUnitCost ??
      line.unitCost;

    updateLine(
      line.id,
      (
        currentLine,
      ) => ({
        ...currentLine,

        confirmedQuantity,

        confirmedUnitCost,

        reviewed:
          true,

        status:
          resolveReviewedStatus({
            ...currentLine,

            confirmedQuantity,

            confirmedUnitCost,
          }),
      }),
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
        keyboardShouldPersistTaps="handled"
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
              {isManualReview
                ? "Manual Delivery Review"
                : "Review Invoice"}
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              {isManualReview
                ? "Confirm what was physically received for each ordered product."
                : "Check detected products, quantities and prices before confirming this delivery."}
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
          style={[
            styles.documentCard,

            isManualReview &&
              styles.manualDocumentCard,
          ]}
        >
          <View
            style={
              styles.documentTop
            }
          >
            <View
              style={[
                styles.documentIcon,

                isManualReview &&
                  styles.manualDocumentIcon,
              ]}
            >
              <Ionicons
                name={
                  isManualReview
                    ? "create-outline"
                    : "document-text-outline"
                }
                size={
                  22
                }
                color={
                  isManualReview
                    ? "#7C3AED"
                    : "#2563EB"
                }
              />
            </View>

            <View
              style={
                styles.documentIdentity
              }
            >
              <Text
                style={
                  styles.documentLabel
                }
              >
                {isManualReview
                  ? "Receiving Method"
                  : "Invoice"}
              </Text>

              <Text
                style={
                  styles.documentVendor
                }
                numberOfLines={
                  2
                }
              >
                {isManualReview
                  ? "Manual Entry"
                  : result.document.vendorName.trim()
                    ? result.document.vendorName
                    : "Vendor not detected"}
              </Text>

              {isManualReview ? (
                <Text
                  style={
                    styles.documentNumber
                  }
                >
                  {result.document.vendorName.trim()
                    ? result.document.vendorName
                    : "Purchase order receiving"}
                </Text>
              ) : result.document.invoiceNumber.trim() ? (
                <Text
                  style={
                    styles.documentNumber
                  }
                >
                  {
                    result.document.invoiceNumber
                  }
                </Text>
              ) : null}
            </View>

            {isManualReview ? (
              <View
                style={
                  styles.manualBadge
                }
              >
                <Ionicons
                  name="person-outline"
                  size={
                    14
                  }
                  color="#7C3AED"
                />

                <Text
                  style={
                    styles.manualBadgeText
                  }
                >
                  Manual
                </Text>
              </View>
            ) : (
              <View
                style={
                  styles.confidenceBadge
                }
              >
                <Text
                  style={
                    styles.confidenceLabel
                  }
                >
                  Confidence
                </Text>

                <Text
                  style={
                    styles.confidenceValue
                  }
                >
                  {
                    Math.round(
                      result.confidence *
                        100,
                    )
                  }
                  %
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.documentTotals,

              isManualReview &&
                styles.manualDocumentTotals,
            ]}
          >
            <DocumentValue
              label={
                isManualReview
                  ? "Expected Subtotal"
                  : "Subtotal"
              }
              value={
                formatOptionalCurrency(
                  result.document.subtotal,
                )
              }
            />

            <DocumentValue
              label="Tax"
              value={
                formatOptionalCurrency(
                  result.document.tax,
                )
              }
            />

            <DocumentValue
              label={
                isManualReview
                  ? "Expected Total"
                  : "Invoice Total"
              }
              value={
                formatOptionalCurrency(
                  result.document.total,
                )
              }
              emphasized
            />
          </View>
        </View>

        {isManualReview ? (
          <View
            style={
              styles.manualInfoCard
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={
                18
              }
              color="#7C3AED"
            />

            <Text
              style={
                styles.manualInfoText
              }
            >
              Quantities start with the amount still expected from this purchase order. Change any product to the quantity actually received, including 0 if it was not delivered.
            </Text>
          </View>
        ) : null}

        <View
          style={
            styles.summaryGrid
          }
        >
          <SummaryCard
            label="Lines"
            value={
              summary.totalLines
            }
            icon="list-outline"
          />

          <SummaryCard
            label="Matched"
            value={
              summary.matchedLines
            }
            icon="checkmark-circle-outline"
            tone="success"
          />

          <SummaryCard
            label="Attention"
            value={
              getAttentionCount(
                result.lines,
              )
            }
            icon="warning-outline"
            tone="warning"
          />

          <SummaryCard
            label={
              isManualReview
                ? "Not Received"
                : "New / Unknown"
            }
            value={
              isManualReview
                ? getZeroReceivedCount(
                    result.lines,
                  )
                : summary.newProductLines +
                  summary.unmatchedLines
            }
            icon={
              isManualReview
                ? "remove-circle-outline"
                : "help-circle-outline"
            }
            tone={
              isManualReview
                ? "warning"
                : "danger"
            }
          />
        </View>

        <View
          style={
            styles.filterRow
          }
        >
          <FilterButton
            label="All"
            count={
              result.lines.length
            }
            active={
              filter ===
              "all"
            }
            onPress={() =>
              setFilter(
                "all",
              )
            }
          />

          <FilterButton
            label="Needs Attention"
            count={
              getAttentionCount(
                result.lines,
              )
            }
            active={
              filter ===
              "attention"
            }
            onPress={() =>
              setFilter(
                "attention",
              )
            }
          />

          <FilterButton
            label="Matched"
            count={
              summary.matchedLines
            }
            active={
              filter ===
              "matched"
            }
            onPress={() =>
              setFilter(
                "matched",
              )
            }
          />
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
            {isManualReview
              ? "Ordered Products"
              : "Invoice Items"}
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            {isManualReview
              ? "Confirm the quantity physically delivered for every product. A quantity of 0 means the product was not delivered and stock will remain unchanged."
              : "Correct any uncertain values. Nothing will be added to inventory until the final confirmation."}
          </Text>
        </View>

        {filteredLines.length ===
        0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={
                42
              }
              color="#15803D"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              Nothing here
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              No rows match the selected filter.
            </Text>
          </View>
        ) : (
          filteredLines.map(
            (
              line,
              index,
            ) => (
              <InvoiceLineCard
                key={
                  line.id
                }
                line={
                  line
                }
                index={
                  index
                }
                isManualReview={
                  isManualReview
                }
                onDecrease={() =>
                  changeConfirmedQuantity(
                    line,
                    -1,
                  )
                }
                onIncrease={() =>
                  changeConfirmedQuantity(
                    line,
                    1,
                  )
                }
                onQuantityChange={(
                  value,
                ) =>
                  updateQuantityText(
                    line,
                    value,
                  )
                }
                onCostChange={(
                  value,
                ) =>
                  updateCostText(
                    line,
                    value,
                  )
                }
                onMarkReviewed={() =>
                  markReviewed(
                    line,
                  )
                }
              />
            ),
          )
        )}

        <View
          style={
            styles.confirmSection
          }
        >
          {!canConfirm ? (
            <View
              style={
                styles.confirmWarning
              }
            >
              <Ionicons
                name="warning-outline"
                size={
                  18
                }
                color="#B45309"
              />

              <Text
                style={
                  styles.confirmWarningText
                }
              >
                {isManualReview
                  ? "Confirm every product before receiving this order. Products that were not delivered should be entered as 0."
                  : "Review every line before continuing. Rows with missing or uncertain information require confirmation."}
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.readyCard
              }
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={
                  19
                }
                color="#15803D"
              />

              <Text
                style={
                  styles.readyText
                }
              >
                {isManualReview
                  ? "Receiving review is complete. SmartStock is ready to update inventory."
                  : "Invoice review is complete. You can continue to delivery confirmation."}
              </Text>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={
              !canConfirm
            }
            onPress={() =>
              onConfirm(
                result,
              )
            }
            style={({
              pressed,
            }) => [
              styles.confirmButton,

              !canConfirm &&
                styles.confirmButtonDisabled,

              pressed &&
                canConfirm &&
                styles.confirmButtonPressed,
            ]}
          >
            <Ionicons
              name={
                isManualReview
                  ? "checkmark-circle-outline"
                  : "arrow-forward-circle-outline"
              }
              size={
                20
              }
              color="#FFFFFF"
            />

            <Text
              style={
                styles.confirmButtonText
              }
            >
              {isManualReview
                ? "Confirm & Receive Order"
                : "Continue to Delivery Review"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InvoiceLineCard({
  line,
  index,
  isManualReview,
  onDecrease,
  onIncrease,
  onQuantityChange,
  onCostChange,
  onMarkReviewed,
}: {
  line:
    InvoiceImportedLine;

  index:
    number;

  isManualReview:
    boolean;

  onDecrease:
    () => void;

  onIncrease:
    () => void;

  onQuantityChange:
    (
      value:
        string,
    ) => void;

  onCostChange:
    (
      value:
        string,
    ) => void;

  onMarkReviewed:
    () => void;
}) {
  const status =
    getStatusDisplay(
      line.status,
    );

  const confirmedQuantity =
    line.confirmedQuantity ??
    line.quantity ??
    0;

  const confirmedCost =
    line.confirmedUnitCost ??
    line.unitCost;

  const estimatedTotal =
    confirmedCost !==
      null
      ? confirmedCost *
        confirmedQuantity
      : null;

  const isZeroReceipt =
    confirmedQuantity ===
      0;

  return (
    <View
      style={[
        styles.lineCard,

        line.status !==
          "matched" &&
          styles.lineCardAttention,

        line.reviewed &&
          styles.lineCardReviewed,

        isZeroReceipt &&
          styles.lineCardZeroReceipt,
      ]}
    >
      <View
        style={
          styles.lineHeader
        }
      >
        <View
          style={
            styles.lineNumber
          }
        >
          <Text
            style={
              styles.lineNumberText
            }
          >
            {
              index +
              1
            }
          </Text>
        </View>

        <View
          style={
            styles.lineIdentity
          }
        >
          <Text
            style={
              styles.lineProductName
            }
            numberOfLines={
              2
            }
          >
            {line.productName.trim()
              ? line.productName
              : "Product name missing"}
          </Text>

          {line.barcode.trim() ? (
            <Text
              style={
                styles.lineBarcode
              }
            >
              Barcode:{" "}
              {
                line.barcode
              }
            </Text>
          ) : isManualReview ? (
            <Text
              style={
                styles.lineBarcodeMissing
              }
            >
              Barcode not available
            </Text>
          ) : (
            <View
              style={
                styles.inlineWarning
              }
            >
              <Ionicons
                name="warning-outline"
                size={
                  12
                }
                color="#B45309"
              />

              <Text
                style={
                  styles.inlineWarningText
                }
              >
                Barcode missing
              </Text>
            </View>
          )}
        </View>

        {isZeroReceipt ? (
          <View
            style={
              styles.zeroReceiptBadge
            }
          >
            <Text
              style={
                styles.zeroReceiptBadgeText
              }
            >
              Not Received
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.lineStatusBadge,

              {
                backgroundColor:
                  status.background,
              },
            ]}
          >
            <Text
              style={[
                styles.lineStatusText,

                {
                  color:
                    status.color,
                },
              ]}
            >
              {
                status.label
              }
            </Text>
          </View>
        )}
      </View>

      {line.matchedProduct ? (
        <View
          style={
            styles.matchCard
          }
        >
          <Ionicons
            name="link-outline"
            size={
              15
            }
            color="#2563EB"
          />

          <View
            style={
              styles.matchText
            }
          >
            <Text
              style={
                styles.matchLabel
              }
            >
              Matched Inventory Product
            </Text>

            <Text
              style={
                styles.matchName
              }
              numberOfLines={
                2
              }
            >
              {
                line.matchedProduct.name
              }
            </Text>

            {!isManualReview ? (
              <Text
                style={
                  styles.matchConfidence
                }
              >
                Match confidence:{" "}
                {
                  Math.round(
                    line.matchConfidence *
                      100,
                  )
                }
                %
              </Text>
            ) : (
              <Text
                style={
                  styles.manualMatchText
                }
              >
                Linked directly from this purchase order
              </Text>
            )}
          </View>
        </View>
      ) : null}

      {line.orderedQuantity !==
      null ? (
        <View
          style={
            styles.poComparison
          }
        >
          <ComparisonValue
            label="Ordered"
            value={
              line.orderedQuantity
            }
          />

          <ComparisonValue
            label="Previously Received"
            value={
              line.previouslyReceivedQuantity
            }
          />

          <ComparisonValue
            label="Still Expected"
            value={
              line.remainingOrderedQuantity ??
              0
            }
            emphasized
          />
        </View>
      ) : null}

      {line.warnings.length >
      0 ? (
        <View
          style={
            styles.warningBox
          }
        >
          <View
            style={
              styles.warningHeader
            }
          >
            <Ionicons
              name="warning-outline"
              size={
                16
              }
              color="#B45309"
            />

            <Text
              style={
                styles.warningTitle
              }
            >
              Needs Attention
            </Text>
          </View>

          {line.warnings.map(
            (
              warning,
              warningIndex,
            ) => (
              <View
                key={
                  `${line.id}-${warning.type}-${warningIndex}`
                }
                style={
                  styles.warningRow
                }
              >
                <View
                  style={
                    styles.warningDot
                  }
                />

                <Text
                  style={
                    styles.warningText
                  }
                >
                  {
                    warning.message
                  }
                </Text>
              </View>
            ),
          )}
        </View>
      ) : null}

      {isZeroReceipt ? (
        <View
          style={
            styles.notReceivedMessage
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={
              16
            }
            color="#B45309"
          />

          <Text
            style={
              styles.notReceivedMessageText
            }
          >
            This product will be recorded as received with 0 units. Current inventory stock will not change.
          </Text>
        </View>
      ) : null}

      <View
        style={
          styles.editSection
        }
      >
        <Text
          style={
            styles.editSectionTitle
          }
        >
          {isManualReview
            ? "Actual Received Values"
            : "Confirm Received Values"}
        </Text>

        <View
          style={
            styles.editRow
          }
        >
          <View
            style={
              styles.editField
            }
          >
            <Text
              style={
                styles.fieldLabel
              }
            >
              Quantity
            </Text>

            <View
              style={
                styles.quantityEditor
              }
            >
              <Pressable
                accessibilityRole="button"
                onPress={
                  onDecrease
                }
                style={({
                  pressed,
                }) => [
                  styles.quantityButton,

                  pressed &&
                    styles.quantityButtonPressed,
                ]}
              >
                <Ionicons
                  name="remove"
                  size={
                    18
                  }
                  color="#20252B"
                />
              </Pressable>

              <TextInput
                value={
                  confirmedQuantity.toString()
                }
                onChangeText={
                  onQuantityChange
                }
                keyboardType="number-pad"
                selectTextOnFocus
                style={[
                  styles.quantityInput,

                  isZeroReceipt &&
                    styles.quantityInputZero,
                ]}
              />

              <Pressable
                accessibilityRole="button"
                onPress={
                  onIncrease
                }
                style={({
                  pressed,
                }) => [
                  styles.quantityButton,

                  pressed &&
                    styles.quantityButtonPressed,
                ]}
              >
                <Ionicons
                  name="add"
                  size={
                    18
                  }
                  color="#20252B"
                />
              </Pressable>
            </View>
          </View>

          <View
            style={
              styles.editField
            }
          >
            <Text
              style={
                styles.fieldLabel
              }
            >
              Unit Cost
            </Text>

            <View
              style={
                styles.moneyInputContainer
              }
            >
              <Text
                style={
                  styles.moneyPrefix
                }
              >
                $
              </Text>

              <TextInput
                value={
                  confirmedCost ===
                  null
                    ? ""
                    : confirmedCost.toFixed(
                        2,
                      )
                }
                onChangeText={
                  onCostChange
                }
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                selectTextOnFocus
                style={
                  styles.moneyInput
                }
              />
            </View>
          </View>
        </View>

        <View
          style={
            styles.lineTotalRow
          }
        >
          <Text
            style={
              styles.lineTotalLabel
            }
          >
            {isManualReview
              ? "Received Line Total"
              : "Confirmed Line Total"}
          </Text>

          <Text
            style={[
              styles.lineTotalValue,

              isZeroReceipt &&
                styles.lineTotalValueZero,
            ]}
          >
            {
              estimatedTotal ===
              null
                ? "—"
                : formatCurrency(
                    estimatedTotal,
                  )
            }
          </Text>
        </View>
      </View>

      {!line.reviewed ? (
        <Pressable
          accessibilityRole="button"
          onPress={
            onMarkReviewed
          }
          style={({
            pressed,
          }) => [
            styles.reviewButton,

            pressed &&
              styles.reviewButtonPressed,
          ]}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={
              18
            }
            color="#FFFFFF"
          />

          <Text
            style={
              styles.reviewButtonText
            }
          >
            {isManualReview
              ? "Confirm This Product"
              : "Mark as Reviewed"}
          </Text>
        </Pressable>
      ) : (
        <View
          style={[
            styles.reviewedBadge,

            isZeroReceipt &&
              styles.zeroReviewedBadge,
          ]}
        >
          <Ionicons
            name={
              isZeroReceipt
                ? "alert-circle"
                : "checkmark-circle"
            }
            size={
              17
            }
            color={
              isZeroReceipt
                ? "#B45309"
                : "#15803D"
            }
          />

          <Text
            style={[
              styles.reviewedText,

              isZeroReceipt &&
                styles.zeroReviewedText,
            ]}
          >
            {isZeroReceipt
              ? "Confirmed · 0 Received"
              : "Reviewed"}
          </Text>
        </View>
      )}
    </View>
  );
}

function DocumentValue({
  label,
  value,
  emphasized =
    false,
}: {
  label:
    string;

  value:
    string;

  emphasized?:
    boolean;
}) {
  return (
    <View
      style={
        styles.documentValue
      }
    >
      <Text
        style={
          styles.documentValueLabel
        }
      >
        {
          label
        }
      </Text>

      <Text
        style={[
          styles.documentValueText,

          emphasized &&
            styles.documentValueTextEmphasized,
        ]}
      >
        {
          value
        }
      </Text>
    </View>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone =
    "normal",
}: {
  label:
    string;

  value:
    number;

  icon:
    | "list-outline"
    | "checkmark-circle-outline"
    | "warning-outline"
    | "help-circle-outline"
    | "remove-circle-outline";

  tone?:
    | "normal"
    | "success"
    | "warning"
    | "danger";
}) {
  const color =
    tone ===
    "success"
      ? "#15803D"
      : tone ===
          "warning"
        ? "#B45309"
        : tone ===
            "danger"
          ? "#B42318"
          : "#52606D";

  return (
    <View
      style={[
        styles.summaryCard,

        tone ===
          "success" &&
          styles.summaryCardSuccess,

        tone ===
          "warning" &&
          styles.summaryCardWarning,

        tone ===
          "danger" &&
          styles.summaryCardDanger,
      ]}
    >
      <Ionicons
        name={
          icon
        }
        size={
          18
        }
        color={
          color
        }
      />

      <Text
        style={[
          styles.summaryValue,

          {
            color,
          },
        ]}
      >
        {
          value
        }
      </Text>

      <Text
        style={
          styles.summaryLabel
        }
      >
        {
          label
        }
      </Text>
    </View>
  );
}

function FilterButton({
  label,
  count,
  active,
  onPress,
}: {
  label:
    string;

  count:
    number;

  active:
    boolean;

  onPress:
    () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.filterButton,

        active &&
          styles.filterButtonActive,

        pressed &&
          styles.buttonPressed,
      ]}
    >
      <Text
        style={[
          styles.filterButtonText,

          active &&
            styles.filterButtonTextActive,
        ]}
      >
        {
          label
        }
      </Text>

      <View
        style={[
          styles.filterCount,

          active &&
            styles.filterCountActive,
        ]}
      >
        <Text
          style={[
            styles.filterCountText,

            active &&
              styles.filterCountTextActive,
          ]}
        >
          {
            count
          }
        </Text>
      </View>
    </Pressable>
  );
}

function ComparisonValue({
  label,
  value,
  emphasized =
    false,
}: {
  label:
    string;

  value:
    number;

  emphasized?:
    boolean;
}) {
  return (
    <View
      style={
        styles.comparisonValue
      }
    >
      <Text
        style={
          styles.comparisonLabel
        }
      >
        {
          label
        }
      </Text>

      <Text
        style={[
          styles.comparisonNumber,

          emphasized &&
            styles.comparisonNumberEmphasized,
        ]}
      >
        {
          value
        }
      </Text>
    </View>
  );
}

function getAttentionCount(
  lines:
    InvoiceImportedLine[],
): number {
  return lines.filter(
    (
      line,
    ) =>
      line.status !==
        "matched" ||
      line.warnings.length >
        0 ||
      !line.reviewed,
  ).length;
}

function getZeroReceivedCount(
  lines:
    InvoiceImportedLine[],
): number {
  return lines.filter(
    (
      line,
    ) =>
      (
        line.confirmedQuantity ??
        line.quantity ??
        0
      ) ===
      0,
  ).length;
}

function resolveReviewedStatus(
  line:
    InvoiceImportedLine,
): InvoiceLineStatus {
  if (
    !line.productName.trim()
  ) {
    return "missing_information";
  }

  if (
    !line.matchedProduct
  ) {
    return line.status ===
      "new_product"
      ? "new_product"
      : "unmatched";
  }

  const confirmedQuantity =
    line.confirmedQuantity ??
    line.quantity ??
    0;

  if (
    line.orderedQuantity !==
      null &&
    line.remainingOrderedQuantity !==
      null &&
    confirmedQuantity !==
      line.remainingOrderedQuantity
  ) {
    return "quantity_mismatch";
  }

  if (
    line.status ===
    "price_mismatch"
  ) {
    return "price_mismatch";
  }

  return "matched";
}

function getStatusDisplay(
  status:
    InvoiceLineStatus,
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
    case "matched":
      return {
        label:
          "Matched",

        color:
          "#15803D",

        background:
          "#ECFDF3",
      };

    case "needs_attention":
      return {
        label:
          "Attention",

        color:
          "#B45309",

        background:
          "#FFF7ED",
      };

    case "new_product":
      return {
        label:
          "New Product",

        color:
          "#2563EB",

        background:
          "#EFF6FF",
      };

    case "unmatched":
      return {
        label:
          "Unmatched",

        color:
          "#B42318",

        background:
          "#FFF1F0",
      };

    case "missing_information":
      return {
        label:
          "Missing Info",

        color:
          "#B45309",

        background:
          "#FFFBEB",
      };

    case "quantity_mismatch":
      return {
        label:
          "Qty Mismatch",

        color:
          "#B45309",

        background:
          "#FFF7ED",
      };

    case "price_mismatch":
      return {
        label:
          "Price Mismatch",

        color:
          "#B45309",

        background:
          "#FFF7ED",
      };

    case "possible_duplicate":
      return {
        label:
          "Possible Duplicate",

        color:
          "#7C3AED",

        background:
          "#F5F3FF",
      };

    default:
      return {
        label:
          "Attention",

        color:
          "#B45309",

        background:
          "#FFF7ED",
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

function formatOptionalCurrency(
  value:
    number | null,
): string {
  if (
    value ===
    null
  ) {
    return "—";
  }

  return formatCurrency(
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

    documentCard: {
      marginTop:
        22,

      borderWidth:
        1,

      borderColor:
        "#BFDBFE",

      borderRadius:
        16,

      padding:
        15,

      backgroundColor:
        "#F8FBFF",
    },

    manualDocumentCard: {
      borderColor:
        "#DDD6FE",

      backgroundColor:
        "#FAF8FF",
    },

    documentTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,
    },

    documentIcon: {
      width:
        42,

      height:
        42,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        13,

      backgroundColor:
        "#EFF6FF",
    },

    manualDocumentIcon: {
      backgroundColor:
        "#F5F3FF",
    },

    documentIdentity: {
      flex:
        1,

      minWidth:
        0,
    },

    documentLabel: {
      fontSize:
        8,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      color:
        "#94A3B8",
    },

    documentVendor: {
      marginTop:
        2,

      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    documentNumber: {
      marginTop:
        2,

      fontSize:
        10,

      color:
        "#64748B",
    },

    confidenceBadge: {
      alignItems:
        "flex-end",
    },

    confidenceLabel: {
      fontSize:
        8,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#94A3B8",
    },

    confidenceValue: {
      marginTop:
        2,

      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#2563EB",
    },

    manualBadge: {
      flexShrink:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        4,

      borderRadius:
        999,

      paddingHorizontal:
        8,

      paddingVertical:
        6,

      backgroundColor:
        "#F5F3FF",
    },

    manualBadgeText: {
      fontSize:
        9,

      fontWeight:
        "800",

      color:
        "#7C3AED",
    },

    documentTotals: {
      marginTop:
        14,

      flexDirection:
        "row",

      borderTopWidth:
        1,

      borderTopColor:
        "#DBEAFE",

      paddingTop:
        12,

      gap:
        8,
    },

    manualDocumentTotals: {
      borderTopColor:
        "#EDE9FE",
    },

    documentValue: {
      flex:
        1,

      minWidth:
        0,
    },

    documentValueLabel: {
      fontSize:
        8,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#94A3B8",
    },

    documentValueText: {
      marginTop:
        3,

      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    documentValueTextEmphasized: {
      color:
        "#15803D",
    },

    manualInfoCard: {
      marginTop:
        12,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        8,

      borderWidth:
        1,

      borderColor:
        "#DDD6FE",

      borderRadius:
        12,

      padding:
        11,

      backgroundColor:
        "#FAF8FF",
    },

    manualInfoText: {
      flex:
        1,

      fontSize:
        10,

      lineHeight:
        16,

      color:
        "#5B4B8A",
    },

    summaryGrid: {
      marginTop:
        14,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        10,
    },

    summaryCard: {
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

    summaryCardSuccess: {
      borderColor:
        "#BBF7D0",

      backgroundColor:
        "#F7FEFA",
    },

    summaryCardWarning: {
      borderColor:
        "#FDE68A",

      backgroundColor:
        "#FFFBEB",
    },

    summaryCardDanger: {
      borderColor:
        "#FECACA",

      backgroundColor:
        "#FFF8F7",
    },

    summaryValue: {
      marginTop:
        7,

      fontSize:
        20,

      fontWeight:
        "800",
    },

    summaryLabel: {
      marginTop:
        2,

      fontSize:
        9,

      fontWeight:
        "700",

      color:
        "#8B949E",
    },

    filterRow: {
      marginTop:
        18,

      flexDirection:
        "row",

      gap:
        7,
    },

    filterButton: {
      flex:
        1,

      minHeight:
        40,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        5,

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        10,

      paddingHorizontal:
        7,

      backgroundColor:
        "#FFFFFF",
    },

    filterButtonActive: {
      borderColor:
        "#20252B",

      backgroundColor:
        "#20252B",
    },

    filterButtonText: {
      fontSize:
        9,

      fontWeight:
        "800",

      color:
        "#52606D",
    },

    filterButtonTextActive: {
      color:
        "#FFFFFF",
    },

    filterCount: {
      minWidth:
        20,

      height:
        20,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        10,

      paddingHorizontal:
        4,

      backgroundColor:
        "#F1F5F9",
    },

    filterCountActive: {
      backgroundColor:
        "#374151",
    },

    filterCountText: {
      fontSize:
        8,

      fontWeight:
        "800",

      color:
        "#64748B",
    },

    filterCountTextActive: {
      color:
        "#FFFFFF",
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
        17,

      color:
        "#6B7280",
    },

    lineCard: {
      marginBottom:
        14,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        17,

      padding:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    lineCardAttention: {
      borderColor:
        "#FDE68A",
    },

    lineCardReviewed: {
      borderColor:
        "#BBF7D0",
    },

    lineCardZeroReceipt: {
      borderColor:
        "#FDE68A",

      backgroundColor:
        "#FFFDF8",
    },

    lineHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        9,
    },

    lineNumber: {
      width:
        29,

      height:
        29,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        15,

      backgroundColor:
        "#F1F5F9",
    },

    lineNumberText: {
      fontSize:
        10,

      fontWeight:
        "800",

      color:
        "#52606D",
    },

    lineIdentity: {
      flex:
        1,

      minWidth:
        0,
    },

    lineProductName: {
      fontSize:
        14,

      lineHeight:
        19,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    lineBarcode: {
      marginTop:
        3,

      fontSize:
        9,

      color:
        "#94A3B8",
    },

    lineBarcodeMissing: {
      marginTop:
        3,

      fontSize:
        9,

      color:
        "#94A3B8",
    },

    inlineWarning: {
      marginTop:
        4,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        4,
    },

    inlineWarningText: {
      fontSize:
        9,

      fontWeight:
        "700",

      color:
        "#B45309",
    },

    lineStatusBadge: {
      flexShrink:
        0,

      borderRadius:
        999,

      paddingHorizontal:
        8,

      paddingVertical:
        5,
    },

    lineStatusText: {
      fontSize:
        8,

      fontWeight:
        "800",
    },

    zeroReceiptBadge: {
      flexShrink:
        0,

      borderRadius:
        999,

      paddingHorizontal:
        8,

      paddingVertical:
        5,

      backgroundColor:
        "#FFF7ED",
    },

    zeroReceiptBadgeText: {
      fontSize:
        8,

      fontWeight:
        "800",

      color:
        "#B45309",
    },

    matchCard: {
      marginTop:
        12,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        8,

      borderRadius:
        11,

      padding:
        10,

      backgroundColor:
        "#EFF6FF",
    },

    matchText: {
      flex:
        1,
    },

    matchLabel: {
      fontSize:
        8,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#64748B",
    },

    matchName: {
      marginTop:
        2,

      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#1D4ED8",
    },

    matchConfidence: {
      marginTop:
        2,

      fontSize:
        8,

      color:
        "#64748B",
    },

    manualMatchText: {
      marginTop:
        2,

      fontSize:
        8,

      color:
        "#64748B",
    },

    poComparison: {
      marginTop:
        11,

      flexDirection:
        "row",

      gap:
        7,

      borderRadius:
        10,

      padding:
        9,

      backgroundColor:
        "#F8FAFC",
    },

    comparisonValue: {
      flex:
        1,

      minWidth:
        0,
    },

    comparisonLabel: {
      fontSize:
        7,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#94A3B8",
    },

    comparisonNumber: {
      marginTop:
        3,

      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    comparisonNumberEmphasized: {
      color:
        "#B45309",
    },

    warningBox: {
      marginTop:
        11,

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

    warningHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,
    },

    warningTitle: {
      fontSize:
        10,

      fontWeight:
        "800",

      color:
        "#92400E",
    },

    warningRow: {
      marginTop:
        6,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        7,
    },

    warningDot: {
      width:
        5,

      height:
        5,

      marginTop:
        5,

      borderRadius:
        3,

      backgroundColor:
        "#B45309",
    },

    warningText: {
      flex:
        1,

      fontSize:
        9,

      lineHeight:
        14,

      color:
        "#78614A",
    },

    notReceivedMessage: {
      marginTop:
        11,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        7,

      borderRadius:
        10,

      padding:
        9,

      backgroundColor:
        "#FFF7ED",
    },

    notReceivedMessageText: {
      flex:
        1,

      fontSize:
        9,

      lineHeight:
        14,

      color:
        "#92400E",
    },

    editSection: {
      marginTop:
        12,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEF0F2",

      paddingTop:
        12,
    },

    editSectionTitle: {
      fontSize:
        10,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      color:
        "#64748B",
    },

    editRow: {
      marginTop:
        9,

      flexDirection:
        "row",

      gap:
        10,
    },

    editField: {
      flex:
        1,
    },

    fieldLabel: {
      marginBottom:
        5,

      fontSize:
        9,

      fontWeight:
        "700",

      color:
        "#64748B",
    },

    quantityEditor: {
      minHeight:
        40,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        10,

      overflow:
        "hidden",

      backgroundColor:
        "#FFFFFF",
    },

    quantityButton: {
      width:
        38,

      height:
        40,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    quantityButtonPressed: {
      backgroundColor:
        "#F1F5F9",
    },

    quantityInput: {
      flex:
        1,

      minWidth:
        32,

      paddingVertical:
        8,

      fontSize:
        14,

      fontWeight:
        "800",

      textAlign:
        "center",

      color:
        "#111827",
    },

    quantityInputZero: {
      color:
        "#B45309",
    },

    moneyInputContainer: {
      minHeight:
        40,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        10,

      paddingHorizontal:
        10,

      backgroundColor:
        "#FFFFFF",
    },

    moneyPrefix: {
      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#64748B",
    },

    moneyInput: {
      flex:
        1,

      paddingVertical:
        8,

      paddingLeft:
        4,

      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    lineTotalRow: {
      marginTop:
        10,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    lineTotalLabel: {
      fontSize:
        9,

      color:
        "#8B949E",
    },

    lineTotalValue: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    lineTotalValueZero: {
      color:
        "#B45309",
    },

    reviewButton: {
      marginTop:
        12,

      minHeight:
        42,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        6,

      borderRadius:
        10,

      backgroundColor:
        "#20252B",
    },

    reviewButtonPressed: {
      backgroundColor:
        "#111827",
    },

    reviewButtonText: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    reviewedBadge: {
      marginTop:
        12,

      minHeight:
        38,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        5,

      borderRadius:
        10,

      backgroundColor:
        "#ECFDF3",
    },

    zeroReviewedBadge: {
      backgroundColor:
        "#FFF7ED",
    },

    reviewedText: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#15803D",
    },

    zeroReviewedText: {
      color:
        "#B45309",
    },

    confirmSection: {
      marginTop:
        12,
    },

    confirmWarning: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        8,

      borderWidth:
        1,

      borderColor:
        "#FDE68A",

      borderRadius:
        12,

      padding:
        11,

      backgroundColor:
        "#FFFBEB",
    },

    confirmWarningText: {
      flex:
        1,

      fontSize:
        9,

      lineHeight:
        15,

      color:
        "#78614A",
    },

    readyCard: {
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
        12,

      padding:
        11,

      backgroundColor:
        "#F7FEFA",
    },

    readyText: {
      flex:
        1,

      fontSize:
        9,

      lineHeight:
        15,

      fontWeight:
        "700",

      color:
        "#166534",
    },

    confirmButton: {
      marginTop:
        10,

      minHeight:
        50,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        7,

      borderRadius:
        12,

      backgroundColor:
        "#20252B",
    },

    confirmButtonDisabled: {
      opacity:
        0.4,
    },

    confirmButtonPressed: {
      backgroundColor:
        "#111827",
    },

    confirmButtonText: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    emptyCard: {
      minHeight:
        160,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#D1FAE5",

      borderRadius:
        16,

      padding:
        20,

      backgroundColor:
        "#F7FEFA",
    },

    emptyTitle: {
      marginTop:
        8,

      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    emptyText: {
      marginTop:
        4,

      fontSize:
        10,

      color:
        "#64748B",
    },
  });