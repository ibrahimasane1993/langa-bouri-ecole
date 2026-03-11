import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// 👉 Remplace ces valeurs par les tiennes depuis Supabase > Settings > API
const SUPABASE_URL = 'https://VOTRE_URL.supabase.co';
const SUPABASE_ANON_KEY = 'VOTRE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Récupérer les questions par niveau
export async function getQuestions(niveau) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('niveau', niveau)
    .limit(10);

  if (error) throw error;

  // Mélanger les questions aléatoirement
  return data.sort(() => Math.random() - 0.5);
}

// Récupérer le classement global
export async function getClassement() {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false })
    .limit(10);

  if (error) return [];
  return data;
}

// Sauvegarder un score
export async function sauvegarderScore(pseudo, score, niveau) {
  const { error } = await supabase
    .from('scores')
    .upsert({ pseudo, score, niveau, updated_at: new Date() }, { onConflict: 'pseudo' });

  if (error) console.error('Erreur score:', error);
}
