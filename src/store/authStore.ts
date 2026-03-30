import { create } from 'zustand';
import type { User, UserRole, PortalType } from '../types';

export type ExternalUserStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface AuthPermissions {
    canViewFinance: boolean;
    canViewAllBranches: boolean;
    canViewOwnBranchOnly: boolean;
    canManageMembers: boolean;
    canApproveRequests: boolean;
    canViewDonors: boolean;
    canViewPortalAdmin: boolean;
    canCreateFinancialReport: boolean;
    canViewAuditLogs: boolean;
}

const GUEST_PERMS: AuthPermissions = {
    canViewFinance: false,
    canViewAllBranches: false,
    canViewOwnBranchOnly: false,
    canManageMembers: false,
    canApproveRequests: false,
    canViewDonors: false,
    canViewPortalAdmin: false,
    canCreateFinancialReport: false,
    canViewAuditLogs: false,
};

export function computePermissions(role: UserRole | null | undefined): AuthPermissions {
    if (!role) return GUEST_PERMS;
    switch (role) {
        case 'president':
        case 'vice_president':
        case 'treasurer':
            return {
                canViewFinance: true,
                canViewAllBranches: true,
                canViewOwnBranchOnly: false,
                canManageMembers: true,
                canApproveRequests: true,
                canViewDonors: true,
                canViewPortalAdmin: true,
                canCreateFinancialReport: true,
                canViewAuditLogs: true,
            };
        case 'board_member':
            return {
                canViewFinance: false,
                canViewAllBranches: true,
                canViewOwnBranchOnly: false,
                canManageMembers: true,
                canApproveRequests: false,
                canViewDonors: false,
                canViewPortalAdmin: false,
                canCreateFinancialReport: false,
                canViewAuditLogs: false,
            };
        case 'branch_president':
            return {
                canViewFinance: true,
                canViewAllBranches: false,
                canViewOwnBranchOnly: true,
                canManageMembers: true,
                canApproveRequests: false,
                canViewDonors: false,
                canViewPortalAdmin: false,
                canCreateFinancialReport: false,
                canViewAuditLogs: true,
            };
        case 'member':
        default:
            return {
                canViewFinance: false,
                canViewAllBranches: false,
                canViewOwnBranchOnly: false,
                canManageMembers: false,
                canApproveRequests: false,
                canViewDonors: false,
                canViewPortalAdmin: false,
                canCreateFinancialReport: false,
                canViewAuditLogs: false,
            };
    }
}

export interface ExternalSession {
    authId: string;
    externalUserId: string;
    portalType: PortalType;
    status: ExternalUserStatus;
    fullName: string;
}

export interface BeneficiarySession {
    familyId: string;
    familyName: string;
    registrationNumber: string;
}

interface AuthState {
    internalUser: User | null;
    externalSession: ExternalSession | null;
    beneficiarySession: BeneficiarySession | null;
    permissions: AuthPermissions;
    setInternalUser: (user: User | null) => void;
    setExternalSession: (session: ExternalSession | null) => void;
    setBeneficiarySession: (session: BeneficiarySession | null) => void;
    clearAll: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    internalUser: null,
    externalSession: null,
    beneficiarySession: null,
    permissions: GUEST_PERMS,
    setInternalUser: (user) =>
        set({
            internalUser: user,
            externalSession: null,
            beneficiarySession: null,
            permissions: computePermissions(user?.role),
        }),
    setExternalSession: (session) =>
        set({
            externalSession: session,
            internalUser: null,
            beneficiarySession: null,
            permissions: GUEST_PERMS,
        }),
    setBeneficiarySession: (session) =>
        set({
            beneficiarySession: session,
            internalUser: null,
            externalSession: null,
            permissions: GUEST_PERMS,
        }),
    clearAll: () =>
        set({
            internalUser: null,
            externalSession: null,
            beneficiarySession: null,
            permissions: GUEST_PERMS,
        }),
}));

export function normalizeUserRole(role: string): UserRole {
  return role as UserRole;
}

export function permissionsForRole(role: string): AuthPermissions {
    return computePermissions(normalizeUserRole(role));
}
