import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../services/supabaseClient";
import { styles } from "./styles";

const formatDistance = (dist) => {
  if (!dist && dist !== 0) return "--";
  if (dist < 1) return `${Math.round(dist * 1000)} m`;
  return `${dist.toFixed(1)} km`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "--";
  const date = new Date(dateStr);
  return `${date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} às ${date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const formatRelativeDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;
  return formatDate(dateStr);
};

const formatPrice = (price, unit) => {
  if (!price && price !== 0) return null;
  const formatted = Number(price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return { formatted, unit: unit || "" };
};

export default function ClientDashboard() {
  const { user, profile } = useAuth();
  const navigation = useNavigation();

  const [proposalBookings, setProposalBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposalsExpanded, setProposalsExpanded] = useState(true);
  const [confirmedExpanded, setConfirmedExpanded] = useState(false);
  const [cancelledExpanded, setCancelledExpanded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) fetchBookings();
    }, [user]),
  );

  const fetchBookings = async () => {
    setLoading(true);

    const { data, error } = await supabase.rpc(
      "get_client_bookings_with_details",
      { client_uuid: user.id },
    );

    if (error) {
      console.error("Erro ao buscar bookings:", error.message);
      setLoading(false);
      return;
    }

    const all = data || [];
    setProposalBookings(
      all.filter((b) => b.status === "pending" || b.status === "negotiating"),
    );
    setConfirmedBookings(all.filter((b) => b.status === "accepted"));
    setCancelledBookings(
      all.filter((b) => ["cancelled", "rejected"].includes(b.status)),
    );
    setLoading(false);
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      "Cancelar proposta",
      "Tem certeza que deseja cancelar esta proposta?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("bookings")
              .update({ status: "cancelled" })
              .eq("id", bookingId);

            if (error) {
              Alert.alert("Erro", "Não foi possível cancelar a proposta.");
            } else {
              Alert.alert("Cancelado", "Proposta cancelada com sucesso.");
              fetchBookings();
            }
          },
        },
      ],
    );
  };

  const handleOpenChat = async (booking) => {
    const chatParams = {
      bookingId: booking.booking_id,
      otherUserName: booking.professional_full_name || "Profissional",
      serviceName: booking.service_name || "Serviço",
      fromDashboard: true,
    };

    if (booking.conversation_id) {
      navigation.navigate("Mensagens", {
        screen: "ChatScreen",
        params: { conversationId: booking.conversation_id, ...chatParams },
      });
      return;
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({ booking_id: booking.booking_id })
      .select()
      .single();

    if (error) {
      Alert.alert("Erro", "Não foi possível abrir o chat.");
      return;
    }

    navigation.navigate("Mensagens", {
      screen: "ChatScreen",
      params: { conversationId: data.id, ...chatParams },
    });
  };

  // ==========================================
  // RENDER: Card de proposta (pending/negotiating)
  // ==========================================
  const getProposalStatusLabel = (status) => {
    return status === "negotiating" ? "Negociando" : "Aguardando";
  };

  const getProposalStatusStyle = (status) => {
    return status === "negotiating"
      ? styles.statusNegotiating
      : styles.statusPending;
  };

  const getProposalStatusTextStyle = (status) => {
    return status === "negotiating"
      ? styles.statusTextNegotiating
      : styles.statusTextPending;
  };

  const renderProposalCard = (item) => (
    <View key={item.booking_id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.providerInfo}>
          <Image
            source={{
              uri:
                item.professional_avatar_url ||
                "https://via.placeholder.com/40",
            }}
            style={styles.providerAvatar}
          />
          <View style={styles.providerTextInfo}>
            <Text style={styles.providerName}>
              {item.professional_full_name || "Profissional"}
            </Text>
            <Text style={styles.sentDate}>
              Enviado {formatRelativeDate(item.created_at)}
            </Text>
          </View>
        </View>
        <View style={styles.distanceBadge}>
          <Ionicons name="location-sharp" size={12} color="#FFF" />
          <Text style={styles.distanceText}>
            {formatDistance(item.distance_km)}
          </Text>
        </View>
      </View>

      <View style={styles.serviceRow}>
        <Ionicons name="construct-outline" size={16} color="#007AFF" />
        <Text style={styles.serviceNameText}>
          {item.service_name || "Serviço"}
        </Text>
      </View>

      <View style={styles.scheduleRow}>
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <Text style={styles.scheduleText}>
          Agendado para: {formatDateTime(item.scheduled_date)}
        </Text>
      </View>

      {item.description && (
        <Text style={styles.descriptionText} numberOfLines={3}>
          {item.description}
        </Text>
      )}

      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, getProposalStatusStyle(item.status)]}>
          <Text
            style={[
              styles.statusBadgeText,
              getProposalStatusTextStyle(item.status),
            ]}
          >
            {getProposalStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.btnCancel]}
          onPress={() => handleCancelBooking(item.booking_id)}
        >
          <Ionicons name="close" size={16} color="#FFF" />
          <Text style={styles.btnText}>Cancelar</Text>
        </TouchableOpacity>

        {item.conversation_id && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnNegotiate]}
            onPress={() => handleOpenChat(item)}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#FFF" />
            <Text style={styles.btnText}>Negociar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // ==========================================
  // RENDER: Card confirmado (accepted)
  // ==========================================
  const renderConfirmedCard = (item) => {
    const priceInfo = formatPrice(item.service_price, item.service_unit);

    return (
      <View key={item.booking_id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.providerInfo}>
            <Image
              source={{
                uri:
                  item.professional_avatar_url ||
                  "https://via.placeholder.com/40",
              }}
              style={styles.providerAvatar}
            />
            <View style={styles.providerTextInfo}>
              <Text style={styles.providerName}>
                {item.professional_full_name || "Profissional"}
              </Text>
              <Text style={styles.confirmedServiceName}>
                {item.service_name || "Serviço"}
              </Text>
            </View>
          </View>
          <View style={styles.distanceBadge}>
            <Ionicons name="location-sharp" size={12} color="#FFF" />
            <Text style={styles.distanceText}>
              {formatDistance(item.distance_km)}
            </Text>
          </View>
        </View>

        <View style={styles.scheduleRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.scheduleText}>
            {formatDateTime(item.scheduled_date)}
          </Text>
        </View>

        {priceInfo && (
          <View style={styles.priceRow}>
            <Ionicons name="cash-outline" size={16} color="#059669" />
            <Text style={styles.priceText}>{priceInfo.formatted}</Text>
            {priceInfo.unit ? (
              <Text style={styles.priceUnit}>/ {priceInfo.unit}</Text>
            ) : null}
          </View>
        )}

        {item.description && (
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnChat]}
            onPress={() => handleOpenChat(item)}
          >
            <Ionicons name="chatbubbles-outline" size={16} color="#FFF" />
            <Text style={styles.btnText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ==========================================
  // RENDER: Card cancelado
  // ==========================================
  const renderCancelledCard = (item) => (
    <View key={item.booking_id} style={[styles.card, styles.cancelledCard]}>
      <View style={styles.cancelledHeader}>
        <View style={styles.cancelledInfo}>
          <Text style={styles.cancelledProviderName}>
            {item.professional_full_name || "Profissional"}
          </Text>
          <Text style={styles.cancelledService}>
            {item.service_name || "Serviço"}
          </Text>
          <Text style={styles.cancelledDate}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        <View style={styles.cancelledBadge}>
          <Text style={styles.cancelledBadgeText}>
            {item.status === "rejected" ? "Recusado" : "Cancelado"}
          </Text>
        </View>
      </View>
    </View>
  );

  // ==========================================
  // RENDER: Seção colapsável
  // ==========================================
  const renderCollapsibleSection = (
    title,
    icon,
    items,
    renderCard,
    emptyMessage,
    expanded,
    toggleExpanded,
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <TouchableOpacity
          style={styles.sectionHeaderPressable}
          onPress={toggleExpanded}
          activeOpacity={0.7}
        >
          <Ionicons name={icon} size={20} color="#007AFF" />
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.sectionCount}>
            <Text style={styles.sectionCountText}>{items.length}</Text>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#6B7280"
            style={styles.collapseIcon}
          />
        </TouchableOpacity>
      </View>

      {expanded &&
        (items.length === 0 ? (
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        ) : (
          items.map(renderCard)
        ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TrampoApp</Text>
        <Text style={styles.headerSubtitle}>
          Olá, {profile?.full_name || "Contratante"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCollapsibleSection(
          "Propostas enviadas",
          "paper-plane",
          proposalBookings,
          renderProposalCard,
          "Nenhuma proposta enviada.",
          proposalsExpanded,
          () => setProposalsExpanded((prev) => !prev),
        )}

        {renderCollapsibleSection(
          "Trampos contratados",
          "checkmark-circle",
          confirmedBookings,
          renderConfirmedCard,
          "Nenhum trampo contratado.",
          confirmedExpanded,
          () => setConfirmedExpanded((prev) => !prev),
        )}

        {renderCollapsibleSection(
          "Trampos cancelados",
          "close-circle",
          cancelledBookings,
          renderCancelledCard,
          "Nenhum trampo cancelado.",
          cancelledExpanded,
          () => setCancelledExpanded((prev) => !prev),
        )}
      </ScrollView>
    </View>
  );
}
