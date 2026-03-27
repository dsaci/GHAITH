import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { PortalType } from '../../types';
import { registerExternal } from '../../lib/auth';

const VALID: PortalType[] = ['volunteer', 'donor', 'beneficiary'];

export default function RegisterExternalPage() {
    const { portalType } = useParams<{ portalType: string }>();
    const navigate = useNavigate();
    const type = portalType as PortalType;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [full_name, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!portalType || !VALID.includes(type)) {
        return (
            <div className="p-8 text-center" dir="rtl">
                <p>نوع البوابة غير صالح</p>
                <Link to="/portal">رجوع</Link>
            </div>
        );
    }

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await registerExternal(type, { email, password, full_name, phone });
        setLoading(false);
        if (res.ok) navigate('/portal/awaiting-approval', { replace: true });
        else setError(res.error || 'فشل التسجيل');
    };

    const labels: Record<PortalType, string> = {
        volunteer: 'تسجيل متطوع',
        donor: 'تسجيل متبرع',
        beneficiary: 'تسجيل مستفيد',
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4" dir="rtl">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
                <h1 className="text-xl font-bold mb-6 text-gray-900 dark:text-slate-100">{labels[type]}</h1>
                <form onSubmit={submit} className="space-y-3">
                    <input required placeholder="الاسم الكامل" value={full_name} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-slate-600 py-2.5 px-3 text-sm bg-white dark:bg-slate-900" />
                    <input required placeholder="الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-slate-600 py-2.5 px-3 text-sm bg-white dark:bg-slate-900" />
                    <input required type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-slate-600 py-2.5 px-3 text-sm bg-white dark:bg-slate-900" />
                    <input required type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-slate-600 py-2.5 px-3 text-sm bg-white dark:bg-slate-900" />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary-600 text-white font-bold text-sm">
                        {loading ? '...' : 'إرسال الطلب'}
                    </button>
                </form>
                <Link to="/portal" className="block text-center mt-4 text-sm text-primary-600">
                    رجوع
                </Link>
            </div>
        </div>
    );
}
