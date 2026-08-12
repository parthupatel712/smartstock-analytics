import {
  Ionicons,
} from "@expo/vector-icons";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type {
  CloudSyncStatusState,
} from "../types/cloudSyncStatus";

interface CloudSyncStatusProps {
  status:
    CloudSyncStatusState;

  onSync:
    () => void;
}

export function CloudSyncStatus({
  status,
  onSync,
}: CloudSyncStatusProps) {
  const isSyncing =
    status.state ===
    "syncing";

  const display =
    getStatusDisplay(
      status,
    );

  return (
    <View
      style={[
        styles.container,

        status.state ===
          "error" &&
          styles.containerError,

        status.state ===
          "synced" &&
          styles.containerSynced,
      ]}
    >
      <View
        style={
          styles.mainRow
        }
      >
        <View
          style={
            styles.statusIconContainer
          }
        >
          {isSyncing ? (
            <ActivityIndicator
              size="small"
            />
          ) : (
            <Ionicons
              name={
                display.icon
              }
              size={
                20
              }
              color={
                display.color
              }
            />
          )}
        </View>

        <View
          style={
            styles.textContainer
          }
        >
          <View
            style={
              styles.titleRow
            }
          >
            <Text
              style={
                styles.title
              }
            >
              Cloud Sync
            </Text>

            <View
              style={[
                styles.statusBadge,

                {
                  backgroundColor:
                    display.background,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,

                  {
                    color:
                      display.color,
                  },
                ]}
              >
                {
                  display.label
                }
              </Text>
            </View>
          </View>

          <Text
            style={
              styles.description
            }
          >
            {
              display.description
            }
          </Text>

          {status.lastSuccessfulSync ? (
            <Text
              style={
                styles.lastSyncText
              }
            >
              Last synced:{" "}
              {formatSyncTime(
                status.lastSuccessfulSync,
              )}
            </Text>
          ) : (
            <Text
              style={
                styles.lastSyncText
              }
            >
              No successful cloud sync yet
            </Text>
          )}

          {status.state ===
            "error" &&
          status.errorMessage ? (
            <Text
              numberOfLines={
                2
              }
              style={
                styles.errorText
              }
            >
              {
                status.errorMessage
              }
            </Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            status.state ===
            "error"
              ? "Retry cloud synchronization"
              : "Synchronize inventory now"
          }
          disabled={
            isSyncing
          }
          onPress={
            onSync
          }
          style={({
            pressed,
          }) => [
            styles.syncButton,

            pressed &&
              !isSyncing &&
              styles.syncButtonPressed,

            isSyncing &&
              styles.syncButtonDisabled,
          ]}
        >
          <Ionicons
            name={
              status.state ===
              "error"
                ? "refresh-outline"
                : "sync-outline"
            }
            size={
              17
            }
            color="#FFFFFF"
          />

          <Text
            style={
              styles.syncButtonText
            }
          >
            {isSyncing
              ? "Syncing"
              : status.state ===
                  "error"
                ? "Retry"
                : "Sync Now"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function getStatusDisplay(
  status:
    CloudSyncStatusState,
): {
  label:
    string;

  description:
    string;

  icon:
    | "cloud-done-outline"
    | "cloud-offline-outline"
    | "cloud-outline";

  color:
    string;

  background:
    string;
} {
  switch (
    status.state
  ) {
    case "syncing":
      return {
        label:
          "Syncing",

        description:
          getSyncingDescription(
            status.operation,
          ),

        icon:
          "cloud-outline",

        color:
          "#2563EB",

        background:
          "#EFF6FF",
      };

    case "synced":
      return {
        label:
          "Synced",

        description:
          "Local and cloud inventory are synchronized.",

        icon:
          "cloud-done-outline",

        color:
          "#15803D",

        background:
          "#ECFDF3",
      };

    case "error":
      return {
        label:
          "Cloud unavailable",

        description:
          "Your local inventory is still available. Cloud sync can be retried.",

        icon:
          "cloud-offline-outline",

        color:
          "#B42318",

        background:
          "#FFF1F0",
      };

    case "idle":
    default:
      return {
        label:
          "Ready",

        description:
          "Cloud synchronization is ready.",

        icon:
          "cloud-outline",

        color:
          "#52606D",

        background:
          "#F1F5F9",
      };
  }
}

function getSyncingDescription(
  operation:
    CloudSyncStatusState["operation"],
): string {
  switch (
    operation
  ) {
    case "startup":
      return "Downloading the latest inventory from the cloud.";

    case "refresh":
      return "Refreshing inventory from the cloud.";

    case "manual":
      return "Synchronizing local and cloud inventory.";

    case "product-create":
      return "Uploading the new product.";

    case "product-update":
      return "Uploading product changes.";

    case "product-archive":
      return "Updating archived product status.";

    case "product-restore":
      return "Restoring the product in the cloud.";

    case "inventory-update":
      return "Uploading the latest stock transaction.";

    default:
      return "Synchronizing inventory.";
  }
}

function formatSyncTime(
  value:
    string,
): string {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  const now =
    new Date();

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

  const yesterday =
    new Date(
      today,
    );

  yesterday.setDate(
    yesterday.getDate() -
      1,
  );

  const syncDay =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

  const time =
    date.toLocaleTimeString(
      "en-CA",
      {
        hour:
          "numeric",

        minute:
          "2-digit",
      },
    );

  if (
    syncDay.getTime() ===
    today.getTime()
  ) {
    return `Today, ${time}`;
  }

  if (
    syncDay.getTime() ===
    yesterday.getTime()
  ) {
    return `Yesterday, ${time}`;
  }

  return date.toLocaleString(
    "en-CA",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        date.getFullYear() ===
        now.getFullYear()
          ? undefined
          : "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    },
  );
}

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        15,

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        15,

      padding:
        13,

      backgroundColor:
        "#FFFFFF",
    },

    containerSynced: {
      borderColor:
        "#D1FAE5",
    },

    containerError: {
      borderColor:
        "#FECACA",

      backgroundColor:
        "#FFFDFD",
    },

    mainRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    statusIconContainer: {
      width:
        35,

      height:
        35,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        18,

      backgroundColor:
        "#F8FAFC",
    },

    textContainer: {
      flex:
        1,

      marginLeft:
        10,

      marginRight:
        9,
    },

    titleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flexWrap:
        "wrap",

      gap:
        7,
    },

    title: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    statusBadge: {
      borderRadius:
        999,

      paddingHorizontal:
        7,

      paddingVertical:
        3,
    },

    statusBadgeText: {
      fontSize:
        9,

      fontWeight:
        "800",
    },

    description: {
      marginTop:
        4,

      fontSize:
        10,

      lineHeight:
        15,

      color:
        "#6B7280",
    },

    lastSyncText: {
      marginTop:
        4,

      fontSize:
        10,

      fontWeight:
        "600",

      color:
        "#8B949E",
    },

    errorText: {
      marginTop:
        5,

      fontSize:
        9,

      lineHeight:
        13,

      color:
        "#B42318",
    },

    syncButton: {
      minHeight:
        35,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        5,

      borderRadius:
        9,

      paddingHorizontal:
        10,

      backgroundColor:
        "#20252B",
    },

    syncButtonPressed: {
      opacity:
        0.82,
    },

    syncButtonDisabled: {
      opacity:
        0.55,
    },

    syncButtonText: {
      fontSize:
        10,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },
  });