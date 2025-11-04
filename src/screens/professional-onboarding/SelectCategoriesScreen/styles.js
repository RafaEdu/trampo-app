import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Container principal para telas com loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },

  // Container principal da tela
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  // Cabeçalho
  header: {
    paddingHorizontal: 20, // Padding lateral
    paddingTop: 20, // Padding no topo (dentro da safe area)
    marginBottom: 20,
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

  // Lista
  list: {
    flex: 1, // Faz a lista ocupar o espaço disponível
    paddingHorizontal: 20, // Padding lateral para os itens
  },

  footer: {
    padding: 20, // Padding em todos os lados (garante o espaço inferior)
    backgroundColor: "#f5f5f5", // Mesmo fundo para consistência
  },

  // Itens da Lista
  // Dica: Seguimos o mesmo padrão que você usou no SignUp/styles.js
  // com estilos base (itemContainer) e modificadores (itemSelected).
  itemContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  itemSelected: {
    backgroundColor: "#007aff", // Cor de destaque (azul do seu ClientDashboard)
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
});
