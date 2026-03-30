import { supabase } from '../lib/supabase';

export async function getTransactions(filters?: { year?: number; branch_id?: string; type?: string }) {
    let q = supabase.from('transactions').select('*').eq('is_deleted', false);
    if (filters?.year) {
        const y = filters.year;
        q = q.gte('transaction_date', `${y}-01-01`).lte('transaction_date', `${y}-12-31`);
    }
    if (filters?.branch_id) q = q.eq('branch_id', filters.branch_id);
    if (filters?.type) q = q.eq('transaction_type', filters.type);
    const { data, error } = await q.order('transaction_date', { ascending: false });
    return { data, error };
}

export async function createTransaction(row: Record<string, unknown>) {
    const { data: auth } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from('transactions')
        .insert({ ...row, created_by: auth.user?.id })
        .select('*')
        .single();
    return { data, error };
}

export async function getSummary(year: number, branch_id?: string) {
    const { data, error } = await getTransactions({ year, branch_id });
    if (error || !data) return { income_total: 0, expense_total: 0, balance: 0, error };
    let income = 0;
    let expense = 0;
    for (const t of data as { transaction_type: string; amount: string | number }[]) {
        const a = Number(t.amount);
        if (t.transaction_type === 'income') income += a;
        else expense += a;
    }
    return { income_total: income, expense_total: expense, balance: income - expense, error: null };
}

export async function getGlobalSummary() {
    const { data, error } = await supabase
        .from('transactions')
        .select('amount, transaction_type')
        .eq('is_deleted', false);
    
    if (error || !data) return { balance: 0, error };
    
    const income = (data as any[]).filter(t => t.transaction_type === 'income').reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    const expense = (data as any[]).filter(t => t.transaction_type === 'expense').reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    
    return { balance: income - expense, error: null };
}

export async function getByBranch(branchId: string, year: number) {
    return getTransactions({ year, branch_id: branchId });
}

export async function getWilayaLevel(year: number) {
    let q = supabase
        .from('transactions')
        .select('*')
        .eq('is_deleted', false)
        .eq('is_wilaya_level', true)
        .gte('transaction_date', `${year}-01-01`)
        .lte('transaction_date', `${year}-12-31`);
    const { data, error } = await q;
    return { data, error };
}
