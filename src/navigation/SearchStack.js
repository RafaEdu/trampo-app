import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SearchScreen from "../screens/Search";
import ProviderDetailsScreen from "../screens/ProviderDetails";

const Stack = createStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SearchMain"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProviderDetails"
        component={ProviderDetailsScreen}
        options={{ title: "Detalhes do Profissional" }}
      />
    </Stack.Navigator>
  );
}
