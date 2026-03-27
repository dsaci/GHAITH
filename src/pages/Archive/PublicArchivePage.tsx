import { Link } from 'react-router-dom';

/** أرشيف عام للأنشطة — يمكن ربطه باستعلام occasions العام لاحقاً */
export default function PublicArchivePage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 p-8" dir="rtl">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-2xl font-bold mb-4">أرشيف الأنشطة العام</h1>
                <p className="text-gray-600 dark:text-slate-400 mb-8">صفحة عامة بلا تسجيل دخول.</p>
                <Link to="/" className="text-primary-600">
                    الرئيسية
                </Link>
            </div>
        </div>
    );
}
