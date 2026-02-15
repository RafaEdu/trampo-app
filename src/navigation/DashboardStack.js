import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProviderDashboard from "../screens/ProviderDashboard";
import ChatScreen from "../screens/Chat";

const Stack = createStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DashboardMain"
        component={ProviderDashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ title: "Negociação" }}
      />
    </Stack.Navigator>
  );
}
