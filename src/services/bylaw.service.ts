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

  // Check if current user needs acknowledgment (considering versioning)
  async needsAcknowledgment() {
    const { data, error } = await supabase.rpc('needs_bylaw_acknowledgment');
    if (error) {
      console.error('Error checking bylaw acknowledgment:', error);
      // Fallback: if RPC fails, we should still try to find ANY existing acknowledgment via REST
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;
      
      if (!userId) return false;

      const { count } = await supabase
        .from('bylaw_acknowledgments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      return (count || 0) === 0;
    }
    return !!data;
  },

  // Record user agreement using secure RPC
  async recordAgreement() {
    const { error } = await supabase.rpc('record_bylaw_agreement');

    if (error) throw error;
    return true;
  }
};
