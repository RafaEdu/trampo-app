import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
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

export default function ProviderDashboard() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [historyBookings, setHistoryBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (user) fetchBookings();
    }, [user]),
  );

  const fetchBookings = async () => {
    setLoading(true);

    const { data, error } = await supabase.rpc(
      "get_provider_bookings_with_distance",
      { provider_uuid: user.id },
    );

    if (error) {
      console.error("Erro ao buscar bookings:", error.message);
      setLoading(false);
      return;
    }

    const all = data || [];
    setConfirmedBookings(all.filter((b) => b.status === "accepted"));
    setPendingBookings(all.filter((b) => b.status === "pending"));
    setHistoryBookings(
      all.filter((b) =>
        ["completed", "cancelled", "rejected"].includes(b.status),
      ),
    );
    setLoading(false);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    const label = newStatus === "accepted" ? "aceitar" : "recusar";

    Alert.alert("Confirmação", `Deseja ${label} este pedido?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          const { error } = await supabase
            .from("bookings")
            .update({ status: newStatus })
            .eq("id", bookingId);

          if (error) {
            Alert.alert("Erro", "Não foi possível atualizar o pedido.");
          } else {
            Alert.alert(
              "Sucesso",
              `Pedido ${newStatus === "accepted" ? "aceito" : "recusado"}!`,
            );
            fetchBookings();
          }
        },
      },
    ]);
  };

  const handleNegotiate = async (booking) => {
    if (booking.conversation_id) {
      navigation.navigate("ChatScreen", {
        conversationId: booking.conversation_id,
        bookingId: booking.booking_id,
        otherUserName: booking.client_full_name || "Cliente",
      });
      return;
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({ booking_id: booking.booking_id })
      .select()
      .single();

    if (error) {
      Alert.alert("Erro", "Não foi possível iniciar a negociação.");
      return;
    }

    navigation.navigate("ChatScreen", {
      conversationId: data.id,
      bookingId: booking.booking_id,
      otherUserName: booking.client_full_name || "Cliente",
    });
  };

  const handleOpenChat = async (booking) => {
    await handleNegotiate(booking);
  };

  // ==========================================
  // RENDER: Card pendente (aguardando)
  // ==========================================
  const renderPendingCard = (item) => (
    <View key={item.booking_id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.clientInfo}>
          <Image
            source={{
              uri: item.client_avatar_url || "https://via.placeholder.com/40",
            }}
            style={styles.clientAvatar}
          />
          <View style={styles.clientTextInfo}>
            <Text style={styles.clientName}>
              {item.client_full_name || "Cliente"}
            </Text>
            <Text style={styles.sentDate}>
              {formatRelativeDate(item.created_at)}
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

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.btnReject]}
          onPress={() => handleUpdateStatus(item.booking_id, "rejected")}
        >
          <Ionicons name="close" size={16} color="#FFF" />
          <Text style={styles.btnText}>Recusar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.btnNegotiate]}
          onPress={() => handleNegotiate(item)}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#FFF" />
          <Text style={styles.btnText}>Negociar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.btnAccept]}
          onPress={() => handleUpdateStatus(item.booking_id, "accepted")}
        >
          <Ionicons name="checkmark" size={16} color="#FFF" />
          <Text style={styles.btnText}>Aceitar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ==========================================
  // RENDER: Card confirmado
  // ==========================================
  const renderConfirmedCard = (item) => (
    <View key={item.booking_id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.clientInfo}>
          <Image
            source={{
              uri: item.client_avatar_url || "https://via.placeholder.com/40",
            }}
            style={styles.clientAvatar}
          />
          <View style={styles.clientTextInfo}>
            <Text style={styles.clientName}>
              {item.client_full_name || "Cliente"}
            </Text>
            <Text style={styles.serviceNameSmall}>
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

        <TouchableOpacity
          style={[styles.actionBtn, styles.btnDetails]}
          onPress={() =>
            Alert.alert(
              item.service_name || "Detalhes",
              `Cliente: ${item.client_full_name}\n` +
                `Agendado: ${formatDateTime(item.scheduled_date)}\n` +
                `Distância: ${formatDistance(item.distance_km)}\n` +
                `Descrição: ${item.description || "Sem descrição"}`,
            )
          }
        >
          <Ionicons name="information-circle-outline" size={16} color="#FFF" />
          <Text style={styles.btnText}>Detalhes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ==========================================
  // RENDER: Card histórico
  // ==========================================
  const getHistoryStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      case "rejected":
        return "Recusado";
      default:
        return status;
    }
  };

  const getHistoryStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return styles.statusCompleted;
      case "cancelled":
        return styles.statusCancelled;
      case "rejected":
        return styles.statusRejected;
      default:
        return {};
    }
  };

  const getHistoryStatusTextStyle = (status) => {
    switch (status) {
      case "completed":
        return styles.statusTextCompleted;
      case "cancelled":
        return styles.statusTextCancelled;
      case "rejected":
        return styles.statusTextRejected;
      default:
        return {};
    }
  };

  const renderHistoryCard = (item) => (
    <View key={item.booking_id} style={[styles.card, styles.historyCard]}>
      <View style={styles.historyHeader}>
        <View style={styles.historyInfo}>
          <Text style={styles.historyClientName}>
            {item.client_full_name || "Cliente"}
          </Text>
          <Text style={styles.historyService}>
            {item.service_name || "Serviço"}
          </Text>
          <Text style={styles.historyDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, getHistoryStatusStyle(item.status)]}>
          <Text
            style={[
              styles.statusBadgeText,
              getHistoryStatusTextStyle(item.status),
            ]}
          >
            {getHistoryStatusLabel(item.status)}
          </Text>
        </View>
      </View>
    </View>
  );

  // ==========================================
  // RENDER: Seção
  // ==========================================
  const renderSection = (title, icon, items, renderCard, emptyMessage) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color="#007AFF" />
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionCount}>
          <Text style={styles.sectionCountText}>{items.length}</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      ) : (
        items.map(renderCard)
      )}
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
        <Text style={styles.headerTitle}>Meus Trampos</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSection(
          "Trampos confirmados",
          "checkmark-circle",
          confirmedBookings,
          renderConfirmedCard,
          "Nenhum trampo confirmado.",
        )}

        {renderSection(
          "Aguardando resposta",
          "time",
          pendingBookings,
          renderPendingCard,
          "Nenhum pedido pendente.",
        )}

        {renderSection(
          "Últimos trampos",
          "archive",
          historyBookings,
          renderHistoryCard,
          "Nenhum histórico ainda.",
        )}
      </ScrollView>
    </View>
  );
}
