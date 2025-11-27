import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../services/supabaseClient";
import { styles } from "./styles";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    // Buscamos os bookings E os dados do cliente (join)
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        profiles:client_id (full_name, email) 
      `
      )
      .eq("professional_id", user.id)
      .eq("status", "pending") // Apenas os pendentes por enquanto
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setBookings(data || []);

    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      Alert.alert("Erro", "Não foi possível atualizar.");
    } else {
      Alert.alert(
        "Sucesso",
        `Pedido ${newStatus === "accepted" ? "aceito" : "recusado"}!`
      );
      fetchBookings(); // Recarrega a lista
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.clientName}>
        Cliente: {item.profiles?.full_name || "Anônimo"}
      </Text>
      <Text style={styles.desc}>{item.description}</Text>
      <Text style={styles.date}>
        Recebido em: {new Date(item.created_at).toLocaleDateString()}
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, styles.btnReject]}
          onPress={() => handleUpdateStatus(item.id, "rejected")}
        >
          <Text style={styles.btnText}>Recusar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnAccept]}
          onPress={() => handleUpdateStatus(item.id, "accepted")}
        >
          <Text style={styles.btnText}>Aceitar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novos Pedidos</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007aff" />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhum pedido pendente.</Text>
          }
        />
      )}
    </View>
  );
}
