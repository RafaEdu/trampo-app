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

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);

  // Nossos estados de busca
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10); // Raio padrão de 10km

  // 1. Pedir localização ao carregar a tela
  useEffect(() => {
    const requestLocation = async () => {
      setLocationError(null);
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("A permissão de localização foi negada.");
        Alert.alert(
          "Permissão Necessária",
          "Para buscar profissionais próximos, precisamos da sua localização."
        );
        return;
      }

      try {
        setLoading(true); // Usamos o loading principal
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
        console.log("Localização do cliente obtida:", location.coords);
      } catch (error) {
        setLocationError("Não foi possível obter a localização.");
        Alert.alert(
          "Erro",
          "Não foi possível obter sua localização. Tente reiniciar o app."
        );
      }
      setLoading(false);
    };

    requestLocation();
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  // (useEffect que busca categorias permanece o mesmo)
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("id, name");
      if (!error && data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  // 2. Função para alterar o raio (simulada com Alert)
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

  // 3. Função de busca principal
  const handleSearch = async () => {
    // Validação principal: precisamos da localização para buscar
    if (!userLocation) {
      setLocationError("Sua localização é necessária para a busca.");
      Alert.alert(
        "Ops!",
        "Não conseguimos pegar sua localização. Por favor, habilite nas configurações do seu celular e reabra a tela."
      );
      return;
    }

    // Validação de busca vazia (opcional, mas bom ter)
    if (!searchQuery) {
      Alert.alert("Digite algo", "Digite um nome ou serviço para buscar.");
      return;
    }

    setLoading(true);
    console.log("BUSCANDO NO SUPABASE (simulado):");
    console.log("Termo:", searchQuery);
    console.log("Raio:", `${searchRadius}km`);
    console.log(
      "Localização (lat/lng):",
      userLocation.latitude,
      userLocation.longitude
    );

    // --- AQUI ENTRARÁ A LÓGICA DA RPC ---
    // (Por enquanto, mantemos a simulação)
    setTimeout(() => {
      setResults([
        {
          id: 1,
          full_name: "Rafa, o Eletricista",
          distance: "2.5km",
          matched_service: `Serviço relacionado a "${searchQuery}"`,
          other_services: ["Instalação de tomada", "Reparo elétrico"],
          price: "120.00",
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  const renderProviderCard = ({ item }) => <ProviderCard provider={item} />;

  // 4. Se não tiver permissão de localização, bloqueamos a tela
  if (locationError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{locationError}</Text>
          <Button
            title="Tentar novamente"
            onPress={() => {
              /* Lógica para re-pedir */
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // 5. Mostra um loading geral enquanto pega a localização inicial
  if (loading && !results.length) {
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
          {/* 6. Botão de localização atualizado */}
          <Button
            title={`Raio: ${searchRadius}km`}
            onPress={handleChangeRadius}
          />
        </View>

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
