import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  Button,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../services/supabaseClient";
import { useAuth } from "../../../contexts/AuthContext";
import { styles } from "./styles";

export default function SetPricesScreen({ route, navigation }) {
  const { serviceIds } = route.params;
  const { user, forceSetOnboarded } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // EFEITO 1: Botão "Pular" (Sem alterações)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={handleSkip}
          title="Pular"
          color="#007aff"
          disabled={isSaving}
        />
      ),
    });
  }, [navigation, isSaving]);

  // EFEITO 2: Buscar nomes (Sem alterações)
  useEffect(() => {
    const fetchServiceNames = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select("id, name")
        .in("id", serviceIds);

      if (error) {
        Alert.alert("Erro", "Não foi possível carregar os serviços.");
      } else {
        setServices(
          data.map((service) => ({
            ...service,
            price: "",
            unit: "",
          }))
        );
      }
      setLoading(false);
    };

    fetchServiceNames();
  }, [serviceIds]);

  // --- FUNÇÃO 'saveServices' CORRIGIDA ---
  const saveServices = async (dataOverride = null) => {
    if (!user) return;
    setIsSaving(true); // 1. Começa o loading

    try {
      // 2. Prepara os dados
      let dataToInsert;
      if (dataOverride) {
        dataToInsert = services.map((service) => ({
          professional_id: user.id,
          service_id: service.id,
          ...dataOverride,
        }));
      } else {
        dataToInsert = services.map((service) => ({
          professional_id: user.id,
          service_id: service.id,
          price: service.price || null,
          unit: service.unit || null,
        }));
      }

      // 3. Tenta fazer o insert
      const { error: insertError } = await supabase
        .from("professional_services")
        .insert(dataToInsert);

      if (insertError) {
        throw insertError; // 4. Joga o erro do Supabase para o 'catch'
      }

      // 5. SUCESSO no insert! Agora, tenta atualizar o contexto
      await refreshOnboardingStatus(user.id);

      // 6. SUCESSO total!
      // A tela será desmontada pelo Router. Não precisamos chamar
      // setIsSaving(false) aqui, pois o componente vai sumir.
    } catch (error) {
      // 7. PEGA QUALQUER ERRO (do insert OU do refresh)
      console.error("Erro ao salvar serviços:", error.message);
      Alert.alert("Erro ao salvar", error.message);

      // 8. A PARTE MAIS IMPORTANTE: Para o loading em caso de erro.
      setIsSaving(false);
    }
  };

  // Botão "Pular" (Sem alterações)
  const handleSkip = () => {
    saveServices({ price: null, unit: null });
  };

  // Botão "Concluir" (Sem alterações)
  const handleSave = () => {
    saveServices();
  };

  // Funções de input (Sem alterações)
  const handlePriceChange = (id, price) => {
    setServices((currentServices) =>
      currentServices.map((service) =>
        service.id === id ? { ...service, price: price } : service
      )
    );
  };

  const handleUnitChange = (id, unit) => {
    setServices((currentServices) =>
      currentServices.map((service) =>
        service.id === id ? { ...service, unit: unit } : service
      )
    );
  };

  // --- RENDERIZAÇÃO (Sem alterações) ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loadingText}>Carregando serviços...</Text>
      </View>
    );
  }

  const renderServiceCard = ({ item }) => (
    <View style={styles.serviceCard}>
      <Text style={styles.serviceName}>{item.name}</Text>
      <View style={styles.inputGroup}>
        <View style={[styles.inputContainer, styles.priceInput]}>
          <Text style={styles.inputLabel}>Preço (R$)</Text>
          <TextInput
            style={styles.textInput}
            value={item.price}
            onChangeText={(text) => handlePriceChange(item.id, text)}
            keyboardType="numeric"
            placeholder="Ex: 50.00"
            editable={!isSaving}
          />
        </View>

        <View style={[styles.inputContainer, styles.unitInput]}>
          <Text style={styles.inputLabel}>Unidade</Text>
          <TextInput
            style={styles.textInput}
            value={item.unit}
            onChangeText={(text) => handleUnitChange(item.id, text)}
            placeholder="Ex: hora, serviço"
            editable={!isSaving}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isSaving && <ActivityIndicator size="large" color="#007aff" />}

      <View style={styles.header}>
        <Text style={styles.title}>Defina seus preços (Opcional)</Text>
        <Text style={styles.subtitle}>
          Você pode pular esta etapa e preencher depois.
        </Text>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderServiceCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Button
          title="Concluir e Salvar"
          onPress={handleSave}
          disabled={isSaving}
        />
      </View>
    </SafeAreaView>
  );
}
