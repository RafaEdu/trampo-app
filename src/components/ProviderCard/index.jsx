import React from "react";
import { View, Text } from "react-native";
import { styles } from "./styles";
import { Ionicons } from "@expo/vector-icons";

export default function ProviderCard({ provider }) {
  // O 'provider' agora é um objeto mais complexo
  const {
    full_name,
    distance,
    matched_service,
    other_services = [],
    price,
  } = provider;

  // Lógica para o preço (R$ 0,00 é nosso placeholder)
  const displayPrice = price ? `R$ ${parseFloat(price).toFixed(2)}` : "R$ 0,00";

  return (
    <View style={styles.card}>
      {/* Linha 1: Nome e Distância */}
      <View style={styles.cardHeader}>
        <Text style={styles.providerName}>{full_name}</Text>
        <View style={styles.distanceContainer}>
          <Ionicons name="location-outline" size={14} color="#555" />
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
      </View>

      {/* Linha 2: Serviço que deu Match e Preço */}
      <View style={styles.serviceInfo}>
        <Text style={styles.matchedService}>{matched_service}</Text>
        <Text style={styles.price}>{displayPrice}</Text>
      </View>

      {/* Linha 3: Outros serviços */}
      {other_services.length > 0 && (
        <View style={styles.otherServicesContainer}>
          <Text style={styles.otherServicesTitle}>Também oferece:</Text>
          <Text style={styles.otherServicesText} numberOfLines={1}>
            {other_services.join(", ")}
          </Text>
        </View>
      )}
    </View>
  );
}
