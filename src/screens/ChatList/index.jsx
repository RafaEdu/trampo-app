import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../services/supabaseClient";
import { styles } from "./styles";

export default function ChatListScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (user) fetchConversations();
    }, [user]),
  );

  const fetchConversations = async () => {
    if (!user?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        created_at,
        booking_id,
        bookings (
          client_id,
          professional_id,
          status,
          services:service_id (name)
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar conversas:", error.message);
      setLoading(false);
      return;
    }

    // Para cada conversa, buscar a última mensagem e contagem de não lidas
    const enriched = await Promise.all(
      (data || []).map(async (conv) => {
        // Última mensagem
        const { data: lastMsgData } = await supabase
          .from("messages")
          .select("content, created_at, sender_id, read")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const lastMessage = lastMsgData?.[0] || null;

        // Contagem de não lidas
        const { count: unreadCount } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("read", false)
          .neq("sender_id", user?.id);

        // Identificar o outro participante
        const isProvider = conv.bookings?.professional_id === user?.id;
        const otherUserId = isProvider
          ? conv.bookings?.client_id
          : conv.bookings?.professional_id;

        // Buscar perfil do outro participante
        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", otherUserId)
          .single();

        return {
          ...conv,
          lastMessage,
          unreadCount: unreadCount || 0,
          otherUser: otherProfile || { full_name: "Usuário", avatar_url: null },
          serviceName: conv.bookings?.services?.name || "Serviço",
          bookingStatus: conv.bookings?.status,
        };
      }),
    );

    // Ordenar por última mensagem (mais recente primeiro)
    enriched.sort((a, b) => {
      const dateA = a.lastMessage?.created_at || a.created_at;
      const dateB = b.lastMessage?.created_at || b.created_at;
      return new Date(dateB) - new Date(dateA);
    });

    setConversations(enriched);
    setLoading(false);
  };

  const formatLastMessageTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) {
      return date.toLocaleDateString("pt-BR", { weekday: "short" });
    }
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Negociando";
      case "accepted":
        return "Confirmado";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      case "rejected":
        return "Recusado";
      default:
        return "";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "accepted":
        return "#34c759";
      case "completed":
        return "#007AFF";
      case "cancelled":
      case "rejected":
        return "#9CA3AF";
      default:
        return "#9CA3AF";
    }
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.conversationCard,
        item.unreadCount > 0 && styles.unreadCard,
      ]}
      onPress={() =>
        navigation.navigate("ChatScreen", {
          conversationId: item.id,
          bookingId: item.booking_id,
          otherUserName: item.otherUser.full_name,
          serviceName: item.serviceName,
        })
      }
    >
      <Image
        source={{
          uri: item.otherUser.avatar_url || "https://via.placeholder.com/50",
        }}
        style={styles.avatar}
      />

      <View style={styles.conversationInfo}>
        <View style={styles.topRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.otherUser.full_name}
          </Text>
          <Text style={styles.timeText}>
            {formatLastMessageTime(item.lastMessage?.created_at)}
          </Text>
        </View>

        <View style={styles.middleRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.bookingStatus) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.bookingStatus) },
              ]}
            >
              {getStatusLabel(item.bookingStatus)}
            </Text>
          </View>
          <Text style={styles.serviceLabel} numberOfLines={1}>
            {item.serviceName}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage
              ? item.lastMessage.sender_id === user?.id
                ? `Você: ${item.lastMessage.content}`
                : item.lastMessage.content
              : "Nenhuma mensagem ainda"}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Mensagens</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderConversation}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
            <Text style={styles.emptyTitle}>Nenhuma conversa</Text>
            <Text style={styles.emptySubtext}>
              Suas conversas de negociação aparecerão aqui.
            </Text>
          </View>
        }
      />
    </View>
  );
}
