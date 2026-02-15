import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./styles";

// Mock da Galeria (Fictício)
const MOCK_GALLERY = [
  "https://images.unsplash.com/photo-1529229504105-4ea795dcbf59?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502519144081-acca18599776?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

// Mock de Avaliações (Fictício)
const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Ana Souza",
    rating: 5,
    comment: "Excelente profissional! Muito pontual e caprichoso.",
  },
  {
    id: 2,
    name: "Carlos Pereira",
    rating: 4.5,
    comment: "Serviço muito bom, resolveu meu problema rápido.",
  },
];

export default function ProviderDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { providerId } = route.params;
  const { user } = useAuth();

  const [provider, setProvider] = useState(null);
  const [groupedServices, setGroupedServices] = useState({}); // Objeto { "Categoria": [serviços...] }
  const [loading, setLoading] = useState(true);

  // Estado do Modal de Agendamento
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    fetchProviderData();
  }, [providerId]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);

      // 1. Dados do Perfil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", providerId)
        .single();

      if (profileError) throw profileError;
      setProvider(profileData);

      // 2. Serviços com Categoria
      // Precisamos da relação services -> service_categories para agrupar
      const { data: servicesData, error: servicesError } = await supabase
        .from("professional_services")
        .select(
          `
          id,
          price,
          unit,
          services (
            id,
            name,
            description,
            service_categories (
              name
            )
          )
        `,
        )
        .eq("professional_id", providerId);

      if (servicesError) throw servicesError;

      // Lógica de Agrupamento por Categoria
      const grouped = {};
      (servicesData || []).forEach((item) => {
        // Acessa o nome da categoria ou define "Outros"
        const categoryName =
          item.services?.service_categories?.name || "Outros Serviços";

        if (!grouped[categoryName]) {
          grouped[categoryName] = [];
        }
        grouped[categoryName].push(item);
      });

      setGroupedServices(grouped);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error.message);
      Alert.alert("Erro", "Não foi possível carregar os dados.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (serviceItem) => {
    setSelectedService(serviceItem);
    setScheduledDate(new Date());
    setDescription("");
    setModalVisible(true);
  };

  const handleDateChange = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      const updated = new Date(scheduledDate);
      updated.setFullYear(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
      );
      setScheduledDate(updated);
    }
  };

  const handleTimeChange = (event, selected) => {
    setShowTimePicker(false);
    if (selected) {
      const updated = new Date(scheduledDate);
      updated.setHours(selected.getHours(), selected.getMinutes());
      setScheduledDate(updated);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleConfirmBooking = async () => {
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado para agendar um serviço.");
      return;
    }

    if (scheduledDate <= new Date()) {
      Alert.alert("Data inválida", "Selecione uma data e hora futura.");
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.from("bookings").insert({
        client_id: user.id,
        professional_id: providerId,
        service_id: selectedService.services.id,
        scheduled_date: scheduledDate.toISOString(),
        description: description.trim() || null,
        status: "pending",
      });

      if (error) throw error;

      setModalVisible(false);
      Alert.alert(
        "Agendamento solicitado!",
        `Seu pedido para "${selectedService.services.name}" foi enviado com sucesso. Aguarde a confirmação do profissional.`,
      );
    } catch (error) {
      console.error("Erro ao agendar serviço:", error.message);
      Alert.alert(
        "Erro",
        "Não foi possível realizar o agendamento. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!provider) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. SEÇÃO PERFIL (Foto, Nome, Avaliação Geral) */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: provider.avatar_url || "https://via.placeholder.com/150",
            }}
            style={styles.avatar}
          />
          <Text style={styles.providerName}>
            {provider.full_name || provider.username}
          </Text>

          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {/* Mock de média geral se não tiver no banco */}
              5.0 (25 avaliações)
            </Text>
          </View>
        </View>

        {/* 2. SEÇÃO GALERIA (Carrossel) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Galeria do Prestador</Text>
          <FlatList
            data={MOCK_GALLERY}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.galleryImage} />
            )}
            contentContainerStyle={styles.galleryList}
          />
        </View>

        {/* 3. SEÇÃO SERVIÇOS OFERECIDOS (Agrupados por Categoria) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços Oferecidos</Text>

          {Object.keys(groupedServices).length === 0 ? (
            <Text style={styles.emptyText}>Nenhum serviço cadastrado.</Text>
          ) : (
            Object.keys(groupedServices).map((category) => (
              <View key={category} style={styles.categoryGroup}>
                <Text style={styles.categoryTitle}>{category}</Text>

                {groupedServices[category].map((serviceItem) => (
                  <View key={serviceItem.id} style={styles.serviceCard}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>
                        {serviceItem.services?.name}
                      </Text>
                      <Text style={styles.serviceDescription} numberOfLines={2}>
                        {serviceItem.services?.description ||
                          "Sem descrição informada."}
                      </Text>
                      <Text style={styles.servicePrice}>
                        R$ {Number(serviceItem.price).toFixed(2)}
                        <Text style={styles.serviceUnit}>
                          {" "}
                          / {serviceItem.unit}
                        </Text>
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={() => handleBookService(serviceItem)}
                    >
                      <Text style={styles.bookButtonText}>Agendar</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>

        {/* 4. SEÇÃO AVALIAÇÕES DOS CLIENTES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliações Recentes</Text>
          {MOCK_REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.reviewRating}>{review.rating}</Text>
                </View>
              </View>
              <Text style={styles.reviewComment}>"{review.comment}"</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* MODAL DE AGENDAMENTO */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => !submitting && setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Header do Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agendar Serviço</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedService && (
              <Text style={styles.modalServiceName}>
                {selectedService.services?.name}
              </Text>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Seletor de Data */}
              <Text style={styles.modalLabel}>Data</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                <Text style={styles.datePickerText}>
                  {formatDate(scheduledDate)}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={scheduledDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}

              {/* Seletor de Hora */}
              <Text style={styles.modalLabel}>Horário</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#007AFF" />
                <Text style={styles.datePickerText}>
                  {formatTime(scheduledDate)}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={scheduledDate}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  is24Hour={true}
                  onChange={handleTimeChange}
                />
              )}

              {/* Campo de Descrição */}
              <Text style={styles.modalLabel}>Descrição (opcional)</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Descreva o que você precisa..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                editable={!submitting}
              />
            </ScrollView>

            {/* Botões de Ação */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  submitting && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirmBooking}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
