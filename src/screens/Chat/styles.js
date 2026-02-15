import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F4F7",
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },

  /* Separador de data */
  dateSeparator: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: "#999",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
  },

  /* Bubbles */
  bubbleContainer: {
    marginBottom: 6,
  },
  bubbleContainerRight: {
    alignItems: "flex-end",
  },
  bubbleContainerLeft: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleRight: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  bubbleLeft: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  textRight: {
    color: "#FFFFFF",
  },
  textLeft: {
    color: "#333",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  timestampRight: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
  timestampLeft: {
    color: "#999",
    textAlign: "left",
  },

  /* Input bar */
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
});
