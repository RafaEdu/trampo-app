import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
    // Sombra leve
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  providerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007aff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
    marginLeft: 4,
  },
  servicesContainer: {
    marginTop: 4,
  },
  servicesLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  serviceItem: {
    fontSize: 15,
    color: "#555",
    marginBottom: 2,
  },
  moreText: {
    fontSize: 14,
    color: "#007aff",
    fontWeight: "500",
    marginTop: 4,
    fontStyle: "italic",
  },
});
