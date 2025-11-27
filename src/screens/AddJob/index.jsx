import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles";

export default function MyServicesScreen() {
  const { user } = useAuth();

  // --- Estados de Dados ---
  const [sections, setSections] = useState([]);
  const [myServiceIds, setMyServiceIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // --- Estados do Modal e Formulário ---
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Catálogos para seleção
  const [allCategories, setAllCategories] = useState([]);
  const [allServices, setAllServices] = useState([]);

  // Seleções do usuário no Modal
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");

  // --- 1. READ: Buscar e Agrupar Serviços ---
  const fetchMyServices = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("professional_services")
        .select(
          `
          id,
          price,
          unit,
          services (
            id,
            name,
            category_id,
            service_categories (
              id,
              name
            )
          )
        `
        )
        .eq("professional_id", user.id);

      if (error) throw error;

      if (!data) return;

      const ids = new Set(data.map((item) => item.services.id));
      setMyServiceIds(ids);

      const grouped = groupServicesByCategory(data);
      setSections(grouped);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const groupServicesByCategory = (data) => {
    const groups = {};
    data.forEach((item) => {
      const catName = item.services?.service_categories?.name || "Outros";
      if (!groups[catName]) {
        groups[catName] = [];
      }
      groups[catName].push(item);
    });

    return Object.keys(groups)
      .sort()
      .map((key) => ({
        title: key,
        data: groups[key],
      }));
  };

  useEffect(() => {
    if (user) {
      fetchMyServices();
    }

    const fetchCatalogs = async () => {
      const [catRes, servRes] = await Promise.all([
        supabase.from("service_categories").select("id, name").order("name"),
        supabase.from("services").select("id, name, category_id").order("name"),
      ]);

      if (catRes.data) setAllCategories(catRes.data);
      if (servRes.data) setAllServices(servRes.data);
    };

    fetchCatalogs();
  }, [fetchMyServices, user]);

  const availableServicesForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return allServices.filter(
      (s) => s.category_id === selectedCategory.id && !myServiceIds.has(s.id)
    );
  }, [selectedCategory, allServices, myServiceIds]);

  const handleSave = async () => {
    if (!selectedService || !price) {
      Alert.alert("Atenção", "Selecione o serviço e informe o preço.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("professional_services").insert({
        professional_id: user.id,
        service_id: selectedService.id,
        price: parseFloat(price.replace(",", ".")),
        unit: unit || "serviço",
      });

      if (error) throw error;

      Alert.alert("Sucesso", "Serviço adicionado!");
      closeModal();
      fetchMyServices();
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Remover", "Deseja remover este serviço?", [
      { text: "Cancelar" },
      {
        text: "Sim",
        onPress: async () => {
          await supabase.from("professional_services").delete().eq("id", id);
          fetchMyServices();
        },
      },
    ]);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCategory(null);
    setSelectedService(null);
    setPrice("");
    setUnit("");
  };

  // --- Renders ---
  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.serviceName}>{item.services.name}</Text>
        <Text style={styles.servicePrice}>
          R$ {item.price} <Text style={styles.unitText}>/ {item.unit}</Text>
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        style={styles.deleteBtn}
      >
        <Ionicons name="trash-outline" size={20} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );

  return (
    // Mudança 1: SafeAreaView aqui resolve o problema do topo
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Serviços</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007aff"
          style={{ marginTop: 40 }}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent} // Ajuste no estilo
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum serviço cadastrado.</Text>
          }
        />
      )}

      {/* Modal de Cadastro (Mantido igual, apenas renderizado) */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Novo Serviço</Text>

            <Text style={styles.label}>1. Escolha a Categoria:</Text>
            <View style={styles.selectorContainer}>
              <FlatList
                data={allCategories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      selectedCategory?.id === item.id && styles.chipSelected,
                    ]}
                    onPress={() => {
                      setSelectedCategory(item);
                      setSelectedService(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedCategory?.id === item.id &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {selectedCategory && (
              <>
                <Text style={styles.label}>2. Escolha o Serviço:</Text>
                <View style={styles.selectorContainer}>
                  {availableServicesForCategory.length === 0 ? (
                    <Text style={styles.infoText}>
                      Você já adicionou todos os serviços desta categoria.
                    </Text>
                  ) : (
                    <FlatList
                      data={availableServicesForCategory}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(i) => i.id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.chip,
                            selectedService?.id === item.id &&
                              styles.chipSelected,
                          ]}
                          onPress={() => setSelectedService(item)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              selectedService?.id === item.id &&
                                styles.chipTextSelected,
                            ]}
                          >
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </View>
              </>
            )}

            {selectedService && (
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.label}>Preço (R$)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0,00"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Unidade</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ex: hora"
                    value={unit}
                    onChangeText={setUnit}
                  />
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeModal} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                style={[
                  styles.saveBtn,
                  (!selectedService || !price) && styles.saveBtnDisabled,
                ]}
                disabled={!selectedService || !price || saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? "Salvando..." : "Adicionar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
