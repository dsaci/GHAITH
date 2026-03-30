import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, MapPin, Users, Lock, Mail, Home, Eye, EyeOff, LayoutDashboard } from 'lucide-react';

type SpaceType = 'wilaya' | 'municipal' | 'member' | null;

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [selectedSpace, setSelectedSpace] = useState<SpaceType>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Artificial delay for UI smoothness
        await new Promise(r => setTimeout(r, 600));
        
        try {
            const res = await login(email, password);
            if (res.ok) {
                navigate(res.redirect || '/dashboard');
            } else {
                setError('بيانات الدخول غير صحيحة، يرجى التأكد من البريد الإلكتروني وكلمة المرور.');
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول.');
        } finally {
            setLoading(false);
        }
    };

    const getSpaceTitle = () => {
        if (selectedSpace === 'wilaya') return 'فضاء المكتب الولائي';
        if (selectedSpace === 'municipal') return 'فضاء المكاتب البلدية';
        if (selectedSpace === 'member') return 'فضاء الأعضاء';
        return '';
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 font-cairo overflow-hidden bg-primary-900" dir="rtl">
            {/* Ambient Background with Glassmorphism Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[90px]"></div>
                <div className="absolute inset-0 bg-[url('/assets/images/mesh-bg.png')] opacity-10 mix-blend-overlay"></div>
            </div>

            {/* Back to Home Button */}
            <Link
                to="/"
                className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white rounded-xl shadow-lg transition-all group"
            >
                <span className="text-sm font-bold tracking-wide">الرئيسية</span>
                <Home className="w-4 h-4 text-primary-200 group-hover:-translate-x-1 transition-transform" />
            </Link>

            <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                
                {/* Header Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
                        <img src="/assets/images/logo.png" alt="جمعية غيث" className="w-[110px] h-[110px] object-contain drop-shadow-2xl" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">منصة غيث الرقمية</h1>
                    <p className="text-primary-200 text-sm mt-3 font-medium tracking-wide opacity-90">النظام المتكامل لإدارة المكاتب والفروع عبر الولاية</p>
                </div>

                {/* Main Glass Panel */}
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-[2rem] p-8 overflow-hidden relative">
                    
                    {/* Decorative shine effect */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

                    {!selectedSpace ? (
                        <div className="space-y-4">
                            <h2 className="text-lg text-center text-white/90 mb-6 font-bold tracking-wide">تسجيل الدخول - الرجاء تحديد الفضاء</h2>
                            
                            <button 
                                onClick={() => setSelectedSpace('wilaya')} 
                                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-primary-600/40 border border-white/10 hover:border-primary-400/50 rounded-2xl transition-all duration-300 text-white group shadow-sm hover:shadow-md"
                            >
                                <span className="font-bold text-lg">المكتب التنفيذي الولائي</span>
                                <div className="p-2 bg-primary-500/20 rounded-xl group-hover:bg-primary-500/40 transition-colors">
                                    <Building2 className="w-6 h-6 text-primary-200" />
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => setSelectedSpace('municipal')} 
                                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-emerald-600/40 border border-white/10 hover:border-emerald-400/50 rounded-2xl transition-all duration-300 text-white group shadow-sm hover:shadow-md"
                            >
                                <span className="font-bold text-lg">المكاتب والفروع البلدية</span>
                                <div className="p-2 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/40 transition-colors">
                                    <MapPin className="w-6 h-6 text-emerald-200" />
                                </div>
                            </button>

                            <button 
                                onClick={() => setSelectedSpace('member')} 
                                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-amber-600/40 border border-white/10 hover:border-amber-400/50 rounded-2xl transition-all duration-300 text-white group shadow-sm hover:shadow-md"
                            >
                                <span className="font-bold text-lg">فضاء الأعضاء العاديين</span>
                                <div className="p-2 bg-amber-500/20 rounded-xl group-hover:bg-amber-500/40 transition-colors">
                                    <Users className="w-6 h-6 text-amber-200" />
                                </div>
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <LayoutDashboard className="w-5 h-5 text-primary-300" />
                                    {getSpaceTitle()}
                                </h2>
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedSpace(null)} 
                                    className="text-primary-200 text-sm py-1 px-3 hover:bg-white/10 rounded-lg hover:text-white transition-all flex items-center gap-1"
                                >
                                    &rarr; عودة
                                </button>
                            </div>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-white/80 mb-2 text-sm font-medium">البريد الإلكتروني للجمعية</label>
                                    <div className="relative group">
                                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-primary-300 transition-colors" />
                                        <input 
                                            type="email" 
                                            value={email} 
                                            onChange={e => setEmail(e.target.value)} 
                                            required
                                            className="w-full bg-black/20 border border-white/10 text-white placeholder-white/30 rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-transparent transition-all"
                                            placeholder="user@ghaith.dz" 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white/80 mb-2 text-sm font-medium">كلمة المرور</label>
                                    <div className="relative group">
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-primary-300 transition-colors" />
                                        <input 
                                            type={showPassword ? 'text' : 'password'}
                                            value={password} 
                                            onChange={e => setPassword(e.target.value)} 
                                            required
                                            className="w-full bg-black/20 border border-white/10 text-white placeholder-white/30 rounded-xl py-4 pr-12 pl-12 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-transparent transition-all"
                                            placeholder="••••••••" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-200 bg-red-900/60 p-4 rounded-xl text-sm border border-red-500/30 font-medium flex items-center gap-2 animate-shake">
                                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                    {error}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full relative overflow-hidden bg-primary-500 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-primary-500/30 mt-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            جاري التحقق...
                                        </>
                                    ) : 'دخول للفضاء المحمي'}
                                </span>
                            </button>
                        </form>
                    )}
                </div>

                <div className="text-center mt-8 space-y-4">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-primary-200/80 text-sm">هل أنت مستفيد؟</p>
                        <Link 
                            to="/beneficiary/login" 
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105"
                        >
                            <Users className="w-4 h-4" />
                            دخول فضاء المستفيد
                        </Link>
                    </div>

                    <div className="space-y-1">
                        <p className="text-primary-200/60 text-[10px] tracking-wide uppercase">
                            جميع البيانات والحسابات مشفرة ومؤمنة بالنظام المعزول
                        </p>
                        <p className="text-primary-200/40 text-[10px]">
                            © 2026 جمعية غيث الولائية للعمل الخيري والإنساني
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
