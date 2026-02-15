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

  scrollContent: {
    paddingBottom: 40,
  },

  /* ===== SEÇÕES ===== */
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeaderPressable: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  collapseIcon: {
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
    flex: 1,
  },
  sectionCount: {
    backgroundColor: "#E5E7EB",
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6B7280",
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
  },

  /* ===== CARDS ===== */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  /* Card Header (nome + distância) */
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginRight: 10,
  },
  clientTextInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  sentDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  serviceNameSmall: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  /* Badge de distância */
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  distanceText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  /* Linhas de info */
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  serviceNameText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007AFF",
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  scheduleText: {
    fontSize: 13,
    color: "#6B7280",
  },
  descriptionText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
    lineHeight: 20,
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
  },

  /* ===== BOTÕES ===== */
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 4,
  },
  btnReject: {
    backgroundColor: "#ff3b30",
  },
  btnAccept: {
    backgroundColor: "#34c759",
  },
  btnNegotiate: {
    backgroundColor: "#007AFF",
  },
  btnChat: {
    backgroundColor: "#007AFF",
  },
  btnDetails: {
    backgroundColor: "#6B7280",
  },
  btnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },

  /* ===== HISTORY CARDS ===== */
  historyCard: {
    paddingVertical: 12,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyInfo: {
    flex: 1,
    marginRight: 12,
  },
  historyClientName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  historyService: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  historyDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },

  /* Status badges */
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusCompleted: {
    backgroundColor: "#ECFDF5",
  },
  statusTextCompleted: {
    color: "#059669",
  },
  statusCancelled: {
    backgroundColor: "#F3F4F6",
  },
  statusTextCancelled: {
    color: "#6B7280",
  },
  statusRejected: {
    backgroundColor: "#FEF2F2",
  },
  statusTextRejected: {
    color: "#DC2626",
  },
});
