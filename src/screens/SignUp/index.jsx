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
import { styles } from "./styles";

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState(null); // 'pf' ou 'pj'
  const [userRole, setUserRole] = useState(null); // 'provider' ou 'client'

  const handleNextStep = async () => {
    // Validação simples
    if (!accountType || !userRole || !email || !password) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, preencha todos os campos para avançar."
      );
      return;
    }

    // Alteração: Em vez de chamar o signUp, navegamos para a próxima etapa
    // passando os dados coletados.
    navigation.navigate("CompleteProfile", {
      email: email,
      password: password,
      accountType: accountType,
      userRole: userRole,
    });
  };

  // Componente auxiliar para os seletores
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

      {/* --- SELETORES --- */}
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
          onPress={handleNextStep}
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
