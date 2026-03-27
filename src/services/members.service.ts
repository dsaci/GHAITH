import { supabase } from '../lib/supabase';

export async function getAll(filters?: { branch_id?: string; status?: string }) {
    let q = supabase.from('members').select('*').eq('is_deleted', false);
    if (filters?.branch_id) q = q.eq('branch_id', filters.branch_id);
    if (filters?.status) q = q.eq('status', filters.status);
    const { data, error } = await q.order('created_at', { ascending: false });
    return { data, error };
}

export async function create(row: Record<string, unknown>) {
    const { data, error } = await supabase.from('members').insert(row).select('*').single();
    return { data, error };
}

export async function update(id: string, patch: Record<string, unknown>) {
    const { data, error } = await supabase.from('members').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
    return { data, error };
}

export async function getByBranch(branchId: string) {
    return getAll({ branch_id: branchId });
}
