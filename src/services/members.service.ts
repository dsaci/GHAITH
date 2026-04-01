import { supabase } from '../lib/supabase';

export async function getAll(filters?: { branch_id?: string; status?: string }) {
    try {
        // HARDENED: Paginated/Filtered Pure RPC call
        const { data, error } = await supabase.rpc('get_members_v2', {
            p_status: filters?.status || null,
            p_branch_id: filters?.branch_id || null
        });
        
        if (error) throw error;
        return { data: data || [], error: null };
    } catch (err: any) {
        console.error("Fetch Members RPC Error:", err);
        return { data: [], error: err };
    }
}

export async function create() {
    // Member creation via RPC logic (Refinement Pending)
    return { data: null, error: new Error('يرجى الاتصال بمسؤول النظام لإضافة عضو جديد') };
}

export async function update(id: string, patch: Record<string, unknown>) {
    try {
        const { data, error } = await supabase.rpc('manage_member_v2', {
            p_id: id,
            p_role_in_association: patch.role_in_association as string || null,
            p_status: patch.status as string || null,
            p_is_deleted: patch.is_deleted as boolean || null
        });
        return { data, error };
    } catch (err: any) {
        return { data: null, error: err };
    }
}

export async function getByBranch(branchId: string) {
    return getAll({ branch_id: branchId });
}
