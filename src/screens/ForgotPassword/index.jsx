import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles";

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(0); // 0 = Email, 1 = Código/Senha
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Estado para o Toast (Pop-up suave)
  const [toastMessage, setToastMessage] = useState(null);

  const { sendPasswordReset, completePasswordReset } = useAuth();

  // Função para mostrar o Toast por 3 segundos
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert("Erro", "Por favor, digite seu e-mail.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(email);
      // REQUISIÇÃO 1: Substituir Alert por pop-up suave
      showToast("Código enviado! Verifique seu e-mail.");
      setStep(1);
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token || !newPassword) {
      Alert.alert("Erro", "Preencha o código e a nova senha.");
      return;
    }
    setLoading(true);
    try {
      // REQUISIÇÃO 2 & 3: A lógica no AuthContext agora impede
      // o redirecionamento se houver erro e previne tela branca no sucesso.
      await completePasswordReset(email, token, newPassword);

      // Se não der erro, o AuthContext vai atualizar o estado global
      // e o Router vai automaticamente mudar a tela para o App.
      // Podemos mostrar um Toast rápido antes de desmontar (opcional)
    } catch (error) {
      // Se a senha for igual, cairá aqui e o usuário continua nesta tela
      Alert.alert("Erro ao redefinir", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* TOAST NOTIFICATION (POP-UP) */}
          {toastMessage && (
            <View style={styles.toastContainer}>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          )}

          <Text style={styles.title}>
            {step === 0 ? "Recuperar Senha" : "Redefinir Senha"}
          </Text>

          <Text style={styles.description}>
            {step === 0
              ? "Digite seu e-mail para receber um código de verificação."
              : `Digite o código enviado para ${email} e sua nova senha.`}
          </Text>

          {step === 0 ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Seu e-mail cadastrado"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <View style={styles.buttonContainer}>
                <Button
                  title={loading ? "Enviando..." : "Enviar Código"}
                  onPress={handleSendCode}
                  disabled={loading}
                />
              </View>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Código de 6 dígitos"
                value={token}
                onChangeText={setToken}
                keyboardType="number-pad"
                maxLength={6}
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Nova Senha"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!isPasswordVisible}
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
                  title={loading ? "Redefinindo..." : "Alterar Senha"}
                  onPress={handleResetPassword}
                  disabled={loading}
                />
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setStep(0);
                  setNewPassword("");
                  setToken("");
                }}
              >
                <Text style={styles.cancelButtonText}>Voltar / Reenviar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
