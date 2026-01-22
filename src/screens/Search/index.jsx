import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Keyboard,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { supabase } from "../../services/supabaseClient";
import styles from "./styles";

export default function SearchScreen() {
  const navigation = useNavigation();
  const inputRef = useRef(null);

  // Estados
  const [searchText, setSearchText] = useState("");
  const [radius, setRadius] = useState(50);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Localização
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // 1. Obter Localização Real
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Permissão de localização negada");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      } catch (error) {
        console.error("Erro GPS:", error);
        setLocationError("Erro ao obter localização");
      }
    })();
  }, []);

  // Foco no input ao abrir
  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timeout);
    }, []),
  );

  /**
   * Função de Busca
   */
  const handleSearch = async () => {
    if (!userLocation) {
      Alert.alert("Aguarde", "Obtendo sua localização...");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const { data, error } = await supabase.rpc("search_providers_geo", {
        user_lat: userLocation.latitude,
        user_long: userLocation.longitude,
        radius_km: radius,
        search_text: searchText || "", // Garante string vazia se for null
      });

      if (error) throw error;

      // PROTEÇÃO CONTRA O ERRO DE UNDEFINED
      // Filtramos itens que porventura venham nulos ou sem ID
      const validData = (data || []).filter((item) => item && item.id);

      setResults(validData);
    } catch (error) {
      console.error("Erro na busca:", error.message);
      Alert.alert("Erro", "Não foi possível realizar a busca.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setSearchText("");
    setResults([]);
    navigation.goBack();
  };

  /**
   * Renderização do Card com Proteção de Nulos
   */
  const renderProviderItem = ({ item }) => {
    // Dupla checagem para evitar o erro "Cannot read property... of undefined"
    if (!item || !item.id) return null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("ProviderDetails", { providerId: item.id })
        }
      >
        <Image
          source={{ uri: item.avatar_url || "https://via.placeholder.com/150" }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        <View style={styles.cardContent}>
          <Text style={styles.providerName} numberOfLines={2}>
            {item.full_name || item.username || "Profissional"}
          </Text>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {item.average_rating
                ? Number(item.average_rating).toFixed(1)
                : "Novo"}
            </Text>
          </View>

          <Text style={styles.distanceText}>
            {item.distance_km !== undefined && item.distance_km !== null
              ? `${item.distance_km.toFixed(1)} km`
              : "-- km"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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
            placeholder={
              locationError
                ? "Localização indisponível"
                : "Buscar serviços, prestadores..."
            }
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            editable={!locationError}
          />
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Raio de busca: {radius} km</Text>
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={1}
          maximumValue={100}
          step={1}
          value={radius}
          onValueChange={setRadius}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#000000"
          thumbTintColor="#007AFF"
        />
        {!userLocation && !locationError && (
          <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            Localizando você...
          </Text>
        )}
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={results}
          // PROTEÇÃO NO KEY EXTRACTOR
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : `fallback-${index}`
          }
          renderItem={renderProviderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            searchText.length > 0 ? (
              <Text style={styles.emptyText}>
                Nenhum prestador encontrado. Tente aumentar o raio ou mudar o
                termo.
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
}
