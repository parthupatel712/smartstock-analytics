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
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

interface BarcodeScannerProps {
  title?:
    string;

  subtitle?:
    string;

  onClose:
    () => void;

  onBarcodeDetected:
    (
      barcode:
        string,
    ) => Promise<void>;

  onAddProductManually?:
    () => void;

  bottomContent?:
    React.ReactNode;
}

export function BarcodeScanner({
  title =
    "Scan Product",

  subtitle =
    "Scan a barcode to continue.",

  onClose,
  onBarcodeDetected,
  onAddProductManually,
  bottomContent,
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

      /*
       * Allow another barcode shortly
       * after a successful scan so a
       * different product can replace
       * the current result.
       */
      setTimeout(
        () => {
          setHasScanned(
            false,
          );
        },

        850,
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
              styles.permissionTitle
            }
          >
            Camera permission required
          </Text>

          <Text
            style={
              styles.permissionDescription
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
    <SafeAreaView
      edges={[
        "top",
        "left",
        "right",
        "bottom",
      ]}
      style={
        styles.screen
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={
            styles.header
          }
        >
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
              {
                title
              }
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              {
                subtitle
              }
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
              Back
            </Text>
          </Pressable>
        </View>

        <View
          style={
            styles.cameraCard
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
            /*
             * A mild zoom helps small
             * barcodes without forcing the
             * phone too close to the item.
             */
            zoom={
              0.12
            }
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
              styles.camera
            }
          />

          <View
            pointerEvents="none"
            style={
              styles.cameraOverlay
            }
          >
            <View
              style={
                styles.scanFrame
              }
            />

            <Text
              style={
                styles.scanHint
              }
            >
              Keep the barcode about 10–20 cm away and centered
            </Text>
          </View>

          {isProcessing ? (
            <View
              style={
                styles.processingOverlay
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
        </View>

        {onAddProductManually ? (
          <Pressable
            accessibilityRole="button"
            onPress={
              onAddProductManually
            }
            style={({
              pressed,
            }) => [
              styles.manualButton,

              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Text
              style={
                styles.manualButtonText
              }
            >
              Add Product Manually
            </Text>
          </Pressable>
        ) : null}

        {bottomContent ? (
          <View
            style={
              styles.bottomContent
            }
          >
            {
              bottomContent
            }
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex:
        1,

      backgroundColor:
        "#F4F6F8",
    },

    content: {
      paddingHorizontal:
        16,

      paddingTop:
        10,

      paddingBottom:
        24,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      marginBottom:
        14,
    },

    headerText: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        12,
    },

    title: {
      fontSize:
        27,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    subtitle: {
      marginTop:
        4,

      fontSize:
        13,

      lineHeight:
        18,

      color:
        "#6B7280",
    },

    closeButton: {
      minHeight:
        40,

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#CBD2DA",

      borderRadius:
        10,

      paddingHorizontal:
        13,

      backgroundColor:
        "#FFFFFF",
    },

    closeButtonText: {
      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#20252B",
    },

    buttonPressed: {
      opacity:
        0.66,
    },

    cameraCard: {
      height:
        220,

      overflow:
        "hidden",

      borderRadius:
        18,

      backgroundColor:
        "#111827",
    },

    camera: {
      ...StyleSheet.absoluteFillObject,
    },

    cameraOverlay: {
      ...StyleSheet.absoluteFillObject,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        24,

      backgroundColor:
        "rgba(0, 0, 0, 0.08)",
    },

    /*
     * Smaller target area helps users
     * position short / narrow barcodes
     * more consistently.
     */
    scanFrame: {
      width:
        "78%",

      maxWidth:
        285,

      height:
        96,

      borderWidth:
        2,

      borderColor:
        "#FFFFFF",

      borderRadius:
        14,

      backgroundColor:
        "transparent",
    },

    scanHint: {
      marginTop:
        14,

      maxWidth:
        280,

      fontSize:
        12,

      lineHeight:
        17,

      fontWeight:
        "600",

      textAlign:
        "center",

      color:
        "#FFFFFF",
    },

    processingOverlay: {
      ...StyleSheet.absoluteFillObject,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "rgba(0, 0, 0, 0.46)",
    },

    processingText: {
      marginTop:
        9,

      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#FFFFFF",
    },

    manualButton: {
      marginTop:
        12,

      minHeight:
        44,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#D3DAE3",

      borderRadius:
        12,

      backgroundColor:
        "#FFFFFF",
    },

    manualButtonText: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#20252B",
    },

    bottomContent: {
      marginTop:
        12,
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

    permissionTitle: {
      fontSize:
        23,

      fontWeight:
        "800",

      textAlign:
        "center",

      color:
        "#111827",
    },

    permissionDescription: {
      marginTop:
        10,

      fontSize:
        15,

      lineHeight:
        22,

      textAlign:
        "center",

      color:
        "#5D6673",
    },

    statusText: {
      marginTop:
        12,

      fontSize:
        15,

      color:
        "#5D6673",
    },

    primaryButton: {
      marginTop:
        22,

      minHeight:
        46,

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
        11,

      minHeight:
        44,

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