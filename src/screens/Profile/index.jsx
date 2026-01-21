import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles";
import { supabase } from "../../services/supabaseClient";
import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Helper para formatar data
const formatarDataParaBR = (isoDate) => {
  if (!isoDate) return "";
  try {
    const [ano, mes, dia] = isoDate.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    return isoDate;
  }
};

export default function ProfileScreen({ navigation }) {
  const { user, profile, signOut, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Estados principais
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Estados de Edição de Informações Gerais
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  // --- Estados do MODAL de Username ---
  const [modalVisible, setModalVisible] = useState(false);
  const [tempUsername, setTempUsername] = useState(""); // O que está sendo digitado no modal
  const [usernameError, setUsernameError] = useState(""); // Erro de validação/disponibilidade
  const [checkingUsername, setCheckingUsername] = useState(false); // Loading específico do modal

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  // --- Lógica de Imagem (Mantendo a correção anterior) ---
  const pickImage = async () => {
    try {
      console.log("1. Solicitando permissão...");
      // Agora chamamos a função direto, sem o prefixo "ImagePicker."
      const permissionResult = await requestMediaLibraryPermissionsAsync();

      console.log("2. Status da permissão:", permissionResult.status);
      if (permissionResult.status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos da permissão da galeria.",
        );
        return;
      }

      console.log("3. Abrindo galeria...");
      const result = await launchImageLibraryAsync({
        mediaTypes: "images", // <--- PREFIRA USAR A STRING 'images' PARA EVITAR ERROS
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadAvatar(result.assets[0]);
      }
    } catch (error) {
      console.error("Erro pickImage", error);
      Alert.alert("Erro", "Não foi possível abrir a galeria.");
    }
  };

  const uploadAvatar = async (asset) => {
    setAvatarLoading(true);
    try {
      const { uri, mimeType } = asset;
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileExt = uri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, {
          contentType: mimeType || "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      await refreshProfile();
    } catch (error) {
      Alert.alert("Erro no Upload", error.message);
    }
    setAvatarLoading(false);
  };

  // --- Lógica de Edição de DADOS PESSOAIS (Nome Completo) ---
  const savePersonalInfo = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, updated_at: new Date() })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      Alert.alert("Sucesso", "Dados atualizados!");
      setIsEditingInfo(false);
    } catch (error) {
      Alert.alert("Erro ao Salvar", error.message);
    }
    setLoading(false);
  };

  // --- Lógica do MODAL de USERNAME ---

  const handleOpenModal = () => {
    setTempUsername(username); // Começa com o username atual
    setUsernameError("");
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setUsernameError("");
  };

  const handleSaveUsername = async () => {
    const trimmedUsername = tempUsername.trim().toLowerCase();

    // 1. Validações Locais
    if (trimmedUsername.length < 3) {
      setUsernameError("O nome de usuário deve ter pelo menos 3 caracteres.");
      return;
    }

    // Se não mudou nada, só fecha
    if (trimmedUsername === username) {
      handleCloseModal();
      return;
    }

    setCheckingUsername(true);
    setUsernameError("");

    try {
      // 2. Verifica disponibilidade no Supabase
      // Buscamos se existe ALGUÉM com esse username que NÃO seja eu mesmo.
      const { count, error: checkError } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("username", trimmedUsername)
        .neq("id", user.id); // Importante: ignorar o próprio ID

      if (checkError) throw checkError;

      if (count > 0) {
        setUsernameError("Este nome de usuário já está em uso.");
        setCheckingUsername(false);
        return;
      }

      // 3. Atualiza se estiver disponível
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ username: trimmedUsername, updated_at: new Date() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Sucesso
      setUsername(trimmedUsername); // Atualiza estado local
      await refreshProfile(); // Atualiza contexto
      handleCloseModal();
      Alert.alert("Sucesso", "Nome de usuário alterado!");
    } catch (error) {
      console.error(error);
      setUsernameError("Erro ao verificar disponibilidade. Tente novamente.");
    } finally {
      setCheckingUsername(false);
    }
  };

  // Definições visuais da tag
  const isProvider = profile?.user_role === "provider";
  const roleLabel = isProvider ? "Prestador de Serviços" : "Contratante";
  const roleColor = isProvider ? "#4CAF50" : "#2196F3";

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Header (Avatar, Tag, Username) --- */}
        <View style={styles.headerContainer}>
          <View style={[styles.roleTag, { backgroundColor: roleColor }]}>
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>

          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={pickImage}
            disabled={avatarLoading}
          >
            {avatarLoading ? (
              <View
                style={[
                  styles.avatarImage,
                  { justifyContent: "center", alignItems: "center" },
                ]}
              >
                <ActivityIndicator color="#007aff" />
              </View>
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color="#ccc" />
              </View>
            )}

            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>

          {/* Username Display com Botão de Editar */}
          <View style={styles.usernameContainer}>
            <View style={styles.usernameDisplayWrapper}>
              <Text style={styles.usernameText}>@{username || "usuario"}</Text>
              <TouchableOpacity
                onPress={handleOpenModal}
                style={styles.iconButton}
              >
                <Ionicons name="pencil-outline" size={18} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- Cartão de Informações Pessoais --- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Informações Pessoais</Text>
            <Ionicons name="id-card-outline" size={20} color="#555" />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={[styles.input, !isEditingInfo && styles.inputReadonly]}
              value={fullName}
              onChangeText={setFullName}
              editable={isEditingInfo}
              placeholder="Seu nome completo"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={[styles.input, styles.inputReadonly]}
              value={user?.email}
              editable={false}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Nascimento</Text>
              <TextInput
                style={[styles.input, styles.inputReadonly]}
                value={formatarDataParaBR(profile?.data_nascimento)}
                editable={false}
              />
            </View>
            <View style={[styles.fieldContainer, { width: 80 }]}>
              <Text style={styles.label}>Idade</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.inputReadonly,
                  { textAlign: "center" },
                ]}
                value={profile?.idade ? String(profile.idade) : "-"}
                editable={false}
              />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              {profile?.document_type === "cpf" ? "CPF" : "CPF / CNPJ"}
            </Text>
            <TextInput
              style={[styles.input, styles.inputReadonly]}
              value={profile?.cpf_cnpj}
              editable={false}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.cardButton,
              isEditingInfo ? styles.saveButton : styles.editButton,
            ]}
            onPress={
              isEditingInfo ? savePersonalInfo : () => setIsEditingInfo(true)
            }
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons
                  name={isEditingInfo ? "save-outline" : "create-outline"}
                  size={20}
                  color={isEditingInfo ? "#fff" : "#007aff"}
                />
                <Text
                  style={[
                    styles.cardButtonText,
                    isEditingInfo && { color: "#fff" },
                  ]}
                >
                  {isEditingInfo ? " Salvar Alterações" : " Editar Dados"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* --- Botão Financeiro --- */}
        <TouchableOpacity
          style={styles.financeButton}
          onPress={() => {
            Alert.alert(
              "Em breve",
              "O Dashboard Financeiro estará disponível na próxima atualização.",
            );
          }}
        >
          <View style={styles.financeIconContainer}>
            <MaterialCommunityIcons
              name="wallet-outline"
              size={24}
              color="#fff"
            />
          </View>
          <View style={styles.financeTextContainer}>
            <Text style={styles.financeTitle}>Dashboard Financeiro</Text>
            <Text style={styles.financeSubtitle}>
              Gerencie seus ganhos e gastos
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* --- Footer --- */}
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Ionicons name="exit-outline" size={20} color="#e74c3c" />
            <Text style={styles.logoutText}>Sair do App</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Versão 1.0.0</Text>
        </View>
      </ScrollView>

      {/* ================= MODAL DE EDITAR USERNAME ================= */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              {/* Header do Modal */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Alterar Nome de Usuário</Text>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.closeModalButton}
                >
                  <Ionicons name="close" size={24} color="#555" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalInstruction}>
                Escolha um nome único para seu perfil.
              </Text>

              {/* Input com @ prefixo */}
              <View style={styles.modalInputContainer}>
                <Text style={styles.atPrefix}>@</Text>
                <TextInput
                  style={styles.modalInput}
                  value={tempUsername}
                  onChangeText={(text) => {
                    setTempUsername(text);
                    setUsernameError(""); // Limpa erro ao digitar
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus={true} // SOBE O TECLADO AUTOMATICAMENTE
                  placeholder="novo-usuario"
                />
              </View>

              {/* Mensagem de Erro */}
              {usernameError ? (
                <Text style={styles.errorText}>{usernameError}</Text>
              ) : null}

              {/* Botão Salvar */}
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveUsername}
                disabled={checkingUsername}
              >
                {checkingUsername ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSaveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
