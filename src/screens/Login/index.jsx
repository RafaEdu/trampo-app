import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Para o ícone do olho
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Novo estado para controlar a visibilidade da senha
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { signIn } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      Alert.alert("Erro no Login", error.message);
    }
    setLoading(false);
  };

  return (
    // KeyboardAvoidingView para o teclado não tampar os inputs
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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

          {/* Container personalizado para Senha + Ícone */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible} // Controlado pelo estado
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off" : "eye"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? "Carregando..." : "Entrar"}
              onPress={handleLogin}
              disabled={loading}
            />
          </View>

          {/* Botão de Esqueci Minha Senha */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.signUpButtonText}>
              Ainda não tem conta? Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
