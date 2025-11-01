import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";

// Telas de Autenticação
import LoginScreen from "../screens/Login";
import SignUpScreen from "../screens/SignUp";

// Nossos novos Navegadores de Tabs
import ClientTabs from "./ClientTabs";
import ProviderTabs from "./ProviderTabs";

const Stack = createStackNavigator();

export default function Router() {
  // pegamos 'session', 'profile', e o 'loading' inicial
  const { session, profile, loading } = useAuth();

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
        {session && profile ? (
          // Se TEM sessão E perfil, decidimos qual App mostrar
          profile.user_role === "client" ? (
            <Stack.Screen
              name="AppClient"
              component={ClientTabs}
              options={{ headerShown: false }}
            />
          ) : (
            <Stack.Screen
              name="AppProvider"
              component={ProviderTabs}
              options={{ headerShown: false }}
            />
          )
        ) : (
          // Se NÃO TEM sessão, mostra o fluxo de Autenticação
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
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
