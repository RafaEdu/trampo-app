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

export default function ProfileScreen() {
  // Pega o estado global
  const { user, profile, signOut, refreshProfile } = useAuth();

  // Estados locais do formulário
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  /**
   * @description Popula o estado local do formulário com os dados do perfil global
   * sempre que o perfil global (do AuthContext) for atualizado.
   */
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  /**
   * @description Solicita permissão e abre a galeria de imagens do usuário.
   */
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
      mediaTypes: ImagePicker.MediaType.Images, // <-- LINHA CORRIGIDA
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0]);
    }
  };

  /**
   * @description Faz o upload do arquivo de imagem para o Supabase Storage.
   * @param {ImagePicker.ImagePickerAsset} asset O asset da imagem selecionado.
   */
  const uploadAvatar = async (asset) => {
    setLoading(true);
    try {
      const { uri, mimeType } = asset;

      // Precisamos de um polyfill para o React Native lidar com o upload
      // O 'react-native-url-polyfill' que já está no projeto deve ser suficiente
      const response = await fetch(uri);

      // const blob = await response.blob(); // <-- LINHA COM ERRO
      // Em vez de .blob(), vamos usar .arrayBuffer(), que é universal
      const arrayBuffer = await response.arrayBuffer();

      const fileExt = uri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload para o bucket 'avatars'
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, {
          contentType: mimeType || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Sucesso! Agora pegamos a URL pública para salvar no perfil
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

  /**
   * @description Atualiza os dados do perfil do usuário no banco de dados.
   */
  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    const updates = {
      id: user.id,
      username,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    try {
      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }

      // Sucesso!
      Alert.alert("Sucesso!", "Seu perfil foi atualizado.");
      // Manda o AuthContext buscar o perfil novo
      await refreshProfile();
    } catch (error) {
      Alert.alert("Erro ao Salvar", error.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Componente de Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
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

        {/* Informações não-editáveis */}
        <Text style={styles.label}>Tipo de Conta</Text>
        <TextInput
          style={[styles.input, styles.readOnlyInput]}
          value={
            profile?.account_type === "pf" ? "Pessoa Física" : "Pessoa Jurídica"
          }
          editable={false}
        />

        <Text style={styles.label}>Função</Text>
        <TextInput
          style={[styles.input, styles.readOnlyInput]}
          value={profile?.user_role === "client" ? "Contratante" : "Prestador"}
          editable={false}
        />

        {loading && <ActivityIndicator size="large" color="#007aff" />}

        {/* Botões de Ação */}
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
