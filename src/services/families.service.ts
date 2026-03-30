import { supabase } from '../lib/supabase';
import type { Family } from '../types';
import { authService } from './auth.service';

const logService = (action: string, data?: any) => {
    console.log(`[FamiliesService] ${action}:`, data);
};

type FamilyRow = Record<string, unknown>;

function mapFamily(r: FamilyRow): Family {
    return {
        id: String(r.id),
        registrationNumber: String(r.registration_number),
        familyName: String(r.family_name),
        nationalId: r.national_id ? String(r.national_id) : undefined,
        phone: String(r.phone),
        address: String(r.address),
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

export async function getAll(filters?: { status?: string; branch_id?: string }) {
    let q = supabase.from('families').select('*').eq('is_deleted', false);
    if (filters?.status) q = q.eq('status', filters.status);
    if (filters?.branch_id) q = q.eq('branch_id', filters.branch_id);
    const { data, error } = await q.order('created_at', { ascending: false });
    return { data: (data as FamilyRow[] | null)?.map(mapFamily) ?? [], error };
}

export async function getById(id: string) {
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
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    const { data: profile } = await supabase.from('user_profiles').select('branch_id').eq('id', uid ?? '').maybeSingle();
    const row = {
        ...data,
        registered_by: uid,
        branch_id: data.branch_id ?? (profile as { branch_id?: string } | null)?.branch_id ?? null,
    };
    const { data: inserted, error } = await supabase.from('families').insert(row).select('*').single();
    return { data: inserted ? mapFamily(inserted as FamilyRow) : null, error };
}

export async function update(id: string, patch: Partial<FamilyRow>) {
    const { data, error } = await supabase
        .from('families')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();
    return { data: data ? mapFamily(data as FamilyRow) : null, error };
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
        
        if (error) logService('RPC fetching error', error);
        else logService('RPC benefits fetched successfully', data?.length);
        
        return { data: data || [], error };
    }

    // Standard query for internal users (subject to RLS)
    const { data, error } = await supabase
        .from('family_benefits')
        .select('*')
        .eq('family_id', familyId)
        .order('benefit_date', { ascending: false });
    
    if (error) logService('Error fetching benefits', error);
    else logService('Benefits fetched successfully', data?.length);
    
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
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user?.id;
        
        // 1. Get family info for transaction description
        const { data: family } = await supabase.from('families').select('family_name, branch_id').eq('id', familyId).single();
        
        // 2. Insert Benefit
        const { data: benefitData, error: benefitError } = await supabase
            .from('family_benefits')
            .insert({ 
                ...benefit, 
                family_id: familyId,
                approved_by: uid,
                branch_id: family?.branch_id
            })
            .select('*')
            .single();

        if (benefitError) throw benefitError;

        // 3. Insert Transaction if amount exists
        if (benefit.amount && benefit.amount > 0) {
            const { error: transError } = await supabase
                .from('transactions')
                .insert({
                    transaction_type: 'expense',
                    category: 'مساعدات اجتماعية',
                    amount: benefit.amount,
                    description: `مساعدة عائلية (${benefit.benefit_type}): ${family?.family_name}`,
                    transaction_date: benefit.benefit_date,
                    family_id: familyId,
                    occasion_id: benefit.occasion_id,
                    branch_id: family?.branch_id,
                    created_by: uid,
                    approved_by: uid
                });
            
            if (transError) {
                console.error('Failed to create transaction for benefit:', transError);
                // We don't rollback since we don't have DB transactions here, but we log it
            }
        }

        // 4. Log Audit Action
        logService('Logging audit action for benefit', benefitData.id);
        await authService.logAuditAction('create', 'family_benefits', benefitData.id, { 
            family_id: familyId, 
            type: benefit.benefit_type,
            amount: benefit.amount 
        });

        return { data: benefitData, error: null };
    }
};
