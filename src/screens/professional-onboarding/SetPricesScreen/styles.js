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
    // Note: FlatList usa 'contentContainerStyle' para padding interno
    // mas o estilo do componente em si também é útil.
    paddingHorizontal: 20,
    paddingTop: 10,
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

  // Card do Serviço
  serviceCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
  },

  serviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },

  // Inputs
  inputGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  inputContainer: {
    flex: 1, // Faz os inputs dividirem o espaço
  },

  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },

  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  // Adiciona uma margem à direita para o primeiro input
  priceInput: {
    marginRight: 10,
  },
  // Adiciona uma margem à esquerda para o segundo input
  unitInput: {
    marginLeft: 10,
  },

  // Footer (Botão)
  footer: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
});
