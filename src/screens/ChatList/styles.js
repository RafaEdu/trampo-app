import { StyleSheet, Platform, StatusBar } from "react-native";

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

  /* Header */
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },

  listContent: {
    flexGrow: 1,
    paddingTop: 8,
  },

  /* Conversation card */
  conversationCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  unreadCard: {
    backgroundColor: "#F0F7FF",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#E5E7EB",
  },
  conversationInfo: {
    flex: 1,
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  serviceLabel: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: "#007AFF",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },

  /* Empty */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 120,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
