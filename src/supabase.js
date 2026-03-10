import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qgcxhuqmjsgokawntvvn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1Lcz2szuedHS244Q31DUJg_uNUTa0YJ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function getQuestions(niveau) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('niveau', niveau)
    .limit(10);

  if (error) throw error;

  return data.sort(() => Math.random() - 0.5);
}

export async function getClassement() {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false })
    .limit(10);

  if (error) return [];
  return data;
}

export async function sauvegarderScore(pseudo, score, niveau) {
  const { error } = await supabase
    .from('scores')
    .upsert({ pseudo, score, niveau, updated_at: new Date() }, { onConflict: 'pseudo' });

  if (error) console.error('Erreur score:', error);
}
