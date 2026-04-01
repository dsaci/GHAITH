import { supabase } from '../lib/supabase';
import type { Family } from '../types';

const logService = (action: string, data?: any) => {
    console.log(`[FamiliesService] ${action}:`, data);
};

type FamilyRow = Record<string, unknown>;

function mapFamily(r: FamilyRow): Family {
    return {
        id: String(r.id),
        registrationNumber: String(r.registration_number || ''),
        familyName: String(r.family_name || ''),
        nationalId: r.national_id ? String(r.national_id) : undefined,
        phone: String(r.phone || ''),
        address: String(r.address || ''),
        municipalityId: r.municipality_id ? String(r.municipality_id) : '',
        municipalityName: '',
        category: r.category as Family['category'],
        membersCount: Number(r.members_count ?? 1),
        incomeLevel: (r.income_level as Family['incomeLevel']) || 'none',
        monthlyIncome: r.monthly_income != null ? Number(r.monthly_income) : undefined,
        housingStatus: (r.housing_status as Family['housingStatus']) || 'other',
        hasSocialCoverage: Boolean(r.has_social_coverage),
        notes: r.notes ? String(r.notes) : undefined,
        registrationDate: String(r.registration_date ?? ''),
        registeredBy: r.registered_by ? String(r.registered_by) : '',
        branchId: r.branch_id ? String(r.branch_id) : undefined,
        status: (r.status as Family['status']) || 'active',
        is_deleted: Boolean(r.is_deleted),
        createdAt: String(r.created_at ?? ''),
        updatedAt: String(r.updated_at ?? ''),
    };
}

export async function getAll(filters?: { status?: string; branch_id?: string; search?: string }) {
    try {
        // HARDENED: Paginated/Filtered Pure RPC call
        const { data, error } = await supabase.rpc('get_families_v2', {
            p_status: filters?.status || null,
            p_branch_id: filters?.branch_id || null,
            p_search: filters?.search || null,
            p_limit: 100,
            p_offset: 0
        });
        
        if (error) throw error;
        return { data: (data as FamilyRow[] | null)?.map(mapFamily) ?? [], error: null };
    } catch (err: any) {
        console.error("Fetch Families RPC Error:", err);
        return { data: [], error: err };
    }
}

export async function getById(id: string) {
    // Note: We'll keep this simple for now but using .rpc() is better for Pure RPC consistency
    const { data, error } = await supabase.from('families').select('*').eq('id', id).maybeSingle();
    return { data: data ? mapFamily(data as FamilyRow) : null, error };
}

export async function create(
    data: Partial<FamilyRow> & {
        family_name: string;
        registration_number: string;
        phone: string;
        address: string;
        category: string;
    }
) {
    try {
        const { data: res, error } = await supabase.rpc('manage_family_v2', {
            p_id: null,
            p_data: data
        });
        if (error) throw error;
        return { data: res, error: null };
    } catch (err: any) {
        return { data: null, error: err };
    }
}

export async function update(id: string, patch: Partial<FamilyRow>) {
    try {
        const { data, error } = await supabase.rpc('manage_family_v2', {
            p_id: id,
            p_data: patch
        });
        if (error) throw error;
        return { data, error: null };
    } catch (err: any) {
        return { data: null, error: err };
    }
}

export async function softDelete(id: string) {
    return update(id, { is_deleted: true } as Partial<FamilyRow>);
}

export async function getBenefits(familyId: string, regNo?: string) {
    logService('Fetching benefits for family', { familyId, isBeneficiary: !!regNo });
    
    if (regNo) {
        // Use custom RPC for beneficiary portal (bypasses RLS safely)
        const { data, error } = await supabase.rpc('get_beneficiary_benefits', { 
            p_family_id: familyId, 
            p_reg_no: regNo 
        });
        return { data: data || [], error };
    }

    // Standard query for internal users
    const { data, error } = await supabase
        .from('family_benefits')
        .select('*')
        .eq('family_id', familyId)
        .order('benefit_date', { ascending: false });
    
    return { data, error };
}

export async function addBenefit(familyId: string, benefit: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('family_benefits')
        .insert({ ...benefit, family_id: familyId })
        .select('*')
        .single();
    return { data, error };
}

export const familiesService = {
    getAll,
    getById,
    create,
    update,
    softDelete,
    getBenefits,
    addBenefit,
    
    async addBenefitWithTransaction(familyId: string, benefit: {
        family_id: string;
        benefit_type: string;
        amount?: number;
        description?: string;
        benefit_date: string;
        occasion_id?: string;
        notes?: string;
    }) {
        try {
            // HARDENED: Atomic Pure RPC call (Internal Production Mandate)
            const { data, error } = await supabase.rpc('record_family_benefit_atomic_v2', {
                p_family_id: familyId,
                p_benefit_type: benefit.benefit_type,
                p_amount: benefit.amount || 0,
                p_description: benefit.description || null,
                p_benefit_date: benefit.benefit_date,
                p_occasion_id: benefit.occasion_id || null,
                p_notes: benefit.notes || null
            });

            if (error) throw error;
            return { data, error: null };
        } catch (err: any) {
            console.error("Atomic Benefit RPC Error:", err);
            return { data: null, error: err };
        }
    }
};
