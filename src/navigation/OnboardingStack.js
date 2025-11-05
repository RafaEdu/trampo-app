import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Importando as telas do fluxo
import SetLocationScreen from "../screens/professional-onboarding/SetLocationScreen"; // 1. Importar nova tela
import SelectCategoriesScreen from "../screens/professional-onboarding/SelectCategoriesScreen";
import SelectServicesScreen from "../screens/professional-onboarding/SelectServicesScreen";
import SetPricesScreen from "../screens/professional-onboarding/SetPricesScreen";

const Stack = createStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator>
      {/* 2. Adicionar como a primeira tela */}
      <Stack.Screen
        name="SetLocation"
        component={SetLocationScreen}
        options={{ title: "Configurar Perfil (1/4)" }}
      />
      {/* 3. Renumerar as telas seguintes */}
      <Stack.Screen
        name="SelectCategories"
        component={SelectCategoriesScreen}
        options={{ title: "Configurar Perfil (2/4)" }}
      />
      <Stack.Screen
        name="SelectServices"
        component={SelectServicesScreen}
        options={{ title: "Configurar Perfil (3/4)" }}
      />
      <Stack.Screen
        name="SetPrices"
        component={SetPricesScreen}
        options={{ title: "Configurar Perfil (4/4)" }}
      />
    </Stack.Navigator>
  );
}
