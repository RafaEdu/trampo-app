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
  }, [navigation, isSaving, handleSkip]); // Adicionei handleSkip aqui por segurança, mas a correção principal está abaixo

  // EFEITO 2: Buscar nomes (Sem alterações)
  useEffect(() => {
    // Se não tiver serviceIds, não faz sentido estar aqui.
    // Isso é uma defesa extra caso a tela anterior falhe.
    if (!serviceIds || serviceIds.length === 0) {
      console.warn("SetPricesScreen: serviceIds está vazio. Pulando.");
      forceSetOnboarded();
      return;
    }

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
  }, [serviceIds, forceSetOnboarded]); // Adicionei forceSetOnboarded

  // --- FUNÇÃO 'saveServices' CORRIGIDA ---
  const saveServices = async (dataOverride = null) => {
    if (!user) return;
    setIsSaving(true);

    try {
      let dataToInsert;

      if (dataOverride) {
        // --- ESTA É A CORREÇÃO ---
        // O "Pular" (dataOverride=true) não deve usar o estado 'services',
        // que pode estar obsoleto (stale).
        // Devemos usar o 'serviceIds' que recebemos da rota.
        console.log("Modo PULAR: Usando serviceIds da rota:", serviceIds);
        dataToInsert = serviceIds.map((id) => ({
          professional_id: user.id,
          service_id: id,
          ...dataOverride, // Aplica { price: null, unit: null }
        }));
      } else {
        // O "Concluir" (Salvar) usa o estado 'services' que foi preenchido
        console.log("Modo SALVAR: Usando 'services' do estado:", services);
        dataToInsert = services.map((service) => ({
          professional_id: user.id,
          service_id: service.id,
          price: service.price || null,
          unit: service.unit || null,
        }));
      }

      // Este log agora não deve mais mostrar []
      console.log("Tentando inserir no Supabase:", dataToInsert);

      // Se dataToInsert estiver vazio, pulamos a chamada do Supabase
      if (dataToInsert.length === 0) {
        console.warn("Nenhum dado para inserir, pulando.");
        forceSetOnboarded(); // Apenas navega
        return;
      }

      // 3. Tenta fazer o insert
      const { error: insertError } = await supabase
        .from("professional_services")
        .insert(dataToInsert);

      if (insertError) {
        throw insertError;
      }

      // 5. SUCESSO! Apenas atualiza o estado local.
      forceSetOnboarded();
    } catch (error) {
      console.error("Erro ao salvar serviços:", error.message);
      Alert.alert("Erro ao salvar", error.message);
      setIsSaving(false); // Só paramos o loading em caso de ERRO
    }
    // Não definimos setIsSaving(false) em caso de SUCESSO,
    // pois o componente será desmontado e navegará para outra tela.
  };

  // Botão "Pular"
  // Usamos 'useCallback' para garantir que a função no header
  // seja atualizada caso 'saveServices' mude (o que não deve acontecer)
  const handleSkip = React.useCallback(() => {
    saveServices({ price: null, unit: null });
  }, [saveServices]); // 'saveServices' deve ser estável se usarmos useCallback nela também

  // Botão "Concluir"
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
