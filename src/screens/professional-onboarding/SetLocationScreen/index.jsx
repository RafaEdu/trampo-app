import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { supabase } from "../../../services/supabaseClient";
import { useAuth } from "../../../contexts/AuthContext";
import { styles } from "./styles";
import { Ionicons } from "@expo/vector-icons";

export default function SetLocationScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null); // 1. Novo estado para o endereço
  const [errorMsg, setErrorMsg] = useState(null);

  // Função para formatar o endereço (helper)
  const formatAddress = (addr) => {
    if (!addr) return "Não foi possível identificar o endereço.";
    const { street, streetNumber, district, city, subregion } = addr;
    // Tenta montar o mais completo possível
    return `${street || ""} ${streetNumber || ""}\n${
      district || ""
    }\n${city || subregion || ""}`;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg(
          "A permissão de localização é essencial para você ser encontrado por clientes."
        );
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);

        // 2. FAZER O REVERSE GEOCODING
        let geocode = await Location.reverseGeocodeAsync(
          currentLocation.coords
        );
        if (geocode.length > 0) {
          setAddress(geocode[0]); // Pega o primeiro resultado (mais provável)
        }
      } catch (error) {
        setErrorMsg("Não foi possível pegar sua localização. Tente novamente.");
        if (__DEV__ && (Platform.OS === "android" || Platform.OS === "ios")) {
          Alert.alert(
            "Erro no Emulador?",
            "Lembre-se de definir uma localização no seu emulador para continuar."
          );
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleSaveLocation = async () => {
    // ... (lógica de salvar no Supabase permanece igual) ...
    if (!location || !user) {
      Alert.alert("Erro", "Localização ou usuário não encontrados.");
      return;
    }

    setLoading(true);
    const postgisLocation = `POINT(${location.longitude} ${location.latitude})`;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ location: postgisLocation })
        .eq("id", user.id);

      if (error) throw error;
      navigation.navigate("SelectCategories");
    } catch (error) {
      console.error("Erro ao salvar localização:", error.message);
      Alert.alert("Erro", "Não foi possível salvar sua localização.");
      setLoading(false);
    }
  };

  // 3. Atualizar a renderização do conteúdo
  let content = (
    <View style={styles.content}>
      <Ionicons name="location-outline" size={80} color="#007aff" />
      <Text style={styles.title}>Confirme sua localização</Text>
      <Text style={styles.subtitle}>
        Este será seu ponto de partida para clientes encontrarem você.
      </Text>
    </View>
  );

  if (loading) {
    content = (
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.subtitle}>Buscando sua localização...</Text>
      </View>
    );
  }

  if (errorMsg) {
    content = (
      <View style={styles.content}>
        <Ionicons name="alert-circle-outline" size={80} color="#e74c3c" />
        <Text style={styles.title}>Erro de Localização</Text>
        <Text style={styles.subtitle}>{errorMsg}</Text>
      </View>
    );
  }

  // 4. Se tivermos o endereço, mostramos ele para confirmação
  if (address && !loading && !errorMsg) {
    content = (
      <View style={styles.content}>
        <Ionicons name="location" size={80} color="#007aff" />
        <Text style={styles.title}>Este é o seu local?</Text>
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>{formatAddress(address)}</Text>
        </View>
        <Text style={styles.subtitle}>
          Você pode ajustar isso no seu perfil mais tarde.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {content}
      <View style={styles.footer}>
        <Button
          // 5. Mudar o texto do botão para "Confirmar"
          title={loading ? "Salvando..." : "Confirmar e Avançar"}
          onPress={handleSaveLocation}
          disabled={loading || !location || !address}
        />
      </View>
    </SafeAreaView>
  );
}
