import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Este estado vai controlar se o provider já se configurou.
  const [isProviderOnboarded, setIsProviderOnboarded] = useState(false);

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
        return data; // Retorna o perfil para a próxima função
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error.message);
    }
    return null; // Retorna nulo em caso de falha
  };

  // Verifica se o profissional já cadastrou pelo menos um serviço
  const checkProviderOnboarding = async (userId) => {
    try {
      // Usamos { count: 'exact', head: true }
      // Isso faz o Supabase retornar APENAS a contagem (count) e não os dados.
      // É muito mais rápido e eficiente para verificar existência.
      const { error, count } = await supabase
        .from("professional_services")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", userId);

      if (error) throw error;

      // Se tiver 1 ou mais serviços, está "onboarded"
      return count > 0;
    } catch (error) {
      console.error("Erro ao checar onboarding:", error.message);
      return false; // Em caso de erro, assume que não completou
    }
  };

  // --- NOSSA NOVA FUNÇÃO ---
  /**
   * Força a busca do perfil mais recente no Supabase e atualiza o estado global.
   */
  const refreshProfile = async () => {
    // Pega a sessão atual
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      // Re-busca o perfil com os dados do usuário da sessão
      await getProfile(session.user);
    }
  };

  // Esta função será chamada pela tela SetPricesScreen
  const refreshOnboardingStatus = async (userId) => {
    // Apenas re-executa a checagem e atualiza o estado
    if (userId) {
      const isOnboarded = await checkProviderOnboarding(userId);
      setIsProviderOnboarded(isOnboarded);
    }
  };

  // Esta função é "burra". Ela apenas seta o estado,
  // sem fazer chamadas de API. É usada pela SetPricesScreen
  // que JÁ SABE que o insert foi um sucesso.
  const forceSetOnboarded = () => {
    setIsProviderOnboarded(true);
  };

  useEffect(() => {
    setLoading(true);

    const setupSession = async () => {
      // Tenta pegar a sessão que já existe
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // Se a sessão existir, busca o perfil
        const userProfile = await getProfile(session.user);

        // Se for um provider, checa se ele já se configurou
        if (userProfile && userProfile.user_role === "provider") {
          const isOnboarded = await checkProviderOnboarding(session.user.id);
          setIsProviderOnboarded(isOnboarded);
        }
      }
      // --- CORREÇÃO 1: O loading só termina DEPOIS de checar tudo. ---
      setLoading(false);
    };

    setupSession();

    // Escuta mudanças no estado de autenticação (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // --- CORREÇÃO 2: Inicia o loading sempre que o auth mudar ---
      setLoading(true);
      setSession(session);

      if (session) {
        // Usuário logou, busca o perfil
        const userProfile = await getProfile(session.user);

        if (userProfile && userProfile.user_role === "provider") {
          const isOnboarded = await checkProviderOnboarding(session.user.id);
          setIsProviderOnboarded(isOnboarded);
        } else {
          setIsProviderOnboarded(false); // Reseta se for cliente
        }
      } else {
        // Usuário deslogou, limpa o perfil e o estado de onboarding
        setProfile(null);
        setIsProviderOnboarded(false);
      }

      // --- CORREÇÃO 3: O loading só termina DEPOIS que a checagem do login/logout acabar ---
      // (removemos o if(!session) que estava aqui)
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    profile,
    user: session?.user,
    loading,
    isProviderOnboarded,
    refreshOnboardingStatus,
    forceSetOnboarded,
    refreshProfile,
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
  // Esta lógica agora está correta e vai esperar a checagem de onboarding.
  if (loading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
