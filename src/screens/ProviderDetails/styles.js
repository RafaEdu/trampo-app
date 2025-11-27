import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#007aff",
  },

  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  serviceName: {
    fontSize: 16,
    color: "#444",
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#34C759",
  },
  noServices: {
    color: "#999",
    fontStyle: "italic",
    marginBottom: 20,
  },
  separator: {
    height: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: "top",
    height: 100,
    backgroundColor: "#fafafa",
  },
});
