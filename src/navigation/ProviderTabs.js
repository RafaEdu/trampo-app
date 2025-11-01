// src/navigation/ProviderTabs.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Nossas telas
import ProviderDashboard from "../screens/ProviderDashboard";
import AddJobScreen from "../screens/AddJob";
import ProfileScreen from "../screens/Profile";

const Tab = createBottomTabNavigator();

export default function ProviderTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Início") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Publicar") {
            // "Mais"
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Perfil") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007aff",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Escondemos também
      })}
    >
      <Tab.Screen name="Início" component={ProviderDashboard} />
      <Tab.Screen name="Publicar" component={AddJobScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
