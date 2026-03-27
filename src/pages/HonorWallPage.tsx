import { Link } from 'react-router-dom';

export default function HonorWallPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8" dir="rtl">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl font-black text-ghaith-navy dark:text-slate-100 mb-4">جدار الشرف</h1>
                <p className="text-gray-600 dark:text-slate-400 mb-8">يعرض المتبرعين والمتطوعين المميزين (جدول honor_wall عبر Supabase).</p>
                <Link to="/" className="text-primary-600 font-semibold">
                    الرئيسية
                </Link>
            </div>
        </div>
    );
}
