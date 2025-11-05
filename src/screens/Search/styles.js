import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    height: 50,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    marginLeft: 10,
    backgroundColor: "#007aff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  resultsList: {
    flex: 1,
  },
  emptyContainer: {
    // Modificado para centralizar melhor
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20, // Evita que o texto de erro encoste nas bordas
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
});
