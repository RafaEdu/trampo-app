import React from "react";
import { View, Text, Button } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles"; // Crie um styles.js simples

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>
      {user && <Text style={styles.emailText}>{user.email}</Text>}
      {profile && (
        <Text style={styles.emailText}>
          Tipo:{" "}
          {profile.account_type === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}
        </Text>
      )}
      {profile && (
        <Text style={styles.emailText}>
          Função: {profile.user_role === "client" ? "Contratante" : "Prestador"}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Sair (Logout)" onPress={signOut} color="#e74c3c" />
      </View>
    </View>
  );
}
