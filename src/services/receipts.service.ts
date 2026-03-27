import { supabase } from '../lib/supabase';
import { convertToArabicWords } from '../utils/arabicNumberToWords';

export interface BenefitReceipt {
  id: string;
  receipt_number: string;
  branch_id: string;
  family_id: string;
  benefit_type: 'مالية' | 'غذائية' | 'عينية';
  amount: number;
  amount_words: string;
  description: string;
  status: 'draft' | 'signed' | 'delivered' | 'cancelled';
  created_by: string;
  signed_by?: string;
  delivered_by?: string;
  created_at: string;
}

export const receiptService = {
  // Create a new receipt
  async createReceipt(data: {
    family_id: string;
    branch_id: string;
    benefit_type: 'مالية' | 'غذائية' | 'عينية';
    amount: number;
    description: string;
  }) {
    const amount_words = convertToArabicWords(data.amount);
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    
    // Fetch branch code for the receipt number
    const { data: branchData } = await supabase
      .from('branches')
      .select('code')
      .eq('id', data.branch_id)
      .single();
      
    const branch_code = branchData?.code || 'MSL';

    // 1. Generate Receipt Number via RPC
    const { data: receiptNum, error: rpcError } = await supabase.rpc(
      'generate_receipt_number',
      { p_year: year, p_branch_code: branch_code }
    );

    if (rpcError) throw rpcError;

    // 2. Insert into database
    const { data: receipt, error } = await supabase
      .from('benefit_receipts')
      .insert({
        receipt_number: receiptNum,
        family_id: data.family_id,
        branch_id: data.branch_id,
        benefit_type: data.benefit_type,
        amount: data.amount,
        amount_words: amount_words,
        description: data.description,
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;
    return receipt as BenefitReceipt;
  },

  // Get receipts for a specific family
  async getReceiptsByFamily(familyId: string) {
    const { data, error } = await supabase
      .from('benefit_receipts')
      .select(`
        *,
        creator:created_by (full_name),
        signer:signed_by (full_name),
        deliverer:delivered_by (full_name)
      `)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all receipts (filtered by RLS automatically)
  async getReceipts() {
    const { data, error } = await supabase
      .from('benefit_receipts')
      .select(`
        *,
        family:families(target_person_name, file_number),
        creator:created_by (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update status (sign, deliver, cancel)
  async updateReceiptStatus(id: string, status: 'signed' | 'delivered' | 'cancelled') {
    const updateData: any = { status };
    
    const { data, error } = await supabase
      .from('benefit_receipts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
