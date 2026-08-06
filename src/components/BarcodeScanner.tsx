import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface BarcodeScannerProps {
  onClose: () => void;
}

export function BarcodeScanner({
  onClose,
}: BarcodeScannerProps) {
  const [permission, requestPermission] =
    useCameraPermissions();

  if (!permission) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.statusText}>
          Checking camera permission…
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.title}>
          Camera permission required
        </Text>

        <Text style={styles.description}>
          SmartStock needs camera access to scan product
          barcodes.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => void requestPermission()}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            Allow camera access
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            Cancel
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        facing="back"
        style={styles.camera}
      />

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>
              Close
            </Text>
          </Pressable>
        </View>

        <View style={styles.scannerArea}>
          <View style={styles.scanFrame} />

          <Text style={styles.instructions}>
            Position the product barcode inside the frame
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  closeButton: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  closeButtonText: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scannerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  scanFrame: {
    width: "100%",
    maxWidth: 340,
    height: 190,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: 18,
    backgroundColor: "transparent",
  },
  instructions: {
    marginTop: 20,
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    color: "#FFFFFF",
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F4F6F8",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    color: "#5D6673",
  },
  statusText: {
    marginTop: 14,
    fontSize: 16,
    color: "#5D6673",
  },
  primaryButton: {
    marginTop: 24,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingHorizontal: 18,
    backgroundColor: "#20252B",
  },
  primaryButtonText: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryButton: {
    marginTop: 12,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C8CED6",
    borderRadius: 10,
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    fontWeight: "700",
    color: "#20252B",
  },
});