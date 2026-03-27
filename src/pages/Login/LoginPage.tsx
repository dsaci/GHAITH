import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, User, Home } from 'lucide-react';

const DEMO_ACCOUNTS = [
    { label: 'رئيس الجمعية', username: 'president', password: 'president123' },
    { label: 'نائب الرئيس', username: 'vice', password: 'vice123' },
    { label: 'أمين المال', username: 'treasurer', password: 'treasurer123' },
    { label: 'عضو المكتب التنفيذي', username: 'board', password: 'board123' },
    { label: 'مشرف الفرع', username: 'branch1', password: 'branch123' },
    { label: 'عضو', username: 'member', password: 'member123' },
];

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        await new Promise(r => setTimeout(r, 600));
        const res = await login(username, password);
        setLoading(false);
        if (res.ok) navigate(res.redirect || '/dashboard');
        else setError(res.error || 'اسم المستخدم أو كلمة المرور غير صحيحة');
    };

    const fillDemo = (u: string, p: string) => { setUsername(u); setPassword(p); setError(''); };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 flex items-center justify-center p-4" dir="rtl">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full"></div>
                <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-primary-400/10 rounded-full blur-3xl"></div>
            </div>

            {/* Back to Home Button */}
            <Link
                to="/"
                className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-ghaith-navy rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all group scale-100 hover:scale-105"
            >
                <span className="text-sm font-bold">الرجوع للرئيسية</span>
                <Home className="w-4 h-4 text-ghaith-blue group-hover:rotate-12 transition-transform" />
            </Link>

            <div className="w-full max-w-md relative animate-fade-in">
                {/* Logo card */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <img src="/assets/images/logo.png" alt="جمعية غيث" className="w-[100px] h-[100px] object-contain" />
                    </div>
                    <h1 className="text-3xl font-black text-white">جمعية غيث</h1>
                    <p className="text-primary-200 text-sm mt-1">الولائية للعمل الخيري والإنساني - المسيلة</p>
                </div>

                {/* Login form */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">تسجيل الدخول</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="form-label">اسم المستخدم</label>
                            <div className="relative">
                                <User className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="input-field pr-10"
                                    placeholder="أدخل اسم المستخدم"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">كلمة المرور</label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="input-field pr-10 pl-10"
                                    placeholder="أدخل كلمة المرور"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(s => !s)}
                                    className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3 text-base mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    جارٍ التحقق...
                                </span>
                            ) : 'دخول'}
                        </button>
                    </form>

                    {/* Demo accounts */}
                    <div className="mt-6 pt-5 border-t border-gray-100">
                        <p className="text-xs text-gray-400 text-center mb-3">حسابات تجريبية</p>
                        <div className="grid grid-cols-2 gap-2">
                            {DEMO_ACCOUNTS.map(acc => (
                                <button key={acc.username} onClick={() => fillDemo(acc.username, acc.password)}
                                    className="text-xs bg-gray-50 hover:bg-primary-50 hover:text-primary-700 text-gray-600 border border-gray-200 rounded-lg px-3 py-2 transition-colors text-center truncate">
                                    {acc.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-center text-primary-300 text-xs mt-6">
                    © 2026 جمعية غيث الولائية للعمل الخيري والإنساني
                </p>
            </div>
        </div>
    );
}
