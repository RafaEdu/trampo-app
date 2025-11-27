import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles";

export default function ProviderDetailsScreen({ route, navigation }) {
  const { provider } = route.params;
  const { user } = useAuth();

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestBooking = async () => {
    if (!description.trim()) {
      Alert.alert("Atenção", "Descreva o que você precisa.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("bookings").insert({
      client_id: user.id,
      professional_id: provider.id,
      description: description,
      status: "pending",
    });

    setLoading(false);

    if (error) {
      Alert.alert("Erro", "Não foi possível enviar o pedido.");
      console.error(error);
    } else {
      Alert.alert("Sucesso!", "Seu pedido foi enviado. Aguarde a confirmação.");
      navigation.navigate("Início");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{provider.full_name}</Text>
      {/* Exiba mais detalhes do provider aqui (avaliação, especialidade, etc) */}

      <Text style={styles.label}>Descreva o serviço que você precisa:</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder="Ex: Preciso trocar a fiação do chuveiro..."
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
