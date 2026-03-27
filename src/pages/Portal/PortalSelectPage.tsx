import { Link } from 'react-router-dom';
import { Heart, HandHeart, Users } from 'lucide-react';

export default function PortalSelectPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 p-8 flex flex-col items-center justify-center" dir="rtl">
            <h1 className="text-3xl font-black text-white mb-2 text-center">البوابة الخارجية</h1>
            <p className="text-primary-100 mb-10 text-center max-w-md">اختر نوع الحساب للتسجيل أو تسجيل الدخول</p>
            <div className="grid gap-4 w-full max-w-md">
                <Link
                    to="/portal/volunteer/register"
                    className="flex items-center gap-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl p-5 transition-colors border border-white/20"
                >
                    <HandHeart className="w-10 h-10 shrink-0" />
                    <div>
                        <p className="font-bold text-lg">متطوع</p>
                        <p className="text-sm text-primary-100">التسجيل كمتطوع</p>
                    </div>
                </Link>
                <Link
                    to="/portal/donor/register"
                    className="flex items-center gap-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl p-5 transition-colors border border-white/20"
                >
                    <Heart className="w-10 h-10 shrink-0" />
                    <div>
                        <p className="font-bold text-lg">متبرع</p>
                        <p className="text-sm text-primary-100">التسجيل كمتبرع</p>
                    </div>
                </Link>
                <Link
                    to="/portal/beneficiary/register"
                    className="flex items-center gap-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl p-5 transition-colors border border-white/20"
                >
                    <Users className="w-10 h-10 shrink-0" />
                    <div>
                        <p className="font-bold text-lg">مستفيد</p>
                        <p className="text-sm text-primary-100">التسجيل في بوابة المستفيدين</p>
                    </div>
                </Link>
                <Link to="/portal/login" className="text-center text-white font-semibold mt-4 underline">
                    لدي حساب — تسجيل الدخول
                </Link>
                <Link to="/" className="text-center text-primary-200 text-sm">
                    الرجوع للرئيسية
                </Link>
            </div>
        </div>
    );
}
