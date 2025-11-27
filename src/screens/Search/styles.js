import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    elevation: 2, // Sombra leve no Android
    shadowColor: "#000", // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },

  // Estilos das Categorias (Chips)
  categoriesContainer: {
    marginBottom: 20,
    height: 45, // Altura fixa para não pular
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryChipSelected: {
    backgroundColor: "#007aff",
    borderColor: "#005bb5",
  },
  categoryText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  categoryTextSelected: {
    color: "white",
    fontWeight: "bold",
  },

  // Slider
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#666",
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007aff",
  },

  // Botão Principal
  searchButton: {
    backgroundColor: "#007aff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
  },
  searchButtonDisabled: {
    backgroundColor: "#a0cfff",
  },
  searchButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Lista
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "#f5f5f5",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});
