import { supabase, isSupabaseConfigured } from './supabase';
import type { User, ExternalSession, PortalType, ExternalUserStatus } from '../types';
import { normalizeUserRole } from '../types';
import { useAuthStore } from '../store/authStore';
import { loginUser, logoutUser } from '../data/mockData';

type InternalProfileRow = {
    id: string;
    full_name: string;
    phone: string | null;
    role: string;
    branch_id: string | null;
    is_active: boolean | null;
};

type ExternalUserRow = {
    id: string;
    auth_id: string | null;
    portal_type: PortalType;
    status: string;
    full_name: string;
};

function rowToUser(sessionEmail: string, row: InternalProfileRow, usernameHint?: string): User {
    const role = normalizeUserRole(row.role);
    return {
        id: row.id,
        fullName: row.full_name,
        username: usernameHint || sessionEmail.split('@')[0] || row.id.slice(0, 8),
        email: sessionEmail,
        phone: row.phone || '',
        role,
        branchId: row.branch_id || undefined,
        isActive: row.is_active !== false,
    };
}

export function getPostInternalLoginPath(role: string): string {
    const r = normalizeUserRole(role);
    return r === 'branch_president' ? '/branch/dashboard' : '/dashboard';
}

export async function loginInternal(
    emailOrUsername: string,
    password: string
): Promise<{ ok: boolean; user?: User; redirect?: string; error?: string }> {
    if (!isSupabaseConfigured) {
        const u = loginUser(emailOrUsername, password);
        if (!u) return { ok: false, error: 'بيانات الدخول غير صحيحة' };
        useAuthStore.getState().setInternalUser(u);
        return { ok: true, user: u, redirect: getPostInternalLoginPath(u.role) };
    }

    const email = emailOrUsername.includes('@')
        ? emailOrUsername
        : `${emailOrUsername}@ghaith.dz`;

    const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (authErr || !auth.user) {
        return { ok: false, error: authErr?.message || 'فشل تسجيل الدخول' };
    }

    const { data: profile, error: pErr } = await supabase
        .from('user_profiles')
        .select('id,full_name,phone,role,branch_id,is_active')
        .eq('id', auth.user.id)
        .maybeSingle();

    if (pErr || !profile) {
        await supabase.auth.signOut();
        return { ok: false, error: 'لم يُعثر على ملف المستخدم الداخلي' };
    }

    const user = rowToUser(auth.user.email || email, profile as InternalProfileRow, emailOrUsername);
    useAuthStore.getState().setInternalUser(user);
    localStorage.setItem('ghaith_user', JSON.stringify(user));

    return { ok: true, user, redirect: getPostInternalLoginPath(user.role) };
}

export async function loginExternal(
    email: string,
    password: string
): Promise<{ ok: boolean; redirect?: string; error?: string }> {
    if (!isSupabaseConfigured) {
        return { ok: false, error: 'تسجيل البوابة الخارجية يتطلب إعداد Supabase' };
    }

    const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr || !auth.user) {
        return { ok: false, error: authErr?.message || 'فشل تسجيل الدخول' };
    }

    const { data: ext, error: eErr } = await supabase
        .from('external_users')
        .select('id,auth_id,portal_type,status,full_name')
        .eq('auth_id', auth.user.id)
        .maybeSingle();

    if (eErr || !ext) {
        await supabase.auth.signOut();
        return { ok: false, error: 'حساب غير مرتبط بالبوابة الخارجية' };
    }

    const row = ext as ExternalUserRow;
    useAuthStore.getState().setExternalSession({
        authId: row.auth_id!,
        externalUserId: row.id,
        portalType: row.portal_type,
        status: row.status as ExternalSession['status'],
        fullName: row.full_name,
    });

    if (row.status === 'pending') return { ok: true, redirect: '/portal/pending' };
    if (row.status === 'rejected') return { ok: true, redirect: '/portal/rejected' };
    if (row.status === 'active') {
        return { ok: true, redirect: `/portal/${row.portal_type}/dashboard` };
    }
    return { ok: true, redirect: '/portal/login' };
}

export interface ExternalRegisterPayload {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    national_id?: string;
    address?: string;
    municipality_id?: string;
    birth_date?: string;
    gender?: string;
    registration_number?: string;
}

export async function registerExternal(
    portalType: PortalType,
    form: ExternalRegisterPayload
): Promise<{ ok: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
        return { ok: false, error: 'التسجيل يتطلب إعداد Supabase' };
    }

    const { data: signUp, error: signErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
    });
    if (signErr || !signUp.user) {
        return { ok: false, error: signErr?.message || 'فشل إنشاء الحساب' };
    }

    const authId = signUp.user.id;

    const { data: extRow, error: insExtErr } = await supabase
        .from('external_users')
        .insert({
            auth_id: authId,
            portal_type: portalType,
            full_name: form.full_name,
            phone: form.phone,
            email: form.email,
            national_id: form.national_id ?? null,
            address: form.address ?? null,
            municipality_id: form.municipality_id ?? null,
            birth_date: form.birth_date ?? null,
            gender: form.gender ?? null,
            status: 'pending',
        })
        .select('id')
        .single();

    if (insExtErr || !extRow) {
        return { ok: false, error: insExtErr?.message || 'فشل حفظ ملف البوابة' };
    }

    const externalUserId = (extRow as { id: string }).id;

    if (portalType === 'volunteer') {
        await supabase.from('volunteers').insert({ external_user_id: externalUserId });
    } else if (portalType === 'donor') {
        await supabase.from('donor_profiles').insert({ external_user_id: externalUserId });
    } else {
        // Beneficiary: Link to family if registration number is provided
        let targetFamilyId: string | null = null;
        if (form.registration_number) {
            const { data: family } = await supabase
                .from('families')
                .select('id')
                .eq('registration_number', form.registration_number)
                .maybeSingle();
            
            if (family) {
                targetFamilyId = (family as { id: string }).id;
            } else {
                // If the registration number is required but not found, we might want to return an error
                // For now, we'll allow registration but it won't be linked. 
                // Better: Require it for beneficiaries.
                return { ok: false, error: 'رقم التسجيل غير موجود في سجلاتنا. يرجى التأكد من الرقم.' };
            }
        }
        await supabase.from('beneficiary_portal').insert({ 
            external_user_id: externalUserId,
            family_id: targetFamilyId
        });
    }

    const { data: admins } = await supabase
        .from('user_profiles')
        .select('id')
        .in('role', ['president', 'vice_president']);

    const rows =
        admins?.map((a: { id: string }) => ({
            recipient_type: 'internal' as const,
            recipient_id: a.id,
            title: 'تسجيل جديد في البوابة الخارجية',
            message: `طلب انضمام ${portalType}: ${form.full_name}`,
            type: 'general' as const,
        })) ?? [];

    if (rows.length) {
        await supabase.from('notifications').insert(rows);
    }

    return { ok: true };
}

export async function logout(): Promise<void> {
    useAuthStore.getState().clearAll();
    localStorage.removeItem('ghaith_user');
    if (isSupabaseConfigured) {
        await supabase.auth.signOut();
    } else {
        logoutUser();
    }
}

export async function restoreSessionFromSupabase(): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const uid = session.user.id;

    const { data: int } = await supabase
        .from('user_profiles')
        .select('id,full_name,phone,role,branch_id,is_active')
        .eq('id', uid)
        .maybeSingle();

    if (int) {
        const user = rowToUser(session.user.email || '', int as InternalProfileRow);
        useAuthStore.getState().setInternalUser(user);
        return;
    }

    const { data: ext } = await supabase
        .from('external_users')
        .select('id,auth_id,portal_type,status,full_name')
        .eq('auth_id', uid)
        .maybeSingle();

    if (ext) {
        const row = ext as ExternalUserRow;
        useAuthStore.getState().setExternalSession({
            authId: row.auth_id!,
            externalUserId: row.id,
            portalType: row.portal_type,
            status: row.status as ExternalUserStatus,
            fullName: row.full_name,
        });
    }
}
