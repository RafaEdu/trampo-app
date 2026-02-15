import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import DashboardStack from "./DashboardStack";
import AddJobScreen from "../screens/AddJob";
import ChatStack from "./ChatStack";
import ProfileScreen from "../screens/Profile";
import { useUnreadMessages } from "../hooks/useUnreadMessages";

const Tab = createBottomTabNavigator();

export default function ProviderTabs() {
  const unreadCount = useUnreadMessages();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Início") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Serviços") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Mensagens") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "Perfil") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007aff",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Início" component={DashboardStack} />
      <Tab.Screen name="Serviços" component={AddJobScreen} />
      <Tab.Screen
        name="Mensagens"
        component={ChatStack}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
