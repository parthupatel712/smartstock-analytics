export type CloudSyncState =
  | "idle"
  | "syncing"
  | "synced"
  | "error";

export type CloudSyncOperation =
  | "startup"
  | "refresh"
  | "manual"
  | "product-create"
  | "product-update"
  | "product-archive"
  | "product-restore"
  | "inventory-update";

export interface CloudSyncStatusState {
  state:
    CloudSyncState;

  operation:
    CloudSyncOperation | null;

  lastSuccessfulSync:
    string | null;

  errorMessage:
    string | null;
}

export const INITIAL_CLOUD_SYNC_STATUS:
  CloudSyncStatusState = {
    state:
      "idle",

    operation:
      null,

    lastSuccessfulSync:
      null,

    errorMessage:
      null,
  };