import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProviderOnboarded, setIsProviderOnboarded] = useState(false);

  const isPasswordResetting = useRef(false);

  const getProfile = async (user) => {
    try {
      if (!user) return null;
      const { data, error, status } = await supabase
        .from("profiles_with_age")
        .select(
          "username, full_name, avatar_url, account_type, user_role, data_nascimento, cpf_cnpj, document_type, idade",
        )
        .eq("id", user.id)
        .single();

      if (error && status !== 406) throw error;
      if (data) {
        setProfile(data);
        return data;
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error.message);
    }
    return null;
  };

  const checkProviderOnboarding = async (userId) => {
    try {
      const { error, count } = await supabase
        .from("professional_services")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", userId);
      if (error) throw error;
      return count > 0;
    } catch (error) {
      console.error("Erro ao checar onboarding:", error.message);
      return false;
    }
  };

  const refreshProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) await getProfile(session.user);
  };

  const refreshOnboardingStatus = async (userId) => {
    if (userId) {
      const isOnboarded = await checkProviderOnboarding(userId);
      setIsProviderOnboarded(isOnboarded);
    }
  };

  const forceSetOnboarded = () => setIsProviderOnboarded(true);

  // --- Lógica de Sessão ---
  const handleSessionSetup = async (currentSession) => {
    setSession(currentSession);
    if (currentSession) {
      const userProfile = await getProfile(currentSession.user);
      if (userProfile && userProfile.user_role === "provider") {
        const isOnboarded = await checkProviderOnboarding(
          currentSession.user.id,
        );
        setIsProviderOnboarded(isOnboarded);
      } else {
        setIsProviderOnboarded(false);
      }
    } else {
      setProfile(null);
      setIsProviderOnboarded(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);

    // Setup inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionSetup(session);
    });

    // Listener de mudanças
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // SE estivermos resetando a senha, IGNORAMOS eventos automáticos (como o login do verifyOtp)
      // Isso evita que o App redirecione para a Home antes da hora.
      if (isPasswordResetting.current) {
        return;
      }
      setLoading(true);
      await handleSessionSetup(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const verifyOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });
    if (error) throw error;
    return data;
  };

  const sendPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const completePasswordReset = async (email, token, newPassword) => {
    // 1. Ativa a trava para impedir que o Router mude de tela sozinho
    isPasswordResetting.current = true;

    try {
      // 2. Verifica Código (Isso gera uma sessão no Supabase, mas ignoramos no State)
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "recovery",
      });
      if (error) throw error;

      // 3. Tenta atualizar a senha
      if (data.session) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        // SE FALHAR (ex: senha igual):
        if (updateError) {
          // Deslogamos imediatamente para limpar a sessão "suja" criada no passo 2
          await supabase.auth.signOut();
          throw updateError; // Joga o erro para a tela exibir
        }

        // SE SUCESSO:
        // Atualizamos manualmente o estado do App agora que tudo deu certo.
        // Isso evita a "tela branca" pois esperamos carregar tudo antes de soltar a trava.
        await handleSessionSetup(data.session);
      }
    } catch (error) {
      throw error;
    } finally {
      // Solta a trava
      isPasswordResetting.current = false;
    }
  };

  const value = {
    session,
    profile,
    user: session?.user,
    loading,
    isProviderOnboarded,
    verifyOtp,
    sendPasswordReset,
    completePasswordReset,
    refreshOnboardingStatus,
    forceSetOnboarded,
    refreshProfile,
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, optionsData) =>
      supabase.auth.signUp({ email, password, options: { data: optionsData } }),
    signOut: () => supabase.auth.signOut(),
  };

  if (loading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
