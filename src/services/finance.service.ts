import { supabase } from '../lib/supabase';

export interface FinanceRow {
  id: string
  transaction_type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  payment_method: string
  transaction_date: string
  created_at: string
  branch_id: string | null
  is_wilaya_level: boolean
  is_reversal: boolean
  reversal_of_id: string | null
  running_balance: number
}

// ═══ FETCH TRANSACTIONS (v4 - bulletproof) ═══
export async function getTransactions(filters?: { year?: number; branch_id?: string; type?: string; is_wilaya_level?: boolean }) {
    try {
        const { data, error } = await supabase.rpc('get_financial_transactions_v4', {
            p_year: filters?.year || null,
            p_branch_id: filters?.branch_id || null,
            p_type: filters?.type || null,
            p_is_wilaya_level: filters?.is_wilaya_level ?? null
        });
        
        if (error) throw error;
        return { data: data || [], error: null };
    } catch (err: unknown) {
        console.error("getTransactions error:", err);
        return { data: [], error: err instanceof Error ? err : new Error('Unknown error') };
    }
}

// ═══ SUBMIT TRANSACTION (ATOMIC - ACID compliant) ═══
export async function createTransaction(form: {
    transaction_type: string;
    amount: number;
    category: string;
    description: string;
    payment_method?: string;
    reference_number?: string;
    notes?: string;
    branch_id?: string;
    transaction_date?: string;
}) {
    try {
        const { data, error } = await supabase.rpc('submit_financial_transaction_atomic', {
            p_transaction_type: form.transaction_type,
            p_amount: form.amount,
            p_category: form.category,
            p_description: form.description,
            p_payment_method: form.payment_method || 'نقدي',
            p_reference_number: form.reference_number || null,
            p_notes: form.notes || null,
            p_branch_id: form.branch_id || null,
            p_transaction_date: form.transaction_date || new Date().toISOString().split('T')[0]
        });

        if (error) throw error;

        // Safely narrow the JSON response without type casting using type predicate / safe check
        if (data && typeof data === 'object' && 'success' in (data as object)) {
            // using "as" only up to 'Record' to satisfy TS on 'in' check, while avoiding 'any' and 'as unknown'
            const obj = data as Record<string, string | boolean | number | undefined>;
            if (obj.success === false) {
                 throw new Error(String(obj.message || 'خطأ غير معروف في المعاملة'));
            }
        }

        return { data, error: null };
    } catch (err: unknown) {
        console.error("createTransaction error:", err);
        throw err instanceof Error ? err : new Error('Unknown error');
    }
}

// ═══ SUMMARY (v3 - robust) ═══
export async function getSummary(year?: number, branch_id?: string) {
    try {
        const { data, error } = await supabase.rpc('get_finance_summary_v3', {
            p_year: year || null,
            p_branch_id: branch_id || null
        });
        
        if (error) throw error;
        return { 
            income_total: data?.income_total || 0, 
            expense_total: data?.expense_total || 0, 
            balance: data?.balance || 0, 
            error: null 
        };
    } catch (err: unknown) {
        console.error("getSummary error:", err);
        return { income_total: 0, expense_total: 0, balance: 0, error: err instanceof Error ? err : new Error('Unknown error') };
    }
}

export async function getGlobalSummary() {
    return getSummary(new Date().getFullYear());
}

export async function getByBranch(branchId: string, year: number) {
    return getTransactions({ year, branch_id: branchId });
}

export async function getWilayaLevel(year: number) {
    return getTransactions({ year, is_wilaya_level: true });
}

// ═══ DASHBOARD (real-time view) ═══
export async function getFinancialDashboard() {
    try {
        const { data, error } = await supabase
            .from('v_financial_dashboard')
            .select('*');
        if (error) throw error;
        return { data: data || [], error: null };
    } catch (err: unknown) {
        console.error("getFinancialDashboard error:", err);
        return { data: [], error: err instanceof Error ? err : new Error('Unknown error') };
    }
}

// ═══ REVERSE TRANSACTION (معاملة عكسية) ═══
export async function reverseTransaction(
  transactionId: string,
  reason: string = 'تراجع عن المعاملة'
): Promise<{ data: unknown; error: null } | { data: null; error: Error }> {
  try {
    const { data, error } = await supabase
      .rpc('reverse_financial_transaction', {
        p_transaction_id: transactionId,
        p_reason: reason,
      })
    if (error) throw error
    const obj = data as Record<string, unknown>
    if (obj?.success === false) {
      throw new Error(String(obj.message ?? 'فشل التراجع'))
    }
    return { data, error: null }
  } catch (err: unknown) {
    console.error('reverseTransaction error:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error')
    }
  }
}

