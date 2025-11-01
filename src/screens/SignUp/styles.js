import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  //'container' para 'contentContainerStyle' do ScrollView
  // se o conteúdo crescer. Por enquanto, flex: 1 funciona.
  container: {
    flexGrow: 1, // Permite o scroll se necessário
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 20, // Aumenta a margem
  },
  goBackButton: {
    marginTop: 20,
    padding: 10,
  },
  goBackButtonText: {
    fontSize: 14,
    color: "#007aff",
    textAlign: "center",
  },

  selectorContainer: {
    width: "100%",
    marginBottom: 15,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  selectorOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectorButton: {
    flex: 1, // Faz os botões dividirem o espaço
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4, // Espaçamento entre botões
  },
  selectorButtonActive: {
    backgroundColor: "#007aff", // Cor primária
    borderColor: "#007aff",
  },
  selectorButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  selectorButtonTextActive: {
    color: "white",
    fontWeight: "bold",
  },
});
