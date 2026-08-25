import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  ScreenContainer,
} from "./ScreenContainer";

interface ImportInventoryProps {
  onClose:
    () => void;
}

export function ImportInventory({
  onClose,
}: ImportInventoryProps) {
  return (
    <ScreenContainer
      scrollable={
        false
      }
      topSpacing={
        8
      }
      bottomSpacing={
        24
      }
    >
      <View
        style={
          styles.headerRow
        }
      >
        <View
          style={
            styles.headerTextContainer
          }
        >
          <Text
            style={
              styles.title
            }
          >
            Import Inventory
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Import stock and product information from external sources.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={
            onClose
          }
          style={({
            pressed,
          }) => [
            styles.closeButton,

            pressed &&
              styles.buttonPressed,
          ]}
        >
          <Text
            style={
              styles.closeButtonText
            }
          >
            Close
          </Text>
        </Pressable>
      </View>

      <View
        style={
          styles.placeholderCard
        }
      >
        <Text
          style={
            styles.placeholderTitle
          }
        >
          Import Inventory
        </Text>

        <Text
          style={
            styles.placeholderText
          }
        >
          This V2 workspace will support Excel, CSV, PDF, images, and receipt scanning.
        </Text>

        <Text
          style={
            styles.placeholderHint
          }
        >
          We will build the shared import engine in a later V2 branch.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles =
  StyleSheet.create({
    headerRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    headerTextContainer: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        16,
    },

    title: {
      fontSize:
        28,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    subtitle: {
      marginTop:
        6,

      maxWidth:
        320,

      fontSize:
        13,

      lineHeight:
        19,

      color:
        "#6B7280",
    },

    closeButton: {
      minHeight:
        42,

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        10,

      paddingHorizontal:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    closeButtonText: {
      fontSize:
        14,

      fontWeight:
        "700",

      color:
        "#20252B",
    },

    buttonPressed: {
      opacity:
        0.7,
    },

    placeholderCard: {
      marginTop:
        24,

      borderWidth:
        1,

      borderColor:
        "#D9E4F5",

      borderRadius:
        18,

      padding:
        22,

      backgroundColor:
        "#FFFFFF",
    },

    placeholderTitle: {
      fontSize:
        19,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    placeholderText: {
      marginTop:
        8,

      fontSize:
        14,

      lineHeight:
        21,

      color:
        "#52606D",
    },

    placeholderHint: {
      marginTop:
        13,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#8B949E",
    },
  });