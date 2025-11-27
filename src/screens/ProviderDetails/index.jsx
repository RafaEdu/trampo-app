import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles";

export default function ProviderDetailsScreen({ route, navigation }) {
  const { provider, filterCategoryId } = route.params;
  const { user } = useAuth();

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);

  const [providerServices, setProviderServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      // Busca serviços do prestador
      const { data, error } = await supabase
        .from("professional_services")
        .select(
          `
          price,
          unit,
          services (
            id,
            name,
            category_id
          )
        `
        )
        .eq("professional_id", provider.id);

      if (error) {
        console.error("Erro ao buscar serviços:", error);
      } else if (data) {
        // --- LÓGICA DE FILTRO ---
        // Se tivermos um ID de categoria vindo da busca, filtramos.
        // Caso contrário (acesso direto), mostramos tudo.
        const filtered = filterCategoryId
          ? data.filter(
              (item) => item.services.category_id === filterCategoryId
            )
          : data;

        setProviderServices(filtered);
      }
      setLoadingServices(false);
    };

    fetchServices();
  }, [provider.id, filterCategoryId]);

  const handleRequestBooking = async () => {
    if (!description.trim()) {
      Alert.alert(
        "Atenção",
        "Descreva o que você precisa para o prestador entender."
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("bookings").insert({
      client_id: user.id,
      professional_id: provider.id,
      description: description,
      status: "pending",
      // Opcional: Salvar qual foi a categoria de interesse no booking, se tiver coluna pra isso
    });

    setLoading(false);

    if (error) {
      Alert.alert("Erro", "Não foi possível enviar o pedido. Tente novamente.");
      console.error(error);
    } else {
      Alert.alert(
        "Sucesso!",
        "Pedido enviado! Você será notificado quando ele responder.",
        [{ text: "OK", onPress: () => navigation.navigate("Início") }]
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{provider.full_name}</Text>

      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>Opções de serviços:</Text>

        {loadingServices ? (
          <ActivityIndicator size="small" color="#007aff" />
        ) : providerServices.length > 0 ? (
          providerServices.map((item, index) => (
            <View key={index} style={styles.serviceItem}>
              <Text style={styles.serviceName}>{item.services.name}</Text>
              <Text style={styles.servicePrice}>
                {/* Tratamento para preço não numérico ou nulo */}
                {item.price
                  ? `R$ ${parseFloat(item.price).toFixed(2)}`
                  : "A combinar"}
                {item.unit ? ` / ${item.unit}` : ""}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noServices}>
            Este prestador não listou serviços específicos para esta categoria,
            mas você pode solicitar um orçamento abaixo.
          </Text>
        )}
      </View>

      <View style={styles.separator} />

      <Text style={styles.label}>Descreva o que você precisa:</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder="Ex: Preciso que realize o serviço X na data Y..."
        value={description}
        onChangeText={setDescription}
      />

      <Button
        title={loading ? "Enviando..." : "Solicitar Orçamento"}
        onPress={handleRequestBooking}
        disabled={loading}
      />
    </ScrollView>
  );
}
