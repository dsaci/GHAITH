import { supabase } from '../lib/supabase';

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
    } catch (err: any) {
        console.error("getTransactions error:", err);
        return { data: [], error: err };
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

        // The atomic function returns {success, transaction_id, new_balance, message}
        if (data && !data.success) {
            throw new Error(data.message);
        }

        return { data, error: null };
    } catch (err: any) {
        console.error("createTransaction error:", err);
        throw err;
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
    } catch (err: any) {
        console.error("getSummary error:", err);
        return { income_total: 0, expense_total: 0, balance: 0, error: err };
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
    } catch (err: any) {
        console.error("getFinancialDashboard error:", err);
        return { data: [], error: err };
    }
}
