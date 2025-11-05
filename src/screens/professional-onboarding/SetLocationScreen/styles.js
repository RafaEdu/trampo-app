import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Mudei para f5f5f5 para combinar com as outras
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  // 1. Estilos novos para a caixa de endereço
  addressBox: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    width: "100%",
    marginTop: 15,
    marginBottom: 15,
  },
  addressText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 24, // Melhora a leitura
  },
  // ------------------------------------------
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#f5f5f5",
  },
});
