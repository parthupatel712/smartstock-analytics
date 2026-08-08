export type ExportReportType =
  | "inventory"
  | "transactions"
  | "analytics";

export type ExportFileFormat =
  | "csv"
  | "xlsx"
  | "pdf";

export interface ExportReportRequest {
  reportType: ExportReportType;
  format: ExportFileFormat;
}

export interface ExportedReport {
  fileName: string;
  fileUri: string;
  reportType: ExportReportType;
  format: ExportFileFormat;
  rowCount: number;
  createdAt: string;
}