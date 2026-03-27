import { Link } from 'react-router-dom';

export default function AwaitingApprovalPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" dir="rtl">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">تم استلام طلبك</h1>
            <p className="text-gray-600 dark:text-slate-400 max-w-md mb-8">سيتم مراجعة طلبك من قبل إدارة الجمعية. ستصلك إشعارات عند الموافقة أو الرفض.</p>
            <Link to="/" className="text-primary-600 font-semibold">
                الرجوع للرئيسية
            </Link>
        </div>
    );
}
