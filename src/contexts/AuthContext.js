import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Tenta pegar a sessão que já existe
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuta mudanças no estado de autenticação (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Limpa o listener quando o componente desmontar
    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user: session?.user,
    loading,
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),

    signUp: (email, password, optionsData) => {
      return supabase.auth.signUp({
        email,
        password,
        options: {
          // Estes dados serão enviados para o trigger
          data: optionsData,
        },
      });
    },
    signOut: () => supabase.auth.signOut(),
  };

  // Não renderiza nada até termos carregado a sessão
  if (loading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
