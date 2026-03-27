import { supabase } from '../lib/supabase';

export async function getPendingRegistrations() {
    const { data, error } = await supabase.from('external_users').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    return { data: data ?? [], error };
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
