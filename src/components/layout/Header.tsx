import { Bell, Search, Moon, Sun, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'لوحة التحكم',
    '/beneficiaries': 'سجل العائلات والمستفيدين',
    '/finance': 'السجلات المالية',
    '/finance/transactions': 'حركات مالية',
    '/finance/reports': 'التقارير المالية',
    '/documents': 'الوثائق والتقارير',
    '/members': 'سجل الأعضاء',
    '/donors': 'سجل المحسنين',
    '/activities': 'الأنشطة والمناسبات',
    '/activities/calendar': 'التقويم السنوي للأنشطة',
    '/archive': 'أرشيف الجمعية',
    '/requests': 'طلبات المساعدة',
    '/planning': 'الخطط والمتابعة',
    '/administration': 'السجلات الإدارية',
    '/administration/mail': 'سجل البريد',
    '/administration/meetings': 'محاضر الاجتماعات',
    '/administration/inventory': 'المخزون',
    '/inventory': 'سجل الجرد',
    '/branches': 'الفروع البلدية',
    '/reports': 'التقارير الذكية',
    '/reports/literary/new': 'تقرير أدبي جديد',
    '/reports/financial/new': 'تقرير مالي جديد',
    '/admin/portal/pending': 'طلبات البوابة',
    '/admin/portal/volunteers': 'المتطوعون',
    '/admin/portal/donors': 'محسنو البوابة',
    '/admin/portal/requests': 'طلبات المساعدة (البوابة)',
    '/branch/dashboard': 'لوحة الفرع',
    '/branch/families': 'عائلات الفرع',
    '/branch/finance': 'مالية الفرع',
    '/branch/members': 'أعضاء الفرع',
    '/branch/mail': 'بريد الفرع',
    '/branch/meetings': 'اجتماعات الفرع',
    '/branch/inventory': 'مخزون الفرع',
    '/branch/documents': 'وثائق الفرع',
    '/branch/activities': 'أنشطة الفرع',
    '/branch/archive': 'أرشيف الفرع',
    '/branch/administration': 'إدارة الفرع',
    '/branch/requests': 'طلبات الفرع',
    '/branch/planning': 'خطط الفرع',
    '/branch/reports': 'تقارير الفرع',
    '/branch/donors': 'محسنو الفرع',
};

function resolvePageTitle(pathname: string): string {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    if (pathname === '/activities/calendar') return PAGE_TITLES['/activities/calendar'];
    if (pathname.startsWith('/archive')) return PAGE_TITLES['/archive'];
    if (pathname.startsWith('/branch/activities/') && pathname !== '/branch/activities') {
        if (pathname.endsWith('/new')) return 'نشاط جديد';
        if (pathname.endsWith('/edit')) return 'تعديل النشاط';
        return 'تفاصيل النشاط';
    }
    if (pathname.startsWith('/activities/') && pathname !== '/activities') {
        if (pathname === '/activities/new') return 'نشاط جديد';
        if (pathname.endsWith('/edit')) return 'تعديل النشاط';
        return 'تفاصيل النشاط';
    }
    return 'منصة غيث';
}

export default function Header() {
    const { user } = useAuth();
    const location = useLocation();
    const [dark, setDark] = useState(true);
    const [search, setSearch] = useState('');

    const title = resolvePageTitle(location.pathname);

    const toggleDark = () => {
        setDark(d => !d);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700/50 px-6 py-4 flex items-center justify-between gap-4 transition-colors duration-200">
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">{title}</h1>

            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="بحث..."
                        className="pr-10 pl-4 py-2 text-sm border border-gray-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 w-48 bg-white dark:bg-slate-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 transition-colors duration-200"
                    />
                </div>

                {/* Go to Landing Page */}
                <Link
                    to="/"
                    title="الرجوع للموقع الرئيسي"
                    className="p-2 rounded-xl text-gray-400 dark:text-slate-400 hover:text-ghaith-blue dark:hover:text-ghaith-blue hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <Home className="w-5 h-5" />
                </Link>

                {/* Dark mode toggle */}
                <button onClick={toggleDark} className="p-2 rounded-xl text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    {dark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className="relative p-2 rounded-xl text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User avatar */}
                {user && (
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                            {user.fullName.charAt(0)}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
