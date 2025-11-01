import React from "react";
import { View, Text } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles";

export default function ClientDashboard() {
  const { user, profile } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard do Contratante</Text>
      <Text style={styles.subtitle}>
        Bem-vindo(a), {profile?.full_name || user?.email}!
      </Text>
      <Text style={styles.placeholder}>
        Aqui você verá seus serviços em andamento e poderá buscar novos
        profissionais.
      </Text>
    </View>
  );
}
