import {
  type BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import {
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

interface BarcodeScannerProps {
  onClose:
    () => void;

  onBarcodeDetected:
    (
      barcode:
        string,
    ) => Promise<void>;
}

export function BarcodeScanner({
  onClose,
  onBarcodeDetected,
}: BarcodeScannerProps) {
  const [
    permission,
    requestPermission,
  ] =
    useCameraPermissions();

  const [
    hasScanned,
    setHasScanned,
  ] =
    useState(
      false,
    );

  const [
    isProcessing,
    setIsProcessing,
  ] =
    useState(
      false,
    );

  async function handleBarcodeScanned(
    result:
      BarcodeScanningResult,
  ): Promise<void> {
    if (
      hasScanned ||
      isProcessing
    ) {
      return;
    }

    const barcode =
      result.data.trim();

    if (
      !barcode
    ) {
      return;
    }

    setHasScanned(
      true,
    );

    setIsProcessing(
      true,
    );

    try {
      await onBarcodeDetected(
        barcode,
      );
    } catch (
      error
    ) {
      console.error(
        "Could not process barcode:",
        error,
      );

      setHasScanned(
        false,
      );
    } finally {
      setIsProcessing(
        false,
      );
    }
  }

  function scanAgain():
    void {
    setHasScanned(
      false,
    );
  }

  if (
    !permission
  ) {
    return (
      <View
        style={
          styles.centeredContainer
        }
      >
        <ActivityIndicator
          size="large"
        />

        <Text
          style={
            styles.statusText
          }
        >
          Checking camera permission…
        </Text>
      </View>
    );
  }

  if (
    !permission.granted
  ) {
    return (
      <SafeAreaView
        edges={[
          "top",
          "left",
          "right",
          "bottom",
        ]}
        style={
          styles.permissionScreen
        }
      >
        <View
          style={
            styles.centeredContainer
          }
        >
          <Text
            style={
              styles.title
            }
          >
            Camera permission required
          </Text>

          <Text
            style={
              styles.description
            }
          >
            SmartStock needs camera access to scan product barcodes.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              void requestPermission()
            }
            style={
              styles.primaryButton
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Allow camera access
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={
              onClose
            }
            style={
              styles.secondaryButton
            }
          >
            <Text
              style={
                styles.secondaryButtonText
              }
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View
      style={
        styles.screen
      }
    >
      <CameraView
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code128",
          ],
        }}
        facing="back"
        onBarcodeScanned={
          hasScanned
            ? undefined
            : (
                result,
              ) =>
                void handleBarcodeScanned(
                  result,
                )
        }
        style={
          StyleSheet.absoluteFill
        }
      />

      <SafeAreaView
        edges={[
          "top",
          "left",
          "right",
        ]}
        pointerEvents="box-none"
        style={
          styles.overlay
        }
      >
        <View
          pointerEvents="box-none"
          style={
            styles.topBar
          }
        >
          <Pressable
            accessibilityRole="button"
            hitSlop={
              12
            }
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
          pointerEvents="box-none"
          style={
            styles.scannerArea
          }
        >
          <View
            pointerEvents="none"
            style={
              styles.scanFrame
            }
          />

          <Text
            style={
              styles.instructions
            }
          >
            Position the product barcode inside the frame
          </Text>

          {isProcessing ? (
            <View
              style={
                styles.processingCard
              }
            >
              <ActivityIndicator
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.processingText
                }
              >
                Looking up product…
              </Text>
            </View>
          ) : null}

          {hasScanned &&
          !isProcessing ? (
            <Pressable
              accessibilityRole="button"
              onPress={
                scanAgain
              }
              style={
                styles.scanAgainButton
              }
            >
              <Text
                style={
                  styles.scanAgainButtonText
                }
              >
                Scan again
              </Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex:
        1,

      backgroundColor:
        "#000000",
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,

      zIndex:
        10,
    },

    topBar: {
      zIndex:
        20,

      alignItems:
        "flex-end",

      paddingHorizontal:
        20,

      paddingTop:
        8,
    },

    closeButton: {
      minWidth:
        76,

      alignItems:
        "center",

      borderRadius:
        10,

      paddingHorizontal:
        16,

      paddingVertical:
        11,

      backgroundColor:
        "rgba(0, 0, 0, 0.78)",
    },

    closeButtonText: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    buttonPressed: {
      opacity:
        0.7,
    },

    scannerArea: {
      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        28,
    },

    scanFrame: {
      width:
        "100%",

      maxWidth:
        340,

      height:
        190,

      borderWidth:
        3,

      borderColor:
        "#FFFFFF",

      borderRadius:
        18,

      backgroundColor:
        "transparent",
    },

    instructions: {
      marginTop:
        20,

      fontSize:
        16,

      lineHeight:
        23,

      textAlign:
        "center",

      color:
        "#FFFFFF",
    },

    processingCard: {
      marginTop:
        18,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius:
        12,

      paddingHorizontal:
        16,

      paddingVertical:
        12,

      backgroundColor:
        "rgba(0, 0, 0, 0.75)",
    },

    processingText: {
      marginLeft:
        10,

      fontSize:
        15,

      fontWeight:
        "600",

      color:
        "#FFFFFF",
    },

    scanAgainButton: {
      marginTop:
        18,

      borderRadius:
        10,

      paddingHorizontal:
        18,

      paddingVertical:
        12,

      backgroundColor:
        "#FFFFFF",
    },

    scanAgainButtonText: {
      fontWeight:
        "800",

      color:
        "#20252B",
    },

    permissionScreen: {
      flex:
        1,

      backgroundColor:
        "#F4F6F8",
    },

    centeredContainer: {
      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      padding:
        24,

      backgroundColor:
        "#F4F6F8",
    },

    title: {
      fontSize:
        24,

      fontWeight:
        "800",

      textAlign:
        "center",
    },

    description: {
      marginTop:
        12,

      fontSize:
        16,

      lineHeight:
        23,

      textAlign:
        "center",

      color:
        "#5D6673",
    },

    statusText: {
      marginTop:
        14,

      fontSize:
        16,

      color:
        "#5D6673",
    },

    primaryButton: {
      marginTop:
        24,

      minHeight:
        48,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        10,

      paddingHorizontal:
        18,

      backgroundColor:
        "#20252B",
    },

    primaryButtonText: {
      fontWeight:
        "700",

      color:
        "#FFFFFF",
    },

    secondaryButton: {
      marginTop:
        12,

      minHeight:
        46,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#C8CED6",

      borderRadius:
        10,

      paddingHorizontal:
        18,

      backgroundColor:
        "#FFFFFF",
    },

    secondaryButtonText: {
      fontWeight:
        "700",

      color:
        "#20252B",
    },
  });