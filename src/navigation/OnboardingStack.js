import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Importando as duas telas do fluxo
import SelectCategoriesScreen from "../screens/professional-onboarding/SelectCategoriesScreen";
import SelectServicesScreen from "../screens/professional-onboarding/SelectServicesScreen";
import SetPricesScreen from "../screens/professional-onboarding/SetPricesScreen";

const Stack = createStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SelectCategories"
        component={SelectCategoriesScreen}
        options={{ title: "Configurar Perfil (1/3)" }}
      />
      <Stack.Screen
        name="SelectServices"
        component={SelectServicesScreen}
        options={{ title: "Configurar Perfil (2/3)" }}
      />
      <Stack.Screen
        name="SetPrices"
        component={SetPricesScreen}
        options={{ title: "Configurar Perfil (3/3)" }}
      />
    </Stack.Navigator>
  );
}
