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
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../services/supabaseClient";
import { styles } from "./styles";

export default function ChatScreen() {
  const route = useRoute();
  const { conversationId, otherUserName } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();

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

          if (payload.new.sender_id !== user.id) {
            supabase
              .from("messages")
              .update({ read: true })
              .eq("id", payload.new.id);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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

  const markMessagesAsRead = async () => {
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("read", false);
  };

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || sending) return;

    setSending(true);
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: text,
    });

    if (error) {
      console.error("Erro ao enviar mensagem:", error.message);
      setNewMessage(text);
    }

    setSending(false);
  };

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

  const renderMessage = ({ item, index }) => {
    const isMe = item.sender_id === user.id;
    const showDate = shouldShowDateSeparator(index);

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {formatDateSeparator(item.created_at)}
            </Text>
          </View>
        )}
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
      </View>
    );
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
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

      <View style={styles.inputBar}>
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
    </KeyboardAvoidingView>
  );
}
