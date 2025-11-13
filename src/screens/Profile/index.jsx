import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles";
import { supabase } from "../../services/supabaseClient";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

// Dica de Sênior: Função helper para formatar a data ISO (AAAA-MM-DD)
// de volta para o formato brasileiro (DD/MM/AAAA) para exibição.
const formatarDataParaBR = (isoDate) => {
  if (!isoDate) return "";
  try {
    const [ano, mes, dia] = isoDate.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    return isoDate; // Retorna o original se falhar
  }
};

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      // Alteração: 'full_name' agora vem do cadastro, mas permitimos editar.
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos da permissão da galeria para você escolher uma foto."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0]);
    }
  };

  const uploadAvatar = async (asset) => {
    setLoading(true);
    try {
      const { uri, mimeType } = asset;
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileExt = uri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, {
          contentType: mimeType || "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(data.path);

      if (!publicUrlData) {
        throw new Error("Não foi possível obter a URL pública da imagem.");
      }

      setAvatarUrl(publicUrlData.publicUrl);
      Alert.alert(
        "Sucesso",
        "Foto de perfil atualizada! Clique em 'Salvar' para confirmar."
      );
    } catch (error) {
      console.error("Erro no upload do avatar:", error);
      Alert.alert("Erro no Upload", error.message);
    }
    setLoading(false);
  };

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    const updates = {
      id: user.id,
      username,
      full_name: fullName, // 'full_name' agora é editável
      avatar_url: avatarUrl,
      updated_at: new Date(),
      // Dica: Não permitimos editar os outros campos por aqui.
    };

    try {
      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;

      Alert.alert("Sucesso!", "Seu perfil foi atualizado.");
      await refreshProfile();
    } catch (error) {
      Alert.alert("Erro ao Salvar", error.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {/* ... (lógica do avatar sem alteração) ... */}
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="camera" size={40} color="#ccc" />
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            <Ionicons name="pencil" size={18} color="white" />
          </View>
        </TouchableOpacity>

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={[styles.input, styles.readOnlyInput]}
          value={user?.email}
          editable={false}
        />

        {/* Alteração: Este campo agora é editável */}
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Seu nome completo"
          value={fullName}
          onChangeText={setFullName}
          editable={!loading}
        />

        <Text style={styles.label}>Nome de Usuário</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: @seu-usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!loading}
        />

        {/* --- Alteração: Novos campos (não editáveis) --- */}

        <Text style={styles.label}>
          {profile?.document_type || "Documento"}
        </Text>
        <TextInput
          style={[styles.input, styles.readOnlyInput]}
          value={profile?.cpf_cnpj}
          editable={false}
        />

        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, marginRight: 5 }}>
            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={formatarDataParaBR(profile?.data_nascimento)}
              editable={false}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 5 }}>
            <Text style={styles.label}>Idade</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={profile?.idade ? `${profile.idade} anos` : ""}
              editable={false}
            />
          </View>
        </View>

        <Text style={styles.label}>Função</Text>
        <TextInput
          style={[styles.input, styles.readOnlyInput]}
          value={profile?.user_role === "client" ? "Contratante" : "Prestador"}
          editable={false}
        />
        {/* --- Fim das alterações --- */}

        {loading && <ActivityIndicator size="large" color="#007aff" />}

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Salvando..." : "Salvar Alterações"}
            onPress={updateProfile}
            disabled={loading}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Sair (Logout)" onPress={signOut} color="#e74c3c" />
        </View>
      </View>
    </ScrollView>
  );
}
