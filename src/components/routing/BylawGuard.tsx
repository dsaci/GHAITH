import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../ui';

interface BylawGuardProps {
    children: React.ReactNode;
}

/**
 * BylawGuard - Hardened Production Implementation
 * Uses cached acknowledgment state from AuthContext to prevent redundant DB calls.
 * Ensures the platform is secure while maintaining high performance.
 */
export function BylawGuard({ children }: BylawGuardProps) {
    const { user, isLoading: authLoading, hasAcknowledgedBylaws, isBylawLoading } = useAuth();
    const location = useLocation();

    // 1. Handle Loading States (Auth initialization + Cached Bylaw check)
    // Architect Requirement: Wait for both to be ready before making a routing decision.
    if (authLoading || isBylawLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
                <div className="text-center space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-500 dark:text-slate-400 font-medium animate-pulse">جاري التحقق من الصلاحيات...</p>
                </div>
            </div>
        );
    }

    /**
     * 2. Security Enforcement: Redirect to regulations if agreement is missing.
     * We strictly check 'hasAcknowledgedBylaws' which is populated server-side via RPC.
     * Ignore for non-authenticated users or if already on the regulations page.
     */
    if (user && !hasAcknowledgedBylaws && location.pathname !== '/regulations') {
        process.env.NODE_ENV !== 'production' && console.log('BylawGuard: [SECURITY] Redirecting to /regulations (Consent Required)');
        return <Navigate to="/regulations" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
