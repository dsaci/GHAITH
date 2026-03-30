import { Bell, Search, Moon, Sun, Home, ExternalLink, CheckCheck, RefreshCw, FileText, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useNotifications, AppNotification } from '../../hooks/useNotifications';

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

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} د`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} س`;
    return `منذ ${Math.floor(hrs / 24)} ي`;
}

function NotificationIcon({ type }: { type: AppNotification['type'] }) {
    if (type === 'volunteer') return <Heart className="w-4 h-4 text-pink-500" />;
    if (type === 'registration') return <FileText className="w-4 h-4 text-blue-500" />;
    return <Bell className="w-4 h-4 text-amber-500" />;
}

export default function Header() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
    const [search, setSearch] = useState('');
    const [bellOpen, setBellOpen] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);

    const { notifications, unreadCount, loading, refetch, markAsRead, markAllRead } = useNotifications();

    const title = resolvePageTitle(location.pathname);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setBellOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const toggleDark = () => {
        const isDark = !dark;
        setDark(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleNotifClick = (notif: AppNotification) => {
        markAsRead(notif.id);
        setBellOpen(false);
        navigate(notif.link);
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

                {/* === NOTIFICATIONS BELL === */}
                <div className="relative" ref={bellRef}>
                    <button
                        onClick={() => setBellOpen(o => !o)}
                        className="relative p-2 rounded-xl text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        title="الإشعارات"
                    >
                        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-amber-500' : ''}`} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-0.5 leading-none animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown panel */}
                    {bellOpen && (
                        <div
                            className="absolute left-0 mt-2 w-[360px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-fade-in"
                            style={{ top: '100%' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-primary-600" />
                                    <span className="font-bold text-gray-900 dark:text-white text-[14px]">الإشعارات</span>
                                    {unreadCount > 0 && (
                                        <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[11px] font-black px-2 py-0.5 rounded-full">
                                            {unreadCount} جديد
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    {/* Refresh */}
                                    <button
                                        onClick={refetch}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        title="تحديث"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                    </button>
                                    {/* Mark all read */}
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                            title="تعليم الكل كمقروء"
                                        >
                                            <CheckCheck className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* List */}
                            <div className="max-h-[380px] overflow-y-auto">
                                {loading && notifications.length === 0 ? (
                                    <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">جاري التحميل...</span>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                                        <Bell className="w-10 h-10 text-gray-200 dark:text-gray-700" />
                                        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">لا توجد إشعارات جديدة</p>
                                        <p className="text-gray-300 dark:text-gray-600 text-xs">سيظهر هنا كل جديد تلقائياً</p>
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <button
                                            key={notif.id}
                                            onClick={() => handleNotifClick(notif)}
                                            className={`w-full text-right flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${
                                                !notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                        >
                                            {/* Icon */}
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                                notif.type === 'help_request' ? 'bg-amber-50 dark:bg-amber-900/20' :
                                                notif.type === 'volunteer' ? 'bg-pink-50 dark:bg-pink-900/20' :
                                                'bg-blue-50 dark:bg-blue-900/20'
                                            }`}>
                                                <NotificationIcon type={notif.type} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-[13px] font-bold leading-tight truncate ${notif.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.read && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                                                    {notif.body}
                                                </p>
                                                <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1 font-mono">
                                                    {timeAgo(notif.timestamp)}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2.5">
                                    <Link
                                        to="/requests"
                                        onClick={() => setBellOpen(false)}
                                        className="flex items-center justify-center gap-1.5 text-[12px] text-primary-600 dark:text-primary-400 font-bold hover:text-primary-700 transition-colors"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        عرض كل الطلبات
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

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
