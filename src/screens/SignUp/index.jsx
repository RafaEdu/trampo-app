import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles";

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState(null); // 'pf' ou 'pj'
  const [userRole, setUserRole] = useState(null); // 'provider' ou 'client'

  const { signUp } = useAuth();

  const handleSignUp = async () => {
    // Validação simples
    if (!accountType || !userRole) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, selecione todos os campos."
      );
      return;
    }

    setLoading(true);

    // Prepara os dados para enviar ao Supabase
    const optionsData = {
      account_type: accountType,
      user_role: userRole,
    };

    // Envia os dados junto com email e senha
    const { error } = await signUp(email, password, optionsData);

    if (error) {
      Alert.alert("Erro no Cadastro", error.message);
    } else {
      Alert.alert(
        "Cadastro enviado!",
        "Verifique seu e-mail para confirmar a conta."
      );
      navigation.navigate("Login");
    }
    setLoading(false);
  };

  // Componente auxiliar para os seletores (boa prática)
  const Selector = ({ label, options, selectedValue, onSelect }) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <View style={styles.selectorOptionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectorButton,
              selectedValue === option.value && styles.selectorButtonActive,
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text
              style={[
                styles.selectorButtonText,
                selectedValue === option.value &&
                  styles.selectorButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      {/* --- NOVOS SELETORES --- */}
      <Selector
        label="Eu sou:"
        options={[
          { label: "Pessoa Física (PF)", value: "pf" },
          { label: "Pessoa Jurídica (PJ)", value: "pj" },
        ]}
        selectedValue={accountType}
        onSelect={setAccountType}
      />

      <Selector
        label="Eu quero:"
        options={[
          { label: "Prestar Serviços", value: "provider" },
          { label: "Contratar Serviços", value: "client" },
        ]}
        selectedValue={userRole}
        onSelect={setUserRole}
      />
      {/* ------------------------- */}

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Carregando..." : "Cadastrar"}
          onPress={handleSignUp}
          disabled={loading}
        />
      </View>

      <TouchableOpacity
        style={styles.goBackButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.goBackButtonText}>
          Já tem uma conta? Entre aqui
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
