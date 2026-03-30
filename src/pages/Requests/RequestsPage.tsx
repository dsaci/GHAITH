import { useState, useEffect } from 'react';
import { Plus, AlertCircle, Clock, CheckCircle, XCircle, MapPin, Phone, Loader2, MessageSquare } from 'lucide-react';
import { Badge, Button } from '../../components/ui';
import { MSILA_DAIRAS, MSILA_MUNICIPALITIES } from '../../data/msilaData';
import { getPortalRequests, updateRequestStatus, PortalRequestView } from '../../services/admin.portal.service';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const TYPE_LABELS: Record<string, string> = {
    financial_aid: 'مساعدة مالية', food_aid: 'مساعدة غذائية', medical_aid: 'مساعدة طبية',
    educational_aid: 'دعم تعليمي', space_request: 'طلب فضاء', other: 'طلب آخر',
};
const STATUS_LABELS: Record<string, string> = { pending: 'معلق', under_review: 'قيد الدراسة', approved: 'موافق عليه', rejected: 'مرفوض', fulfilled: 'تم التنفيذ' };
const STATUS_COLORS: Record<string, 'yellow' | 'blue' | 'green' | 'red' | 'gray'> = { pending: 'yellow', under_review: 'blue', approved: 'green', rejected: 'red', fulfilled: 'gray' };
const URGENCY_LABELS: Record<string, string> = { low: 'منخفض', medium: 'متوسط', high: 'عالٍ', urgent: 'عاجل جداً' };
const URGENCY_COLORS: Record<string, 'gray' | 'blue' | 'orange' | 'red'> = { low: 'gray', medium: 'blue', high: 'orange', urgent: 'red' };

export default function RequestsPage() {
    const [requests, setRequests] = useState<PortalRequestView[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [municipalityFilter, setMunicipalityFilter] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchRequests();
    }, [statusFilter, municipalityFilter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data } = await getPortalRequests({ 
                status: statusFilter || undefined, 
                municipality: municipalityFilter || undefined 
            });
            setRequests(data);
        } catch (error) {
            toast.error('خطأ في جلب الطلبات');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (request: PortalRequestView, status: 'approved' | 'rejected') => {
        if (!user) return;
        
        const notes = window.prompt(status === 'approved' ? 'ملاحظات الموافقة (اختياري):' : 'سبب الرفض:');
        if (status === 'rejected' && !notes) return;

        try {
            setProcessingId(request.id);
            const { error } = await updateRequestStatus({
                requestId: request.id,
                status,
                notes: notes || undefined,
                reviewerId: user.id,
                familyId: request.family_id
            });

            if (error) throw error;
            toast.success('تم تحديث حالة الطلب وإشعار العائلة');
            fetchRequests();
        } catch (error) {
            toast.error('خطأ في تحديث الطلب');
        } finally {
            setProcessingId(null);
        }
    };

    const pending = requests.filter(r => r.status === 'pending').length;

    return (
        <div className="space-y-5 animate-fade-in" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">طلبات المساعدة (الفضاء الرقمي)</h2>
                    {pending > 0 && (
                        <div className="flex items-center gap-2 text-sm text-amber-600 mt-1 font-bold">
                            <AlertCircle className="w-4 h-4" />
                            لديك {pending} طلبات جديدة بانتظار المراجعة
                        </div>
                    )}
                </div>
                <Button variant="primary" icon={<Plus className="w-4 h-4" />}>إضافة طلب يدوي</Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex bg-white dark:bg-gray-700 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 gap-1 overflow-x-auto">
                    {[{ value: '', label: 'الكل' }, { value: 'pending', label: 'معلقة' }, { value: 'under_review', label: 'قيد الدراسة' }, { value: 'approved', label: 'موافق عليها' }, { value: 'fulfilled', label: 'منفذة' }].map(f => (
                        <button 
                            key={f.value} 
                            onClick={() => setStatusFilter(f.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                statusFilter === f.value ? 'bg-primary-600 text-white shadow-md shadow-primary-200' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <select 
                        value={municipalityFilter} 
                        onChange={e => setMunicipalityFilter(e.target.value)} 
                        className="select-field text-sm font-bold p-2.5 shadow-sm"
                    >
                        <option value="">جميع البلديات</option>
                        {MSILA_DAIRAS.map(dairaName => (
                            <optgroup key={dairaName} label={dairaName}>
                                {MSILA_MUNICIPALITIES.filter(m => m.daira === dairaName).map(m => (
                                    <option key={m.id} value={m.name}>{m.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                    <p className="text-gray-500 font-bold text-lg">جاري تحميل الطلبات البنكية...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {requests.length > 0 ? requests.map(r => (
                        <div key={r.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            {r.status === 'pending' && <div className="absolute top-0 right-0 w-2 h-full bg-amber-400" />}
                            
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-start gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                        r.urgency_level === 'urgent' ? 'bg-red-50 text-red-600' : 
                                        r.urgency_level === 'high' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                        <Clock className="w-7 h-7" />
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h4 className="text-xl font-black text-gray-900 dark:text-white">عائلة {r.requester_name}</h4>
                                            <Badge variant={URGENCY_COLORS[r.urgency_level as any] || 'gray'}>إلحاح: {URGENCY_LABELS[r.urgency_level]}</Badge>
                                            <Badge variant="gray">{TYPE_LABELS[r.request_type] || 'طلب عام'}</Badge>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 mt-2">
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> بلدية {r.municipality_name}</span>
                                            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {r.requester_phone}</span>
                                            <span className="flex items-center gap-1 font-mono">#{r.registration_number}</span>
                                        </div>

                                        <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-600 group-hover:bg-white dark:group-hover:bg-gray-700 group-hover:border-gray-100 transition-all">
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{r.description}</p>
                                        </div>

                                        {r.reviewer_notes && (
                                            <div className="flex items-start gap-2 mt-3 p-3 bg-primary-50 text-primary-700 rounded-xl border border-primary-100/50">
                                                <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                                                <p className="text-xs font-bold italic">ملاحظة المراجع ({r.reviewer_name}): {r.reviewer_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 border-t lg:border-t-0 lg:border-r border-gray-100 dark:border-gray-700 pt-4 lg:pt-0 lg:pr-6">
                                    <div className="text-left">
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">تاريخ الطلب</p>
                                        <p className="text-sm font-black text-gray-800 dark:text-gray-200">{new Date(r.request_date).toLocaleDateString('ar-DZ')}</p>
                                        <Badge variant={STATUS_COLORS[r.status] || 'gray'} className="mt-2 py-1 px-4 text-xs font-black">
                                            {STATUS_LABELS[r.status]}
                                        </Badge>
                                    </div>

                                    {r.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button 
                                                disabled={processingId === r.id}
                                                onClick={() => handleAction(r, 'approved')}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
                                                title="موافقة"
                                            >
                                                {processingId === r.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                            </button>
                                            <button 
                                                disabled={processingId === r.id}
                                                onClick={() => handleAction(r, 'rejected')}
                                                className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl shadow-lg shadow-red-200 transition-all disabled:opacity-50"
                                                title="رفض"
                                            >
                                                {processingId === r.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <CheckCircle className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-400 dark:text-gray-500">لا توجد طلبات تطابق بحثك</h3>
                            <button onClick={() => {setStatusFilter(''); setMunicipalityFilter('');}} className="text-primary-600 font-bold mt-2 hover:underline">إعادة ضبط المرشحات</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
