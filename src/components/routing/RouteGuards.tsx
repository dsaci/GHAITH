import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';
import type { PortalType } from '../../types';

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

/** يمنع مستخدمي الفروع من استخدام مسارات المكتب الولائي (يوجّه إلى لوحة الفرع) */
export function WilayaInternalScope({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const loc = useLocation();
    
    // إذا كان المستخدم ينتمي لفضاء الفروع ويحاول دخول مسارات الولاية
    if (user?.space === 'branch' && !loc.pathname.startsWith('/branch')) {
        return <Navigate to="/branch/dashboard" replace />;
    }
    
    // العكس: إذا كان مستخدم تنفيذي يحاول دخول مسارات الفروع (اختياري، لكن هنا نتركه يدخل للمراقبة)
    return <>{children}</>;
}


export function RequireBranchPresident({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'branch_president') return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

export function RequireSpace({ space, children }: { space: 'executive' | 'branch' | 'member'; children: React.ReactNode }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.space !== space) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}


export function RequireRoles({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

export function RequireFinanceAccess({ children }: { children: React.ReactNode }) {
    const p = useAuthStore((s) => s.permissions);
    if (!p.canViewFinance) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

export function RequirePortalAdmin({ children }: { children: React.ReactNode }) {
    const p = useAuthStore((s) => s.permissions);
    if (!p.canViewPortalAdmin) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

export function RequireFinancialReportAccess({ children }: { children: React.ReactNode }) {
    const p = useAuthStore((s) => s.permissions);
    if (!p.canCreateFinancialReport) return <Navigate to="/reports" replace />;
    return <>{children}</>;
}

export function ExternalPortalRoute({ portalType, children }: { portalType: PortalType; children: React.ReactNode }) {
    const session = useAuthStore((s) => s.externalSession);
    if (!session) return <Navigate to="/portal/login" replace />;
    if (session.portalType !== portalType) {
        return <Navigate to={`/portal/${session.portalType}/dashboard`} replace />;
    }
    if (session.status === 'pending') return <Navigate to="/portal/pending" replace />;
    if (session.status === 'rejected') return <Navigate to="/portal/rejected" replace />;
    if (session.status !== 'active') return <Navigate to="/portal/login" replace />;
    return <>{children}</>;
}

export function ExternalPendingRoute({ children }: { children: React.ReactNode }) {
    const session = useAuthStore((s) => s.externalSession);
    if (!session) return <Navigate to="/portal/login" replace />;
    if (session.status === 'active') return <Navigate to={`/portal/${session.portalType}/dashboard`} replace />;
    if (session.status === 'rejected') return <Navigate to="/portal/rejected" replace />;
    if (session.status !== 'pending') return <Navigate to="/portal/login" replace />;
    return <>{children}</>;
}

export function RequireBeneficiaryAuth({ children }: { children: React.ReactNode }) {
    const session = useAuthStore((s) => s.beneficiarySession);
    if (!session) return <Navigate to="/beneficiary/login" replace />;
    return <>{children}</>;
}
