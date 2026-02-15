import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ClientDashboard from "../screens/ClientDashboard";

const Stack = createStackNavigator();

export default function ClientDashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ClientDashboardMain"
        component={ClientDashboard}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
