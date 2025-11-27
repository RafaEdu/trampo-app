import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";
import { supabase } from "../../services/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import ProviderCard from "../../components/ProviderCard";
import { styles } from "./styles";

export default function SearchScreen({ navigation }) {
  // Estado agora guarda o ID da categoria, não um texto livre
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Raio padrão inicial (ex: 30km)
  const [searchRadius, setSearchRadius] = useState(30);

  // 1. Pegar Localização
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permissão negada");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  // 2. Pegar Categorias (Mantém igual)
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("id, name")
        .order("name");
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

  // 3. Busca Atualizada
  const handleSearch = async () => {
    if (!userLocation) {
      Alert.alert("Localização", "Aguardando sua localização...");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Selecione", "Por favor, escolha uma categoria de serviço.");
      return;
    }

    setLoading(true);
    setResults([]);

    // Encontra o objeto da categoria selecionada para pegar o nome (se RPC buscar por texto)
    // OU passamos o ID se sua RPC suportar filtragem por ID.
    // Assumindo que o RPC 'search_professionals' usa 'search_term' (texto):
    const categoryName = categories.find(
      (c) => c.id === selectedCategory
    )?.name;

    const args = {
      client_lat: userLocation.latitude,
      client_lng: userLocation.longitude,
      search_radius_meters: searchRadius * 1000, // km -> metros
      search_term: categoryName, // Nome da categoria como termo de busca
    };

    try {
      const { data, error } = await supabase.rpc("search_professionals", args);

      if (error) throw error;
      setResults(data);

      if (data.length === 0)
        Alert.alert(
          "Ops",
          "Nenhum profissional nesta área para essa categoria."
        );
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao buscar profissionais.");
    } finally {
      setLoading(false);
    }
  };

  // Renderiza o card, passando a categoria selecionada para a próxima tela
  const renderProviderCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        navigation.navigate("ProviderDetails", {
          provider: item,
          // Passamos o filtro escolhido para a tela de detalhes
          filterCategoryId: selectedCategory,
        });
      }}
    >
      <ProviderCard provider={item} />
    </TouchableOpacity>
  );

  // Renderiza os "Chips" de categoria
  const renderCategoryItem = ({ item }) => {
    const isSelected = selectedCategory === item.id;
    return (
      <TouchableOpacity
        style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
        onPress={() => setSelectedCategory(item.id)}
      >
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextSelected,
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>O que você precisa hoje?</Text>

        {/* Lista Horizontal de Categorias */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          />
        </View>

        {/* Seletor de Raio (Slider) */}
        <View style={styles.sliderContainer}>
          <View style={styles.sliderLabelRow}>
            <Text style={styles.sliderLabel}>Distância máxima:</Text>
            <Text style={styles.sliderValue}>{searchRadius} km</Text>
          </View>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={1}
            maximumValue={100}
            step={1}
            value={searchRadius}
            onValueChange={setSearchRadius}
            minimumTrackTintColor="#007aff"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="#007aff"
          />
        </View>

        {/* Botão de Busca */}
        <TouchableOpacity
          style={[
            styles.searchButton,
            (!selectedCategory || !userLocation) && styles.searchButtonDisabled,
          ]}
          onPress={handleSearch}
          disabled={!selectedCategory || !userLocation}
        >
          <Text style={styles.searchButtonText}>Buscar Profissionais</Text>
          <Ionicons
            name="search"
            size={20}
            color="white"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      {/* Lista de Resultados */}
      <View style={styles.resultsContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007aff"
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProviderCard}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>
                Selecione uma categoria e ajuste a distância para buscar.
              </Text>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
