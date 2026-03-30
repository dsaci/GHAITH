import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getPendingRegistrations, approveUser, rejectUser } from '../../../services/admin.portal.service';
import { CheckCircle, XCircle, User, Phone, MapPin, Clock, Search, Shield, FileDown } from 'lucide-react';
import { LoadingSpinner, Badge, Button, Input } from '../../../components/ui';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { VolunteerFormPDF } from '../../../components/Admin/Portal/VolunteerFormPDF';
import toast from 'react-hot-toast';

interface VolunteerData {
    occupation: string;
    specialization?: string;
    education_level?: string;
    areas_of_interest: string[];
}

interface PortalRequest {
    request_type: string;
    description: string;
    urgency: string;
}

interface ExternalUser {
    id: string;
    full_name: string;
    phone: string;
    email?: string;
    social_media?: string;
    portal_type: 'volunteer' | 'donor' | 'beneficiary';
    status: string;
    address?: string;
    birth_date?: string;
    birth_place?: string;
    national_id?: string;
    created_at: string;
    volunteers?: VolunteerData[];
    portal_requests?: PortalRequest[];
}

export default function RegistrationRequests() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<ExternalUser[]>([]);
    const [filter, setFilter] = useState<'all' | 'volunteer' | 'donor' | 'beneficiary'>('all');
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await getPendingRegistrations();
            if (error) {
                toast.error('خطأ في جلب الطلبات');
            } else {
                setRequests(data as ExternalUser[]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchData();
    }, []);

    const handleApprove = async (req: ExternalUser) => {
        if (!user) return;
        const confirm = window.confirm(`هل أنت متأكد من قبول ${req.full_name}؟`);
        if (!confirm) return;

        const { error } = await approveUser(req.id, user.id);
        if (error) {
            toast.error('فشل القبول');
        } else {
            toast.success('تم قبول المستخدم بنجاح');
            void fetchData();
        }
    };

    const handleReject = async (req: ExternalUser) => {
        if (!user) return;
        const reason = window.prompt('سبب الرفض:');
        if (reason === null) return;

        const { error } = await rejectUser(req.id, reason || 'لم يتم ذكر سبب', user.id);
        if (error) {
            toast.error('فشل الرفض');
        } else {
            toast.success('تم رفض الطلب');
            void fetchData();
        }
    };

    const filtered = requests.filter(r => {
        const matchType = filter === 'all' || r.portal_type === filter;
        const matchSearch = r.full_name.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search);
        return matchType && matchSearch;
    });

    const TYPE_LABELS: Record<string, string> = {
        volunteer: 'متطوع',
        donor: 'محسن',
        beneficiary: 'عائلة مستفيدة'
    };

    const TYPE_COLORS: Record<string, 'blue' | 'green' | 'yellow'> = {
        volunteer: 'blue',
        donor: 'green',
        beneficiary: 'yellow'
    };

    return (
        <div className="space-y-6 font-['Cairo'] animate-fade-in" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 italic-arabic">إدارة طلبات البوابة الخارجية</h1>
                    <p className="text-gray-500 dark:text-slate-400">مراجعة والتحقق من طلبات الانضمام للمتطوعين، المحسنين، والعائلات.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => void fetchData()} size="sm">تحديث القائمة</Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="بحث بالاسم أو الهاتف..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <div className="flex gap-2 bg-gray-50 dark:bg-slate-900/50 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                    {(['all', 'volunteer', 'donor', 'beneficiary'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === t
                                    ? 'bg-white dark:bg-slate-800 text-ghaith-navy dark:text-slate-200 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {t === 'all' ? 'الكل' : TYPE_LABELS[t]}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-slate-900/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-slate-400">لا توجد طلبات معلقة حالياً.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((req) => (
                        <div key={req.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                            {req.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100">{req.full_name}</h3>
                                            <Badge variant={TYPE_COLORS[req.portal_type]}>{TYPE_LABELS[req.portal_type]}</Badge>
                                        </div>
                                    </div>
                                    <div className="text-left text-xs text-gray-400">
                                        <div className="flex items-center gap-1 justify-end">
                                            <Clock className="w-3 h-3" />
                                            {new Date(req.created_at).toLocaleDateString('ar-DZ')}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                                        <Phone className="w-4 h-4" />
                                        <span>{req.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                                        <MapPin className="w-4 h-4" />
                                        <span className="truncate">{req.address || 'غير محدد'}</span>
                                    </div>
                                    {req.national_id && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 col-span-2">
                                            <Shield className="w-4 h-4" />
                                            <span>رقم التعريف: {req.national_id}</span>
                                        </div>
                                    )}
                                </div>

                                {req.portal_type === 'beneficiary' && req.portal_requests?.[0] && (
                                    <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-100 dark:border-orange-500/20">
                                        <div className="flex items-center gap-2 mb-2 font-bold text-orange-700 dark:text-orange-400">
                                            <FileDown className="w-4 h-4" />
                                            <span>تفاصيل طلب المساعدة:</span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-slate-300 bg-white/50 dark:bg-transparent p-3 rounded-lg border border-orange-50 dark:border-transparent">
                                            {req.portal_requests[0].description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-50 dark:border-slate-700/50 flex flex-wrap gap-2">
                                <Button
                                    className="flex-1 min-w-[120px] gap-2"
                                    onClick={() => void handleApprove(req)}
                                    variant="primary"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    قبول
                                </Button>

                                {req.portal_type === 'volunteer' && (
                                    <PDFDownloadLink
                                        key={`pdf-${req.id}`}
                                        document={
                                            <VolunteerFormPDF
                                                municipality={req.address || ''}
                                                data={{
                                                    full_name: req.full_name,
                                                    phone: req.phone,
                                                    address: req.address || '',
                                                    birth_date: req.birth_date || '',
                                                    birth_place: req.birth_place || '',
                                                    profession: req.volunteers?.[0]?.occupation || '',
                                                    specialization: req.volunteers?.[0]?.specialization,
                                                    education_level: req.volunteers?.[0]?.education_level,
                                                    email: req.email,
                                                    social_media: req.social_media,
                                                    interests: req.volunteers?.[0]?.areas_of_interest || []
                                                }}
                                            />
                                        }
                                        fileName={`استمارة_${req.full_name}.pdf`}
                                        className="flex-1 min-w-[120px]"
                                    >
                                        {({ loading: pdfLoading }) => (
                                            <Button
                                                variant="secondary"
                                                className="w-full gap-2 text-ghaith-navy"
                                                disabled={pdfLoading}
                                            >
                                                <FileDown className="w-4 h-4 text-ghaith-navy" />
                                                {pdfLoading ? 'جاري التحميل...' : 'الاستمارة'}
                                            </Button>
                                        )}
                                    </PDFDownloadLink>
                                )}

                                <Button
                                    className="flex-1 min-w-[120px] gap-2"
                                    variant="secondary"
                                    onClick={() => void handleReject(req)}
                                >
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    رفض
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
