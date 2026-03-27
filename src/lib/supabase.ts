import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Safe initialization to prevent crashes when credentials are missing
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        from: () => ({
            select: () => ({
                insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase credentials missing') }) }) }),
                gte: () => ({ lte: () => Promise.resolve({ data: [], error: null }) }),
                eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
                order: () => Promise.resolve({ data: [], error: null })
            }),
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase credentials missing') }) }) })
        }),
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase credentials missing') }),
            signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase credentials missing') }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        }
    } as any;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ Supabase credentials missing (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY). Running in mock/offline mode.'
    );
}
