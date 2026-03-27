import { supabase } from '../../lib/supabase';
import type { ExternalRegisterPayload } from '../../lib/auth';
import { registerExternal } from '../../lib/auth';

export async function register(formData: ExternalRegisterPayload) {
    return registerExternal('volunteer', formData);
}

export async function getMyProfile() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { data: null, error: new Error('not signed in') };
    const { data: ext } = await supabase.from('external_users').select('id').eq('auth_id', auth.user.id).maybeSingle();
    if (!ext) return { data: null, error: new Error('no profile') };
    const { data, error } = await supabase.from('volunteers').select('*').eq('external_user_id', (ext as { id: string }).id).maybeSingle();
    return { data, error };
}

export async function getMyLogs() {
    const { data: prof, error: e1 } = await getMyProfile();
    if (e1 || !prof) return { data: [], error: e1 };
    const vid = (prof as { id: string }).id;
    const { data, error } = await supabase.from('volunteer_logs').select('*').eq('volunteer_id', vid).order('participation_date', { ascending: false });
    return { data: data ?? [], error };
}

export async function getMyStats() {
    const { data: prof } = await getMyProfile();
    const row = prof as { total_hours?: number; id?: string; badge_level?: string } | null;
    if (!row?.id) return { total_hours: 0, activities_count: 0, badge_level: 'new' as const };
    const { data: logs } = await supabase.from('volunteer_logs').select('id').eq('volunteer_id', row.id);
    return {
        total_hours: Number(row.total_hours ?? 0),
        activities_count: logs?.length ?? 0,
        badge_level: (row.badge_level as 'new') || 'new',
    };
}

export async function logParticipation(occasionId: string, hours: number) {
    const { data: prof } = await getMyProfile();
    const vid = (prof as { id?: string } | null)?.id;
    if (!vid) return { error: new Error('no volunteer row') };
    return supabase.from('volunteer_logs').insert({
        volunteer_id: vid,
        occasion_id: occasionId,
        hours_contributed: hours,
        participation_date: new Date().toISOString().slice(0, 10),
    });
}

export async function updateBadge(volunteerId: string) {
    const { data: v } = await supabase.from('volunteers').select('total_hours').eq('id', volunteerId).single();
    const h = Number((v as { total_hours?: number } | null)?.total_hours ?? 0);
    let badge = 'new';
    if (h >= 200) badge = 'champion';
    else if (h >= 100) badge = 'gold';
    else if (h >= 50) badge = 'silver';
    else if (h >= 10) badge = 'bronze';
    return supabase.from('volunteers').update({ badge_level: badge }).eq('id', volunteerId);
}

export async function generateCertificate(volunteerId: string): Promise<Blob> {
    const { data } = await supabase.from('volunteers').select('volunteer_number,total_hours').eq('id', volunteerId).single();
    const d = data as { volunteer_number?: string; total_hours?: number } | null;
    const html = `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>Certificate</title></head><body style="font-family:sans-serif;text-align:center;padding:2rem"><h1>Certificate</h1><p>ID: ${d?.volunteer_number ?? volunteerId}</p><p>Hours: ${d?.total_hours ?? 0}</p></body></html>`;
    return new Blob([html], { type: 'text/html;charset=utf-8' });
}
