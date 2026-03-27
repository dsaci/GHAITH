import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginExternal } from '../../lib/auth';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function PortalLoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await loginExternal(email, password);
        setLoading(false);
        if (res.ok && res.redirect) navigate(res.redirect, { replace: true });
        else setError(res.error || 'فشل تسجيل الدخول');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 p-4" dir="rtl">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                <h1 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-slate-100">دخول البوابة الخارجية</h1>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                        <div className="relative">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 py-2.5 pr-10 pl-3 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">كلمة المرور</label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type={show ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 py-2.5 pr-10 pl-10 text-sm" />
                            <button type="button" onClick={() => setShow(!show)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary-600 text-white font-bold text-sm disabled:opacity-50">
                        {loading ? '...' : 'دخول'}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm space-y-2">
                    <Link to="/portal" className="text-primary-600 block">
                        إنشاء حساب
                    </Link>
                    <Link to="/" className="text-gray-500 block">
                        الرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
}
