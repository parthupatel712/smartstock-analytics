import * as Sharing from "expo-sharing";

import type {
  ExportedReport,
  ExportFileFormat,
} from "../types/exportReport";

function getSharingOptions(
  format: ExportFileFormat,
): {
  mimeType?: string;
  UTI?: string;
  dialogTitle?: string;
} {
  switch (format) {
    case "csv":
      return {
        mimeType: "text/csv",
        UTI: "public.comma-separated-values-text",
        dialogTitle: "Share SmartStock CSV Report",
      };

    case "xlsx":
      return {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        UTI:
          "org.openxmlformats.spreadsheetml.sheet",
        dialogTitle: "Share SmartStock Excel Report",
      };

    case "pdf":
      return {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: "Share SmartStock PDF Report",
      };

    default:
      return {
        dialogTitle: "Share SmartStock Report",
      };
  }
}

export async function shareExportedReport(
  report: ExportedReport,
): Promise<void> {
  const sharingAvailable =
    await Sharing.isAvailableAsync();

  if (!sharingAvailable) {
    throw new Error(
      "File sharing is not available on this device.",
    );
  }

  await Sharing.shareAsync(
    report.fileUri,
    getSharingOptions(report.format),
  );
}