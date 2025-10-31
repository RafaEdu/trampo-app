// src/screens/Login/index.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity, // Importamos o TouchableOpacity
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles"; // Vamos precisar adicionar um estilo novo

// Agora recebemos 'navigation' para poder ir para a tela de Cadastro
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Note que não pedimos mais o 'signUp' aqui
  const { signIn } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      Alert.alert("Erro no Login", error.message);
    }
    // Não precisamos fazer mais nada, o listener no AuthContext
    // vai detectar a sessão e o Router vai trocar a tela.
    setLoading(false);
  };

  // Removemos a função handleSignUp

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trampo App</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Carregando..." : "Entrar"}
          onPress={handleLogin}
          disabled={loading}
        />
      </View>

      {/* Removemos o botão de Cadastrar e colocamos um link */}
      <TouchableOpacity
        style={styles.signUpButton} // Usaremos um estilo novo
        onPress={() => navigation.navigate("SignUp")} // Navega para a tela
      >
        <Text style={styles.signUpButtonText}>
          Ainda não tem conta? Cadastre-se
        </Text>
      </TouchableOpacity>
    </View>
  );
}
