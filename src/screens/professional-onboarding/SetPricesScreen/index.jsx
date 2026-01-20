import React, { useState, useEffect } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native"; // Removido CommonActions
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
  const { user } = useAuth();

  const { selectedServices = [] } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [pricesState, setPricesState] = useState({});

  useEffect(() => {
    if (!selectedServices || selectedServices.length === 0) return;

    const initialState = {};
    selectedServices.forEach((service) => {
      initialState[service.id] = {
        price: "",
        unit: "servico",
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

  const navigateToDashboard = () => {
    // CORREÇÃO: Usamos .navigate() em vez de .reset()
    // O .navigate procura a rota "ProviderTabs" em qualquer lugar da árvore de navegação.
    // Isso resolve o erro "action RESET was not handled".
    try {
      navigation.navigate("ProviderTabs");
    } catch (error) {
      console.error("Erro de navegação:", error);
      // Fallback caso o nome da rota esteja diferente no seu index.js
      Alert.alert("Erro", "Não foi possível redirecionar para o Dashboard.");
    }
  };

  const handleFinishOnboarding = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const servicesPayload = selectedServices.map((service) => {
        const config = pricesState[service.id];
        const priceValue = config.isNegotiable
          ? null
          : parseFloat(config.price.replace(",", "."));

        return {
          professional_id: user.id,
          service_id: service.id,
          price: isNaN(priceValue) ? null : priceValue,
          unit: config.unit,
        };
      });

      const { error } = await supabase
        .from("professional_services")
        .insert(servicesPayload);

      if (error) throw error;

      Alert.alert("Sucesso", "Seus serviços foram cadastrados!");
      navigateToDashboard();
    } catch (error) {
      // CORREÇÃO: Se der erro de duplicidade (código 23505),
      // significa que já foi salvo no clique anterior.
      // Apenas redirecionamos o usuário sem mostrar erro.
      if (error.code === "23505") {
        console.log("Serviços já cadastrados, redirecionando...");
        navigateToDashboard();
      } else {
        console.error("Erro ao salvar serviços:", error);
        Alert.alert(
          "Erro",
          "Não foi possível salvar seus serviços. Tente novamente.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const renderServiceItem = ({ item }) => {
    const config = pricesState[item.id] || {};
    const isNegotiable = config.isNegotiable ?? true;

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
              trackColor={{ false: "#767577", true: "#4A90E2" }}
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
