import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SectionList,
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
  const { categoryIds } = route.params || { categoryIds: [] };

  const [groupedServices, setGroupedServices] = useState([]);
  const [selectedServicesIds, setSelectedServicesIds] = useState([]); // Renomeado para deixar claro que são IDs
  const [allServices, setAllServices] = useState([]); // Novo estado para guardar os objetos completos
  const [loading, setLoading] = useState(true);

  // Formata os dados para o SectionList
  const formatDataForSectionList = (categories, services) => {
    return categories.map((category) => ({
      title: category.name,
      data: services.filter((service) => service.category_id === category.id),
    }));
  };

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const [categoriesResponse, servicesResponse] = await Promise.all([
          supabase
            .from("service_categories")
            .select("id, name")
            .in("id", categoryIds),
          supabase
            .from("services")
            .select("id, name, category_id")
            .in("category_id", categoryIds),
        ]);

        if (categoriesResponse.error) throw categoriesResponse.error;
        if (servicesResponse.error) throw servicesResponse.error;

        // Guarda todos os serviços para uso posterior na navegação
        setAllServices(servicesResponse.data);

        const formattedData = formatDataForSectionList(
          categoriesResponse.data,
          servicesResponse.data,
        );

        setGroupedServices(formattedData);
      } catch (error) {
        console.error("Erro ao buscar serviços:", error.message);
        Alert.alert("Erro", "Não foi possível carregar os serviços.");
      }
      setLoading(false);
    };

    if (categoryIds?.length > 0) {
      fetchServices();
    } else {
      setLoading(false);
    }
  }, [categoryIds]);

  const toggleSelectService = (id) => {
    setSelectedServicesIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((servId) => servId !== id)
        : [...prevSelected, id],
    );
  };

  const handleNextStep = () => {
    // CORREÇÃO: Filtra os objetos completos dos serviços baseados nos IDs selecionados
    const selectedServicesFullObjects = allServices.filter((service) =>
      selectedServicesIds.includes(service.id),
    );

    // Envia o array de objetos (selectedServices) em vez de apenas IDs
    navigation.navigate("SetPrices", {
      selectedServices: selectedServicesFullObjects,
    });
  };

  const renderServiceItem = ({ item }) => {
    const isSelected = selectedServicesIds.includes(item.id);
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
      />

      <View style={styles.footer}>
        <Button
          title="Avançar"
          onPress={handleNextStep}
          disabled={selectedServicesIds.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}
