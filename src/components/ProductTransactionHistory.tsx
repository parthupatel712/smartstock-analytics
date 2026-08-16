import {
  useMemo,
} from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import type {
  TransactionHistoryItem,
} from "../types/transactionHistory";

interface ProductTransactionHistoryProps {
  productName:
    string;

  currentStock:
    number;

  transactions:
    TransactionHistoryItem[];

  onClose:
    () => void;
}

interface TransactionSection {
  title:
    string;

  data:
    TransactionHistoryItem[];
}

export function ProductTransactionHistory({
  productName,
  currentStock,
  transactions,
  onClose,
}: ProductTransactionHistoryProps) {
  const sections =
    useMemo(
      () =>
        groupTransactionsByDate(
          transactions,
        ),
      [
        transactions,
      ],
    );

  const flatData =
    useMemo(
      () =>
        sections.flatMap(
          (
            section,
          ) => [
            {
              type:
                "section" as const,

              id:
                `section-${section.title}`,

              title:
                section.title,
            },

            ...section.data.map(
              (
                transaction,
              ) => ({
                type:
                  "transaction" as const,

                id:
                  `transaction-${transaction.id}`,

                transaction,
              }),
            ),
          ],
        ),

      [
        sections,
      ],
    );

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
      <FlatList
        data={
          flatData
        }
        keyExtractor={(
          item,
        ) =>
          item.id
        }
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        initialNumToRender={
          12
        }
        maxToRenderPerBatch={
          12
        }
        windowSize={
          7
        }
        ListHeaderComponent={
          <View>
            <View
              style={
                styles.headerRow
              }
            >
              <View
                style={
                  styles.headerTextContainer
                }
              >
                <Text
                  style={
                    styles.screenTitle
                  }
                >
                  Stock History
                </Text>

                <Text
                  style={
                    styles.productName
                  }
                  numberOfLines={
                    2
                  }
                >
                  {
                    productName
                  }
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                hitSlop={
                  10
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
                numberOfLines={
                  1
                }
                adjustsFontSizeToFit
                minimumFontScale={
                  0.8
                }
              >
                {
                  currentStock
                }{" "}
                units
              </Text>

              <Text
                style={
                  styles.stockSummaryDescription
                }
              >
                Current quantity based on the latest recorded inventory activity.
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={
                styles.emptyTitle
              }
            >
              No stock history yet
            </Text>

            <Text
              style={
                styles.emptyDescription
              }
            >
              Stock In, Sale, Customer Return, Damage, and Physical Count activity will appear here.
            </Text>
          </View>
        }
        renderItem={({
          item,
        }) => {
          if (
            item.type ===
            "section"
          ) {
            return (
              <Text
                style={
                  styles.sectionTitle
                }
              >
                {
                  item.title
                }
              </Text>
            );
          }

          return (
            <TransactionTimelineItem
              transaction={
                item.transaction
              }
            />
          );
        }}
      />
    </SafeAreaView>
  );
}

interface TransactionTimelineItemProps {
  transaction:
    TransactionHistoryItem;
}

function TransactionTimelineItem({
  transaction,
}: TransactionTimelineItemProps) {
  const display =
    getTransactionDisplay(
      transaction,
    );

  const stockChanged =
    transaction.stockBefore !==
    transaction.stockAfter;

  return (
    <View
      style={
        styles.timelineRow
      }
    >
      <View
        style={
          styles.timelineIndicatorColumn
        }
      >
        <View
          style={[
            styles.timelineDot,

            display.isPositive
              ? styles.positiveDot
              : styles.negativeDot,

            display.isNeutral &&
              styles.neutralDot,
          ]}
        />

        <View
          style={
            styles.timelineLine
          }
        />
      </View>

      <View
        style={
          styles.transactionCard
        }
      >
        <View
          style={
            styles.transactionHeader
          }
        >
          <View
            style={
              styles.transactionTitleContainer
            }
          >
            <Text
              style={
                styles.transactionTitle
              }
              numberOfLines={
                2
              }
            >
              {
                display.title
              }
            </Text>

            <Text
              style={
                styles.transactionTime
              }
            >
              {
                formatTransactionTime(
                  transaction.createdAt,
                )
              }
            </Text>
          </View>

          <Text
            style={[
              styles.quantityChange,

              display.isPositive
                ? styles.positiveText
                : styles.negativeText,

              display.isNeutral &&
                styles.neutralText,
            ]}
            numberOfLines={
              1
            }
            adjustsFontSizeToFit
            minimumFontScale={
              0.75
            }
          >
            {
              display.quantityText
            }
          </Text>
        </View>

        <View
          style={
            styles.stockMovementRow
          }
        >
          <StockValueBox
            label="Before"
            value={
              transaction.stockBefore
            }
          />

          <Text
            style={
              styles.stockArrow
            }
          >
            →
          </Text>

          <StockValueBox
            label="After"
            value={
              transaction.stockAfter
            }
          />
        </View>

        {!stockChanged ? (
          <Text
            style={
              styles.noChangeText
            }
          >
            No stock quantity change
          </Text>
        ) : null}

        <View
          style={
            styles.metadataRow
          }
        >
          <View
            style={
              styles.metadataItem
            }
          >
            <Text
              style={
                styles.metadataLabel
              }
            >
              Value
            </Text>

            <Text
              style={
                styles.metadataValue
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
                formatCurrency(
                  transaction.transactionValue,
                )
              }
            </Text>
          </View>

          <View
            style={
              styles.metadataItem
            }
          >
            <Text
              style={
                styles.metadataLabel
              }
            >
              Source
            </Text>

            <Text
              style={
                styles.metadataValue
              }
              numberOfLines={
                2
              }
            >
              {
                formatSource(
                  transaction.source,
                )
              }
            </Text>
          </View>
        </View>

        {transaction.notes ? (
          <View
            style={
              styles.notesCard
            }
          >
            <Text
              style={
                styles.notesLabel
              }
            >
              Note
            </Text>

            <Text
              style={
                styles.notesText
              }
            >
              {
                transaction.notes
              }
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function StockValueBox({
  label,
  value,
}: {
  label:
    string;

  value:
    number;
}) {
  return (
    <View
      style={
        styles.stockValueBox
      }
    >
      <Text
        style={
          styles.stockValueLabel
        }
      >
        {
          label
        }
      </Text>

      <Text
        style={
          styles.stockValue
        }
        numberOfLines={
          1
        }
        adjustsFontSizeToFit
        minimumFontScale={
          0.75
        }
      >
        {
          value
        }
      </Text>
    </View>
  );
}

function groupTransactionsByDate(
  transactions:
    TransactionHistoryItem[],
): TransactionSection[] {
  const groups =
    new Map<
      string,
      TransactionHistoryItem[]
    >();

  transactions.forEach(
    (
      transaction,
    ) => {
      const sectionTitle =
        getDateSectionTitle(
          transaction.createdAt,
        );

      const existingGroup =
        groups.get(
          sectionTitle,
        ) ??
        [];

      existingGroup.push(
        transaction,
      );

      groups.set(
        sectionTitle,
        existingGroup,
      );
    },
  );

  return Array.from(
    groups.entries(),
  ).map(
    (
      [
        title,
        data,
      ],
    ) => ({
      title,
      data,
    }),
  );
}

function getDateSectionTitle(
  isoDate:
    string,
): string {
  const transactionDate =
    new Date(
      isoDate,
    );

  if (
    Number.isNaN(
      transactionDate.getTime(),
    )
  ) {
    return "Unknown Date";
  }

  const today =
    startOfDay(
      new Date(),
    );

  const yesterday =
    new Date(
      today,
    );

  yesterday.setDate(
    yesterday.getDate() -
      1,
  );

  const transactionDay =
    startOfDay(
      transactionDate,
    );

  if (
    transactionDay.getTime() ===
    today.getTime()
  ) {
    return "Today";
  }

  if (
    transactionDay.getTime() ===
    yesterday.getTime()
  ) {
    return "Yesterday";
  }

  return transactionDate.toLocaleDateString(
    "en-CA",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        transactionDate.getFullYear() !==
        today.getFullYear()
          ? "numeric"
          : undefined,
    },
  );
}

function startOfDay(
  date:
    Date,
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

function formatTransactionTime(
  isoDate:
    string,
): string {
  const date =
    new Date(
      isoDate,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Unknown time";
  }

  return date.toLocaleTimeString(
    "en-CA",
    {
      hour:
        "numeric",

      minute:
        "2-digit",
    },
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

function formatSource(
  source:
    TransactionHistoryItem["source"],
): string {
  switch (
    source
  ) {
    case "camera":
      return "Camera";

    case "bluetooth":
      return "Bluetooth Scanner";

    case "usb":
      return "USB Scanner";

    case "esp32":
      return "Scanner Device";

    case "manual":
    default:
      return "Manual Entry";
  }
}

function getTransactionDisplay(
  transaction:
    TransactionHistoryItem,
): {
  title:
    string;

  quantityText:
    string;

  isPositive:
    boolean;

  isNeutral:
    boolean;
} {
  switch (
    transaction.transactionType
  ) {
    case "stock_in":
      return {
        title:
          "Stock In",

        quantityText:
          `+${transaction.quantity}`,

        isPositive:
          true,

        isNeutral:
          false,
      };

    case "return":
      return {
        title:
          "Customer Return",

        quantityText:
          `+${transaction.quantity}`,

        isPositive:
          true,

        isNeutral:
          false,
      };

    case "sale":
      return {
        title:
          "Sale",

        quantityText:
          `-${transaction.quantity}`,

        isPositive:
          false,

        isNeutral:
          false,
      };

    case "damage":
      return {
        title:
          "Damaged Stock",

        quantityText:
          `-${transaction.quantity}`,

        isPositive:
          false,

        isNeutral:
          false,
      };

    case "adjustment": {
      const difference =
        transaction.stockAfter -
        transaction.stockBefore;

      return {
        title:
          "Physical Count",

        quantityText:
          difference >
            0
            ? `+${difference}`
            : difference.toString(),

        isPositive:
          difference >
          0,

        isNeutral:
          difference ===
          0,
      };
    }

    default:
      return {
        title:
          "Inventory Update",

        quantityText:
          transaction.quantity.toString(),

        isPositive:
          false,

        isNeutral:
          true,
      };
  }
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

    headerRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    headerTextContainer: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        16,
    },

    screenTitle: {
      fontSize:
        28,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    productName: {
      marginTop:
        5,

      fontSize:
        15,

      lineHeight:
        21,

      fontWeight:
        "600",

      color:
        "#5D6673",
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
        0.7,
    },

    stockSummaryCard: {
      marginTop:
        22,

      marginBottom:
        24,

      borderRadius:
        18,

      padding:
        20,

      backgroundColor:
        "#20252B",
    },

    stockSummaryLabel: {
      fontSize:
        12,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#D1D5DB",
    },

    stockSummaryValue: {
      marginTop:
        6,

      fontSize:
        32,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    stockSummaryDescription: {
      marginTop:
        6,

      maxWidth:
        320,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#B9C0C8",
    },

    sectionTitle: {
      marginTop:
        8,

      marginBottom:
        12,

      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#374151",
    },

    timelineRow: {
      flexDirection:
        "row",

      alignItems:
        "stretch",
    },

    timelineIndicatorColumn: {
      width:
        24,

      flexShrink:
        0,

      alignItems:
        "center",
    },

    timelineDot: {
      width:
        12,

      height:
        12,

      marginTop:
        22,

      borderWidth:
        3,

      borderRadius:
        6,

      backgroundColor:
        "#FFFFFF",
    },

    positiveDot: {
      borderColor:
        "#15803D",
    },

    negativeDot: {
      borderColor:
        "#B42318",
    },

    neutralDot: {
      borderColor:
        "#64748B",
    },

    timelineLine: {
      flex:
        1,

      width:
        2,

      marginTop:
        4,

      backgroundColor:
        "#D7DCE2",
    },

    transactionCard: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        8,

      marginBottom:
        14,

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

    transactionHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    transactionTitleContainer: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        14,
    },

    transactionTitle: {
      fontSize:
        16,

      lineHeight:
        21,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    transactionTime: {
      marginTop:
        4,

      fontSize:
        12,

      color:
        "#6B7280",
    },

    quantityChange: {
      flexShrink:
        0,

      maxWidth:
        85,

      fontSize:
        20,

      fontWeight:
        "800",

      textAlign:
        "right",
    },

    positiveText: {
      color:
        "#15803D",
    },

    negativeText: {
      color:
        "#B42318",
    },

    neutralText: {
      color:
        "#64748B",
    },

    stockMovementRow: {
      marginTop:
        16,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    stockValueBox: {
      flex:
        1,

      minWidth:
        0,

      borderRadius:
        10,

      paddingHorizontal:
        12,

      paddingVertical:
        10,

      backgroundColor:
        "#F4F6F8",
    },

    stockValueLabel: {
      fontSize:
        10,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#6B7280",
    },

    stockValue: {
      marginTop:
        3,

      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    stockArrow: {
      flexShrink:
        0,

      marginHorizontal:
        10,

      fontSize:
        20,

      color:
        "#6B7280",
    },

    noChangeText: {
      marginTop:
        10,

      fontSize:
        12,

      color:
        "#6B7280",
    },

    metadataRow: {
      marginTop:
        16,

      flexDirection:
        "row",

      gap:
        16,
    },

    metadataItem: {
      flex:
        1,

      minWidth:
        0,
    },

    metadataLabel: {
      fontSize:
        10,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      color:
        "#6B7280",
    },

    metadataValue: {
      marginTop:
        3,

      fontSize:
        13,

      lineHeight:
        18,

      fontWeight:
        "700",

      color:
        "#20252B",
    },

    notesCard: {
      marginTop:
        14,

      borderRadius:
        10,

      padding:
        12,

      backgroundColor:
        "#FFF8E8",
    },

    notesLabel: {
      fontSize:
        10,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      color:
        "#8A5A00",
    },

    notesText: {
      marginTop:
        5,

      fontSize:
        13,

      lineHeight:
        19,

      color:
        "#5F4300",
    },

    emptyContainer: {
      alignItems:
        "center",

      paddingVertical:
        60,

      paddingHorizontal:
        20,
    },

    emptyTitle: {
      fontSize:
        19,

      fontWeight:
        "800",

      textAlign:
        "center",

      color:
        "#111827",
    },

    emptyDescription: {
      marginTop:
        8,

      maxWidth:
        300,

      fontSize:
        13,

      lineHeight:
        19,

      textAlign:
        "center",

      color:
        "#6B7280",
    },
  });