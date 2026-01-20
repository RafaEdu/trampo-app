import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  listContent: {
    paddingBottom: 100, // Espaço extra para o footer
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007aff",
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
  },

  // Card Meus Serviços
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    // Sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#28a745",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  futureInfoContainer: {
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  futureInfoText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  editHint: {
    marginTop: 8,
    fontSize: 11,
    color: "#007aff",
    textAlign: "right",
    fontStyle: "italic",
  },
  bold: {
    fontWeight: "600",
    color: "#555",
  },

  // Footer Button
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  offerButton: {
    backgroundColor: "#007aff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  offerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Área de Busca
  searchContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#999",
    fontSize: 16,
  },

  // Card de Busca
  searchCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
  },
  searchCardContent: {
    flex: 1,
    marginRight: 10,
  },
  categoryBadge: {
    fontSize: 12,
    color: "#007aff",
    marginBottom: 4,
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#e1f0ff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#007aff",
    fontWeight: "600",
    fontSize: 14,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },

  // Unit Selector
  unitContainer: {
    marginBottom: 20,
  },
  unitScroll: {
    flexDirection: "row",
  },
  unitChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  unitChipSelected: {
    backgroundColor: "#e1f0ff",
    borderColor: "#007aff",
  },
  unitText: {
    fontSize: 14,
    color: "#666",
  },
  unitTextSelected: {
    color: "#007aff",
    fontWeight: "600",
  },

  // Modal Buttons
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#eee",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#007aff",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
    marginRight: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  closeModalButton: {
    marginTop: 15,
    alignSelf: "center",
    padding: 10,
  },
  closeModalText: {
    color: "#666",
  },
});
