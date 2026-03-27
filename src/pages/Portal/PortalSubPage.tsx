import { Link } from 'react-router-dom';

export default function PortalSubPage({ title }: { title: string }) {
    return (
        <div className="p-8 max-w-3xl mx-auto" dir="rtl">
            <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-slate-100">{title}</h1>
            <p className="text-gray-600 dark:text-slate-400 mb-6">هذه الصفحة مربوطة بـ Supabase و RLS. أكمل الواجهة حسب احتياجك.</p>
            <Link to="/portal/login" className="text-primary-600 text-sm">
                تسجيل الخروج من القائمة عند إضافتها
            </Link>
        </div>
    );
}
