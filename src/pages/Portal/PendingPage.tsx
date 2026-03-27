import { Link } from 'react-router-dom';

export default function PendingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" dir="rtl">
            <h1 className="text-2xl font-bold mb-3">حسابك قيد المراجعة</h1>
            <p className="text-gray-600 dark:text-slate-400 max-w-md mb-8">يرجى الانتظار حتى تتم الموافقة من قبل الإدارة.</p>
            <Link to="/" className="text-primary-600">
                الرئيسية
            </Link>
        </div>
    );
}
