import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles";

import DateTimePicker from "@react-native-community/datetimepicker";
import MaskedTextInput from "react-native-mask-input"; // Importação default está correta

export default function CompleteProfileScreen({ route, navigation }) {
  const { email, password, accountType, userRole } = route.params;
  const { signUp } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dataNascimentoTexto, setDataNascimentoTexto] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");

  // --- ESTA É A CORREÇÃO ---
  // Dica de Sênior: Em vez de uma string, vamos definir a máscara
  // como um array de RegEx. Isso é mais robusto e corrige o erro 'maskArray.find'.
  const getDocumentoMask = () => {
    if (accountType === "pf") {
      // Máscara de CPF: 000.000.000-00
      return [
        /\d/,
        /\d/,
        /\d/,
        ".",
        /\d/,
        /\d/,
        /\d/,
        ".",
        /\d/,
        /\d/,
        /\d/,
        "-",
        /\d/,
        /\d/,
      ];
    } else {
      // Máscara de CNPJ: 00.000.000/0000-00
      return [
        /\d/,
        /\d/,
        ".",
        /\d/,
        /\d/,
        /\d/,
        ".",
        /\d/,
        /\d/,
        /\d/,
        "/",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        "-",
        /\d/,
        /\d/,
      ];
    }
  };

  const documentoMask = getDocumentoMask();

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
      setDataNascimentoTexto(selectedDate.toLocaleDateString("pt-BR"));
    }
  };

  const formatarDataParaISO = (dataObj) => {
    const ano = dataObj.getFullYear();
    const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
    const dia = String(dataObj.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  };

  const handleCompleteSignUp = async () => {
    if (!fullName || !dataNascimentoTexto || !cpfCnpj) {
      Alert.alert("Campos incompletos", "Por favor, preencha todos os campos.");
      return;
    }

    // Dica: Validar se o CPF/CNPJ foi preenchido completamente
    const unmaskedCpfCnpj = cpfCnpj.replace(/\D/g, "");
    const expectedLength = accountType === "pf" ? 11 : 14;

    if (unmaskedCpfCnpj.length !== expectedLength) {
      Alert.alert(
        "Documento inválido",
        `O ${accountType === "pf" ? "CPF" : "CNPJ"} parece estar incompleto.`
      );
      return;
    }

    setLoading(true);

    const dataFormatada = formatarDataParaISO(date);

    const optionsData = {
      full_name: fullName,
      account_type: accountType,
      user_role: userRole,
      data_nascimento: dataFormatada,
      cpf_cnpj: unmaskedCpfCnpj, // Enviamos apenas os números
      document_type: accountType === "pf" ? "CPF" : "CNPJ",
    };

    const { error } = await signUp(email, password, optionsData);

    if (error) {
      Alert.alert("Erro no Cadastro", error.message);
      setLoading(false);
    } else {
      navigation.navigate("VerifyEmail", { email: email });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Estamos quase lá!</Text>
      <Text style={styles.subtitle}>Complete seu perfil para continuar.</Text>

      {loading && <ActivityIndicator size="large" color="#007aff" />}

      <TextInput
        style={styles.input}
        placeholder="Nome Completo (como no documento)"
        value={fullName}
        onChangeText={setFullName}
        editable={!loading}
      />

      <TouchableOpacity
        style={styles.dateInputButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text
          style={[
            styles.dateInputText,
            !dataNascimentoTexto && styles.dateInputPlaceholder,
          ]}
        >
          {dataNascimentoTexto || "Data de Nascimento"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}

      {/* Alteração: A prop 'mask' agora recebe o array de RegEx */}
      <MaskedTextInput
        style={styles.input}
        mask={documentoMask} // Passando o array de RegEx
        value={cpfCnpj}
        // Dica: O 'onChangeText' com o array de regex pode retornar o
        // texto formatado e o não formatado. Vamos pegar só o formatado.
        onChangeText={(formatted) => setCpfCnpj(formatted)}
        placeholder={
          accountType === "pf" ? "000.000.000-00" : "00.000.000/0000-00"
        }
        keyboardType="numeric"
        editable={!loading}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Finalizando..." : "Finalizar Cadastro"}
          onPress={handleCompleteSignUp}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}
