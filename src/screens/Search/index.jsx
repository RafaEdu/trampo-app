import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { supabase } from "../../services/supabaseClient";
import { styles } from "./styles";
import { Ionicons } from "@expo/vector-icons";
import ProviderCard from "../../components/ProviderCard";

// 1. Recebemos a prop 'navigation' aqui
export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);

  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);

  useEffect(() => {
    (async () => {
      setLocationError(null);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("A permissão de localização foi negada.");
        Alert.alert("Permissão Necessária", "...");
        return;
      }
      try {
        setLoading(true);
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      } catch (error) {
        console.warn("Falha ao obter localização real:", error.message);
        if (__DEV__) {
          Alert.alert("Modo DEV", "Usando localização simulada (SP).");
          const mockLocation = { latitude: -23.55052, longitude: -46.633308 };
          setUserLocation(mockLocation);
        } else {
          setLocationError("Não foi possível obter a localização.");
          Alert.alert("Erro", "Não foi possível obter sua localização.");
        }
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("id, name");
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleChangeRadius = () => {
    Alert.alert(
      "Selecionar Raio",
      "Qual a distância máxima?",
      [
        { text: "5 km", onPress: () => setSearchRadius(5) },
        { text: "10 km", onPress: () => setSearchRadius(10) },
        { text: "25 km", onPress: () => setSearchRadius(25) },
        { text: "Cancelar", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const handleSearch = async () => {
    if (!userLocation) {
      Alert.alert("Ops!", "Aguarde! Estamos pegando sua localização...");
      return;
    }
    if (!searchQuery) {
      Alert.alert("Digite algo", "Digite um nome ou serviço para buscar.");
      return;
    }

    setLoading(true);
    setResults([]);

    const args = {
      client_lat: userLocation.latitude,
      client_lng: userLocation.longitude,
      search_radius_meters: searchRadius * 1000,
      search_term: searchQuery,
    };

    try {
      const { data, error } = await supabase.rpc("search_professionals", args);

      if (error) throw error;

      setResults(data);

      if (data.length === 0) {
        Alert.alert(
          "Nenhum resultado",
          "Nenhum profissional encontrado com esses critérios."
        );
      }
    } catch (error) {
      console.error("Erro ao chamar RPC:", error.message);
      Alert.alert(
        "Erro na Busca",
        "Ocorreu um erro ao buscar. Tente novamente."
      );
    }

    setLoading(false);
  };

  // 2. Atualizamos o renderItem para ser clicável
  const renderProviderCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7} // Dá um feedback visual ao tocar
      onPress={() => {
        // Navega para a tela de detalhes passando o objeto 'provider' inteiro via params
        navigation.navigate("ProviderDetails", { provider: item });
      }}
    >
      {/* O componente de visualização permanece o mesmo, apenas envolvido pelo toque */}
      <ProviderCard provider={item} />
    </TouchableOpacity>
  );

  if (loading && !results.length && !userLocation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007aff" />
          <Text style={styles.emptyText}>Obtendo sua localização...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Buscar por nome ou serviço..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Filtros:</Text>
          <Button title="Categorias" onPress={() => {}} />
          <Button
            title={`Raio: ${searchRadius}km`}
            onPress={handleChangeRadius}
          />
        </View>

        {locationError && <Text style={styles.errorText}>{locationError}</Text>}

        {loading ? (
          <ActivityIndicator size="large" color="#007aff" />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProviderCard}
            style={styles.resultsList}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Busque por um profissional ou serviço.
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
