import React from "react";
import { View, Text } from "react-native";
import { styles } from "./styles";
import { Ionicons } from "@expo/vector-icons";

export default function ProviderCard({ provider }) {
  const {
    full_name,
    distance, // Agora é um NÚMERO
    matched_service,
    other_services = [],
    price,
  } = provider;

  // Lógica para o preço (R$ 0,00 é nosso placeholder)
  const displayPrice = price ? `R$ ${parseFloat(price).toFixed(2)}` : "R$ 0,00";

  // --- CORREÇÃO DE BUG ---
  // Formata o número da distância para uma string amigável
  // Ex: 2.5134 -> "2.5 km"
  // Ex: 0.823 -> "823 m"
  const formatDistance = (dist) => {
    if (dist < 1) {
      return `${Math.round(dist * 1000)} m`;
    }
    return `${dist.toFixed(1)} km`;
  };
  // -------------------------

  return (
    <View style={styles.card}>
      {/* Linha 1: Nome e Distância */}
      <View style={styles.cardHeader}>
        <Text style={styles.providerName}>{full_name}</Text>
        <View style={styles.distanceContainer}>
          <Ionicons name="location-outline" size={14} color="#555" />
          {/* Agora usa a distância formatada */}
          <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
        </View>
      </View>

      {/* Linha 2: Serviço que deu Match e Preço */}
      <View style={styles.serviceInfo}>
        <Text style={styles.matchedService}>{matched_service}</Text>
        <Text style={styles.price}>{displayPrice}</Text>
      </View>

      {/* Linha 3: Outros serviços */}
      {other_services && other_services.length > 0 && (
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
