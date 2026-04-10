import { supabase } from '../lib/supabase';

export async function getTransactions(filters?: { year?: number; branch_id?: string; type?: string; is_wilaya_level?: boolean }) {
    try {
        // HARDENED: Filterable Pure RPC call (v3 handles year/branch more flexibly)
        const { data, error } = await supabase.rpc('get_financial_transactions_v3', {
            p_year: filters?.year || null,
            p_branch_id: filters?.branch_id || null,
            p_type: filters?.type || null,
            p_is_wilaya_level: filters?.is_wilaya_level ?? null
        });
        
        if (error) {
            console.error("Fetch Transactions RPC Error Details:", error);
            throw error;
        }
        return { data: data || [], error: null };
    } catch (err: any) {
        console.error("Fetch Transactions Exception:", err);
        return { data: [], error: err };
    }
}

export async function createTransaction(row: Record<string, unknown>) {
    try {
        // HARDENED: Use specific V3 RPC for transaction submission to bypass RLS securely
        const { data, error } = await supabase.rpc('submit_financial_transaction_v3', {
            p_data: row
        });
        
        if (error) {
            console.error("Create Transaction RPC Error Details:", error);
            throw error;
        }
        return { data, error: null };
    } catch (err: any) {
        console.error("Create Transaction Exception:", err);
        return { data: null, error: err };
    }
}

export async function getSummary(year: number, branch_id?: string) {
    try {
        // HARDENED: Server-side Finance Summary (Atomic/Secure)
        const { data, error } = await supabase.rpc('get_finance_summary_v2', {
            p_year: year,
            p_branch_id: branch_id || null
        });
        
        if (error) throw error;
        return { 
            income_total: data.income_total, 
            expense_total: data.expense_total, 
            balance: data.balance, 
            error: null 
        };
    } catch (err: any) {
        console.error("Finance Summary RPC Error:", err);
        return { income_total: 0, expense_total: 0, balance: 0, error: err };
    }
}

export async function getGlobalSummary() {
    return getSummary(new Date().getFullYear()); // Use current year for global dashboard context
}

export async function getByBranch(branchId: string, year: number) {
    return getTransactions({ year, branch_id: branchId });
}

export async function getWilayaLevel(year: number) {
    return getTransactions({ year, is_wilaya_level: true });
}
