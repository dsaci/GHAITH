import { supabase } from '../lib/supabase';
import type { Family } from '../types';

const logService = (action: string, data?: any) => {
    console.log(`[FamiliesService] ${action}:`, data);
};

type FamilyRow = Record<string, unknown>;

function mapFamily(r: any): Family {
    return {
        id: String(r.id),
        registrationNumber: String(r.registration_number || ''),
        familyName: String(r.family_name || ''),
        nationalId: r.national_id ? String(r.national_id) : undefined,
        phone: String(r.phone || ''),
        address: String(r.address || ''),
        municipalityId: r.municipality_id ? String(r.municipality_id) : '',
        municipalityName: r.municipality_name || '',
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

export const familiesService = {
    async getAll(filters?: { status?: string; branch_id?: string; search?: string }) {
        try {
            const { data, error } = await supabase.rpc('get_families_v2', {
                p_status: filters?.status || null,
                p_branch_id: filters?.branch_id || null,
                p_search: filters?.search || null,
                p_limit: 100,
                p_offset: 0
            });
            
            if (error) throw error;
            return { data: (data as any[] | null)?.map(mapFamily) ?? [], error: null };
        } catch (err: any) {
            console.error("Fetch Families RPC Error:", err);
            return { data: [], error: err };
        }
    },

    async getById(id: string) {
        try {
            const { data, error } = await supabase.rpc('get_family_by_id_v2', { p_id: id });
            if (error) throw error;
            return { data: data ? mapFamily(data) : null, error: null };
        } catch (err: any) {
            console.error("Fetch Family ID RPC Error:", err);
            return { data: null, error: err };
        }
    },

    async create(data: Partial<FamilyRow>) {
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
    },

    async update(id: string, patch: Partial<FamilyRow>) {
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
    },

    async softDelete(id: string) {
        return this.update(id, { is_deleted: true } as Partial<FamilyRow>);
    },

    async getBenefits(familyId: string, regNo?: string) {
        try {
            if (regNo) {
                const { data, error } = await supabase.rpc('get_beneficiary_benefits', { 
                    p_family_id: familyId, 
                    p_reg_no: regNo 
                });
                return { data: data || [], error };
            }

            const { data, error } = await supabase.rpc('get_family_benefits_v2', { 
                p_family_id: familyId 
            });
            
            if (error) throw error;
            
            // Map the field 'approved_by_name' to what client might expect if needed
            return { data: data || [], error: null };
        } catch (err: any) {
            console.error("Fetch Benefits RPC Error:", err);
            return { data: [], error: err };
        }
    },

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

// Also export the functions individually for backward compatibility if needed
export const getAll = familiesService.getAll;
export const getById = familiesService.getById;
export const create = familiesService.create;
export const update = familiesService.update;
export const softDelete = familiesService.softDelete;
export const getBenefits = familiesService.getBenefits;
