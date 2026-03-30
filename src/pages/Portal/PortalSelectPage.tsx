import { Link } from 'react-router-dom';
import { Heart, HandHeart, Users } from 'lucide-react';

export default function PortalSelectPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 p-8 flex flex-col items-center justify-center" dir="rtl">
            <h1 className="text-3xl font-black text-white mb-2 text-center">البوابة الخارجية</h1>
            <p className="text-primary-100 mb-10 text-center max-w-md">اختر نوع الحساب للتسجيل أو تسجيل الدخول</p>
            <div className="grid gap-4 w-full max-w-md">
                <Link
                    to="/beneficiary/login"
                    className="flex items-center gap-4 bg-primary-500 hover:bg-primary-400 text-white rounded-2xl p-6 transition-all border-2 border-primary-400 shadow-xl shadow-primary-900/20 scale-105 my-4 group"
                >
                    <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                        <Users className="w-8 h-8 shrink-0" />
                    </div>
                    <div>
                        <p className="font-black text-xl">فضاء المستفيد</p>
                        <p className="text-sm text-primary-50">الدخول برقم التسجيل و الهاتف</p>
                    </div>
                </Link>

                <div className="h-px bg-white/10 my-4"></div>

                <Link
                    to="/portal/volunteer/register"
                    className="flex items-center gap-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl p-4 transition-colors border border-white/10"
                >
                    <HandHeart className="w-6 h-6 shrink-0 opacity-70" />
                    <div>
                        <p className="font-bold">تسجيل متطوع</p>
                    </div>
                </Link>
                <Link
                    to="/portal/donor/register"
                    className="flex items-center gap-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl p-4 transition-colors border border-white/10"
                >
                    <Heart className="w-6 h-6 shrink-0 opacity-70" />
                    <div>
                        <p className="font-bold">تسجيل متبرع</p>
                    </div>
                </Link>
                
                <Link to="/portal/login" className="text-center text-white font-semibold mt-4 underline decoration-primary-400 underline-offset-4">
                    دخول (متطوع / متبرع)
                </Link>
                <Link to="/" className="text-center text-primary-200 text-sm mt-4">
                    الرجوع للرئيسية
                </Link>
            </div>
        </div>
    );
}
