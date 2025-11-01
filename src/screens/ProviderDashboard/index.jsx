import React from "react";
import { View, Text } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles";

export default function ProviderDashboard() {
  const { user, profile } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard do Prestador</Text>
      <Text style={styles.subtitle}>
        Bem-vindo(a), {profile?.full_name || user?.email}!
      </Text>
      <Text style={styles.placeholder}>
        Aqui você gerenciará seus serviços, propostas e verá novas
        oportunidades.
      </Text>
    </View>
  );
}
