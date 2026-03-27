import { supabase } from '../../lib/supabase';
import type { ExternalRegisterPayload } from '../../lib/auth';
import { registerExternal } from '../../lib/auth';

export async function register(formData: ExternalRegisterPayload) {
    return registerExternal('beneficiary', formData);
}

export async function getMyStatus() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { data: null, error: new Error('غير مسجل') };
    const { data, error } = await supabase.from('external_users').select('status,full_name').eq('auth_id', auth.user.id).maybeSingle();
    return { data, error };
}

/** نوع المساعدة + التاريخ + الوصف فقط — بدون مبالغ ولا عائلات أخرى */
export async function getMyBenefits() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { data: [], error: new Error('غير مسجل') };
    const { data: ext } = await supabase.from('external_users').select('id').eq('auth_id', auth.user.id).maybeSingle();
    if (!ext) return { data: [], error: null };
    const { data: bp } = await supabase.from('beneficiary_portal').select('family_id').eq('external_user_id', (ext as { id: string }).id).maybeSingle();
    const fid = (bp as { family_id?: string } | null)?.family_id;
    if (!fid) return { data: [], error: null };
    const { data, error } = await supabase
        .from('family_benefits')
        .select('benefit_type,benefit_date,description')
        .eq('family_id', fid)
        .order('benefit_date', { ascending: false });
    return { data: data ?? [], error };
}

export async function submitRequest(payload: Record<string, unknown>) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { error: new Error('غير مسجل') };
    const { data: ext } = await supabase.from('external_users').select('id').eq('auth_id', auth.user.id).maybeSingle();
    const rid = (ext as { id?: string } | null)?.id;
    if (!rid) return { error: new Error('لا يوجد ملف') };
    return supabase.from('portal_requests').insert({ ...payload, requester_id: rid });
}

export async function getMyRequests() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { data: [], error: new Error('غير مسجل') };
    const { data: ext } = await supabase.from('external_users').select('id').eq('auth_id', auth.user.id).maybeSingle();
    const rid = (ext as { id?: string } | null)?.id;
    if (!rid) return { data: [], error: null };
    const { data, error } = await supabase.from('portal_requests').select('*').eq('requester_id', rid).order('created_at', { ascending: false });
    return { data: data ?? [], error };
}
