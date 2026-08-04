import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>SmartStock Analytics</Text>

        <Text style={styles.subtitle}>
          Inventory scanning and retail analytics platform
        </Text>

        <Text style={styles.status}>Development environment ready</Text>

        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },
  status: {
    marginTop: 28,
    fontSize: 15,
    fontWeight: "600",
  },
});
