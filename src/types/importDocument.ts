export type ImportDocumentSource =
  | "camera"
  | "photo_library"
  | "file";

export type ImportDocumentType =
  | "image"
  | "pdf"
  | "excel"
  | "unknown";

export interface ImportDocument {
  uri:
    string;

  name:
    string;

  mimeType:
    string | null;

  fileType:
    ImportDocumentType;

  source:
    ImportDocumentSource;

  size:
    number | null;

  createdAt:
    string;
}

export interface ImportDocumentResult {
  document:
    ImportDocument | null;

  cancelled:
    boolean;
}