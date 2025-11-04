import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";

// Telas de Autenticação
import LoginScreen from "../screens/Login";
import SignUpScreen from "../screens/SignUp";

// Nossos Navegadores de Tabs
import ClientTabs from "./ClientTabs";
import ProviderTabs from "./ProviderTabs";

import OnboardingStack from "./OnboardingStack";

const Stack = createStackNavigator();

// Telas de Autenticação
const AuthStack = () => (
  <>
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SignUp"
      component={SignUpScreen}
      options={{ title: "Criar Conta" }}
    />
  </>
);

// Telas do App (CLIENTE)
const AppClientStack = () => (
  <Stack.Screen
    name="AppClient"
    component={ClientTabs}
    options={{ headerShown: false }}
  />
);

// Telas do App (PROVIDER)
const AppProviderStack = () => (
  <Stack.Screen
    name="AppProvider"
    component={ProviderTabs}
    options={{ headerShown: false }}
  />
);

// --- TELA DE ONBOARDING ---
const AppOnboardingStack = () => (
  <Stack.Screen
    name="AppOnboarding"
    component={OnboardingStack}
    options={{ headerShown: false }}
  />
);

export default function Router() {
  // pegamos 'session', 'profile', 'loading' E O NOSSO NOVO ESTADO
  const { session, profile, loading, isProviderOnboarded } = useAuth();

  // O loading do AuthContext garante que temos a sessão E o perfil
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!session || !profile
          ? // 1. Se NÃO TEM sessão ou perfil, mostra o fluxo de Autenticação
            AuthStack()
          : profile.user_role === "client"
            ? // 2. Se TEM sessão E é CLIENTE, mostra o app de cliente
              AppClientStack()
            : profile.user_role === "provider" && isProviderOnboarded
              ? // 3. Se TEM sessão, é PROVIDER E JÁ FEZ ONBOARDING, mostra o app de provider
                AppProviderStack()
              : // 4. Se TEM sessão, é PROVIDER E NÃO FEZ ONBOARDING, mostra o fluxo de onboarding
                AppOnboardingStack()}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
