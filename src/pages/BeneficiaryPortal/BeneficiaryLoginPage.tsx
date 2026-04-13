import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authLib from '../../lib/auth';
import { Hash, Phone, LogIn, ShieldCheck, Loader2, AlertCircle, Home, CheckCircle2, Heart } from 'lucide-react';
import { Button } from '../../components/ui';

export default function BeneficiaryLoginPage() {
    const navigate = useNavigate();
    const [regNo, setRegNo] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Auto-redirect if already logged in as beneficiary
        const checkSession = async () => {
            try {
                await authLib.restoreBeneficiarySession();
            } catch (e) {
                console.error(e);
            }
        };
        checkSession();
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regNo || !phone) {
            setError('يرجى إدخال رقم التسجيل ورقم الهاتف');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await authLib.loginBeneficiary({ email: regNo, password: phone });
            if (!result.ok) {
                setError(result.error ?? 'فشل تسجيل الدخول. تأكد من صحة البيانات.');
                setLoading(false);
                return;
            }
            
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/beneficiary/dashboard', { replace: true });
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'فشل تسجيل الدخول. تأكد من صحة البيانات.');
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-8 animate-bounce">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-4">تم تسجيل دخولكم بنجاح</h1>
                <p className="text-xl text-primary-600 font-bold mb-2">مرحباً بعائلتنا الكريمة في فضاءكم "غيث"</p>
                <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري تحويلكم للوحة التحكم...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 relative" dir="rtl">
            {/* Top Navigation */}
            <div className="absolute top-6 right-6 sm:top-10 sm:right-10">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/70 backdrop-blur-md rounded-full border border-primary-100 text-primary-600 font-bold hover:bg-primary-600 hover:text-white transition-all shadow-lg shadow-primary-50 active:scale-95"
                >
                    <Home className="w-5 h-5" />
                    <span className="hidden sm:inline">العودة للرئيسية</span>
                </button>
            </div>

            {/* Header / Logo */}
            <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary-200 mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                    <ShieldCheck className="w-10 h-10" />
                </div>
                
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 rounded-full text-primary-700 font-bold mb-4 animate-pulse">
                    <Heart className="w-4 h-4 fill-primary-700" />
                    <span>فخورون بخدمتكم</span>
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-2">فضاء العائلات المستفيدة</h1>
                <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
                    مرحباً بعائلتنا الكريمة في بيتكم الثاني "غيث"، حيث نتشرف بتمكينكم رقمياً لتسهيل تواصلكم معنا.
                </p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10 relative overflow-hidden animate-in fade-in zoom-in duration-500">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                    <LogIn className="w-5 h-5 text-primary-600" />
                    تسجيل الدخول للمنصة
                </h2>

                <form onSubmit={handleLogin} className="space-y-6 relative">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 mr-2 block text-right">رقم التسجيل (مثلاً: FAM-2000)</label>
                        <div className="relative group">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                <Hash className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="أدخل رقم التسجيل"
                                className="w-full bg-gray-50 border-gray-100 border-2 rounded-2xl py-4 pr-12 pl-4 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-lg font-mono tracking-wider text-right"
                                value={regNo}
                                onChange={(e) => setRegNo(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 mr-2 block text-right">رقم الهاتف المرتبط بالملف</label>
                        <div className="relative group">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                <Phone className="w-5 h-5" />
                            </div>
                            <input
                                type="tel"
                                placeholder="06XXXXXXXX"
                                className="w-full bg-gray-50 border-gray-100 border-2 rounded-2xl py-4 pr-12 pl-4 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-lg font-mono tracking-widest text-right"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xl font-black shadow-xl shadow-primary-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-none"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <span>دخول الفضاء الرقمي</span>
                                <LogIn className="w-6 h-6" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400 leading-relaxed font-bold">
                        أهلنا الأعزاء، نحن هنا لخدمتكم وتسهيل وصولكم لاستفاداتكم بكل عزة وكرامة.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-gray-400 text-sm">
                <div className="flex items-center justify-center gap-2 mb-2 font-bold text-primary-600">
                    <Heart className="w-4 h-4 fill-primary-600" />
                    <span>جمعية غيث للعمل الخيري و الإنساني</span>
                </div>
                <p>© 2026 - جميع الحقوق محفوظة</p>
            </div>
        </div>
    );
}
