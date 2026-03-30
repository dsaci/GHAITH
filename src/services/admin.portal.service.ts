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

export async function getPendingRegistrations() {
    const { data, error } = await supabase
        .from('external_users')
        .select(`
            *,
            volunteers (
                occupation,
                specialization,
                education_level,
                areas_of_interest
            ),
            portal_requests (
                request_type,
                description,
                urgency
            )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    return { data: data ?? [], error };
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
    const { data: ext } = await supabase.from('external_users').select('portal_type').eq('id', externalUserId).single();
    const portal = (ext as { portal_type?: string } | null)?.portal_type;

    const { error: uErr } = await supabase
        .from('external_users')
        .update({
            status: 'active',
            approved_by: approvedBy,
            approved_at: new Date().toISOString(),
        })
        .eq('id', externalUserId);
    if (uErr) return { error: uErr };

    if (portal === 'volunteer') {
        const year = new Date().getFullYear();
        const num = await nextVolunteerNumber(year);
        await supabase.from('volunteers').update({ volunteer_number: num }).eq('external_user_id', externalUserId);
    }

    const { data: authRow } = await supabase.from('external_users').select('auth_id,portal_type').eq('id', externalUserId).single();
    const authId = (authRow as { auth_id?: string; portal_type?: string } | null)?.auth_id;
    const ptype = (authRow as { portal_type?: string } | null)?.portal_type ?? 'donor';
    if (authId) {
        await supabase.from('notifications').insert({
            recipient_type: ptype === 'volunteer' ? 'volunteer' : ptype === 'beneficiary' ? 'beneficiary' : 'donor',
            recipient_id: authId,
            title: 'تم قبول طلبك',
            message: 'يمكنك الآن تسجيل الدخول إلى البوابة.',
            type: 'approval',
        });
    }

    return { error: null };
}

async function nextVolunteerNumber(year: number): Promise<string> {
    const prefix = `GHV-${year}-`;
    const { data } = await supabase.from('volunteers').select('volunteer_number').not('volunteer_number', 'is', null);
    let max = 0;
    for (const row of (data as { volunteer_number?: string }[] | null) ?? []) {
        const n = row.volunteer_number?.replace(prefix, '') ?? '';
        const v = parseInt(n, 10);
        if (!Number.isNaN(v) && v > max) max = v;
    }
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

export async function rejectUser(externalUserId: string, reason: string, rejectedBy: string) {
    const { error } = await supabase
        .from('external_users')
        .update({
            status: 'rejected',
            rejection_reason: reason,
            approved_by: rejectedBy,
        })
        .eq('id', externalUserId);
    if (error) return { error };

    const { data: authRow } = await supabase.from('external_users').select('auth_id,portal_type').eq('id', externalUserId).single();
    const authId = (authRow as { auth_id?: string } | null)?.auth_id;
    const ptype = (authRow as { portal_type?: string } | null)?.portal_type ?? 'donor';
    if (authId) {
        await supabase.from('notifications').insert({
            recipient_type: ptype === 'volunteer' ? 'volunteer' : ptype === 'beneficiary' ? 'beneficiary' : 'donor',
            recipient_id: authId,
            title: 'تم رفض الطلب',
            message: reason,
            type: 'rejection',
        });
    }

    return { error: null };
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
