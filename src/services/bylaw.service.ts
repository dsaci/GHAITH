// v2.1.0 — bylaw agreement now uses RPC (record_bylaw_agreement) — no direct INSERT
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

  // Pure RPC check for AuthContext
  async rpcNeedsAcknowledgment() {
    return await supabase.rpc('needs_bylaw_acknowledgment');
  },

  // Check if current user needs acknowledgment (considering versioning)
  async needsAcknowledgment() {
    const { data, error } = await supabase.rpc('needs_bylaw_acknowledgment');
    if (error) {
      console.error('Error checking bylaw acknowledgment:', error);
      // Removed REST fallback as per Pure RPC mandate
      return false; 
    }
    return !!data;
  },

  // Record user agreement using secure RPC
  async recordAgreement() {
    try {
      const { error } = await supabase.rpc('record_bylaw_agreement');
      if (error) throw error;
      return true;
    } catch (err: any) {
      if (err.code === '42501') {
        alert("Direct insert blocked. Use RPC only.");
      } else if (err.code === '401') {
        alert("Session expired. Please login again.");
        // Redirect to login could be handled here or in the caller
      } else {
        console.error("Failed to record agreement:", err);
      }
      throw err;
    }
  }
};
