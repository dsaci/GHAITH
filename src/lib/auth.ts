import { supabase } from './supabase';
import { UserProfile } from '../types';

/**
 * AUTHENTICATION LIBRARY (Unified)
 * Version: 2.1.2-RPC-DIRECT-EXPORT
 * Hand-off: 2026-03-31T14:20:00Z
 */

export async function loginInternal(emailOrUsername: string, password: string) {
    try {
        console.log('[AuthLib] Forced login check for:', emailOrUsername);
        
        const email = emailOrUsername.includes('@')
            ? emailOrUsername
            : `${emailOrUsername}@ghaith.dz`;

        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) throw signInError;
        if (!user) throw new Error('لم يتم العثور على بيانات المستخدم');

        const { data: profile, error: rpcError } = await supabase
            .rpc('get_my_profile')
            .maybeSingle();

        if (rpcError) throw rpcError;
        if (!profile) throw new Error('لم يتم العثور على ملف تعريفي (Internal profile missing)');

        return { user, profile: profile as UserProfile };
    } catch (error: any) {
        console.error('[AuthLib] Login Exception:', error);
        throw error;
    }
}

export async function restoreSessionFromSupabase() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        const { data: profile, error: rpcError } = await supabase
            .rpc('get_my_profile')
            .maybeSingle();

        if (rpcError || !profile) return null;

        return { user: session.user, profile: profile as UserProfile };
    } catch (err) {
        return null;
    }
}

export async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
}

// Support legacy import * as authLib if existing
export const authLib = {
    loginInternal,
    restoreSessionFromSupabase,
    restoreBeneficiarySession: async () => null, // Placeholder if needed
    logout
};
