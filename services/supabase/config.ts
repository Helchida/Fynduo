import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables Supabase manquantes dans .env');
}

if (__DEV__) {
  console.log('🔷 Supabase connecté à:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // On garde Firebase Auth pour l'instant
  },
});

/**
 * Helper pour logger les erreurs Supabase en dev uniquement
 */
export const logSupabaseError = (operation: string, error: any) => {
  if (__DEV__) {
    console.error(`❌ Supabase ${operation}:`, error);
  }
};