import { supabase } from '../lib/supabase';
import { convertToArabicWords } from '../utils/arabicNumberToWords';

export interface BenefitReceipt {
  id: string;
  receipt_number: string;
  branch_id: string;
  family_id: string;
  benefit_type: string;
  benefit_value: number;
  benefit_value_in_words: string;
  benefit_description: string;
  status: 'draft' | 'printed' | 'signed' | 'delivered' | 'cancelled';
  created_by: string;
  created_at: string;
}

export const receiptService = {
  // Create a new receipt
  async createReceipt(data: {
    family_id: string;
    branch_id: string;
    benefit_type: string;
    amount: number;
    description: string;
  }) {
    const amount_words = convertToArabicWords(data.amount);
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    
    // Fetch branch record to get the code (handle both UUID and Code for robustness)
    let branchQuery = supabase.from('branches').select('id, code');
    
    // Check if data.branch_id is a valid UUID format (36 chars) or a short code
    if (data.branch_id && data.branch_id.length === 36) {
        branchQuery = branchQuery.or(`id.eq.${data.branch_id},code.eq.${data.branch_id}`);
    } else {
        branchQuery = branchQuery.eq('code', data.branch_id);
    }
    
    const { data: branchData } = await branchQuery.maybeSingle();
      
    const branch_id = branchData?.id;
    const branch_code = branchData?.code || 'MSL';

    // 1. Generate Receipt Number via RPC
    const { data: receiptNum, error: rpcError } = await supabase.rpc(
      'generate_receipt_number',
      { p_year: year, p_branch_code: branch_code }
    );

    if (rpcError) throw rpcError;

    // 2. Fetch Family Details for snapshot
    const { data: family } = await supabase.from('families').select('*').eq('id', data.family_id).single();

    // 3. Insert into database using ACTUAL SQL column names
    const { data: receipt, error } = await supabase
      .from('benefit_receipts')
      .insert({
        receipt_number: receiptNum,
        fiscal_year: year,
        family_id: data.family_id,
        branch_id: branch_id || null,
        beneficiary_full_name: family?.family_name || 'غير معروف',
        beneficiary_phone: family?.phone,
        beneficiary_address: family?.address,
        benefit_type: data.benefit_type,
        benefit_value: data.amount,
        benefit_value_in_words: amount_words,
        benefit_description: data.description,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
        console.error('Error creating receipt in DB:', error);
        throw error;
    }
    return receipt as BenefitReceipt;
  },

  // Get receipts for a specific family
  async getReceiptsByFamily(familyId: string) {
    const { data, error } = await supabase
      .from('benefit_receipts')
      .select(`
        *,
        creator:created_by (full_name),
        deliverer:delivered_by (full_name),
        printer:printed_by (full_name)
      `)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all receipts (Pure RPC)
  async getReceipts() {
    try {
      const { data, error } = await supabase.rpc('get_benefit_receipts_v2', {
        p_limit: 100,
        p_offset: 0
      });
      
      if (error) throw error;
      
      // Map RPC output to match what the frontend expects
      return (data || []).map((r: any) => ({
        ...r,
        family: {
          family_name: r.family_name,
          registration_number: r.registration_number
        },
        creator: {
          full_name: r.created_by_name
        }
      }));
    } catch (err) {
      console.error("Receipts RPC Fetch Error:", err);
      return [];
    }
  },

  // Update status (Pure RPC)
  async updateReceiptStatus(id: string, status: 'signed' | 'delivered' | 'cancelled') {
    try {
      const { data, error } = await supabase.rpc('manage_benefit_receipt_status_v2', {
        p_id: id,
        p_status: status
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Receipt Status RPC Error:", err);
      throw err;
    }
  }
};
