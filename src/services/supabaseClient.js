import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

// Pega as variáveis de ambiente que definimos no .env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Erro: Variáveis de ambiente do Supabase não estão configuradas."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // No React Native, precisamos desabilitar o autoRefreshToken por padrão.
    // Gerenciamos isso manualmente ou em momentos específicos.
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
