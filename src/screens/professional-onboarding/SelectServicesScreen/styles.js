import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Containers
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  listContainer: {
    flex: 1,
    paddingHorizontal: 20, // Padding lateral para os itens
  },

  // Cabeçalho da Tela
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },

  // Cabeçalho da Seção (Ex: "Eletricista", "Encanador")
  sectionHeaderContainer: {
    backgroundColor: "#f5f5f5",
    paddingTop: 15,
    paddingBottom: 10,
  },

  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },

  // Itens da Lista (Serviços)
  itemContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },

  itemSelected: {
    backgroundColor: "#007aff",
    borderColor: "#007aff",
  },

  itemText: {
    fontSize: 16,
    color: "#333",
  },

  itemTextSelected: {
    color: "white",
    fontWeight: "bold",
  },

  // Footer (Botão)
  footer: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
});
