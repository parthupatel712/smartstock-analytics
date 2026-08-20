import * as DocumentPicker from "expo-document-picker";

import * as ImagePicker from "expo-image-picker";

import type {
  ImportDocument,
  ImportDocumentResult,
  ImportDocumentType,
} from "../types/importDocument";

function determineDocumentType(
  name:
    string,

  mimeType:
    string | null,
): ImportDocumentType {
  const normalizedName =
    name.toLowerCase();

  const normalizedMime =
    mimeType?.toLowerCase() ??
    "";

  if (
    normalizedMime.startsWith(
      "image/",
    ) ||
    normalizedName.endsWith(
      ".jpg",
    ) ||
    normalizedName.endsWith(
      ".jpeg",
    ) ||
    normalizedName.endsWith(
      ".png",
    ) ||
    normalizedName.endsWith(
      ".heic",
    ) ||
    normalizedName.endsWith(
      ".webp",
    )
  ) {
    return "image";
  }

  if (
    normalizedMime ===
      "application/pdf" ||
    normalizedName.endsWith(
      ".pdf",
    )
  ) {
    return "pdf";
  }

  if (
    normalizedName.endsWith(
      ".xlsx",
    ) ||
    normalizedName.endsWith(
      ".xls",
    ) ||
    normalizedMime.includes(
      "spreadsheet",
    ) ||
    normalizedMime.includes(
      "excel",
    )
  ) {
    return "excel";
  }

  return "unknown";
}

export async function captureImportDocument():
  Promise<ImportDocumentResult> {
  const permission =
    await ImagePicker.requestCameraPermissionsAsync();

  if (
    !permission.granted
  ) {
    throw new Error(
      "Camera permission is required to scan an invoice.",
    );
  }

  const result =
    await ImagePicker.launchCameraAsync({
      mediaTypes: [
        "images",
      ],

      allowsEditing:
        false,

      quality:
        1,
    });

  if (
    result.canceled ||
    result.assets.length ===
      0
  ) {
    return {
      document:
        null,

      cancelled:
        true,
    };
  }

  const asset =
    result.assets[0];

  const fileName =
    asset.fileName ??
    `invoice-${Date.now()}.jpg`;

  const document:
    ImportDocument = {
      uri:
        asset.uri,

      name:
        fileName,

      mimeType:
        asset.mimeType ??
        "image/jpeg",

      fileType:
        "image",

      source:
        "camera",

      size:
        asset.fileSize ??
        null,

      createdAt:
        new Date().toISOString(),
    };

  return {
    document,

    cancelled:
      false,
  };
}

export async function chooseImportImage():
  Promise<ImportDocumentResult> {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (
    !permission.granted
  ) {
    throw new Error(
      "Photo-library permission is required to choose an invoice image.",
    );
  }

  const result =
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [
        "images",
      ],

      allowsMultipleSelection:
        false,

      quality:
        1,
    });

  if (
    result.canceled ||
    result.assets.length ===
      0
  ) {
    return {
      document:
        null,

      cancelled:
        true,
    };
  }

  const asset =
    result.assets[0];

  const fileName =
    asset.fileName ??
    `invoice-${Date.now()}.jpg`;

  const document:
    ImportDocument = {
      uri:
        asset.uri,

      name:
        fileName,

      mimeType:
        asset.mimeType ??
        "image/jpeg",

      fileType:
        "image",

      source:
        "photo_library",

      size:
        asset.fileSize ??
        null,

      createdAt:
        new Date().toISOString(),
    };

  return {
    document,

    cancelled:
      false,
  };
}

export async function chooseImportFile():
  Promise<ImportDocumentResult> {
  const result =
    await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",

        "image/*",

        "application/vnd.ms-excel",

        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],

      multiple:
        false,

      copyToCacheDirectory:
        true,
    });

  if (
    result.canceled ||
    result.assets.length ===
      0
  ) {
    return {
      document:
        null,

      cancelled:
        true,
    };
  }

  const asset =
    result.assets[0];

  const mimeType =
    asset.mimeType ??
    null;

  const document:
    ImportDocument = {
      uri:
        asset.uri,

      name:
        asset.name,

      mimeType,

      fileType:
        determineDocumentType(
          asset.name,
          mimeType,
        ),

      source:
        "file",

      size:
        asset.size ??
        null,

      createdAt:
        new Date().toISOString(),
    };

  return {
    document,

    cancelled:
      false,
  };
}