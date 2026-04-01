import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../ui';

interface BylawGuardProps {
    children: React.ReactNode;
}

/**
 * BylawGuard - Hardened Production Implementation (Non-Blocking)
 * Now only handles loading states, allowing access even if bylaws are not signed.
 */
export function BylawGuard({ children }: BylawGuardProps) {
    const { isLoading: authLoading, isBylawLoading } = useAuth();

    // 1. Handle Loading States
    if (authLoading || isBylawLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
                <div className="text-center space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-500 dark:text-slate-400 font-medium animate-pulse">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    // 2. Security Enforcement: DISABLED (as requested)
    // We no longer block access if hasAcknowledgedBylaws is false.
    // The bylaws will be displayed as a non-blocking informational popup instead.
    
    return <>{children}</>;
}
