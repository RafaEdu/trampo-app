import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SectionList, // Usamos SectionList em vez de FlatList
  TouchableOpacity,
  ActivityIndicator,
  Button,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../services/supabaseClient";
import { styles } from "./styles";

export default function SelectServicesScreen({ route, navigation }) {
  // 1. Recebe os IDs da tela anterior
  const { categoryIds } = route.params;

  const [groupedServices, setGroupedServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Esta função transforma os dados crus do Supabase
  // no formato que o SectionList espera: [ { title: '...', data: [...] } ]
  const formatDataForSectionList = (categories, services) => {
    return categories.map((category) => ({
      title: category.name, // Ex: "Eletricista"
      // Filtra apenas os serviços que pertencem a esta categoria
      data: services.filter((service) => service.category_id === category.id),
    }));
  };

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        // Usa Promise.all para fazer as duas
        // buscas ao banco de dados em paralelo. É mais rápido!
        const [categoriesResponse, servicesResponse] = await Promise.all([
          // Busca 1: Os nomes das categorias que foi selecionado
          supabase
            .from("service_categories")
            .select("id, name")
            .in("id", categoryIds),
          // Busca 2: Todos os serviços que pertencem a essas categorias
          supabase
            .from("services")
            .select("id, name, category_id")
            .in("category_id", categoryIds),
        ]);

        if (categoriesResponse.error) throw categoriesResponse.error;
        if (servicesResponse.error) throw servicesResponse.error;

        // 3. Formata os dados para o SectionList
        const formattedData = formatDataForSectionList(
          categoriesResponse.data,
          servicesResponse.data
        );

        setGroupedServices(formattedData);
      } catch (error) {
        console.error("Erro ao buscar serviços:", error.message);
        Alert.alert("Erro", "Não foi possível carregar os serviços.");
      }
      setLoading(false);
    };

    fetchServices();
  }, [categoryIds]); // Roda a busca se os categoryIds mudarem

  const toggleSelectService = (id) => {
    setSelectedServices((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((servId) => servId !== id)
        : [...prevSelected, id]
    );
  };

  const handleNextStep = () => {
    // 5. Envia os IDs dos serviços selecionados para a próxima tela
    navigation.navigate("SetPrices", { serviceIds: selectedServices });
  };

  // Renderiza o item de serviço (mesma lógica da tela anterior)
  const renderServiceItem = ({ item }) => {
    const isSelected = selectedServices.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.itemContainer, isSelected && styles.itemSelected]}
        onPress={() => toggleSelectService(item.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Renderiza o título da categoria (Ex: "Eletricista")
  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loadingText}>Carregando serviços...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quais serviços você oferece?</Text>
        <Text style={styles.subtitle}>
          Selecione os serviços que você realiza.
        </Text>
      </View>

      <SectionList
        sections={groupedServices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderServiceItem}
        renderSectionHeader={renderSectionHeader}
        showsVerticalScrollIndicator={false}
        style={styles.listContainer}
        // 3. REMOVER o ListFooterComponent daqui
      />

      {/* 4. Botão movido para fora da lista e dentro do View 'footer' */}
      <View style={styles.footer}>
        <Button
          title="Avançar"
          onPress={handleNextStep}
          disabled={selectedServices.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}
