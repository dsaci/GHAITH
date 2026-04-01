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

// --- Beneficiary Requests Management ---

export async function getPortalRequests(filters?: { status?: string; municipality?: string }) {
    let q = supabase.from('view_portal_requests').select('*');

    if (filters?.status) q = q.eq('status', filters.status);
    if (filters?.municipality) q = q.eq('municipality_name', filters.municipality);

    const { data, error } = await q.order('request_date', { ascending: false });
    return { data: (data as PortalRequestView[]) || [], error };
}

export async function updateRequestStatus(params: {
    requestId: string;
    status: 'approved' | 'rejected' | 'under_review' | 'fulfilled';
    notes?: string;
    reviewerId: string;
    familyId: string; // Used for notification
}) {
    const { error: updateErr } = await supabase
        .from('portal_requests')
        .update({
            status: params.status,
            internal_notes: params.notes,
            reviewed_by: params.reviewerId,
            reviewed_at: new Date().toISOString()
        })
        .eq('id', params.requestId);

    if (updateErr) return { error: updateErr };

    // Send notification to beneficiary
    const statusLabels: Record<string, string> = {
        approved: 'مقبول ✅',
        rejected: 'مرفوض ❌',
        under_review: 'قيد المراجعة ⏳',
        fulfilled: 'تم التنفيذ 🎉'
    };

    await supabase.from('notifications').insert({
        recipient_type: 'beneficiary',
        recipient_id: params.familyId,
        title: `تحديث لطلب المساعدة: ${statusLabels[params.status]}`,
        message: params.notes || `تم تحديث حالة طلبك إلى: ${statusLabels[params.status]}`,
        type: params.status === 'rejected' ? 'rejection' : 'approval'
    });

    return { error: null };
}

// --- Legacy Functions ---

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
    const { data: existing } = await supabase.from('beneficiary_portal').select('id').eq('external_user_id', externalUserId).maybeSingle();
    const row = {
        external_user_id: externalUserId,
        family_id: familyId,
        linked_at: new Date().toISOString(),
        linked_by: linkedBy,
    };
    if (existing) {
        return supabase.from('beneficiary_portal').update(row).eq('external_user_id', externalUserId);
    }
    return supabase.from('beneficiary_portal').insert(row);
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
