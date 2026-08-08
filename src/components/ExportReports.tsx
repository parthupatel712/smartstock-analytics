import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type {
  ExportFileFormat,
  ExportReportType,
} from "../types/exportReport";

interface ExportReportsProps {
  selectedReportType: ExportReportType;
  selectedFormat: ExportFileFormat;
  isExporting?: boolean;
  onReportTypeChange: (
    reportType: ExportReportType,
  ) => void;
  onFormatChange: (
    format: ExportFileFormat,
  ) => void;
  onExport: () => void;
  onClose: () => void;
}

interface Option<T> {
  value: T;
  label: string;
  description: string;
}

const REPORT_OPTIONS: Option<ExportReportType>[] = [
  {
    value: "inventory",
    label: "Inventory",
    description:
      "Current products, pricing, stock, category, and reorder information.",
  },
  {
    value: "transactions",
    label: "Transactions",
    description:
      "Inventory movement history including sales, deliveries, damage, and adjustments.",
  },
  {
    value: "analytics",
    label: "Analytics",
    description:
      "Daily trends, top products, category performance, and sales metrics.",
  },
];

const FORMAT_OPTIONS: Option<ExportFileFormat>[] = [
  {
    value: "csv",
    label: "CSV",
    description:
      "Best for raw data, Excel, Python, Power BI, Tableau, and data analysis.",
  },
  {
    value: "xlsx",
    label: "Excel",
    description:
      "Formatted workbook for business reporting and spreadsheet analysis.",
  },
  {
    value: "pdf",
    label: "PDF",
    description:
      "Polished printable report for sharing with managers or clients.",
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
      (option) =>
        option.value === selectedReportType,
    ) ?? REPORT_OPTIONS[0];

  const selectedFormatOption =
    FORMAT_OPTIONS.find(
      (option) =>
        option.value === selectedFormat,
    ) ?? FORMAT_OPTIONS[0];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              Export Reports
            </Text>

            <Text style={styles.subtitle}>
              Generate business-ready files from your SmartStock data.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.closeButtonText}>
              Close
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          Choose report
        </Text>

        <View style={styles.optionList}>
          {REPORT_OPTIONS.map((option) => {
            const selected =
              selectedReportType === option.value;

            return (
              <Pressable
                accessibilityRole="button"
                key={option.value}
                onPress={() =>
                  onReportTypeChange(option.value)
                }
                style={({ pressed }) => [
                  styles.optionCard,
                  selected &&
                    styles.optionCardSelected,
                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionTitle,
                      selected &&
                        styles.optionTitleSelected,
                    ]}
                  >
                    {option.label}
                  </Text>

                  <Text style={styles.optionDescription}>
                    {option.description}
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
                    <Text style={styles.checkText}>
                      ✓
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>
          Choose format
        </Text>

        <View style={styles.formatRow}>
          {FORMAT_OPTIONS.map((option) => {
            const selected =
              selectedFormat === option.value;

            return (
              <Pressable
                accessibilityRole="button"
                key={option.value}
                onPress={() =>
                  onFormatChange(option.value)
                }
                style={({ pressed }) => [
                  styles.formatCard,
                  selected &&
                    styles.formatCardSelected,
                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.formatTitle,
                    selected &&
                      styles.formatTitleSelected,
                  ]}
                >
                  {option.label}
                </Text>

                <Text
                  style={styles.formatDescription}
                >
                  {option.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>
            Export summary
          </Text>

          <Text style={styles.previewTitle}>
            {selectedReport.label} →{" "}
            {selectedFormatOption.label}
          </Text>

          <Text style={styles.previewDescription}>
            {selectedReport.description}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isExporting}
          onPress={onExport}
          style={({ pressed }) => [
            styles.exportButton,
            pressed && styles.buttonPressed,
            isExporting &&
              styles.exportButtonDisabled,
          ]}
        >
          <Text style={styles.exportButtonText}>
            {isExporting
              ? "Generating report…"
              : "Generate & Share"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  content: {
    padding: 18,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
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
    marginTop: 6,
    fontSize: 15,
    lineHeight: 21,
    color: "#6B7280",
  },
  closeButton: {
    borderWidth: 1,
    borderColor: "#CBD2DA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#20252B",
  },
  buttonPressed: {
    opacity: 0.72,
  },
  sectionTitle: {
    marginTop: 26,
    marginBottom: 12,
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },
  optionList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E4E8",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  optionCardSelected: {
    borderColor: "#1D4ED8",
    backgroundColor: "#EFF6FF",
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 14,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  optionTitleSelected: {
    color: "#1D4ED8",
  },
  optionDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#6B7280",
  },
  selectionIndicator: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#CBD2DA",
    borderRadius: 14,
  },
  selectionIndicatorSelected: {
    borderColor: "#1D4ED8",
    backgroundColor: "#1D4ED8",
  },
  checkText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  formatRow: {
    gap: 12,
  },
  formatCard: {
    borderWidth: 1,
    borderColor: "#E0E4E8",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  formatCardSelected: {
    borderColor: "#0F766E",
    backgroundColor: "#F0FDFA",
  },
  formatTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  formatTitleSelected: {
    color: "#0F766E",
  },
  formatDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#6B7280",
  },
  previewCard: {
    marginTop: 26,
    borderRadius: 16,
    padding: 18,
    backgroundColor: "#20252B",
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#CBD5E1",
  },
  previewTitle: {
    marginTop: 7,
    fontSize: 21,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  previewDescription: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: "#CBD5E1",
  },
  exportButton: {
    marginTop: 18,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#20252B",
  },
  exportButtonDisabled: {
    opacity: 0.55,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});