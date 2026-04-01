import { supabase } from '../lib/supabase';

export interface BylawRule {
  id: string;
  chapter_number: number;
  chapter_title: string;
  chapter_order: number;
  article_number: number;
  article_title: string;
  article_content: string;
  article_order: number;
  is_active: boolean;
}

export const bylawService = {
  // Get all active rules
  async getBylawRules() {
    const { data, error } = await supabase
      .from('bylaw_articles')
      .select('*')
      .eq('is_active', true)
      .order('chapter_number', { ascending: true })
      .order('article_number', { ascending: true });

    if (error) throw error;
    return data as BylawRule[];
  },

  // Check if current user has agreed to the latest bylaw
  async checkUserAgreement(userId: string) {
    const { data, error } = await supabase
      .from('bylaw_acknowledgments')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 means zero rows found
    return !!data;
  },

  // Record user agreement using secure RPC to bypass RLS issues
  async recordAgreement(userId: string) {
    const { data, error } = await supabase.rpc('record_bylaw_agreement', {
      p_user_id: userId,
      p_user_type: 'internal',
      p_ip_address: '127.0.0.1'
    });

    if (error) throw error;
    if (data === false) throw new Error('Failed to record agreement through RPC');
    return true;
  }
};
