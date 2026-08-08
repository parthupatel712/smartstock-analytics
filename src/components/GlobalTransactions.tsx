import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMemo, useState } from "react";

import type {
  GlobalTransaction,
  GlobalTransactionType,
} from "../types/globalTransaction";

interface GlobalTransactionsProps {
  transactions: GlobalTransaction[];
  onClose: () => void;
}

type TransactionFilter =
  | "all"
  | GlobalTransactionType;

const FILTERS: {
  label: string;
  value: TransactionFilter;
}[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Sales",
    value: "sale",
  },
  {
    label: "Stock In",
    value: "stock_in",
  },
  {
    label: "Damage",
    value: "damage",
  },
  {
    label: "Returns",
    value: "return",
  },
  {
    label: "Counts",
    value: "physical_count",
  },
];

export function GlobalTransactions({
  transactions,
  onClose,
}: GlobalTransactionsProps) {
  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<TransactionFilter>(
    "all",
  );

  const filteredTransactions =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLowerCase();

      return transactions.filter(
        (transaction) => {
          const matchesType =
            selectedFilter ===
              "all" ||
            transaction.transactionType ===
              selectedFilter;

          const matchesSearch =
            normalizedSearch === "" ||
            transaction.productName
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            transaction.productBrand
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            transaction.barcode
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            transaction.department
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            transaction.category
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          return (
            matchesType &&
            matchesSearch
          );
        },
      );
    }, [
      transactions,
      searchQuery,
      selectedFilter,
    ]);

  return (
    <SafeAreaView
      style={styles.screen}
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
          style={styles.headerRow}
        >
          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text
              style={styles.title}
            >
              Transactions
            </Text>

            <Text
              style={styles.subtitle}
            >
              Review inventory activity across all products.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
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
              Close
            </Text>
          </Pressable>
        </View>

        <View
          style={
            styles.searchContainer
          }
        >
          <Ionicons
            name="search-outline"
            size={20}
            color="#7A838E"
          />

          <TextInput
            value={searchQuery}
            onChangeText={
              setSearchQuery
            }
            placeholder="Search product, brand, barcode, category..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            style={
              styles.searchInput
            }
          />

          {searchQuery ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setSearchQuery("")
              }
              style={
                styles.clearSearchButton
              }
            >
              <Ionicons
                name="close-circle"
                size={19}
                color="#8B949E"
              />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filtersRow
          }
        >
          {FILTERS.map(
            (filter) => {
              const isSelected =
                selectedFilter ===
                filter.value;

              return (
                <Pressable
                  key={filter.value}
                  accessibilityRole="button"
                  onPress={() =>
                    setSelectedFilter(
                      filter.value,
                    )
                  }
                  style={({ pressed }) => [
                    styles.filterChip,

                    isSelected &&
                      styles.filterChipSelected,

                    pressed &&
                      styles.buttonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,

                      isSelected &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              );
            },
          )}
        </ScrollView>

        <View
          style={styles.resultsHeader}
        >
          <Text
            style={styles.resultsTitle}
          >
            Recent Activity
          </Text>

          <Text
            style={styles.resultsCount}
          >
            {
              filteredTransactions.length
            }{" "}
            transaction
            {filteredTransactions.length ===
            1
              ? ""
              : "s"}
          </Text>
        </View>

        {filteredTransactions.length >
        0 ? (
          <View>
            {filteredTransactions.map(
              (transaction) => (
                <TransactionCard
                  key={
                    transaction.transactionId
                  }
                  transaction={
                    transaction
                  }
                />
              ),
            )}
          </View>
        ) : (
          <View
            style={
              styles.emptyContainer
            }
          >
            <Ionicons
              name="receipt-outline"
              size={42}
              color="#9CA3AF"
            />

            <Text
              style={styles.emptyTitle}
            >
              No transactions found
            </Text>

            <Text
              style={styles.emptyText}
            >
              Try changing the transaction filter or search terms.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TransactionCard({
  transaction,
}: {
  transaction: GlobalTransaction;
}) {
  const stockChange =
    transaction.stockAfter -
    transaction.stockBefore;

  const activityStyle =
    getActivityStyle(
      transaction.transactionType,
    );

  return (
    <View
      style={styles.transactionCard}
    >
      <View
        style={
          styles.transactionHeader
        }
      >
        <View
          style={
            styles.transactionIdentity
          }
        >
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  activityStyle.background,
              },
            ]}
          >
            <Ionicons
              name={
                activityStyle.icon
              }
              size={21}
              color={
                activityStyle.color
              }
            />
          </View>

          <View
            style={
              styles.productTextContainer
            }
          >
            <Text
              style={
                styles.productName
              }
              numberOfLines={2}
            >
              {
                transaction.productName
              }
            </Text>

            {transaction.productBrand.trim() ? (
              <Text
                style={
                  styles.productBrand
                }
              >
                {
                  transaction.productBrand
                }
              </Text>
            ) : null}
          </View>
        </View>

        <View
          style={[
            styles.transactionBadge,
            {
              backgroundColor:
                activityStyle.background,
            },
          ]}
        >
          <Text
            style={[
              styles.transactionBadgeText,
              {
                color:
                  activityStyle.color,
              },
            ]}
          >
            {
              activityStyle.label
            }
          </Text>
        </View>
      </View>

      <View
        style={styles.metaRow}
      >
        <Text
          style={styles.metaText}
        >
          {
            transaction.department
          }
        </Text>

        <Text
          style={
            styles.metaSeparator
          }
        >
          •
        </Text>

        <Text
          style={styles.metaText}
          numberOfLines={1}
        >
          {
            transaction.category
          }
        </Text>
      </View>

      <Text
        style={styles.barcode}
      >
        Barcode:{" "}
        {transaction.barcode}
      </Text>

      <View
        style={styles.metricsRow}
      >
        <Metric
          label="Change"
          value={
            stockChange > 0
              ? `+${stockChange}`
              : `${stockChange}`
          }
          tone={
            stockChange > 0
              ? "positive"
              : stockChange < 0
                ? "negative"
                : "normal"
          }
        />

        <Metric
          label="Stock"
          value={`${transaction.stockBefore} → ${transaction.stockAfter}`}
        />

        <Metric
          label="Value"
          value={formatCurrency(
            transaction.transactionValue,
          )}
        />
      </View>

      {transaction.notes ? (
        <View
          style={
            styles.noteContainer
          }
        >
          <Ionicons
            name="document-text-outline"
            size={15}
            color="#64748B"
          />

          <Text
            style={
              styles.noteText
            }
          >
            {transaction.notes}
          </Text>
        </View>
      ) : null}

      <View
        style={styles.footerRow}
      >
        <Text
          style={styles.sourceText}
        >
          {formatSource(
            transaction.source,
          )}
        </Text>

        <Text
          style={styles.dateText}
        >
          {formatDateTime(
            transaction.createdAt,
          )}
        </Text>
      </View>
    </View>
  );
}

function Metric({
  label,
  value,
  tone = "normal",
}: {
  label: string;
  value: string;
  tone?:
    | "normal"
    | "positive"
    | "negative";
}) {
  return (
    <View
      style={styles.metric}
    >
      <Text
        style={styles.metricLabel}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.metricValue,

          tone === "positive" &&
            styles.metricPositive,

          tone === "negative" &&
            styles.metricNegative,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function getActivityStyle(
  type: GlobalTransactionType,
) {
  switch (type) {
    case "stock_in":
      return {
        label:
          "Stock In",

        icon:
          "arrow-down-circle-outline" as const,

        color:
          "#15803D",

        background:
          "#ECFDF3",
      };

    case "sale":
      return {
        label:
          "Sale",

        icon:
          "cart-outline" as const,

        color:
          "#2563EB",

        background:
          "#EFF6FF",
      };

    case "damage":
      return {
        label:
          "Damage",

        icon:
          "warning-outline" as const,

        color:
          "#B42318",

        background:
          "#FFF1F0",
      };

    case "return":
      return {
        label:
          "Return",

        icon:
          "return-down-back-outline" as const,

        color:
          "#7C3AED",

        background:
          "#F5F3FF",
      };

    case "physical_count":
      return {
        label:
          "Physical Count",

        icon:
          "calculator-outline" as const,

        color:
          "#B45309",

        background:
          "#FFF7ED",
      };
  }
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-CA",
    {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function formatSource(
  source: GlobalTransaction["source"],
): string {
  switch (source) {
    case "camera":
      return "Camera";

    case "bluetooth":
      return "Bluetooth";

    case "usb":
      return "USB";

    case "esp32":
      return "ESP32";

    case "manual":
    default:
      return "Manual";
  }
}

function formatDateTime(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  const now =
    new Date();

  const todayStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

  const yesterdayStart =
    new Date(todayStart);

  yesterdayStart.setDate(
    yesterdayStart.getDate() -
      1,
  );

  const transactionDay =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

  const time =
    date.toLocaleTimeString(
      "en-CA",
      {
        hour: "numeric",
        minute: "2-digit",
      },
    );

  if (
    transactionDay.getTime() ===
    todayStart.getTime()
  ) {
    return `Today · ${time}`;
  }

  if (
    transactionDay.getTime() ===
    yesterdayStart.getTime()
  ) {
    return `Yesterday · ${time}`;
  }

  return date.toLocaleString(
    "en-CA",
    {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() ===
        now.getFullYear()
          ? undefined
          : "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
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
      marginTop: 5,
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
      opacity: 0.72,
    },

    searchContainer: {
      marginTop: 22,

      minHeight: 50,

      flexDirection: "row",
      alignItems: "center",

      borderWidth: 1,
      borderColor:
        "#D6DCE3",

      borderRadius: 14,

      paddingHorizontal: 14,

      backgroundColor:
        "#FFFFFF",
    },

    searchInput: {
      flex: 1,

      marginLeft: 9,

      paddingVertical: 12,

      fontSize: 15,

      color: "#111827",
    },

    clearSearchButton: {
      marginLeft: 8,

      padding: 3,
    },

    filtersRow: {
      marginTop: 14,

      paddingRight: 10,

      gap: 8,
    },

    filterChip: {
      minHeight: 38,

      alignItems: "center",
      justifyContent:
        "center",

      borderWidth: 1,
      borderColor:
        "#D6DCE3",

      borderRadius: 999,

      paddingHorizontal: 14,

      backgroundColor:
        "#FFFFFF",
    },

    filterChipSelected: {
      borderColor:
        "#20252B",

      backgroundColor:
        "#20252B",
    },

    filterChipText: {
      fontSize: 12,

      fontWeight: "700",

      color: "#52606D",
    },

    filterChipTextSelected: {
      color: "#FFFFFF",
    },

    resultsHeader: {
      marginTop: 24,
      marginBottom: 12,

      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    resultsTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: "#111827",
    },

    resultsCount: {
      fontSize: 12,
      fontWeight: "600",
      color: "#7A838E",
    },

    transactionCard: {
      marginBottom: 14,

      borderWidth: 1,
      borderColor:
        "#E0E4E8",

      borderRadius: 18,

      padding: 16,

      backgroundColor:
        "#FFFFFF",
    },

    transactionHeader: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
    },

    transactionIdentity: {
      flex: 1,

      flexDirection: "row",

      marginRight: 10,
    },

    iconContainer: {
      width: 43,
      height: 43,

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius: 22,
    },

    productTextContainer: {
      flex: 1,

      marginLeft: 11,
    },

    productName: {
      fontSize: 17,
      fontWeight: "800",
      color: "#111827",
    },

    productBrand: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: "600",
      color: "#6B7280",
    },

    transactionBadge: {
      flexShrink: 0,

      borderRadius: 999,

      paddingHorizontal: 9,
      paddingVertical: 5,
    },

    transactionBadgeText: {
      fontSize: 10,
      fontWeight: "800",
    },

    metaRow: {
      marginTop: 13,

      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },

    metaText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#64748B",
    },

    metaSeparator: {
      marginHorizontal: 6,
      color: "#CBD2DA",
    },

    barcode: {
      marginTop: 5,

      fontSize: 11,

      color: "#8B949E",
    },

    metricsRow: {
      marginTop: 15,

      flexDirection: "row",

      borderTopWidth: 1,
      borderTopColor:
        "#EEF0F2",

      paddingTop: 13,

      gap: 8,
    },

    metric: {
      flex: 1,
    },

    metricLabel: {
      fontSize: 10,

      fontWeight: "700",

      textTransform:
        "uppercase",

      color: "#8B949E",
    },

    metricValue: {
      marginTop: 4,

      fontSize: 14,

      fontWeight: "800",

      color: "#20252B",
    },

    metricPositive: {
      color: "#15803D",
    },

    metricNegative: {
      color: "#B42318",
    },

    noteContainer: {
      marginTop: 13,

      flexDirection: "row",
      alignItems:
        "flex-start",

      gap: 7,

      borderRadius: 10,

      padding: 10,

      backgroundColor:
        "#F8FAFC",
    },

    noteText: {
      flex: 1,

      fontSize: 12,

      lineHeight: 17,

      color: "#52606D",
    },

    footerRow: {
      marginTop: 13,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    sourceText: {
      fontSize: 11,

      fontWeight: "600",

      color: "#8B949E",
    },

    dateText: {
      marginLeft: 12,

      fontSize: 11,

      fontWeight: "600",

      textAlign: "right",

      color: "#8B949E",
    },

    emptyContainer: {
      marginTop: 30,

      alignItems: "center",

      borderWidth: 1,
      borderColor:
        "#E5E7EB",

      borderRadius: 18,

      paddingHorizontal: 24,
      paddingVertical: 45,

      backgroundColor:
        "#FFFFFF",
    },

    emptyTitle: {
      marginTop: 12,

      fontSize: 18,

      fontWeight: "800",

      color: "#111827",
    },

    emptyText: {
      marginTop: 6,

      maxWidth: 280,

      fontSize: 13,

      lineHeight: 19,

      textAlign: "center",

      color: "#6B7280",
    },
  });