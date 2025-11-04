import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../services/supabaseClient";
import { styles } from "./styles"; // Importando do arquivo de estilos

export default function SelectCategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("service_categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error("Erro ao buscar categorias:", error.message);
        Alert.alert("Erro", "Não foi possível carregar as categorias.");
      } else {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const toggleSelectCategory = (id) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((catId) => catId !== id)
        : [...prevSelected, id]
    );
  };

  const handleNextStep = () => {
    // Agora que temos os IDs, o próximo passo
    // é navegar e passá-los como parâmetro.
    navigation.navigate("SelectServices", { categoryIds: selectedCategories });
  };

  // Função para renderizar o item, mantendo o JSX principal limpo
  const renderCategoryItem = ({ item }) => {
    const isSelected = selectedCategories.includes(item.id);
    return (
      <TouchableOpacity
        // Dica Sênior: Usamos um array para aplicar estilos condicionais.
        // O primeiro é o base, o segundo é o modificador.
        style={[styles.itemContainer, isSelected && styles.itemSelected]}
        onPress={() => toggleSelectCategory(item.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loadingText}>Carregando categorias...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quais são suas áreas de atuação?</Text>
        <Text style={styles.subtitle}>
          Selecione uma ou mais categorias para começar.
        </Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategoryItem}
        showsVerticalScrollIndicator={false}
        style={styles.list} // Aplicando o novo estilo da lista
      />

      {/* 3. Botão movido para fora da lista e dentro do View 'footer' */}
      <View style={styles.footer}>
        <Button
          title="Avançar"
          onPress={handleNextStep}
          disabled={selectedCategories.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}
