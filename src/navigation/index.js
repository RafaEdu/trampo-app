// src/navigation/index.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";

import LoginScreen from "../screens/Login";
import HomeScreen from "../screens/Home";
import SignUpScreen from "../screens/SignUp"; // 1. Importe a nova tela

const Stack = createStackNavigator();

export default function Router() {
  const { session } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session && session.user ? (
          // Telas Autenticadas
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Minha Conta" }}
          />
        ) : (
          // Telas Não Autenticadas
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }} // Tela de login sem header
            />
            <Stack.Screen
              name="SignUp" // 2. Adicione a tela de SignUp
              component={SignUpScreen}
              options={{ title: "Criar Conta", headerBackTitle: "Voltar" }} // Damos um título
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
