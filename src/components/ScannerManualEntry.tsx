import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useMemo,
  useState,
} from "react";

import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface ScannerManualEntryProps {
  initialBarcode?:
    string;

  isProcessing?:
    boolean;

  onSubmit:
    (
      barcode:
        string,
    ) => Promise<void> | void;

  onCancel:
    () => void;
}

export function ScannerManualEntry({
  initialBarcode = "",
  isProcessing = false,
  onSubmit,
  onCancel,
}: ScannerManualEntryProps) {
  const [
    barcode,
    setBarcode,
  ] =
    useState(
      initialBarcode,
    );

  const normalizedBarcode =
    barcode.trim();

  const canSubmit =
    useMemo(
      () =>
        normalizedBarcode.length >
          0 &&
        !isProcessing,

      [
        normalizedBarcode,
        isProcessing,
      ],
    );

  async function handleSubmit():
    Promise<void> {
    if (
      !canSubmit
    ) {
      return;
    }

    Keyboard.dismiss();

    await onSubmit(
      normalizedBarcode,
    );
  }

  return (
    <View
      style={
        styles.card
      }
    >
      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerIcon
          }
        >
          <Ionicons
            name="keypad-outline"
            size={
              20
            }
            color="#2563EB"
          />
        </View>

        <View
          style={
            styles.headerText
          }
        >
          <Text
            style={
              styles.title
            }
          >
            Enter Barcode
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Type the barcode number to find a product manually.
          </Text>
        </View>
      </View>

      <View
        style={
          styles.inputContainer
        }
      >
        <Ionicons
          name="barcode-outline"
          size={
            20
          }
          color="#64748B"
        />

        <TextInput
          value={
            barcode
          }
          onChangeText={
            setBarcode
          }
          placeholder="Enter UPC / EAN barcode"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          autoFocus
          autoCorrect={
            false
          }
          returnKeyType="search"
          onSubmitEditing={() =>
            void handleSubmit()
          }
          style={
            styles.input
          }
        />

        {barcode.length >
        0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear barcode"
            hitSlop={
              8
            }
            onPress={() =>
              setBarcode(
                "",
              )
            }
            style={
              styles.clearButton
            }
          >
            <Ionicons
              name="close-circle"
              size={
                20
              }
              color="#94A3B8"
            />
          </Pressable>
        ) : null}
      </View>

      <Text
        style={
          styles.helperText
        }
      >
        You can type or paste the barcode printed on the product.
      </Text>

      <View
        style={
          styles.actions
        }
      >
        <Pressable
          accessibilityRole="button"
          disabled={
            isProcessing
          }
          onPress={
            onCancel
          }
          style={({
            pressed,
          }) => [
            styles.cancelButton,

            pressed &&
              styles.cancelButtonPressed,

            isProcessing &&
              styles.disabledButton,
          ]}
        >
          <Text
            style={
              styles.cancelButtonText
            }
          >
            Back to Scanner
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={
            !canSubmit
          }
          onPress={() =>
            void handleSubmit()
          }
          style={({
            pressed,
          }) => [
            styles.submitButton,

            pressed &&
              canSubmit &&
              styles.submitButtonPressed,

            !canSubmit &&
              styles.disabledSubmitButton,
          ]}
        >
          <Ionicons
            name="search-outline"
            size={
              18
            }
            color="#FFFFFF"
          />

          <Text
            style={
              styles.submitButtonText
            }
          >
            {
              isProcessing
                ? "Searching…"
                : "Find Product"
            }
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        17,

      padding:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    headerIcon: {
      width:
        40,

      height:
        40,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        13,

      backgroundColor:
        "#EFF6FF",
    },

    headerText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        10,
    },

    title: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    subtitle: {
      marginTop:
        2,

      fontSize:
        10,

      lineHeight:
        15,

      color:
        "#64748B",
    },

    inputContainer: {
      marginTop:
        15,

      minHeight:
        50,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#D6DCE3",

      borderRadius:
        13,

      paddingHorizontal:
        12,

      backgroundColor:
        "#F8FAFC",
    },

    input: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        9,

      paddingVertical:
        12,

      fontSize:
        15,

      fontWeight:
        "600",

      color:
        "#111827",
    },

    clearButton: {
      marginLeft:
        7,

      padding:
        2,
    },

    helperText: {
      marginTop:
        7,

      fontSize:
        9,

      lineHeight:
        14,

      color:
        "#8B949E",
    },

    actions: {
      marginTop:
        14,

      flexDirection:
        "row",

      gap:
        9,
    },

    cancelButton: {
      flex:
        1,

      minHeight:
        44,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#D6DCE3",

      borderRadius:
        11,

      paddingHorizontal:
        10,

      backgroundColor:
        "#FFFFFF",
    },

    cancelButtonPressed: {
      backgroundColor:
        "#F8FAFC",
    },

    cancelButtonText: {
      fontSize:
        11,

      fontWeight:
        "800",

      textAlign:
        "center",

      color:
        "#52606D",
    },

    submitButton: {
      flex:
        1,

      minHeight:
        44,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        6,

      borderRadius:
        11,

      paddingHorizontal:
        10,

      backgroundColor:
        "#20252B",
    },

    submitButtonPressed: {
      backgroundColor:
        "#111827",
    },

    submitButtonText: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    disabledButton: {
      opacity:
        0.55,
    },

    disabledSubmitButton: {
      backgroundColor:
        "#A7AFB9",
    },
  });