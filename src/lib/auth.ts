import { supabase } from './supabase';
import { UserProfile, UserRole } from '../types';

/**
 * AUTHENTICATION LIBRARY (Unified)
 * Version: 2.1.0-RPC-FINAL
 * This library replaces all legacy auth.service.ts logic.
 * It uses the 'get_my_profile' RPC to bypass RLS recursion.
 */

export const authLib = {
    /**
     * Internal login logic that handles both email and username
     */
    async loginInternal(emailOrUsername: string, password: string) {
        try {
            console.log('[AuthLib] Attempting login for:', emailOrUsername);
            
            const email = emailOrUsername.includes('@')
                ? emailOrUsername
                : `${emailOrUsername}@ghaith.dz`;

            const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                console.error('[AuthLib] SignIn Error:', signInError.message);
                throw signInError;
            }

            if (!user) {
                throw new Error('لم يتم العثور على بيانات المستخدم');
            }

            // Using the SAFE RPC to get profile - this bypasses RLS issues
            const { data: profile, error: rpcError } = await supabase
                .rpc('get_my_profile')
                .maybeSingle();

            if (rpcError) {
                console.error('[AuthLib] RPC Error fetching profile:', rpcError);
                throw rpcError;
            }

            if (!profile) {
                throw new Error('لم يتم العثور على ملف تعريفي لهذا الحساب. يرجى مراجعة الإدارة.');
            }

            return { user, profile: profile as UserProfile };
        } catch (error: any) {
            console.error('[AuthLib] Overall Login Exception:', error);
            throw error;
        }
    },

    /**
     * Restore session safely using the RPC
     */
    async restoreSessionFromSupabase() {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session?.user) {
                return null;
            }

            // Use the RPC again for safety
            const { data: profile, error: rpcError } = await supabase
                .rpc('get_my_profile')
                .maybeSingle();

            if (rpcError || !profile) {
                console.warn('[AuthLib] Failed to restore profile via RPC', rpcError);
                return null;
            }

            return {
                user: session.user,
                profile: profile as UserProfile
            };
        } catch (err) {
            console.error('[AuthLib] Restore session error:', err);
            return null;
        }
    },

    async logout() {
        await supabase.auth.signOut();
        window.location.href = '/login';
    }
};
