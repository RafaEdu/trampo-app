import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles";

export default function VerifyEmailScreen({ route }) {
  const { email } = route.params;
  const { verifyOtp } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length < 6) {
      Alert.alert("Erro", "O código deve ter 6 dígitos.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email, code);
      // Não precisa navegar manualmente:
      // O AuthContext vai detectar a sessão e o Router vai jogar para o AppLogado automaticamente!
    } catch (error) {
      Alert.alert("Código inválido", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verifique seu E-mail</Text>
      <Text style={styles.subtitle}>Enviamos um código para: {email}</Text>

      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder="123456"
        keyboardType="number-pad"
        maxLength={6}
        textAlign="center"
        editable={!loading}
      />

      <Button
        title={loading ? "Verificando..." : "Confirmar"}
        onPress={handleVerify}
        disabled={loading}
      />
    </View>
  );
}
