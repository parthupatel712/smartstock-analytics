import {
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
  ExportFileFormat,
  ExportReportType,
} from "../types/exportReport";

interface ExportReportsProps {
  selectedReportType:
    ExportReportType;

  selectedFormat:
    ExportFileFormat;

  isExporting?:
    boolean;

  onReportTypeChange: (
    reportType:
      ExportReportType,
  ) => void;

  onFormatChange: (
    format:
      ExportFileFormat,
  ) => void;

  onExport:
    () => void;

  onClose:
    () => void;
}

interface Option<T> {
  value:
    T;

  label:
    string;

  description:
    string;
}

const REPORT_OPTIONS:
  Option<ExportReportType>[] = [
    {
      value:
        "inventory",

      label:
        "Inventory",

      description:
        "Products, prices, stock levels, categories, and reorder information.",
    },

    {
      value:
        "transactions",

      label:
        "Stock History",

      description:
        "Sales, stock added, damaged items, returns, and physical counts.",
    },

    {
      value:
        "analytics",

      label:
        "Analytics",

      description:
        "Sales trends, product performance, category performance, and store metrics.",
    },
  ];

const FORMAT_OPTIONS:
  Option<ExportFileFormat>[] = [
    {
      value:
        "csv",

      label:
        "CSV",

      description:
        "Best for raw data, Excel, Python, Power BI, Tableau, and further analysis.",
    },

    {
      value:
        "xlsx",

      label:
        "Excel",

      description:
        "Spreadsheet format for reviewing, filtering, and sharing business data.",
    },

    {
      value:
        "pdf",

      label:
        "PDF",

      description:
        "Printable report that is easy to share or keep as a business record.",
    },
  ];

export function ExportReports({
  selectedReportType,
  selectedFormat,
  isExporting = false,
  onReportTypeChange,
  onFormatChange,
  onExport,
  onClose,
}: ExportReportsProps) {
  const selectedReport =
    REPORT_OPTIONS.find(
      (
        option,
      ) =>
        option.value ===
        selectedReportType,
    ) ??
    REPORT_OPTIONS[0];

  const selectedFormatOption =
    FORMAT_OPTIONS.find(
      (
        option,
      ) =>
        option.value ===
        selectedFormat,
    ) ??
    FORMAT_OPTIONS[0];

  return (
    <SafeAreaView
      edges={[
        "top",
        "left",
        "right",
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
                styles.title
              }
            >
              Export Reports
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Create a report from your SmartStock data and share it from your device.
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

        <Text
          style={
            styles.sectionTitle
          }
        >
          Report
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          Choose the information you want to export.
        </Text>

        <View
          style={
            styles.optionList
          }
        >
          {REPORT_OPTIONS.map(
            (
              option,
            ) => {
              const selected =
                selectedReportType ===
                option.value;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                  key={
                    option.value
                  }
                  onPress={() =>
                    onReportTypeChange(
                      option.value,
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.optionCard,

                    selected &&
                      styles.optionCardSelected,

                    pressed &&
                      styles.buttonPressed,
                  ]}
                >
                  <View
                    style={
                      styles.optionTextContainer
                    }
                  >
                    <Text
                      style={[
                        styles.optionTitle,

                        selected &&
                          styles.optionTitleSelected,
                      ]}
                    >
                      {
                        option.label
                      }
                    </Text>

                    <Text
                      style={
                        styles.optionDescription
                      }
                    >
                      {
                        option.description
                      }
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.selectionIndicator,

                      selected &&
                        styles.selectionIndicatorSelected,
                    ]}
                  >
                    {selected ? (
                      <Text
                        style={
                          styles.checkText
                        }
                      >
                        ✓
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            },
          )}
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          File Format
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          Choose how you want the report saved.
        </Text>

        <View
          style={
            styles.formatList
          }
        >
          {FORMAT_OPTIONS.map(
            (
              option,
            ) => {
              const selected =
                selectedFormat ===
                option.value;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                  key={
                    option.value
                  }
                  onPress={() =>
                    onFormatChange(
                      option.value,
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.formatCard,

                    selected &&
                      styles.formatCardSelected,

                    pressed &&
                      styles.buttonPressed,
                  ]}
                >
                  <View
                    style={
                      styles.formatHeader
                    }
                  >
                    <Text
                      style={[
                        styles.formatTitle,

                        selected &&
                          styles.formatTitleSelected,
                      ]}
                    >
                      {
                        option.label
                      }
                    </Text>

                    <View
                      style={[
                        styles.formatIndicator,

                        selected &&
                          styles.formatIndicatorSelected,
                      ]}
                    >
                      {selected ? (
                        <Text
                          style={
                            styles.formatCheckText
                          }
                        >
                          ✓
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <Text
                    style={
                      styles.formatDescription
                    }
                  >
                    {
                      option.description
                    }
                  </Text>
                </Pressable>
              );
            },
          )}
        </View>

        <View
          style={
            styles.previewCard
          }
        >
          <Text
            style={
              styles.previewLabel
            }
          >
            Ready to Export
          </Text>

          <Text
            style={
              styles.previewTitle
            }
            numberOfLines={
              2
            }
          >
            {
              selectedReport.label
            }{" "}
            ·{" "}
            {
              selectedFormatOption.label
            }
          </Text>

          <Text
            style={
              styles.previewDescription
            }
          >
            {
              selectedReport.description
            }
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Export ${selectedReport.label} as ${selectedFormatOption.label}`}
          disabled={
            isExporting
          }
          onPress={
            onExport
          }
          style={({
            pressed,
          }) => [
            styles.exportButton,

            pressed &&
              !isExporting &&
              styles.exportButtonPressed,

            isExporting &&
              styles.exportButtonDisabled,
          ]}
        >
          <Text
            style={
              styles.exportButtonText
            }
          >
            {isExporting
              ? "Generating…"
              : "Generate & Share"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
        6,

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

    sectionTitle: {
      marginTop:
        26,

      fontSize:
        19,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    sectionDescription: {
      marginTop:
        4,

      marginBottom:
        12,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#6B7280",
    },

    optionList: {
      gap:
        10,
    },

    optionCard: {
      minHeight:
        88,

      flexDirection:
        "row",

      alignItems:
        "center",

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

    optionCardSelected: {
      borderColor:
        "#1D4ED8",

      backgroundColor:
        "#EFF6FF",
    },

    optionTextContainer: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        14,
    },

    optionTitle: {
      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    optionTitleSelected: {
      color:
        "#1D4ED8",
    },

    optionDescription: {
      marginTop:
        4,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#6B7280",
    },

    selectionIndicator: {
      flexShrink:
        0,

      width:
        28,

      height:
        28,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        2,

      borderColor:
        "#CBD2DA",

      borderRadius:
        14,
    },

    selectionIndicatorSelected: {
      borderColor:
        "#1D4ED8",

      backgroundColor:
        "#1D4ED8",
    },

    checkText: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    formatList: {
      gap:
        10,
    },

    formatCard: {
      minHeight:
        82,

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

    formatCardSelected: {
      borderColor:
        "#0F766E",

      backgroundColor:
        "#F0FDFA",
    },

    formatHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    formatTitle: {
      flex:
        1,

      minWidth:
        0,

      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    formatTitleSelected: {
      color:
        "#0F766E",
    },

    formatIndicator: {
      flexShrink:
        0,

      width:
        24,

      height:
        24,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        2,

      borderColor:
        "#CBD2DA",

      borderRadius:
        12,
    },

    formatIndicatorSelected: {
      borderColor:
        "#0F766E",

      backgroundColor:
        "#0F766E",
    },

    formatCheckText: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    formatDescription: {
      marginTop:
        5,

      paddingRight:
        28,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#6B7280",
    },

    previewCard: {
      marginTop:
        26,

      borderRadius:
        16,

      padding:
        18,

      backgroundColor:
        "#20252B",
    },

    previewLabel: {
      fontSize:
        11,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      letterSpacing:
        0.3,

      color:
        "#CBD5E1",
    },

    previewTitle: {
      marginTop:
        7,

      fontSize:
        20,

      lineHeight:
        25,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    previewDescription: {
      marginTop:
        7,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#CBD5E1",
    },

    exportButton: {
      marginTop:
        18,

      minHeight:
        52,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        14,

      backgroundColor:
        "#20252B",
    },

    exportButtonPressed: {
      backgroundColor:
        "#111827",
    },

    exportButtonDisabled: {
      opacity:
        0.55,
    },

    exportButtonText: {
      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },
  });