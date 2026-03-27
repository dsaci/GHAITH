/// <reference types="vite/client" />

declare module 'file-saver';

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    /** مفتاح anon العام (JWT) — الأنسب لـ createClient */
    readonly VITE_SUPABASE_ANON_KEY?: string
    /** مفتاح publishable من لوحة Supabase الجديدة — يُستخدم إن لم يُعرّف ANON_KEY */
    readonly VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY?: string
    readonly VITE_APP_NAME?: string
    readonly VITE_APP_VERSION?: string
    readonly VITE_ASSOCIATION_NAME?: string
    readonly VITE_WILAYA?: string
    readonly VITE_CONTACT_PHONE?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
