import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Esta função vai buscar o perfil do usuário no Supabase
  const getProfile = async (user) => {
    try {
      if (!user) return null;

      const { data, error, status } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url, account_type, user_role")
        .eq("id", user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile(data);
        return data;
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    // Tenta pegar a sessão que já existe
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Se a sessão existir, já busca o perfil
        await getProfile(session.user);
      }
      setLoading(false);
    });

    // Escuta mudanças no estado de autenticação (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        // Usuário logou, busca o perfil
        await getProfile(session.user);
      } else {
        // Usuário deslogou, limpa o perfil
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    profile,
    user: session?.user,
    loading,
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, optionsData) =>
      supabase.auth.signUp({
        email,
        password,
        options: { data: optionsData },
      }),
    signOut: () => supabase.auth.signOut(),
  };

  // Não renderiza nada até termos carregado a sessão E o perfil
  // (Ou podemos mostrar um <Loading />)
  if (loading) {
    return null; // Ou <AppLoading />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
