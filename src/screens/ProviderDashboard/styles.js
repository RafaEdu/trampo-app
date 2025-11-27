import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  desc: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginBottom: 15,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },

  btnReject: {
    backgroundColor: "#ff3b30",
  },

  btnAccept: {
    backgroundColor: "#34c759",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
  },
});
