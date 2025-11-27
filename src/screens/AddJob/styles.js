import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28, // Aumentei um pouco
    fontWeight: "bold",
    color: "#333",
  },
  addBtn: {
    backgroundColor: "#007aff",
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  // --- Estilos da Lista ---
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },

  // --- Cabeçalho da Seção (Categoria) Melhorado ---
  sectionHeader: {
    marginTop: 20,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#e1f0ff", // Fundo azul bem claro
    borderRadius: 8,
    borderLeftWidth: 4, // Borda lateral para destaque
    borderLeftColor: "#007aff",
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "800", // Mais "grosso"
    color: "#005bb5", // Azul mais escuro para contraste
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // --- Card do Serviço ---
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    // Sombras mais suaves
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  serviceName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 15,
    color: "#34c759", // Verde (dinheiro)
    fontWeight: "700",
  },
  unitText: {
    fontSize: 13,
    color: "#888",
    fontWeight: "400",
  },
  deleteBtn: {
    padding: 10,
    backgroundColor: "#fff0f0", // Fundo vermelho claro no botão de delete
    borderRadius: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 50,
    fontSize: 16,
  },

  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end", // Modal vem de baixo
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#333",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    marginBottom: 10,
    marginTop: 10,
  },
  infoText: {
    color: "#999",
    fontStyle: "italic",
    marginBottom: 10,
  },

  selectorContainer: {
    flexDirection: "row",
    marginBottom: 20,
    height: 45,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#f2f2f7",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipSelected: {
    backgroundColor: "#e1f0ff",
    borderColor: "#007aff",
  },
  chipText: {
    color: "#555",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#007aff",
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: 20,
  },
  cancelBtn: {
    padding: 16,
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f2f2f7",
    borderRadius: 12,
    marginRight: 10,
  },
  cancelBtnText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: "#007aff",
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 10,
  },
  saveBtnDisabled: {
    backgroundColor: "#ccc",
  },
  saveBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
