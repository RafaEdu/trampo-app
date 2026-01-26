import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    position: "relative", // Necessário para o Toast absoluto
  },
  // ESTILOS DO TOAST
  toastContainer: {
    position: "absolute",
    top: 50, // Distância do topo
    left: 20,
    right: 20,
    backgroundColor: "#4CAF50", // Verde sucesso
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000, // Fica acima de tudo
  },
  toastText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 10,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
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
  passwordContainer: {
    flexDirection: "row",
    width: "100%",
    height: 50,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 10,
  },
  cancelButton: {
    marginTop: 20,
  },
  cancelButtonText: {
    color: "#555",
  },
});
