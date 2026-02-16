import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../services/supabaseClient";
import { styles } from "./styles";

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { conversationId, otherUserName, serviceName, bookingId } =
    route.params;
  const { user, profile } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatLocked, setChatLocked] = useState(false);
  const flatListRef = useRef(null);

  // Proposal modal state
  const [proposalModalVisible, setProposalModalVisible] = useState(false);
  const [proposalDate, setProposalDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [proposalPrice, setProposalPrice] = useState("");
  const [proposalPayment, setProposalPayment] = useState("pix");
  const [sendingProposal, setSendingProposal] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  // Rejection modal state
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingProposalId, setRejectingProposalId] = useState(null);
  const [rejectingMessageId, setRejectingMessageId] = useState(null);

  // Proposals data
  const [proposals, setProposals] = useState({});

  const isProvider = profile?.user_role === "provider";

  const handleBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    fetchMessages();
    fetchProposals();
    checkChatLocked();
    markMessagesAsRead();
    fetchBookingData();

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);

          if (user?.id && payload.new.sender_id !== user.id) {
            supabase
              .from("messages")
              .update({ read: true })
              .eq("id", payload.new.id);
          }

          // If it's a proposal message, fetch proposals again
          if (
            payload.new.message_type === "proposal" ||
            payload.new.message_type === "proposal_accepted" ||
            payload.new.message_type === "proposal_rejected"
          ) {
            fetchProposals();
          }
        },
      )
      .subscribe();

    // Listen for proposal updates
    const proposalChannel = supabase
      .channel(`proposals:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "proposals",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchProposals();
          checkChatLocked();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(proposalChannel);
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!error) {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const fetchProposals = async () => {
    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .eq("conversation_id", conversationId);

    if (!error && data) {
      const map = {};
      data.forEach((p) => {
        map[p.message_id] = p;
      });
      setProposals(map);
    }
  };

  const checkChatLocked = async () => {
    if (!bookingId) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("chat_locked")
      .eq("id", bookingId)
      .single();

    if (!error && data) {
      setChatLocked(data.chat_locked);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user?.id) return;
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("read", false);
  };

  const fetchBookingData = async () => {
    if (!bookingId) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("scheduled_date, description, service_id, services:service_id (name, price, unit)")
      .eq("id", bookingId)
      .single();

    if (!error && data) {
      setBookingData(data);
    }
  };

  const openProposalModal = () => {
    if (bookingData) {
      if (bookingData.scheduled_date) {
        setProposalDate(new Date(bookingData.scheduled_date));
      }
      if (bookingData.services?.price) {
        const price = Number(bookingData.services.price);
        const formatted = price.toFixed(2).replace(".", ",");
        setProposalPrice(formatCurrency(formatted.replace(/\D/g, "")));
      }
    }
    setProposalModalVisible(true);
  };

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || sending || chatLocked) return;

    setSending(true);
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: text,
      message_type: "text",
    });

    if (error) {
      console.error("Erro ao enviar mensagem:", error.message);
      setNewMessage(text);
    }

    setSending(false);
  };

  // ==========================================
  // PROPOSAL: Send proposal
  // ==========================================
  const formatCurrency = (value) => {
    const numbers = value.replace(/\D/g, "");
    const amount = (parseInt(numbers, 10) || 0) / 100;
    return amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handlePriceChange = (text) => {
    const numbers = text.replace(/\D/g, "");
    if (numbers === "") {
      setProposalPrice("");
      return;
    }
    setProposalPrice(formatCurrency(numbers));
  };

  const parsePriceToNumber = (priceStr) => {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/\./g, "").replace(",", ".")) || 0;
  };

  const handleSendProposal = async () => {
    const price = parsePriceToNumber(proposalPrice);
    if (price <= 0) {
      Alert.alert("Erro", "Informe um valor valido para o servico.");
      return;
    }

    if (proposalDate <= new Date()) {
      Alert.alert("Erro", "A data deve ser no futuro.");
      return;
    }

    setSendingProposal(true);

    const dateFormatted = proposalDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeFormatted = proposalDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const priceFormatted = price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    const paymentLabel = proposalPayment === "pix" ? "PIX" : "Dinheiro";

    const proposalText =
      `\u{1F4CB} *PROPOSTA FINAL*\n\n` +
      `\u{1F4C5} Data: ${dateFormatted}\n` +
      `\u{23F0} Horario: ${timeFormatted}\n` +
      `\u{1F4B0} Valor: ${priceFormatted}\n` +
      `\u{1F4B3} Pagamento: ${paymentLabel}\n\n` +
      `Aguardando sua confirmacao...`;

    // Insert the message
    const { data: msgData, error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: proposalText,
        message_type: "proposal",
      })
      .select()
      .single();

    if (msgError) {
      console.error("Erro ao enviar proposta:", msgError.message);
      Alert.alert("Erro", "Nao foi possivel enviar a proposta.");
      setSendingProposal(false);
      return;
    }

    // Insert the proposal record
    const { error: propError } = await supabase.from("proposals").insert({
      conversation_id: conversationId,
      message_id: msgData.id,
      provider_id: user.id,
      scheduled_date: proposalDate.toISOString(),
      price: price,
      payment_method: proposalPayment,
    });

    if (propError) {
      console.error("Erro ao salvar proposta:", propError.message);
    }

    setSendingProposal(false);
    setProposalModalVisible(false);
    setProposalPrice("");
    setProposalDate(new Date());
    setProposalPayment("pix");
  };

  // ==========================================
  // PROPOSAL: Accept
  // ==========================================
  const handleAcceptProposal = async (proposalId) => {
    Alert.alert("Confirmar", "Deseja aceitar esta proposta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Aceitar",
        onPress: async () => {
          // Update proposal status
          const { data: proposalData, error: propError } = await supabase
            .from("proposals")
            .update({ status: "accepted" })
            .eq("id", proposalId)
            .select()
            .single();

          if (propError) {
            Alert.alert("Erro", "Nao foi possivel aceitar a proposta.");
            return;
          }

          // Send acceptance message
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: "\u{2705} Trampo aceito!",
            message_type: "proposal_accepted",
          });

          // Update booking with final details
          const updateData = {
            status: "accepted",
            payment_method: proposalData.payment_method,
            final_price: proposalData.price,
            final_scheduled_date: proposalData.scheduled_date,
          };

          // If payment is "dinheiro", lock the chat immediately
          if (proposalData.payment_method === "dinheiro") {
            updateData.chat_locked = true;
            updateData.chat_locked_at = new Date().toISOString();
          }

          await supabase
            .from("bookings")
            .update(updateData)
            .eq("id", bookingId);

          if (proposalData.payment_method === "dinheiro") {
            setChatLocked(true);
          }

          fetchProposals();
        },
      },
    ]);
  };

  // ==========================================
  // PROPOSAL: Reject
  // ==========================================
  const openRejectionModal = (proposalId, messageId) => {
    setRejectingProposalId(proposalId);
    setRejectingMessageId(messageId);
    setRejectionReason("");
    setRejectionModalVisible(true);
  };

  const handleRejectProposal = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert("Erro", "Informe o motivo da recusa.");
      return;
    }

    // Update proposal status
    const { error: propError } = await supabase
      .from("proposals")
      .update({
        status: "rejected",
        rejection_reason: rejectionReason.trim(),
      })
      .eq("id", rejectingProposalId);

    if (propError) {
      Alert.alert("Erro", "Nao foi possivel recusar a proposta.");
      return;
    }

    // Send rejection message
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: `\u{274C} Proposta recusada.\nMotivo: ${rejectionReason.trim()}`,
      message_type: "proposal_rejected",
    });

    setRejectionModalVisible(false);
    setRejectingProposalId(null);
    setRejectingMessageId(null);
    setRejectionReason("");
    fetchProposals();
  };

  // ==========================================
  // FORMAT helpers
  // ==========================================
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateSeparator = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const shouldShowDateSeparator = (index) => {
    if (index === 0) return true;
    const currentDate = new Date(messages[index].created_at).toDateString();
    const prevDate = new Date(messages[index - 1].created_at).toDateString();
    return currentDate !== prevDate;
  };

  // ==========================================
  // RENDER: Proposal message bubble
  // ==========================================
  const renderProposalBubble = (item) => {
    const proposal = proposals[item.id];
    const isMe = item.sender_id === user?.id;
    const isPending = proposal?.status === "pending";
    const isAccepted = proposal?.status === "accepted";
    const isRejected = proposal?.status === "rejected";

    return (
      <View
        style={[
          styles.proposalBubble,
          isMe ? styles.proposalBubbleRight : styles.proposalBubbleLeft,
        ]}
      >
        <Text
          style={[styles.bubbleText, isMe ? styles.textRight : styles.textLeft]}
        >
          {item.content}
        </Text>

        {/* Status badge */}
        {isAccepted && (
          <View style={styles.proposalStatusBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#34c759" />
            <Text style={styles.proposalStatusAccepted}>Aceita</Text>
          </View>
        )}
        {isRejected && (
          <View style={styles.proposalStatusBadge}>
            <Ionicons name="close-circle" size={16} color="#FF3B30" />
            <Text style={styles.proposalStatusRejected}>Recusada</Text>
          </View>
        )}

        {/* Action buttons for client on pending proposals */}
        {!isProvider && isPending && (
          <View style={styles.proposalActions}>
            <TouchableOpacity
              style={styles.proposalRejectBtn}
              onPress={() => openRejectionModal(proposal.id, item.id)}
            >
              <Ionicons name="close" size={16} color="#FFF" />
              <Text style={styles.proposalBtnText}>Recusar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.proposalAcceptBtn}
              onPress={() => handleAcceptProposal(proposal.id)}
            >
              <Ionicons name="checkmark" size={16} color="#FFF" />
              <Text style={styles.proposalBtnText}>Aceitar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pending indicator for provider */}
        {isProvider && isPending && (
          <View style={styles.proposalStatusBadge}>
            <Ionicons name="time" size={16} color="#F59E0B" />
            <Text style={styles.proposalStatusPending}>Aguardando</Text>
          </View>
        )}

        <Text
          style={[
            styles.timestamp,
            isMe ? styles.timestampRight : styles.timestampLeft,
          ]}
        >
          {formatTime(item.created_at)}
        </Text>
      </View>
    );
  };

  // ==========================================
  // RENDER: Message
  // ==========================================
  const renderMessage = ({ item, index }) => {
    const isMe = item.sender_id === user?.id;
    const showDate = shouldShowDateSeparator(index);
    const isProposal = item.message_type === "proposal";
    const isAcceptMsg = item.message_type === "proposal_accepted";
    const isRejectMsg = item.message_type === "proposal_rejected";

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {formatDateSeparator(item.created_at)}
            </Text>
          </View>
        )}

        {/* System-like messages for accept/reject */}
        {(isAcceptMsg || isRejectMsg) && (
          <View style={styles.systemMessageContainer}>
            <View
              style={[
                styles.systemMessageBubble,
                isAcceptMsg
                  ? styles.systemAcceptBubble
                  : styles.systemRejectBubble,
              ]}
            >
              <Text style={styles.systemMessageText}>{item.content}</Text>
              <Text style={styles.systemTimestamp}>
                {formatTime(item.created_at)}
              </Text>
            </View>
          </View>
        )}

        {/* Proposal message */}
        {isProposal && (
          <View
            style={[
              styles.bubbleContainer,
              isMe ? styles.bubbleContainerRight : styles.bubbleContainerLeft,
            ]}
          >
            {renderProposalBubble(item)}
          </View>
        )}

        {/* Normal text message */}
        {!isProposal && !isAcceptMsg && !isRejectMsg && (
          <View
            style={[
              styles.bubbleContainer,
              isMe ? styles.bubbleContainerRight : styles.bubbleContainerLeft,
            ]}
          >
            <View
              style={[
                styles.bubble,
                isMe ? styles.bubbleRight : styles.bubbleLeft,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  isMe ? styles.textRight : styles.textLeft,
                ]}
              >
                {item.content}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  isMe ? styles.timestampRight : styles.timestampLeft,
                ]}
              >
                {formatTime(item.created_at)}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  // ==========================================
  // Date/Time picker handlers
  // ==========================================
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const updated = new Date(proposalDate);
      updated.setFullYear(selectedDate.getFullYear());
      updated.setMonth(selectedDate.getMonth());
      updated.setDate(selectedDate.getDate());
      setProposalDate(updated);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const updated = new Date(proposalDate);
      updated.setHours(selectedTime.getHours());
      updated.setMinutes(selectedTime.getMinutes());
      setProposalDate(updated);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {otherUserName}
          </Text>
          {serviceName && (
            <Text style={styles.headerService} numberOfLines={1}>
              {serviceName}
            </Text>
          )}
        </View>
        {chatLocked && (
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={14} color="#6B7280" />
            <Text style={styles.lockedBadgeText}>Encerrado</Text>
          </View>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={48}
              color="#ccc"
            />
            <Text style={styles.emptyText}>
              Inicie a conversa com {otherUserName}
            </Text>
          </View>
        }
      />

      {/* Chat locked banner */}
      {chatLocked && (
        <View style={styles.lockedBanner}>
          <Ionicons name="lock-closed" size={18} color="#6B7280" />
          <Text style={styles.lockedBannerText}>Este chat foi encerrado.</Text>
        </View>
      )}

      {/* Input bar - hidden when locked */}
      {!chatLocked && (
        <View style={styles.inputBar}>
          {/* Proposal button for providers */}
          {isProvider && (
            <TouchableOpacity
              style={styles.proposalButton}
              onPress={openProposalModal}
            >
              <Ionicons
                name="document-text-outline"
                size={22}
                color="#007AFF"
              />
            </TouchableOpacity>
          )}

          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            <Ionicons
              name="send"
              size={20}
              color={newMessage.trim() ? "#FFF" : "#ccc"}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* ==========================================
          MODAL: Proposal
          ========================================== */}
      <Modal
        visible={proposalModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProposalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enviar Proposta</Text>
              <TouchableOpacity
                onPress={() => setProposalModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Initial client booking data */}
              {bookingData && (
                <View style={styles.bookingInfoSection}>
                  <Text style={styles.bookingInfoTitle}>Proposta do cliente</Text>
                  <View style={styles.bookingInfoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text style={styles.bookingInfoText}>
                      Data solicitada: {bookingData.scheduled_date
                        ? new Date(bookingData.scheduled_date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }) +
                          " às " +
                          new Date(bookingData.scheduled_date).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--"}
                    </Text>
                  </View>
                  {bookingData.services?.price && (
                    <View style={styles.bookingInfoRow}>
                      <Ionicons name="cash-outline" size={16} color="#6B7280" />
                      <Text style={styles.bookingInfoText}>
                        Valor do serviço: {Number(bookingData.services.price).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                        {bookingData.services.unit ? ` / ${bookingData.services.unit}` : ""}
                      </Text>
                    </View>
                  )}
                  {bookingData.description && (
                    <View style={styles.bookingInfoRow}>
                      <Ionicons name="document-text-outline" size={16} color="#6B7280" />
                      <Text style={styles.bookingInfoText}>
                        {bookingData.description}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Date */}
              <Text style={styles.modalLabel}>
                {"\u{1F4C5}"} Data do trabalho
              </Text>
              <TouchableOpacity
                style={styles.modalInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.modalInputText}>
                  {proposalDate.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={proposalDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={new Date()}
                  onChange={onDateChange}
                  locale="pt-BR"
                />
              )}

              {/* Time */}
              <Text style={styles.modalLabel}>{"\u{23F0}"} Horario</Text>
              <TouchableOpacity
                style={styles.modalInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.modalInputText}>
                  {proposalDate.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Ionicons name="time-outline" size={20} color="#6B7280" />
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={proposalDate}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onTimeChange}
                  is24Hour
                />
              )}

              {/* Price */}
              <Text style={styles.modalLabel}>{"\u{1F4B0}"} Valor (R$)</Text>
              <View style={styles.modalInput}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={styles.priceInput}
                  value={proposalPrice}
                  onChangeText={handlePriceChange}
                  placeholder="0,00"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              {/* Payment method */}
              <Text style={styles.modalLabel}>
                {"\u{1F4B3}"} Forma de pagamento
              </Text>
              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    proposalPayment === "pix" && styles.paymentOptionSelected,
                  ]}
                  onPress={() => setProposalPayment("pix")}
                >
                  <Ionicons
                    name="qr-code-outline"
                    size={20}
                    color={proposalPayment === "pix" ? "#007AFF" : "#6B7280"}
                  />
                  <Text
                    style={[
                      styles.paymentOptionText,
                      proposalPayment === "pix" &&
                        styles.paymentOptionTextSelected,
                    ]}
                  >
                    PIX
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    proposalPayment === "dinheiro" &&
                      styles.paymentOptionSelected,
                  ]}
                  onPress={() => setProposalPayment("dinheiro")}
                >
                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color={
                      proposalPayment === "dinheiro" ? "#007AFF" : "#6B7280"
                    }
                  />
                  <Text
                    style={[
                      styles.paymentOptionText,
                      proposalPayment === "dinheiro" &&
                        styles.paymentOptionTextSelected,
                    ]}
                  >
                    Dinheiro
                  </Text>
                </TouchableOpacity>
              </View>

              {proposalPayment === "dinheiro" && (
                <Text style={styles.paymentWarning}>
                  {"\u{26A0}\u{FE0F}"} Ao aceitar com pagamento em dinheiro, o
                  chat sera encerrado apos a confirmacao.
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.sendProposalBtn,
                sendingProposal && styles.sendProposalBtnDisabled,
              ]}
              onPress={handleSendProposal}
              disabled={sendingProposal}
            >
              {sendingProposal ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={18} color="#FFF" />
                  <Text style={styles.sendProposalBtnText}>
                    Enviar Proposta
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==========================================
          MODAL: Rejection reason
          ========================================== */}
      <Modal
        visible={rejectionModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRejectionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recusar Proposta</Text>
              <TouchableOpacity
                onPress={() => setRejectionModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Informe o motivo da recusa:</Text>
              <TextInput
                style={styles.rejectionInput}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                placeholder="Ex: Valor muito alto, prefiro outro horario..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.rejectConfirmBtn}
              onPress={handleRejectProposal}
            >
              <Ionicons name="close-circle" size={18} color="#FFF" />
              <Text style={styles.rejectConfirmBtnText}>Confirmar Recusa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
