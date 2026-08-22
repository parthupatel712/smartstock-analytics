import {
  Ionicons,
} from "@expo/vector-icons";

import {
  type BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import {
  type ReactNode,
  useRef,
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
  onClose:
    () => void;

  onBarcodeDetected:
    (
      barcode:
        string,
    ) => Promise<void>;

  /*
   * Kept for backward compatibility
   * with App.tsx.
   *
   * We no longer show the Add button
   * inside the camera area.
   */
  onAddProductManually?:
    () => void;

  bottomContent?:
    ReactNode;

  title?:
    string;

  subtitle?:
    string;
}

const SAME_BARCODE_COOLDOWN_MS =
  1600;

export function BarcodeScanner({
  onClose,
  onBarcodeDetected,
  onAddProductManually,
  bottomContent,
  title = "Scan Product",
  subtitle = "Scan a barcode to find a product in SmartStock.",
}: BarcodeScannerProps) {
  const [
    permission,
    requestPermission,
  ] =
    useCameraPermissions();

  const [
    isProcessing,
    setIsProcessing,
  ] =
    useState(
      false,
    );

  const [
    lastBarcode,
    setLastBarcode,
  ] =
    useState(
      "",
    );

  const lastProcessedBarcodeRef =
    useRef(
      "",
    );

  const lastProcessedAtRef =
    useRef(
      0,
    );

  async function handleBarcodeScanned(
    result:
      BarcodeScanningResult,
  ): Promise<void> {
    if (
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

    const now =
      Date.now();

    const isSameRecentBarcode =
      lastProcessedBarcodeRef.current ===
        barcode &&
      now -
        lastProcessedAtRef.current <
        SAME_BARCODE_COOLDOWN_MS;

    if (
      isSameRecentBarcode
    ) {
      return;
    }

    lastProcessedBarcodeRef.current =
      barcode;

    lastProcessedAtRef.current =
      now;

    setLastBarcode(
      barcode,
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

      lastProcessedBarcodeRef.current =
        "";

      lastProcessedAtRef.current =
        0;
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
      </SafeAreaView>
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
            styles.permissionHeader
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={
              10
            }
            onPress={
              onClose
            }
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={
                22
              }
              color="#111827"
            />
          </Pressable>
        </View>

        <View
          style={
            styles.centeredContainer
          }
        >
          <View
            style={
              styles.permissionIcon
            }
          >
            <Ionicons
              name="camera-outline"
              size={
                30
              }
              color="#2563EB"
            />
          </View>

          <Text
            style={
              styles.permissionTitle
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
            style={({
              pressed,
            }) => [
              styles.primaryButton,

              pressed &&
                styles.primaryButtonPressed,
            ]}
          >
            <Ionicons
              name="camera-outline"
              size={
                19
              }
              color="#FFFFFF"
            />

            <Text
              style={
                styles.primaryButtonText
              }
            >
              Allow Camera
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={
              onClose
            }
            style={({
              pressed,
            }) => [
              styles.permissionCancelButton,

              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Text
              style={
                styles.permissionCancelText
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
      <View
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={
            10
          }
          onPress={
            onClose
          }
          style={({
            pressed,
          }) => [
            styles.backButton,

            pressed &&
              styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={
              22
            }
            color="#111827"
          />
        </Pressable>

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
            {
              title
            }
          </Text>

          <Text
            style={
              styles.subtitle
            }
            numberOfLines={
              2
            }
          >
            {
              subtitle
            }
          </Text>
        </View>

        <View
          style={
            styles.headerSpacer
          }
        />
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
          onBarcodeScanned={(
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

        <View
          pointerEvents="none"
          style={
            styles.cameraShade
          }
        />

        <View
          pointerEvents="none"
          style={
            styles.scanFrame
          }
        >
          <View
            style={[
              styles.corner,
              styles.cornerTopLeft,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.cornerTopRight,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.cornerBottomLeft,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.cornerBottomRight,
            ]}
          />

          <View
            style={
              styles.scanLine
            }
          />
        </View>

        <View
          pointerEvents="none"
          style={
            styles.cameraInstructionContainer
          }
        >
          <View
            style={
              styles.cameraInstructionPill
            }
          >
            <Ionicons
              name="barcode-outline"
              size={
                15
              }
              color="#FFFFFF"
            />

            <Text
              style={
                styles.cameraInstructions
              }
            >
              Position barcode inside the frame
            </Text>
          </View>
        </View>

        {isProcessing ? (
          <View
            pointerEvents="none"
            style={
              styles.processingOverlay
            }
          >
            <View
              style={
                styles.processingCard
              }
            >
              <ActivityIndicator
                size="small"
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
          </View>
        ) : null}
      </View>

      <ScrollView
        style={
          styles.resultScroll
        }
        contentContainerStyle={
          styles.resultContent
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        {bottomContent ? (
          bottomContent
        ) : (
          <View
            style={
              styles.readyCard
            }
          >
            <View
              style={
                styles.readyIcon
              }
            >
              <Ionicons
                name="barcode-outline"
                size={
                  25
                }
                color="#52606D"
              />
            </View>

            <View
              style={
                styles.readyText
              }
            >
              <Text
                style={
                  styles.readyTitle
                }
              >
                Ready to scan
              </Text>

              <Text
                style={
                  styles.readyDescription
                }
              >
                Scan an existing product to view stock and quick actions.
              </Text>

              {lastBarcode ? (
                <Text
                  style={
                    styles.lastBarcode
                  }
                >
                  Last scan:{" "}
                  {
                    lastBarcode
                  }
                </Text>
              ) : null}
            </View>
          </View>
        )}

        {/*
         * Keep manual product creation
         * outside the camera area.
         *
         * This button only appears when
         * App.tsx supplies the callback
         * and no scanned result is shown.
         */}
        {onAddProductManually &&
        !bottomContent ? (
          <Pressable
            accessibilityRole="button"
            onPress={
              onAddProductManually
            }
            style={({
              pressed,
            }) => [
              styles.addProductButton,

              pressed &&
                styles.addProductButtonPressed,
            ]}
          >
            <Ionicons
              name="add-circle-outline"
              size={
                19
              }
              color="#52606D"
            />

            <Text
              style={
                styles.addProductText
              }
            >
              Add product manually
            </Text>

            <Ionicons
              name="chevron-forward"
              size={
                16
              }
              color="#94A3B8"
            />
          </Pressable>
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

    header: {
      minHeight:
        62,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        16,

      paddingVertical:
        5,

      backgroundColor:
        "#F4F6F8",
    },

    backButton: {
      width:
        40,

      height:
        40,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#DCE1E7",

      borderRadius:
        13,

      backgroundColor:
        "#FFFFFF",
    },

    headerTextContainer: {
      flex:
        1,

      minWidth:
        0,

      marginHorizontal:
        10,
    },

    headerSpacer: {
      width:
        40,
    },

    title: {
      fontSize:
        18,

      fontWeight:
        "800",

      textAlign:
        "center",

      color:
        "#111827",
    },

    subtitle: {
      marginTop:
        2,

      fontSize:
        9,

      lineHeight:
        13,

      textAlign:
        "center",

      color:
        "#6B7280",
    },

    /*
     * Smaller camera section.
     */
    cameraCard: {
      height:
        200,

      marginHorizontal:
        14,

      overflow:
        "hidden",

      borderRadius:
        18,

      backgroundColor:
        "#111827",
    },

    cameraShade: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        "rgba(0,0,0,0.08)",
    },

    /*
     * Centered barcode-sized guide.
     */
    scanFrame: {
      position:
        "absolute",

      top:
        "25%",

      left:
        "9%",

      right:
        "9%",

      height:
        90,
    },

    corner: {
      position:
        "absolute",

      width:
        26,

      height:
        26,

      borderColor:
        "#FFFFFF",
    },

    cornerTopLeft: {
      top:
        0,

      left:
        0,

      borderTopWidth:
        3,

      borderLeftWidth:
        3,

      borderTopLeftRadius:
        10,
    },

    cornerTopRight: {
      top:
        0,

      right:
        0,

      borderTopWidth:
        3,

      borderRightWidth:
        3,

      borderTopRightRadius:
        10,
    },

    cornerBottomLeft: {
      bottom:
        0,

      left:
        0,

      borderBottomWidth:
        3,

      borderLeftWidth:
        3,

      borderBottomLeftRadius:
        10,
    },

    cornerBottomRight: {
      right:
        0,

      bottom:
        0,

      borderRightWidth:
        3,

      borderBottomWidth:
        3,

      borderBottomRightRadius:
        10,
    },

    scanLine: {
      position:
        "absolute",

      top:
        "50%",

      left:
        10,

      right:
        10,

      height:
        2,

      borderRadius:
        999,

      backgroundColor:
        "rgba(255,255,255,0.92)",
    },

    cameraInstructionContainer: {
      position:
        "absolute",

      left:
        0,

      right:
        0,

      bottom:
        10,

      alignItems:
        "center",
    },

    cameraInstructionPill: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        6,

      borderRadius:
        999,

      paddingHorizontal:
        10,

      paddingVertical:
        6,

      backgroundColor:
        "rgba(17,24,39,0.70)",
    },

    cameraInstructions: {
      fontSize:
        9,

      fontWeight:
        "700",

      color:
        "#FFFFFF",
    },

    processingOverlay: {
      ...StyleSheet.absoluteFillObject,

      zIndex:
        8,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "rgba(0,0,0,0.14)",
    },

    processingCard: {
      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius:
        999,

      paddingHorizontal:
        14,

      paddingVertical:
        9,

      backgroundColor:
        "rgba(17,24,39,0.88)",
    },

    processingText: {
      marginLeft:
        8,

      fontSize:
        11,

      fontWeight:
        "700",

      color:
        "#FFFFFF",
    },

    resultScroll: {
      flex:
        1,

      minHeight:
        0,
    },

    resultContent: {
      paddingHorizontal:
        14,

      paddingTop:
        10,

      paddingBottom:
        28,
    },

    readyCard: {
      minHeight:
        72,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        16,

      padding:
        12,

      backgroundColor:
        "#FFFFFF",
    },

    readyIcon: {
      width:
        43,

      height:
        43,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        14,

      backgroundColor:
        "#F1F5F9",
    },

    readyText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        10,
    },

    readyTitle: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#111827",
    },

    readyDescription: {
      marginTop:
        2,

      fontSize:
        9,

      lineHeight:
        14,

      color:
        "#64748B",
    },

    lastBarcode: {
      marginTop:
        4,

      fontSize:
        8,

      color:
        "#94A3B8",
    },

    addProductButton: {
      marginTop:
        9,

      minHeight:
        45,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#E0E4E8",

      borderRadius:
        13,

      paddingHorizontal:
        12,

      backgroundColor:
        "#FFFFFF",
    },

    addProductButtonPressed: {
      backgroundColor:
        "#F8FAFC",
    },

    addProductText: {
      flex:
        1,

      marginLeft:
        8,

      fontSize:
        11,

      fontWeight:
        "700",

      color:
        "#52606D",
    },

    permissionScreen: {
      flex:
        1,

      backgroundColor:
        "#F4F6F8",
    },

    permissionHeader: {
      paddingHorizontal:
        16,

      paddingTop:
        8,
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

    permissionIcon: {
      width:
        64,

      height:
        64,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        22,

      backgroundColor:
        "#EFF6FF",
    },

    permissionTitle: {
      marginTop:
        17,

      fontSize:
        22,

      fontWeight:
        "800",

      textAlign:
        "center",

      color:
        "#111827",
    },

    description: {
      marginTop:
        10,

      maxWidth:
        320,

      fontSize:
        14,

      lineHeight:
        21,

      textAlign:
        "center",

      color:
        "#5D6673",
    },

    statusText: {
      marginTop:
        14,

      fontSize:
        14,

      color:
        "#5D6673",
    },

    primaryButton: {
      marginTop:
        24,

      minHeight:
        48,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        7,

      borderRadius:
        12,

      paddingHorizontal:
        18,

      backgroundColor:
        "#20252B",
    },

    primaryButtonPressed: {
      backgroundColor:
        "#111827",
    },

    primaryButtonText: {
      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    permissionCancelButton: {
      marginTop:
        10,

      minHeight:
        44,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        18,
    },

    permissionCancelText: {
      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#64748B",
    },

    buttonPressed: {
      opacity:
        0.65,
    },
  });