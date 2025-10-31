import React from "react";
import { View, Text, Button } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles";

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo!</Text>
      {user && <Text style={styles.emailText}>{user.email}</Text>}
      <View style={styles.buttonContainer}>
        <Button title="Sair (Logout)" onPress={signOut} color="#e74c3c" />
      </View>
    </View>
  );
}
