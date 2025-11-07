import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  // --- Estilos do Avatar ---
  avatarContainer: {
    marginBottom: 20,
    position: "relative",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#007aff",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007aff",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  // --- Estilos do Formulário ---
  label: {
    width: "100%",
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    textAlign: "left",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  readOnlyInput: {
    backgroundColor: "#f5f5f5",
    color: "#888",
  },
  // --- Botões ---
  buttonContainer: {
    width: "100%",
    marginTop: 10,
  },
});
