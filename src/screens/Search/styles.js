import { StyleSheet, Platform, StatusBar } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2", // Fundo levemente cinza para destacar os cards brancos
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
  },
  /* Header e SearchBar */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    // Sombra leve na barra de busca
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
  /* Área de Filtros (Slider) */
  filterContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontWeight: "600",
  },
  /* Lista */
  loadingContainer: {
    marginTop: 50,
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
    fontSize: 16,
  },
  /* Cards de Resultado */
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    height: 100, // Altura fixa para consistência
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden", // Garante que a imagem respeite a borda arredondada

    // Sombra do Card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: 100, // Largura fixa da imagem à esquerda
    height: "100%", // Ocupa do topo ao bottom
    backgroundColor: "#E1E1E1",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center", // Centraliza verticalmente
    alignItems: "center", // Centraliza horizontalmente (conforme pedido)
    paddingHorizontal: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  distanceText: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
});

export default styles;
