import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  providerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1, // Permite que o nome quebre a linha se for longo
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  distanceText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 4,
  },
  serviceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  matchedService: {
    fontSize: 16,
    color: "#007aff", // Destaque para o serviço buscado
    fontWeight: "500",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#34C759", // Verde (cor de "provider")
  },
  otherServicesContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  otherServicesTitle: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  otherServicesText: {
    fontSize: 12,
    color: "#555",
  },
});
