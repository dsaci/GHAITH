import { Link } from 'react-router-dom';

export default function RejectedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" dir="rtl">
            <h1 className="text-2xl font-bold mb-3 text-red-700">تم رفض الطلب</h1>
            <p className="text-gray-600 dark:text-slate-400 max-w-md mb-8">للمزيد من المعلومات يرجى التواصل مع الجمعية.</p>
            <Link to="/portal" className="text-primary-600">
                البوابة
            </Link>
        </div>
    );
}
