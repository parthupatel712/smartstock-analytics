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
  | "dashboard"
  | "history"
  | "scan"
  | "reorder"
  | "analytics"
  | "data";

interface BottomNavigationProps {
  activeItem?:
    BottomNavigationItem | null;

  onDashboard:
    () => void;

  onHistory:
    () => void;

  onScan:
    () => void;

  onReorder:
    () => void;

  onAnalytics:
    () => void;

  onData:
    () => void;
}

export function BottomNavigation({
  activeItem = null,
  onDashboard,
  onHistory,
  onScan,
  onReorder,
  onAnalytics,
  onData,
}: BottomNavigationProps) {
  const insets =
    useSafeAreaInsets();

  /*
   * Keep enough space for the iPhone
   * home indicator, but don't waste
   * the entire safe-area height.
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
          icon="grid-outline"
          activeIcon="grid"
          label="Dashboard"
          active={
            activeItem ===
            "dashboard"
          }
          onPress={
            onDashboard
          }
        />

        <NavigationButton
          icon="time-outline"
          activeIcon="time"
          label="History"
          active={
            activeItem ===
            "history"
          }
          onPress={
            onHistory
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
          icon="cube-outline"
          activeIcon="cube"
          label="Reorder"
          active={
            activeItem ===
            "reorder"
          }
          onPress={
            onReorder
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

        <NavigationButton
          icon="swap-vertical-outline"
          activeIcon="swap-vertical"
          label="Data"
          active={
            activeItem ===
            "data"
          }
          onPress={
            onData
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
    | "grid-outline"
    | "time-outline"
    | "barcode-outline"
    | "cube-outline"
    | "bar-chart-outline"
    | "swap-vertical-outline";

  activeIcon:
    | "grid"
    | "time"
    | "barcode"
    | "cube"
    | "bar-chart"
    | "swap-vertical";

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
            23
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
          0.72
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
    /*
     * Navigation stays in the normal
     * page layout.
     *
     * No absolute positioning.
     * No floating overlay.
     * No blur.
     */
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

    /*
     * Reduced from 69px.
     *
     * This gives the page noticeably
     * more usable vertical space.
     */
    bar: {
      minHeight:
        56,

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
        50,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        14,

      paddingHorizontal:
        1,

      paddingVertical:
        2,
    },

    /*
     * Selected tab remains subtle,
     * similar to Apple's tab controls.
     */
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

    /*
     * Smaller icon container allows
     * the complete navbar to shrink.
     */
    iconContainer: {
      width:
        34,

      height:
        28,

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
        8,

      lineHeight:
        9,

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