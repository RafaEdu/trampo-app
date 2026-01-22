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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabaseClient";
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

  const [provider, setProvider] = useState(null);
  const [groupedServices, setGroupedServices] = useState({}); // Objeto { "Categoria": [serviços...] }
  const [loading, setLoading] = useState(true);

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
    Alert.alert(
      "Contratar",
      `Deseja solicitar o serviço: ${serviceItem.services.name}?`,
    );
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
    </View>
  );
}
