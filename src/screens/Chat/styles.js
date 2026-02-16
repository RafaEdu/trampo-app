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

  /* Header personalizado */
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 12 : 56,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerService: {
    fontSize: 13,
    color: "#007AFF",
    marginTop: 2,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  lockedBadgeText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
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

  /* Proposal button */
  proposalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#EBF5FF",
  },

  /* Proposal bubble */
  proposalBubble: {
    maxWidth: "85%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
  },
  proposalBubbleRight: {
    backgroundColor: "#007AFF",
    borderColor: "#0056B3",
    borderBottomRightRadius: 4,
  },
  proposalBubbleLeft: {
    backgroundColor: "#FFFFFF",
    borderColor: "#007AFF",
    borderBottomLeftRadius: 4,
  },

  /* Proposal status badges */
  proposalStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  proposalStatusAccepted: {
    fontSize: 13,
    fontWeight: "600",
    color: "#34c759",
  },
  proposalStatusRejected: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF3B30",
  },
  proposalStatusPending: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F59E0B",
  },

  /* Proposal action buttons */
  proposalActions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },
  proposalRejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  proposalAcceptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34c759",
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  proposalBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },

  /* System messages (accept/reject) */
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  systemMessageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    maxWidth: "80%",
  },
  systemAcceptBubble: {
    backgroundColor: "#D1FAE5",
  },
  systemRejectBubble: {
    backgroundColor: "#FEE2E2",
  },
  systemMessageText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    lineHeight: 20,
  },
  systemTimestamp: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
  },

  /* Chat locked */
  lockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 8,
  },
  lockedBannerText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  modalInputText: {
    fontSize: 15,
    color: "#1F2937",
  },
  currencyPrefix: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    padding: 0,
  },

  /* Payment options */
  paymentOptions: {
    flexDirection: "row",
    gap: 12,
  },
  paymentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    gap: 8,
  },
  paymentOptionSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#EBF5FF",
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  paymentOptionTextSelected: {
    color: "#007AFF",
  },
  paymentWarning: {
    fontSize: 12,
    color: "#D97706",
    marginTop: 10,
    lineHeight: 18,
  },

  /* Send proposal button */
  sendProposalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  sendProposalBtnDisabled: {
    opacity: 0.6,
  },
  sendProposalBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  /* Rejection modal */
  rejectionInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
    minHeight: 100,
    textAlignVertical: "top",
  },
  rejectConfirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3B30",
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  rejectConfirmBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  /* Booking info in proposal modal */
  bookingInfoSection: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  bookingInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0369A1",
    marginBottom: 10,
  },
  bookingInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  bookingInfoText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
    lineHeight: 18,
  },
});
