import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../services/supabaseClient";
import { useAuth } from "../../../contexts/AuthContext";
import { styles } from "./styles";

const UNIT_OPTIONS = [
  { label: "Preço Fixo (por serviço)", value: "servico" },
  { label: "Por Hora", value: "hora" },
  { label: "Por Dia (Diária)", value: "dia" },
  { label: "Por Metro Quadrado (m²)", value: "m2" },
  { label: "Por Unidade/Peça", value: "unidade" },
];

const SetPricesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth(); // Pegando o usuário logado

  // Recebe os serviços selecionados da tela anterior (array de objetos {id, name, ...})
  const { selectedServices } = route.params || { selectedServices: [] };

  const [loading, setLoading] = useState(false);

  // Estado para controlar os preços e unidades de cada serviço
  // Estrutura: { [serviceId]: { price: string, unit: string, isNegotiable: boolean } }
  const [pricesState, setPricesState] = useState({});

  useEffect(() => {
    // Inicializa o estado. Por padrão, tudo é "A combinar" (isNegotiable: true)
    // Isso reduz a fricção inicial do usuário.
    const initialState = {};
    selectedServices.forEach((service) => {
      initialState[service.id] = {
        price: "",
        unit: "servico", // Valor default do enum
        isNegotiable: true,
      };
    });
    setPricesState(initialState);
  }, [selectedServices]);

  const updateServiceState = (serviceId, field, value) => {
    setPricesState((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value,
      },
    }));
  };

  const handleFinishOnboarding = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Preparar o payload para o Supabase
      const servicesPayload = selectedServices.map((service) => {
        const config = pricesState[service.id];

        // Se for negociável, mandamos null no preço (ou 0, dependendo da sua constraint check)
        // A unidade mandamos o default ou o selecionado para manter integridade
        const priceValue = config.isNegotiable
          ? null
          : parseFloat(config.price.replace(",", "."));

        return {
          professional_id: user.id, // ID do profile (uuid)
          service_id: service.id,
          price: isNaN(priceValue) ? null : priceValue,
          unit: config.unit,
          // created_at é default now()
        };
      });

      // 2. Bulk Insert (Inserção em lote) para performance (<100ms latency goal)
      const { error } = await supabase
        .from("professional_services")
        .insert(servicesPayload);

      if (error) throw error;

      // 3. Atualizar status do profile ou navegar para Dashboard
      // Opcional: Atualizar alguma flag no profile dizendo que o onboarding acabou

      Alert.alert("Sucesso", "Seus serviços foram cadastrados!");

      // Reseta a navegação para a Dashboard do Provider
      navigation.reset({
        index: 0,
        routes: [{ name: "ProviderTabs" }],
      });
    } catch (error) {
      console.error("Erro ao salvar serviços:", error);
      Alert.alert(
        "Erro",
        "Não foi possível salvar seus serviços. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderServiceItem = ({ item }) => {
    const config = pricesState[item.id] || {};
    const isNegotiable = config.isNegotiable;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>
              {isNegotiable ? "A Combinar" : "Definir valor"}
            </Text>
            <Switch
              value={isNegotiable}
              onValueChange={(val) =>
                updateServiceState(item.id, "isNegotiable", val)
              }
              trackColor={{ false: "#767577", true: "#4A90E2" }} // Use as cores do seu tema
              thumbColor={isNegotiable ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
        </View>

        {!isNegotiable && (
          <View style={styles.inputsContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valor (R$)</Text>
              <TextInput
                style={styles.input}
                placeholder="0,00"
                keyboardType="numeric"
                value={config.price}
                onChangeText={(text) =>
                  updateServiceState(item.id, "price", text)
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cobrado por</Text>
              {/* Simplificação de Select para UX Mobile */}
              <View style={styles.unitSelector}>
                {UNIT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.unitBadge,
                      config.unit === opt.value && styles.unitBadgeSelected,
                    ]}
                    onPress={() =>
                      updateServiceState(item.id, "unit", opt.value)
                    }
                  >
                    <Text
                      style={[
                        styles.unitText,
                        config.unit === opt.value && styles.unitTextSelected,
                      ]}
                    >
                      {opt.value === "servico" ? "Fixo" : opt.value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Definir Preços</Text>
        <Text style={styles.subtitle}>
          Você pode definir um preço base ou deixar como "A Combinar" para
          negociar no chat.
        </Text>
      </View>

      <FlatList
        data={selectedServices}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderServiceItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={handleFinishOnboarding}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Concluir Cadastro</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SetPricesScreen;
