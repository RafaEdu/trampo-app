import { StyleSheet, Platform, StatusBar, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F7", // Cinza bem claro para o fundo geral
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* HEADER */
  header: {
    backgroundColor: "#007AFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4, // Sombra Android
    shadowColor: "#000", // Sombra iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  backButton: {
    padding: 4,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  /* 1. SEÇÃO PERFIL */
  profileSection: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    // Sombra leve
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  providerName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },

  /* TÍTULOS DE SEÇÃO GENÉRICOS */
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 16,
    marginBottom: 12,
  },

  /* 2. GALERIA */
  galleryList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  galleryImage: {
    width: 140,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#E5E7EB",
  },

  /* 3. SERVIÇOS */
  categoryGroup: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  serviceCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 18,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#10B981", // Verde para preço
  },
  serviceUnit: {
    fontSize: 12,
    fontWeight: "normal",
    color: "#9CA3AF",
  },
  bookButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 13,
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 10,
  },

  /* 4. AVALIAÇÕES */
  reviewCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  reviewerName: {
    fontWeight: "600",
    color: "#374151",
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewRating: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
  },
  reviewComment: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    fontStyle: "italic",
  },
});

export default styles;
