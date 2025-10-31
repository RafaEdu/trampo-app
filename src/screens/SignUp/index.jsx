import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles";

// Recebemos o 'navigation' para poder voltar para a tela de Login
export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth(); // Pegamos apenas o signUp do nosso hook

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) {
      Alert.alert("Erro no Cadastro", error.message);
    } else {
      // Importante: O Supabase pode exigir confirmação de e-mail.
      // O listener no nosso AuthContext vai lidar com a sessão,
      // mas é bom avisar o usuário.
      Alert.alert(
        "Cadastro enviado!",
        "Verifique seu e-mail para confirmar a conta."
      );
      // Opcional: navegar de volta ao login após o sucesso
      navigation.navigate("Login");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar sua Conta</Text>
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
        placeholder="Senha (mínimo 6 caracteres)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Carregando..." : "Cadastrar"}
          onPress={handleSignUp}
          disabled={loading}
        />
      </View>

      {/* Botão para voltar ao Login */}
      <TouchableOpacity
        style={styles.goBackButton}
        onPress={() => navigation.goBack()} // Simplesmente volta
      >
        <Text style={styles.goBackButtonText}>
          Já tem uma conta? Entre aqui
        </Text>
      </TouchableOpacity>
    </View>
  );
}
