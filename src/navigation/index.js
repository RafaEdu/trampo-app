import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";

// Telas de Autenticação
import LoginScreen from "../screens/Login";
import SignUpScreen from "../screens/SignUp";
import CompleteProfileScreen from "../screens/CompleteProfile";
import ForgotPasswordScreen from "../screens/ForgotPassword";

// Nossos Navegadores de Tabs
import ClientTabs from "./ClientTabs";
import ProviderTabs from "./ProviderTabs";
import VerifyEmailScreen from "../screens/VerifyEmail";

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
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ title: "Recuperar Senha" }}
    />
    <Stack.Screen
      name="CompleteProfile"
      component={CompleteProfileScreen}
      options={{ title: "Perfil" }}
    />
    <Stack.Screen
      name="VerifyEmail"
      component={VerifyEmailScreen}
      options={{ title: "Verificação" }}
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
  const { session, profile, loading, isProviderOnboarded } = useAuth();

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
          ? AuthStack()
          : profile.user_role === "client"
            ? AppClientStack()
            : profile.user_role === "provider" && isProviderOnboarded
              ? AppProviderStack()
              : AppOnboardingStack()}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
