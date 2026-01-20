import { StyleSheet } from "react-native";

// Cores baseadas no que vi do projeto (ajuste para seu tema global depois)
const COLORS = {
  primary: "#4A90E2", // Azul padrão de apps de serviço
  background: "#F5F7FA",
  card: "#FFFFFF",
  text: "#333333",
  textLight: "#666666",
  border: "#E0E0E0",
  success: "#28A745",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Espaço para o footer
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // Sombra sutil para elevação
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  switchContainer: {
    alignItems: "flex-end",
  },
  switchLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  inputsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: "#FAFAFA",
  },
  unitSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  unitBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "transparent",
  },
  unitBadgeSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: COLORS.primary,
  },
  unitText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  unitTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default styles;
