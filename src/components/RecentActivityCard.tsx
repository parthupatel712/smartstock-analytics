import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { DashboardRecentActivity } from "../types/dashboardRecentActivity";

interface Props {
  activity: DashboardRecentActivity;
}

export function RecentActivityCard({
  activity,
}: Props) {
  const change =
    activity.stockAfter -
    activity.stockBefore;

  const increase = change > 0;

  const {
    icon,
    iconColor,
    badge,
    badgeColor,
    badgeBackground,
  } = getActivityStyle(
    activity.transactionType,
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.leftColumn}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                badgeBackground,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={22}
            color={iconColor}
          />
        </View>

        <View style={styles.timeline} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={styles.productName}
          >
            {activity.productName}
          </Text>

          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  badgeBackground,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: badgeColor,
                },
              ]}
            >
              {badge}
            </Text>
          </View>
        </View>

        <Text style={styles.brand}>
          {activity.productBrand}
        </Text>

        <View style={styles.metrics}>
          <Metric
            title="Change"
            value={`${increase ? "+" : ""}${change}`}
            valueColor={
              increase
                ? "#15803D"
                : "#B42318"
            }
          />

          <Metric
            title="Stock"
            value={`${activity.stockBefore} → ${activity.stockAfter}`}
          />

          <Metric
            title="Value"
            value={`$${activity.transactionValue.toFixed(
              2,
            )}`}
          />
        </View>

        {activity.notes ? (
          <Text style={styles.note}>
            {activity.notes}
          </Text>
        ) : null}

        <Text style={styles.time}>
          {new Date(
            activity.createdAt,
          ).toLocaleString()}
        </Text>
      </View>
    </Pressable>
  );
}

function Metric({
  title,
  value,
  valueColor = "#111827",
}: {
  title: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricTitle}>
        {title}
      </Text>

      <Text
        style={[
          styles.metricValue,
          {
            color: valueColor,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function getActivityStyle(
  type: DashboardRecentActivity["transactionType"],
) {
  switch (type) {
    case "stock_in":
      return {
        icon:
          "arrow-down-circle-outline" as const,
        iconColor: "#15803D",
        badge: "Delivery",
        badgeColor: "#15803D",
        badgeBackground: "#ECFDF3",
      };

    case "sale":
      return {
        icon:
          "cart-outline" as const,
        iconColor: "#2563EB",
        badge: "Sale",
        badgeColor: "#2563EB",
        badgeBackground: "#EFF6FF",
      };

    case "damage":
      return {
        icon:
          "warning-outline" as const,
        iconColor: "#DC2626",
        badge: "Damage",
        badgeColor: "#DC2626",
        badgeBackground: "#FEF2F2",
      };

    case "return":
      return {
        icon:
          "return-down-back-outline" as const,
        iconColor: "#7C3AED",
        badge: "Return",
        badgeColor: "#7C3AED",
        badgeBackground: "#F5F3FF",
      };

    default:
      return {
        icon:
          "calculator-outline" as const,
        iconColor: "#D97706",
        badge: "Count",
        badgeColor: "#D97706",
        badgeBackground: "#FFF7ED",
      };
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  cardPressed: {
    opacity: 0.75,
  },

  leftColumn: {
    alignItems: "center",
    marginRight: 16,
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },

  timeline: {
    flex: 1,
    width: 2,
    marginTop: 8,
    backgroundColor: "#E5E7EB",
  },

  content: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  brand: {
    marginTop: 3,
    color: "#6B7280",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  badgeText: {
    fontWeight: "700",
    fontSize: 12,
  },

  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  metric: {
    flex: 1,
  },

  metricTitle: {
    color: "#6B7280",
    fontSize: 11,
  },

  metricValue: {
    marginTop: 4,
    fontWeight: "700",
  },

  note: {
    marginTop: 14,
    color: "#475569",
    fontStyle: "italic",
  },

  time: {
    marginTop: 10,
    fontSize: 12,
    color: "#9CA3AF",
  },
});