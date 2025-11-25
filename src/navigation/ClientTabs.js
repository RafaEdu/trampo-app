import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import ClientDashboard from "../screens/ClientDashboard";
import SearchScreen from "../screens/Search";
import ProfileScreen from "../screens/Profile";
import SearchStack from "./SearchStack";

const Tab = createBottomTabNavigator();

export default function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Início") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Procurar") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Perfil") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007aff",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Vamos esconder o header do Tab
      })}
    >
      <Tab.Screen name="Início" component={ClientDashboard} />
      <Tab.Screen name="Procurar" component={SearchStack} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
