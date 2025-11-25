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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import DateTimePicker from "@react-native-community/datetimepicker";
import MaskedTextInput from "react-native-mask-input";

// --- 1. SCHEMAS DE VALIDAÇÃO (ZOD) ---
// Schema base (comum aos dois)
const baseSchema = z.object({
  fullName: z
    .string()
    .min(3, "Nome muito curto")
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, "Nome deve conter apenas letras"),
  date: z
    .date({
      required_error: "Data de nascimento é obrigatória",
      invalid_type_error: "Data inválida",
    })
    .max(new Date(), "Data não pode ser no futuro"),
});

// Schema CPF (PF)
const pfSchema = baseSchema.extend({
  cpfCnpj: z
    .string()
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length === 11, "CPF deve ter 11 dígitos"),
});

// Schema CNPJ (PJ)
const pjSchema = baseSchema.extend({
  cpfCnpj: z
    .string()
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length === 14, "CNPJ deve ter 14 dígitos"),
});

export default function CompleteProfileScreen({ route, navigation }) {
  const { email, password, accountType, userRole } = route.params;
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  // Estado local apenas para controle visual do DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- 2. CONFIGURAÇÃO DO FORMULÁRIO ---
  // Seleciona o schema correto baseado no tipo de conta
  const currentSchema = accountType === "pf" ? pfSchema : pjSchema;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      fullName: "",
      cpfCnpj: "",
      date: new Date(),
    },
  });

  // Monitora o valor da data para exibir no texto do botão
  const selectedDate = watch("date");

  // --- 3. FUNÇÕES AUXILIARES ---

  // Máscaras (Array de Regex)
  const cpfMask = [
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
  const cnpjMask = [
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

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      // Atualiza o valor no React Hook Form
      setValue("date", date, { shouldValidate: true });
    }
  };

  const formatarDataParaISO = (dataObj) => {
    const ano = dataObj.getFullYear();
    const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
    const dia = String(dataObj.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  };

  // --- 4. SUBMISSÃO DO FORMULÁRIO ---
  // Essa função só é chamada se a validação do Zod passar
  const onSubmit = async (data) => {
    setLoading(true);

    // data.cpfCnpj já vem limpo (apenas números) graças ao .transform() do Zod
    // O Zod faz o transform na validação, mas o 'data' do onSubmit recebe o valor do input.
    // Vamos garantir a limpeza aqui para envio à API.
    const cleanDoc = data.cpfCnpj.replace(/\D/g, "");

    const optionsData = {
      full_name: data.fullName,
      account_type: accountType,
      user_role: userRole,
      data_nascimento: formatarDataParaISO(data.date),
      cpf_cnpj: cleanDoc,
      document_type: accountType === "pf" ? "CPF" : "CNPJ",
    };

    const { error } = await signUp(email, password, optionsData);

    if (error) {
      Alert.alert("Erro no Cadastro", error.message);
      setLoading(false);
    } else {
      // Sucesso! Vai para a verificação de email (OTP)
      navigation.navigate("VerifyEmail", { email: email });
      // Não paramos o loading pois mudou de tela
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

      {/* --- CAMPO: NOME COMPLETO --- */}
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            style={[styles.input, errors.fullName && { borderColor: "red" }]}
            placeholder="Nome Completo"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            editable={!loading}
          />
        )}
      />
      {errors.fullName && (
        <Text
          style={{ color: "red", alignSelf: "flex-start", marginBottom: 10 }}
        >
          {errors.fullName.message}
        </Text>
      )}

      {/* --- CAMPO: DATA DE NASCIMENTO --- */}
      <TouchableOpacity
        style={[styles.dateInputButton, errors.date && { borderColor: "red" }]}
        onPress={() => setShowDatePicker(true)}
        disabled={loading}
      >
        <Text style={styles.dateInputText}>
          {selectedDate
            ? selectedDate.toLocaleDateString("pt-BR")
            : "Data de Nascimento"}
        </Text>
      </TouchableOpacity>
      {errors.date && (
        <Text
          style={{ color: "red", alignSelf: "flex-start", marginBottom: 10 }}
        >
          {errors.date.message}
        </Text>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* --- CAMPO: DOCUMENTO (CPF/CNPJ) --- */}
      <Controller
        control={control}
        name="cpfCnpj"
        render={({ field: { onChange, value, onBlur } }) => (
          <MaskedTextInput
            mask={accountType === "pf" ? cpfMask : cnpjMask}
            style={[styles.input, errors.cpfCnpj && { borderColor: "red" }]}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={
              accountType === "pf" ? "000.000.000-00" : "00.000.000/0000-00"
            }
            keyboardType="numeric"
            editable={!loading}
          />
        )}
      />
      {errors.cpfCnpj && (
        <Text
          style={{ color: "red", alignSelf: "flex-start", marginBottom: 10 }}
        >
          {errors.cpfCnpj.message}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        {/* handleSubmit(onSubmit) conecta a validação com sua função */}
        <Button
          title={loading ? "Finalizando..." : "Finalizar Cadastro"}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}
