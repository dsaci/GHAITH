import { supabase } from './supabase';
import { UserProfile, UserRole } from '../types';

/**
 * AUTHENTICATION LIBRARY (Unified)
 * Version: 2.1.1-RPC-FORCE-SYNC
 * Hand-off: 2026-03-31T11:32:00Z
 */

export const authLib = {
    async loginInternal(emailOrUsername: string, password: string) {
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
    },

    async restoreSessionFromSupabase() {
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
    },

    async logout() {
        await supabase.auth.signOut();
        window.location.href = '/login';
    }
};
