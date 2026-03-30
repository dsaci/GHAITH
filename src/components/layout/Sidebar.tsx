import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBranchLayout } from '../../context/LayoutBranchContext';
import { useAuthStore } from '../../store/authStore';
import type { AuthPermissions } from '../../store/authStore';
import {
    LayoutDashboard,
    Users,
    DollarSign,
    FileText,
    UserCheck,
    Heart,
    Calendar,
    Settings,
    ClipboardList,
    LogOut,
    ChevronLeft,
    FileBarChart,
    Archive,
    MapPin,
    UserCog,
    Activity,
    BookOpen,
} from 'lucide-react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

type NavItem = {
    to: string;
    branchTo: string;
    label: string;
    icon: LucideIcon;
    resource: string;
    perm?: keyof AuthPermissions;
    wilayaOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
    { to: '/dashboard', branchTo: '/branch/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, resource: 'dashboard' },
    { to: '/reports', branchTo: '/branch/reports', label: 'التقارير الذكية', icon: FileBarChart, resource: 'reports' },
    { to: '/beneficiaries', branchTo: '/branch/families', label: 'سجل العائلات', icon: Users, resource: 'beneficiaries' },
    { to: '/receipts', branchTo: '/branch/receipts', label: 'وثائق الاستفادة', icon: FileText, resource: 'beneficiaries' },
    { to: '/finance', branchTo: '/branch/finance', label: 'السجلات المالية', icon: DollarSign, resource: 'finance', perm: 'canViewFinance' },
    { to: '/documents', branchTo: '/branch/documents', label: 'الوثائق والتقارير', icon: FileText, resource: 'documents' },
    { to: '/members', branchTo: '/branch/members', label: 'الأعضاء', icon: UserCheck, resource: 'members' },
    { to: '/donors', branchTo: '/branch/donors', label: 'المحسنون', icon: Heart, resource: 'donors', perm: 'canViewDonors' },
    { to: '/activities', branchTo: '/branch/activities', label: 'الأنشطة والمناسبات', icon: Calendar, resource: 'activities' },
    { to: '/archive', branchTo: '/branch/archive', label: 'أرشيف الجمعية', icon: Archive, resource: 'activities' },
    { to: '/regulations', branchTo: '/branch/regulations', label: 'ميثاق الجمعية', icon: BookOpen, resource: 'dashboard' },
    { to: '/administration', branchTo: '/branch/administration', label: 'السجلات الإدارية', icon: Settings, resource: 'administration' },
    { to: '/requests', branchTo: '/branch/requests', label: 'الطلبات', icon: ClipboardList, resource: 'requests' },
    { to: '/planning', branchTo: '/branch/planning', label: 'الخطط والمتابعة', icon: ClipboardList, resource: 'planning' },
    { to: '/branches', branchTo: '/branches', label: 'الفروع البلدية', icon: MapPin, resource: 'branches', wilayaOnly: true },
    { to: '/admin/portal/pending', branchTo: '/admin/portal/pending', label: 'البوابة الخارجية (إدارة)', icon: UserCog, resource: 'portal_admin', perm: 'canViewPortalAdmin', wilayaOnly: true },
    { to: '/administration/logs', branchTo: '/branch/administration/logs', label: 'سجل التتبع', icon: Activity, resource: 'administration', perm: 'canViewAuditLogs' },
];

const ROLE_LABELS: Record<string, string> = {
    president: 'رئيس الجمعية',
    vice_president: 'نائب الرئيس',
    treasurer: 'أمين المال',
    board_member: 'عضو المكتب الولائي',
    branch_president: 'رئيس المكتب البلدي',
    member: 'عضو',
};

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const { user, logout, canAccess } = useAuth();
    const navigate = useNavigate();
    const branchMode = useBranchLayout();
    const permissions = useAuthStore((s) => s.permissions);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const filteredNavItems = NAV_ITEMS.filter((item) => {
        if (item.wilayaOnly && (!permissions.canViewAllBranches || branchMode)) return false;
        if (item.perm && !permissions[item.perm]) return false;
        return canAccess(item.resource, 'read');
    });

    // const pathFor = (p: string) => (branchMode ? `/branch${p}` : p);item.to);

    return (
        <aside
            className={clsx(
                'h-screen bg-white dark:bg-slate-800 border-l border-gray-100 dark:border-slate-700/50 flex flex-col transition-all duration-300 shadow-lg',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            <div
                className={clsx(
                    'flex items-center p-4 border-b border-gray-100 dark:border-slate-700/50',
                    collapsed ? 'flex-col gap-4 px-2' : 'justify-between'
                )}
            >
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-[56px] h-[56px] bg-ghaith-navy rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-ghaith-navy/20">
                            <img src="/assets/images/logo_abyadh.png" alt="جمعية غيث الولائية" className="w-[48px] h-[48px] object-contain" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-slate-100 leading-tight">جمعية غيث الولائية</p>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div className="w-[40px] h-[40px] bg-ghaith-navy rounded-lg mx-auto flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-ghaith-navy/20">
                        <img src="/assets/images/logo_abyadh.png" alt="جمعية غيث الولائية" className="w-[32px] h-[32px] object-contain" />
                    </div>
                )}
                <button
                    onClick={onToggle}
                    className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <ChevronLeft className={clsx('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {filteredNavItems.map(({ branchTo, to, label, icon: Icon }) => {
                    const dest = branchMode ? branchTo : to;
                    return (
                        <NavLink
                            key={dest + label}
                            to={dest}
                            className={({ isActive }) => clsx('sidebar-link', { active: isActive })}
                            title={collapsed ? label : undefined}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            {!collapsed && <span className="truncate">{label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="border-t border-gray-100 dark:border-slate-700/50 p-3">
                {!collapsed && user && (
                    <div className="flex items-center gap-3 px-2 py-2 mb-2">
                        <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm shrink-0">
                            {user.fullName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{user.fullName}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{ROLE_LABELS[user.role] ?? user.role}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => void handleLogout()}
                    className={clsx(
                        'sidebar-link w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300',
                        collapsed && 'justify-center'
                    )}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>تسجيل الخروج</span>}
                </button>
            </div>
        </aside>
    );
}
