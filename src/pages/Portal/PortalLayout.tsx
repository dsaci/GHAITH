import { Link } from 'react-router-dom';
import { logout } from '../../lib/auth';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900" dir="rtl">
            <header className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between gap-4">
                <Link to="/" className="text-sm font-semibold text-primary-600">
                    الموقع الرئيسي
                </Link>
                <button
                    type="button"
                    onClick={() => {
                        void logout().then(() => {
                            window.location.href = '/portal/login';
                        });
                    }}
                    className="text-sm text-red-600"
                >
                    تسجيل الخروج
                </button>
            </header>
            <main>{children}</main>
        </div>
    );
}
