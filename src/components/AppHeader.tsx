import {
  Ionicons,
} from "@expo/vector-icons";

import {
  BlurView,
} from "expo-blur";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export function AppHeader() {
  const insets =
    useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,

        {
          paddingTop:
            insets.top,
        },
      ]}
    >
      <BlurView
        intensity={
          65
        }
        tint="light"
        style={
          StyleSheet.absoluteFill
        }
      />

      <View
        pointerEvents="none"
        style={
          styles.backgroundOverlay
        }
      />

      <View
        style={
          styles.content
        }
      >
        <View
          style={
            styles.logo
          }
        >
          <Ionicons
            name="cube"
            size={
              19
            }
            color="#FFFFFF"
          />
        </View>

        <Text
          style={
            styles.appName
          }
          numberOfLines={
            1
          }
        >
          SmartStock
        </Text>
      </View>

      <View
        pointerEvents="none"
        style={
          styles.bottomEdge
        }
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    wrapper: {
      flexShrink:
        0,

      overflow:
        "hidden",

      backgroundColor:
        "rgba(244, 246, 248, 0.74)",
    },

    backgroundOverlay: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        "rgba(244, 246, 248, 0.34)",
    },

    content: {
      height:
        48,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        18,
    },

    logo: {
      width:
        34,

      height:
        34,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        10,

      backgroundColor:
        "#20252B",
    },

    appName: {
      marginLeft:
        9,

      fontSize:
        18,

      lineHeight:
        22,

      fontWeight:
        "800",

      letterSpacing:
        -0.3,

      color:
        "#101828",
    },

    bottomEdge: {
      height:
        StyleSheet.hairlineWidth,

      backgroundColor:
        "rgba(15, 23, 42, 0.08)",
    },
  });