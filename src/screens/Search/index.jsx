import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabaseClient"; // Ajuste o caminho conforme sua estrutura
import styles from "./styles";

export default function SearchScreen() {
  const navigation = useNavigation();
  const inputRef = useRef(null);

  // Estados
  const [searchText, setSearchText] = useState("");
  const [radius, setRadius] = useState(50); // Padrão 50km
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock da localização do usuário atual (Em produção, use expo-location)
  // Substitua isso pela lógica real do seu UserContext ou Location Context
  const currentUserLocation = {
    latitude: -23.55052, // Exemplo: São Paulo
    longitude: -46.633308,
  };

  /**
   * Lógica de Foco e Teclado:
   * Sempre que a tela ganha foco (entra nela ou volta pra ela),
   * o input ganha foco e o teclado sobe.
   */
  useFocusEffect(
    useCallback(() => {
      // Pequeno delay para garantir que a animação de transição de tela terminou
      const timeout = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(timeout);
    }, []),
  );

  /**
   * Função de Busca no Supabase via RPC
   */
  const handleSearch = async () => {
    if (!searchText.trim()) return;

    setLoading(true);
    Keyboard.dismiss(); // Opcional: baixar teclado ao buscar, ou manter se preferir

    try {
      const { data, error } = await supabase.rpc("search_providers_geo", {
        user_lat: currentUserLocation.latitude,
        user_long: currentUserLocation.longitude,
        radius_km: radius,
        search_text: searchText,
      });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error("Erro na busca:", error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lógica do botão Voltar
   * Limpa o texto e volta para Home.
   */
  const handleGoBack = () => {
    setSearchText(""); // Requisito: apagar texto ao voltar pela seta
    setResults([]);
    navigation.goBack();
  };

  /**
   * Renderização de cada Card de Provider
   */
  const renderProviderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ProviderDetails", { providerId: item.id })
      }
    >
      {/* Esquerda: Foto (Topo ao Bottom) */}
      <Image
        source={{ uri: item.avatar_url || "https://via.placeholder.com/150" }}
        style={styles.cardImage}
        resizeMode="cover"
      />

      {/* Direita: Informações Centralizadas */}
      <View style={styles.cardContent}>
        <Text style={styles.providerName} numberOfLines={2}>
          {item.full_name || item.username}
        </Text>

        {/* Sistema de Avaliação (Mock visual por enquanto) */}
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>
            {item.average_rating
              ? Number(item.average_rating).toFixed(1)
              : "Novo"}
          </Text>
        </View>

        <Text style={styles.distanceText}>
          {item.distance_km ? `${item.distance_km.toFixed(1)} km` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header com SearchBar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.searchBarContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={{ marginRight: 8 }}
          />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Buscar serviços, prestadores..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch} // Enter do teclado dispara a busca
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Slider de Raio */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Raio de busca: {radius} km</Text>
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={1}
          maximumValue={100}
          step={1}
          value={radius}
          onValueChange={setRadius}
          minimumTrackTintColor="#007AFF" // Cor primária do app (ajuste conforme tema)
          maximumTrackTintColor="#000000"
          thumbTintColor="#007AFF"
        />
      </View>

      {/* Lista de Resultados */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProviderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            searchText.length > 0 && !loading ? (
              <Text style={styles.emptyText}>
                Nenhum prestador encontrado nesta região.
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
}
