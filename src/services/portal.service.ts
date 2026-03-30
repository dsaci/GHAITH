import { supabase } from '../lib/supabase';

export interface BeneficiaryProfile {
    id: string;
    registration_number: string;
    family_name: string;
    phone: string;
    address: string;
    category: string;
    members_count: number;
    status: string;
    municipality_name: string;
}

export interface PortalNotification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

export interface PortalRequest {
    id: string;
    request_type: string;
    description: string;
    status: string;
    urgency: string;
    internal_notes?: string;
    created_at: string;
}

export const portalService = {
    async getProfile(familyId: string, regNo: string) {
        const { data, error } = await supabase.rpc('get_beneficiary_profile', {
            p_family_id: familyId,
            p_reg_no: regNo
        });
        return { data: (data?.[0] as BeneficiaryProfile) || null, error };
    },

    async getNotifications(familyId: string, regNo: string) {
        const { data, error } = await supabase.rpc('get_beneficiary_notifications', {
            p_family_id: familyId,
            p_reg_no: regNo
        });
        return { data: (data as PortalNotification[]) || [], error };
    },

    async getRequests(familyId: string, regNo: string) {
        const { data, error } = await supabase.rpc('get_beneficiary_requests', {
            p_family_id: familyId,
            p_reg_no: regNo
        });
        return { data: (data as PortalRequest[]) || [], error };
    },

    async submitRequest(familyId: string, regNo: string, request: { type: string; description: string; urgency?: string }) {
        const { data: requestId, error } = await supabase.rpc('submit_beneficiary_request', {
            p_family_id: familyId,
            p_reg_no: regNo,
            p_request_type: request.type,
            p_description: request.description,
            p_urgency: request.urgency || 'medium'
        });
        return { data: requestId, error };
    }
};
