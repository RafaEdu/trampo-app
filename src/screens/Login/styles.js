// src/screens/Login/styles.js
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 10,
  },
  signUpButton: {
    marginTop: 20,
    padding: 10,
  },
  signUpButtonText: {
    fontSize: 14,
    color: "#007aff",
    textAlign: "center",
  },
});
