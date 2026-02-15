import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProviderDashboard from "../screens/ProviderDashboard";

const Stack = createStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DashboardMain"
        component={ProviderDashboard}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
