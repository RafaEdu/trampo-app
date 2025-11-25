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

export default function ProviderDetailsScreen({ route, navigation }) {
  const { provider } = route.params; // Recebemos o objeto provider da tela anterior
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
      professional_id: provider.id, // ID do prestador vindo da navegação
      // service_id: provider.service_id, // Se você tiver esse dado no card, pode passar
      description: description,
      status: "pending",
    });

    setLoading(false);

    if (error) {
      Alert.alert("Erro", "Não foi possível enviar o pedido.");
      console.error(error);
    } else {
      Alert.alert("Sucesso!", "Seu pedido foi enviado. Aguarde a confirmação.");
      navigation.navigate("Início"); // Volta para o dashboard
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

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333" },
  label: { fontSize: 16, marginBottom: 10, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: "top",
    height: 100,
  },
});
