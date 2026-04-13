import { supabase } from '../../lib/supabase';
import type { ExternalRegisterPayload } from '../../lib/auth';
import { registerExternal } from '../../lib/auth';

export async function register(formData: ExternalRegisterPayload) {
    return registerExternal({ ...formData, role: 'donor' });
}

export async function getMyProfile() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { data: null, error: new Error('not signed in') };
    const { data: ext } = await supabase.from('external_users').select('id').eq('auth_id', auth.user.id).maybeSingle();
    if (!ext) return { data: null, error: new Error('no profile') };
    const { data, error } = await supabase.from('donor_profiles').select('*').eq('external_user_id', (ext as { id: string }).id).maybeSingle();
    return { data, error };
}

/** سجل تواريخ التبرع من ملف المتبرع — بدون مبالغ في الاستعلام */
export async function getMyDonations() {
    const { data: prof, error } = await getMyProfile();
    if (!prof) return { data: [], error };
    const p = prof as { last_donation_date?: string; id?: string };
    const rows: { id: string; donation_date: string | null; occasion_id: null }[] = [];
    if (p.last_donation_date) {
        rows.push({ id: 'last', donation_date: p.last_donation_date, occasion_id: null });
    }
    return { data: rows, error };
}

export async function getMyImpact() {
    const { data: prof } = await getMyProfile();
    const row = prof as { donations_count?: number } | null;
    const donationsCount = row?.donations_count ?? 0;
    return {
        families_helped: Math.min(donationsCount * 2, 500),
        activities_supported: Math.min(donationsCount, 80),
    };
}

export async function toggleHonorWall(show: boolean) {
    const { data: prof } = await getMyProfile();
    const id = (prof as { id?: string } | null)?.id;
    if (!id) return { error: new Error('no profile') };
    return supabase.from('donor_profiles').update({ show_in_honor_wall: show }).eq('id', id);
}

export async function updateDonorTier(donorId: string) {
    const { data } = await supabase.from('donor_profiles').select('donations_count').eq('id', donorId).single();
    const n = Number((data as { donations_count?: number } | null)?.donations_count ?? 0);
    let tier = 'supporter';
    if (n >= 20) tier = 'patron';
    else if (n >= 10) tier = 'champion';
    else if (n >= 5) tier = 'partner';
    else if (n >= 3) tier = 'friend';
    return supabase.from('donor_profiles').update({ donor_tier: tier }).eq('id', donorId);
}
