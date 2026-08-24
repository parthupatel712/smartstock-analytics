import {
  Ionicons,
} from "@expo/vector-icons";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export type BottomNavigationItem =
  | "home"
  | "inventory"
  | "scan"
  | "orders"
  | "analytics";

interface BottomNavigationProps {
  activeItem?:
    BottomNavigationItem | null;

  onHome:
    () => void;

  onInventory:
    () => void;

  onScan:
    () => void;

  onOrders:
    () => void;

  onAnalytics:
    () => void;
}

export function BottomNavigation({
  activeItem = null,
  onHome,
  onInventory,
  onScan,
  onOrders,
  onAnalytics,
}: BottomNavigationProps) {
  const insets =
    useSafeAreaInsets();

  /*
   * Keep enough room for the iPhone
   * home indicator without wasting
   * too much vertical space.
   */
  const bottomPadding =
    Math.max(
      insets.bottom - 14,
      2,
    );

  return (
    <View
      style={[
        styles.container,

        {
          paddingBottom:
            bottomPadding,
        },
      ]}
    >
      <View
        style={
          styles.bar
        }
      >
        <NavigationButton
          icon="home-outline"
          activeIcon="home"
          label="Home"
          active={
            activeItem ===
            "home"
          }
          onPress={
            onHome
          }
        />

        <NavigationButton
          icon="cube-outline"
          activeIcon="cube"
          label="Inventory"
          active={
            activeItem ===
            "inventory"
          }
          onPress={
            onInventory
          }
        />

        <NavigationButton
          icon="barcode-outline"
          activeIcon="barcode"
          label="Scan"
          active={
            activeItem ===
            "scan"
          }
          accent
          onPress={
            onScan
          }
        />

        <NavigationButton
          icon="cart-outline"
          activeIcon="cart"
          label="Orders"
          active={
            activeItem ===
            "orders"
          }
          onPress={
            onOrders
          }
        />

        <NavigationButton
          icon="bar-chart-outline"
          activeIcon="bar-chart"
          label="Analytics"
          active={
            activeItem ===
            "analytics"
          }
          onPress={
            onAnalytics
          }
        />
      </View>
    </View>
  );
}

function NavigationButton({
  icon,
  activeIcon,
  label,
  active,
  accent =
    false,
  onPress,
}: {
  icon:
    | "home-outline"
    | "cube-outline"
    | "barcode-outline"
    | "cart-outline"
    | "bar-chart-outline";

  activeIcon:
    | "home"
    | "cube"
    | "barcode"
    | "cart"
    | "bar-chart";

  label:
    string;

  active:
    boolean;

  accent?:
    boolean;

  onPress:
    () => void;
}) {
  const activeColor =
    accent
      ? "#2563EB"
      : "#111827";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        label
      }
      accessibilityState={{
        selected:
          active,
      }}
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.navButton,

        active &&
          styles.navButtonActive,

        active &&
          accent &&
          styles.navButtonAccentActive,

        pressed &&
          styles.navButtonPressed,
      ]}
    >
      <View
        style={[
          styles.iconContainer,

          active &&
            styles.iconContainerActive,

          active &&
            accent &&
            styles.iconContainerAccentActive,
        ]}
      >
        <Ionicons
          name={
            active
              ? activeIcon
              : icon
          }
          size={
            24
          }
          color={
            active
              ? activeColor
              : "#667085"
          }
        />
      </View>

      <Text
        style={[
          styles.navLabel,

          active &&
            styles.navLabelActive,

          active &&
            accent &&
            styles.navLabelAccentActive,
        ]}
        numberOfLines={
          1
        }
        adjustsFontSizeToFit
        minimumFontScale={
          0.78
        }
      >
        {
          label
        }
      </Text>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flexShrink:
        0,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        "#E1E5EA",

      paddingTop:
        2,

      paddingHorizontal:
        5,

      backgroundColor:
        "#FFFFFF",
    },

    bar: {
      minHeight:
        58,

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#FFFFFF",
    },

    navButton: {
      flex:
        1,

      minWidth:
        0,

      minHeight:
        52,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        14,

      paddingHorizontal:
        2,

      paddingVertical:
        2,
    },

    navButtonActive: {
      backgroundColor:
        "#F3F5F7",
    },

    navButtonAccentActive: {
      backgroundColor:
        "#EFF6FF",
    },

    navButtonPressed: {
      opacity:
        0.60,
    },

    iconContainer: {
      width:
        36,

      height:
        30,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        10,
    },

    iconContainerActive: {
      backgroundColor:
        "#E7EBEF",
    },

    iconContainerAccentActive: {
      backgroundColor:
        "#DBEAFE",
    },

    navLabel: {
      marginTop:
        1,

      width:
        "100%",

      fontSize:
        8.5,

      lineHeight:
        10,

      fontWeight:
        "700",

      textAlign:
        "center",

      color:
        "#667085",
    },

    navLabelActive: {
      fontWeight:
        "800",

      color:
        "#111827",
    },

    navLabelAccentActive: {
      color:
        "#2563EB",
    },
  });