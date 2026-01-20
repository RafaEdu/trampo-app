import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabaseClient";
import { styles } from "./styles";
import { useFocusEffect } from "@react-navigation/native";

// Opções de unidade conforme definido no banco (enum)
const UNIT_OPTIONS = ["servico", "hora", "dia", "m2", "unidade"];

export default function AddJobScreen() {
  const [loading, setLoading] = useState(false);
  const [myServices, setMyServices] = useState([]);
  const [myServiceIds, setMyServiceIds] = useState([]);

  // --- Estados de Busca ---
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // --- Estados do Modal de ADIÇÃO ---
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [serviceToAdd, setServiceToAdd] = useState(null);

  // --- Estados do Modal de EDIÇÃO/EXCLUSÃO ---
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null); // O objeto da tabela professional_services

  // --- Estados Comuns (Formulário) ---
  // Guardamos o valor "bruto" (inteiro representando centavos) para facilitar a máscara
  // Ex: 100 = R$ 1,00
  const [priceRawValue, setPriceRawValue] = useState("0");
  const [selectedUnit, setSelectedUnit] = useState("servico");

  // =========================================================================
  // MÁSCARA DE MOEDA
  // =========================================================================
  const handlePriceChange = (text) => {
    // Remove tudo que não for dígito
    const numericValue = text.replace(/[^0-9]/g, "");
    // Remove zeros à esquerda excessivos (ex: 001 -> 1), mas mantém "0" se vazio
    const cleanValue = numericValue.replace(/^0+/, "") || "0";
    setPriceRawValue(cleanValue);
  };

  const formatCurrency = (rawValue) => {
    const numberValue = parseInt(rawValue, 10) / 100;
    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // =========================================================================
  // CARREGAR MEUS SERVIÇOS
  // =========================================================================
  const fetchMyServices = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("professional_services")
        .select(
          `
          id,
          price,
          unit,
          professional_id,
          service:services (
            id,
            name,
            description,
            category:service_categories (
              id,
              name
            )
          )
        `,
        )
        .eq("professional_id", user.id);

      if (error) throw error;

      const ids = data.map((item) => item.service.id);
      setMyServiceIds(ids);

      const grouped = groupServicesByCategory(data);
      setMyServices(grouped);
    } catch (error) {
      console.error("Erro ao buscar meus serviços:", error.message);
      Alert.alert("Erro", "Não foi possível carregar seus serviços.");
    } finally {
      setLoading(false);
    }
  };

  const groupServicesByCategory = (data) => {
    const groups = {};
    data.forEach((item) => {
      const catName = item.service.category?.name || "Outros";
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(item);
    });
    return Object.keys(groups).map((key) => ({
      title: key,
      data: groups[key],
    }));
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyServices();
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
    }, []),
  );

  // =========================================================================
  // BUSCA (NOME DO SERVIÇO OU CATEGORIA)
  // =========================================================================
  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // 1. Busca serviços por nome
      const { data: servicesByName, error: err1 } = await supabase
        .from("services")
        .select(`*, category:service_categories(*)`)
        .ilike("name", `%${text}%`);

      if (err1) throw err1;

      // 2. Busca categorias por nome para achar os serviços delas
      //    Primeiro achamos as categorias que batem com o texto
      const { data: categories, error: err2 } = await supabase
        .from("service_categories")
        .select("id")
        .ilike("name", `%${text}%`);

      if (err2) throw err2;

      let servicesByCategory = [];
      if (categories.length > 0) {
        const catIds = categories.map((c) => c.id);
        const { data: servicesByCatData, error: err3 } = await supabase
          .from("services")
          .select(`*, category:service_categories(*)`)
          .in("category_id", catIds);

        if (err3) throw err3;
        servicesByCategory = servicesByCatData;
      }

      // 3. Combina os resultados e remove duplicatas (pelo ID)
      const allResults = [...servicesByName, ...servicesByCategory];
      const uniqueResults = [];
      const seenIds = new Set();

      allResults.forEach((item) => {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          // Filtra se eu já tenho esse serviço
          if (!myServiceIds.includes(item.id)) {
            uniqueResults.push(item);
          }
        }
      });

      setSearchResults(uniqueResults);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // =========================================================================
  // FLUXO DE ADIÇÃO
  // =========================================================================
  const openAddModal = (service) => {
    setServiceToAdd(service);
    setPriceRawValue("0"); // Reseta para R$ 0,00
    setSelectedUnit("servico");
    setAddModalVisible(true);
  };

  const confirmAddService = async () => {
    if (priceRawValue === "0" || priceRawValue === "") {
      Alert.alert("Atenção", "Defina um valor maior que zero.");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Converte rawValue (centavos) para decimal
      const finalPrice = parseFloat(priceRawValue) / 100;

      const { error } = await supabase.from("professional_services").insert({
        professional_id: user.id,
        service_id: serviceToAdd.id,
        price: finalPrice,
        unit: selectedUnit,
      });

      if (error) throw error;

      Alert.alert("Sucesso", "Serviço adicionado!");
      setAddModalVisible(false);
      fetchMyServices();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao adicionar serviço.");
    }
  };

  // =========================================================================
  // FLUXO DE EDIÇÃO / EXCLUSÃO
  // =========================================================================
  const openEditModal = (professionalServiceItem) => {
    setServiceToEdit(professionalServiceItem);
    // Converte o preço salvo (ex: 150.50) para string de centavos (15050) para a máscara funcionar
    const initialRaw = (professionalServiceItem.price * 100).toFixed(0);
    setPriceRawValue(initialRaw);
    setSelectedUnit(professionalServiceItem.unit || "servico");
    setEditModalVisible(true);
  };

  const handleUpdateService = async () => {
    if (!serviceToEdit) return;

    try {
      const finalPrice = parseFloat(priceRawValue) / 100;

      const { error } = await supabase
        .from("professional_services")
        .update({
          price: finalPrice,
          unit: selectedUnit,
        })
        .eq("id", serviceToEdit.id);

      if (error) throw error;

      Alert.alert("Atualizado", "Serviço atualizado com sucesso.");
      setEditModalVisible(false);
      fetchMyServices();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao atualizar serviço.");
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToEdit) return;

    Alert.alert(
      "Excluir Serviço",
      `Tem certeza que deseja deixar de oferecer "${serviceToEdit.service.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("professional_services")
                .delete()
                .eq("id", serviceToEdit.id);

              if (error) throw error;

              setEditModalVisible(false);
              fetchMyServices();
            } catch (error) {
              console.error(error);
              Alert.alert("Erro", "Não foi possível excluir.");
            }
          },
        },
      ],
    );
  };

  // =========================================================================
  // RENDERIZAÇÃO
  // =========================================================================

  // Componente de Seleção de Unidade (Chips)
  const renderUnitSelector = () => (
    <View style={styles.unitContainer}>
      <Text style={styles.label}>Tipo de cobrança:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.unitScroll}
      >
        {UNIT_OPTIONS.map((opt) => {
          const isSelected = selectedUnit === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.unitChip, isSelected && styles.unitChipSelected]}
              onPress={() => setSelectedUnit(opt)}
            >
              <Text
                style={[styles.unitText, isSelected && styles.unitTextSelected]}
              >
                Por {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // Card: Meus Serviços (com clique para editar)
  const renderMyServiceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openEditModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.service.name}</Text>
        <Text style={styles.cardPrice}>
          {item.price?.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}{" "}
          / {item.unit}
        </Text>
      </View>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.service.description}
      </Text>
      <View style={styles.futureInfoContainer}>
        <Text style={styles.futureInfoText}>
          Ofertado na região: <Text style={styles.bold}>Não</Text>
        </Text>
        <Text style={styles.futureInfoText}>
          Média regional: <Text style={styles.bold}>-</Text>
        </Text>
      </View>
      <Text style={styles.editHint}>Toque para editar ou excluir</Text>
    </TouchableOpacity>
  );

  // Card: Busca (Adicionar novo)
  const renderSearchItem = ({ item }) => (
    <View style={styles.searchCard}>
      <View style={styles.searchCardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.categoryBadge}>{item.category?.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.futureInfoContainer}>
          <Text style={styles.futureInfoText}>
            Ofertado na região: <Text style={styles.bold}>Não</Text>
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => openAddModal(item)}
      >
        <Text style={styles.addButtonText}>Adicionar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Serviços</Text>
      </View>

      {/* Tela Principal */}
      {!showSearch ? (
        <View style={{ flex: 1 }}>
          {loading ? (
            <ActivityIndicator
              style={{ marginTop: 20 }}
              size="large"
              color="#007aff"
            />
          ) : (
            <SectionList
              sections={myServices}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMyServiceItem}
              renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.sectionHeader}>{title}</Text>
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Você ainda não oferece serviços. Adicione um abaixo.
                </Text>
              }
            />
          )}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.offerButton}
              onPress={() => setShowSearch(true)}
            >
              <Text style={styles.offerButtonText}>
                Oferecer novos serviços
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Tela de Busca */
        <View style={styles.searchContainer}>
          <View style={styles.searchBarRow}>
            <TouchableOpacity onPress={() => setShowSearch(false)}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Busque por serviço ou categoria..."
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
          </View>

          {searching ? (
            <ActivityIndicator style={{ marginTop: 20 }} color="#007aff" />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderSearchItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                searchQuery.length > 1 ? (
                  <Text style={styles.emptyText}>
                    Nenhum serviço encontrado.
                  </Text>
                ) : null
              }
            />
          )}
        </View>
      )}

      {/* --- MODAL DE ADIÇÃO --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Serviço</Text>
            <Text style={styles.modalSubtitle}>{serviceToAdd?.name}</Text>

            <Text style={styles.label}>Valor do serviço:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formatCurrency(priceRawValue)}
              onChangeText={handlePriceChange}
              placeholder="R$ 0,00"
            />

            {renderUnitSelector()}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmAddService}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL DE EDIÇÃO / EXCLUSÃO --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Serviço</Text>
            <Text style={styles.modalSubtitle}>
              {serviceToEdit?.service?.name}
            </Text>

            <Text style={styles.label}>Alterar Valor:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formatCurrency(priceRawValue)}
              onChangeText={handlePriceChange}
            />

            {renderUnitSelector()}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteService}
              >
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdateService}
              >
                <Text style={styles.confirmButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
