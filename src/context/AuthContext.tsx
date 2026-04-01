import React, { createContext, useContext, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { normalizeUserRole } from '../types';
import { getCurrentUser } from '../data/mockData';
import { useAuthStore } from '../store/authStore';
import { 
    loginInternal, 
    logout as logoutSupabase, 
    restoreSessionFromSupabase 
} from '../lib/auth';
import { loginNotificationService } from '../services/loginNotification.service';
import { isSupabaseConfigured } from '../lib/supabase';
import { bylawService } from '../services/bylaw.service';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    hasAcknowledgedBylaws: boolean;
    isBylawLoading: boolean;
    login: (username: string, password: string) => Promise<{ ok: boolean; redirect?: string; error?: string }>;
    logout: () => Promise<void>;
    hasRole: (roles: UserRole[]) => boolean;
    canAccess: (resource: string, action: 'create' | 'read' | 'update' | 'delete') => boolean;
    refreshBylawStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ROLE_PERMISSIONS: Record<UserRole, Record<string, string[]>> = {
    president: { '*': ['create', 'read', 'update', 'delete'], portal_admin: ['read', 'update'] },
    vice_president: {
        '*': ['create', 'read', 'update'],
        finance: ['create', 'read', 'update'],
        portal_admin: ['read', 'update'],
    },
    treasurer: {
        finance: ['create', 'read', 'update', 'delete'],
        '*': ['read'],
        portal_admin: ['read', 'update'],
    },
    secretary: {
        '*': ['create', 'read', 'update'],
        documents: ['create', 'read', 'update', 'delete'],
        mail: ['create', 'read', 'update', 'delete'],
        meetings: ['create', 'read', 'update', 'delete'],
    },
    board_member: {
        '*': ['read'],
        beneficiaries: ['create', 'read', 'update'],
        activities: ['create', 'read', 'update'],
        documents: ['create', 'read', 'update'],
        members: ['read'],
        administration: ['read', 'update'],
        requests: ['read'],
        reports: ['read'],
    },
    branch_president: {
        dashboard: ['read'],
        beneficiaries: ['create', 'read', 'update'],
        finance: ['create', 'read', 'update'],
        documents: ['read', 'update'],
        members: ['read', 'update'],
        activities: ['read'],
        administration: ['read', 'update'],
        requests: ['read'],
    },
    manager: {
        dashboard: ['read'],
        beneficiaries: ['read', 'update'],
        finance: ['read'],
        activities: ['read', 'update'],
    },
    member: {
        dashboard: ['read'],
        activities: ['read'],
    },
};


function hydrateMockUserFromStorage(): void {
    const stored = getCurrentUser();
    if (!stored) return;
    const u = { ...stored, role: normalizeUserRole(stored.role as string) };
    useAuthStore.getState().setInternalUser(u);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((s) => s.internalUser);
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasAcknowledgedBylaws, setHasAcknowledgedBylaws] = React.useState(true); // Default to true to prevent flash
    const [isBylawLoading, setIsBylawLoading] = React.useState(false);

    const refreshBylawStatus = async () => {
        if (!isSupabaseConfigured) return;
        try {
            setIsBylawLoading(true);
            const needsAck = await bylawService.needsAcknowledgment();
            setHasAcknowledgedBylaws(!needsAck);
        } catch (err) {
            console.error('Failed to check bylaw status', err);
            // On error, we assume true to avoid blocking the user unless it's critical
            setHasAcknowledgedBylaws(true);
        } finally {
            setIsBylawLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            if (isSupabaseConfigured) {
                try {
                    const res = await restoreSessionFromSupabase();
                    if (res) {
                        const { user: supaUser, profile } = res;
                        const u: User = {
                            id: profile.id,
                            email: supaUser.email || '',
                            full_name: profile.full_name,
                            fullName: profile.full_name,
                            role: profile.role,
                            space: profile.space,
                            branch_id: profile.branch_id || undefined,
                            branchId: profile.branch_id || undefined,
                            phone: profile.phone,
                            status: profile.is_active ? 'active' : 'inactive',
                            is_active: profile.is_active,
                            isActive: profile.is_active
                        };
                        useAuthStore.getState().setInternalUser(u);
                    }
                } catch (err) {
                    console.error('Session restore failed.', err);
                } finally {
                    await refreshBylawStatus();
                    setIsLoading(false);
                }
                const s = useAuthStore.getState();
                if (!s.internalUser && !s.externalSession && !s.beneficiarySession) {
                    hydrateMockUserFromStorage();
                }
            } else {
                hydrateMockUserFromStorage();
                setIsLoading(false);
            }
        })();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const res = await loginInternal(username, password);
            if (!res) throw new Error('فشل تسجيل الدخول');

            const { user: supaUser, profile } = res;
            const u: User = {
                id: profile.id,
                email: supaUser.email || '',
                full_name: profile.full_name,
                fullName: profile.full_name,
                role: profile.role,
                space: profile.space,
                branch_id: profile.branch_id || undefined,
                branchId: profile.branch_id || undefined,
                phone: profile.phone,
                status: profile.is_active ? 'active' : 'inactive',
                is_active: profile.is_active,
                isActive: profile.is_active
            };

            useAuthStore.getState().setInternalUser(u);
            loginNotificationService.recordLogin(u.id);
            sessionStorage.setItem('justLoggedIn', 'true');
            
            await refreshBylawStatus();

            const redirect = u.space === 'branch' ? '/branch/dashboard' : '/dashboard';
            return { ok: true, redirect };
        } catch (err: any) {
            console.error('Login error', err);
            return { ok: false, error: err.message || 'فشل تسجيل الدخول' };
        }
    };

    const logout = async () => {
        await logoutSupabase();
    };

    const hasRole = (roles: UserRole[]): boolean => (user ? roles.includes(user.role) : false);

    const canAccess = (resource: string, action: string): boolean => {
        if (!user) return false;
        const perms = ROLE_PERMISSIONS[user.role];
        const specific = perms[resource] || [];
        const wildcard = perms['*'] || [];
        return specific.includes(action) || wildcard.includes(action);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isLoading, 
            hasAcknowledgedBylaws, 
            isBylawLoading, 
            login, 
            logout, 
            hasRole, 
            canAccess,
            refreshBylawStatus
        }}>{children}</AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
};
