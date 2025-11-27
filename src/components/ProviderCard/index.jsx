import React from "react";
import { View, Text } from "react-native";
import { styles } from "./styles";
import { Ionicons } from "@expo/vector-icons";

export default function ProviderCard({ provider }) {
  const {
    full_name,
    distance,
    matched_service,
    other_services = [],
  } = provider;

  // Combina o serviço que deu "match" com os outros para listar
  // Remove duplicatas e valores vazios
  const allServices = Array.from(
    new Set([matched_service, ...other_services])
  ).filter(Boolean);

  // Regra de exibição: Mostrar até 2 serviços, depois "e mais X..."
  const VISIBLE_LIMIT = 2;
  const visibleServices = allServices.slice(0, VISIBLE_LIMIT);
  const remainingCount = allServices.length - VISIBLE_LIMIT;

  const formatDistance = (dist) => {
    if (!dist) return "--";
    if (dist < 1) {
      return `${Math.round(dist * 1000)} m`;
    }
    return `${dist.toFixed(1)} km`;
  };

  return (
    <View style={styles.card}>
      {/* Cabeçalho: Nome e Distância */}
      <View style={styles.cardHeader}>
        <Text style={styles.providerName}>{full_name}</Text>
        <View style={styles.distanceBadge}>
          <Ionicons name="location-sharp" size={12} color="white" />
          <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
        </View>
      </View>

      {/* Lista Resumida de Serviços */}
      <View style={styles.servicesContainer}>
        <Text style={styles.servicesLabel}>Serviços nesta área:</Text>
        {visibleServices.map((service, index) => (
          <Text key={index} style={styles.serviceItem}>
            • {service}
          </Text>
        ))}
        {remainingCount > 0 && (
          <Text style={styles.moreText}>e mais {remainingCount}...</Text>
        )}
      </View>
    </View>
  );
}
