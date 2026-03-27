import { supabase } from '../lib/supabase';
import type { Family } from '../types';

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

export async function getBenefits(familyId: string) {
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
