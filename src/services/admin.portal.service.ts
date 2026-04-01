import { supabase } from '../lib/supabase';

export interface PortalRequestView {
    id: string;
    family_id: string;
    requester_name: string;
    registration_number: string;
    requester_phone: string;
    municipality_name: string;
    request_type: string;
    description: string;
    urgency_level: string;
    status: string;
    reviewer_notes?: string;
    request_date: string;
    decision_date?: string;
    reviewer_name?: string;
}

export const fetchPendingRegistrations = async () => {
    try {
        const { data, error } = await supabase.rpc('get_pending_registrations_v2');
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Failed to fetch pending registrations:", err);
        return [];
    }
};

// Deprecated: migrate callers to fetchPendingRegistrations
export async function getPendingRegistrations() {
    return { data: await fetchPendingRegistrations(), error: null };
}

// --- Beneficiary Requests Management (Hardened Pure RPC) ---

export async function getPortalRequests(filters?: { status?: string; municipality?: string }) {
    try {
        const { data, error } = await supabase.rpc('get_portal_requests_refined', {
            p_status: filters?.status || null,
            p_municipality: filters?.municipality || null,
            p_limit: 50,
            p_offset: 0
        });
        
        if (error) throw error;
        return { data: (data as PortalRequestView[]) || [], error: null };
    } catch (err: any) {
        console.error("Portal RPC Error:", err);
        return { data: [], error: err };
    }
}

export async function updateRequestStatus(params: {
    requestId: string;
    status: 'approved' | 'rejected' | 'under_review' | 'fulfilled';
    notes?: string;
    reviewerId: string;
    familyId: string; 
}) {
    try {
        const { error } = await supabase.rpc('update_portal_request_atomic', {
            p_request_id: params.requestId,
            p_status: params.status,
            p_notes: params.notes || null,
            p_reviewer_id: params.reviewerId,
            p_family_id: params.familyId
        });
        return { error };
    } catch (err: any) {
        console.error("Update Request RPC Error:", err);
        return { error: err };
    }
}

// --- Legacy Functions Hardened ---

export async function approveUser(externalUserId: string, approvedBy: string) {
    const { error } = await supabase.rpc('approve_external_user', {
        p_user_id: externalUserId,
        p_admin_id: approvedBy
    });
    return { error };
}

export async function rejectUser(externalUserId: string, reason: string, rejectedBy: string) {
    const { error } = await supabase.rpc('reject_external_user', {
        p_user_id: externalUserId,
        p_reason: reason,
        p_admin_id: rejectedBy
    });
    return { error };
}

export async function linkBeneficiary(externalUserId: string, familyId: string, linkedBy: string) {
    try {
        const { error } = await supabase.rpc('link_beneficiary_v2', {
            p_external_user_id: externalUserId,
            p_family_id: familyId,
            p_linked_by: linkedBy
        });
        return { error };
    } catch (err: any) {
        console.error("Link Beneficiary RPC Error:", err);
        return { error: err };
    }
}



export async function submitPublicVolunteerRequest(form: {
    full_name: string;
    phone: string;
    birth_date: string;
    birth_place: string;
    municipality_name: string;
    profession: string;
    specialization: string;
    education_level: string;
    reason: string;
}) {
    // Sanitize inputs
    const sanitizedForm = {
        p_full_name: form.full_name?.trim(),
        p_phone: form.phone?.trim(),
        p_birth_date: form.birth_date || null,
        p_birth_place: form.birth_place?.trim() || null,
        p_municipality_name: form.municipality_name,
        p_occupation: form.profession?.trim() || null,
        p_specialization: form.specialization?.trim() || null,
        p_education_level: form.education_level || null,
        p_reason: form.reason?.trim() || null
    };

    const { error } = await supabase.rpc('submit_public_volunteer', sanitizedForm);

    if (error) {
        console.error('RPC Error (Volunteer):', error);
        return { error };
    }
    return { error: null };
}

export async function submitPublicHelpRequest(form: {
    full_name: string;
    phone: string;
    municipality_name: string;
    aid_type: string;
    description: string;
}) {
    const sanitizedForm = {
        p_full_name: form.full_name?.trim(),
        p_phone: form.phone?.trim(),
        p_municipality_name: form.municipality_name,
        p_aid_type: form.aid_type,
        p_description: form.description?.trim()
    };

    const { error } = await supabase.rpc('submit_public_help_request', sanitizedForm);

    if (error) {
        console.error('RPC Error (Help Request):', error);
        return { error };
    }
    return { error: null };
}
