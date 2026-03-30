import React from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  Bell, 
  LogOut, 
  User as UserIcon,
  ShieldCheck,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';

export default function BeneficiaryLayout() {
    const navigate = useNavigate();
    const { beneficiarySession } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleLogout = async () => {
        await authService.logout();
        localStorage.removeItem('ghaith_beneficiary_session');
        navigate('/beneficiary/login', { replace: true });
    };

    if (!beneficiarySession) return null;

    const navItems = [
        { label: 'الرئيسية', icon: LayoutDashboard, path: '/beneficiary/dashboard' },
        { label: 'سجل الاستفادة', icon: History, path: '/beneficiary/benefits' },
        { label: 'طلب مساعدة', icon: HelpCircle, path: '/beneficiary/requests' },
        { label: 'الإشعارات', icon: Bell, path: '/beneficiary/notifications' },
        { label: 'ملفي الشخصي', icon: UserIcon, path: '/beneficiary/profile' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex w-72 flex-col bg-white border-l border-gray-100 shadow-sm fixed inset-y-0 right-0">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-black text-gray-900">فضاء غيث</span>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${
                                        isActive
                                            ? 'bg-primary-50 text-primary-600 shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl text-red-500 hover:bg-red-50 hover:font-bold transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:pr-72 min-h-screen flex flex-col">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-6 sm:px-10 h-20 flex items-center justify-between">
                    <button 
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="text-left font-bold text-gray-900 hidden sm:block">
                            <p className="text-xs text-gray-400 font-medium">مرحباً بك،</p>
                            <p className="text-sm">عائلة {beneficiarySession.familyName}</p>
                        </div>
                        <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold border-2 border-primary-100">
                            {beneficiarySession.familyName[0]}
                        </div>
                    </div>

                    <div className="lg:hidden font-black text-gray-900">فضاء غيث</div>
                </header>

                {/* Page Content */}
                <div className="p-6 sm:p-10 flex-1">
                    <div className="max-w-5xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-8 animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-8 h-8 text-primary-600" />
                                <span className="font-black text-gray-900">فضاء غيث</span>
                            </div>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <nav className="space-y-4">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${
                                            isActive
                                                ? 'bg-primary-50 text-primary-600 shadow-sm text-lg'
                                                : 'text-gray-500 hover:bg-gray-50'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold mt-8"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>تسجيل الخروج</span>
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
}
