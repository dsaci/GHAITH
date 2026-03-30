import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { portalService, PortalRequest } from '../../services/portal.service';
import { HelpCircle, Plus, Send, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Info, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui';

export default function MyRequests() {
    const { beneficiarySession } = useAuthStore();
    const [requests, setRequests] = useState<PortalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [type, setType] = useState('food_aid');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const loadRequests = async () => {
        if (!beneficiarySession) return;
        setLoading(true);
        try {
            const { data } = await portalService.getRequests(
                beneficiarySession.familyId,
                beneficiarySession.registrationNumber
            );
            setRequests(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [beneficiarySession]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || !beneficiarySession) return;

        setSubmitting(true);
        setMessage(null);
        try {
            const { error } = await portalService.submitRequest(
                beneficiarySession.familyId,
                beneficiarySession.registrationNumber,
                { type, description }
            );

            if (error) throw error;

            setMessage({ text: 'تم إرسال طلبك بنجاح. سنقوم بمراجعته والرد عليك قريباً.', type: 'success' });
            setDescription('');
            setShowForm(false);
            loadRequests();
        } catch (err) {
            console.error(err);
            setMessage({ text: 'عذراً، حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending': return { label: 'قيد الانتظار', icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-100' };
            case 'under_review': return { label: 'قيد المراجعة', icon: HelpCircle, color: 'text-blue-500 bg-blue-50 border-blue-100' };
            case 'approved': return { label: 'مقبول', icon: CheckCircle, color: 'text-green-500 bg-green-50 border-green-100' };
            case 'fulfilled': return { label: 'تم التنفيذ', icon: CheckCircle, color: 'text-primary-500 bg-primary-50 border-primary-100' };
            case 'rejected': return { label: 'مرفوض', icon: XCircle, color: 'text-red-500 bg-red-50 border-red-100' };
            default: return { label: 'غير معروف', icon: Info, color: 'text-gray-500 bg-gray-50 border-gray-100' };
        }
    };

    const requestTypes = [
        { id: 'food_aid', label: 'مساعدة غذائية' },
        { id: 'medical_aid', label: 'مساعدة طبية' },
        { id: 'financial_aid', label: 'مساعدة مالية' },
        { id: 'clothing', label: 'ملابس / كسوة' },
        { id: 'educational_aid', label: 'أدوات مدرسية' },
        { id: 'other', label: 'أخرى' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-100">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 leading-tight">طلبات المساعدة</h1>
                        <p className="text-gray-400 font-bold text-sm">أرسل طلبك للجمعية وتابع حالته من هنا</p>
                    </div>
                </div>
                
                {!showForm && (
                     <Button 
                        onClick={() => setShowForm(true)}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-6 rounded-[1.5rem] shadow-lg shadow-primary-100 flex items-center gap-3 font-black text-lg transition-transform hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-6 h-6" />
                        طلب مساعدة جديد
                    </Button>
                )}
            </div>

            {message && (
                <div className={`p-6 rounded-3xl border flex items-center gap-4 animate-in zoom-in duration-300 ${
                    message.type === 'success' ? 'bg-green-50 text-green-800 border-green-100' : 'bg-red-50 text-red-800 border-red-100'
                }`}>
                    {message.type === 'success' ? <CheckCircle className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
                    <p className="font-bold">{message.text}</p>
                    <button onClick={() => setMessage(null)} className="mr-auto text-sm underline opacity-50 hover:opacity-100">إغلاق</button>
                </div>
            )}

            {showForm ? (
                <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-gray-100 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black text-gray-900 underline underline-offset-8 decoration-primary-600 decoration-4">إرسال طلب جديد</h2>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-900 font-bold">إلغاء</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-gray-900 font-black mb-4">ما نوع المساعدة التي تحتاجها؟</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {requestTypes.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setType(t.id)}
                                        className={`px-6 py-4 rounded-2xl border-2 font-bold transition-all text-sm sm:text-base ${
                                            type === t.id 
                                            ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm' 
                                            : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-900 font-black mb-4">اشرح لنا حاجتك (ببساطة):</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-40 px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-[2rem] focus:border-primary-600 focus:bg-white transition-all text-gray-900 font-medium text-lg leading-relaxed outline-none"
                                placeholder="مثال: أحتاج لقضاء وصفة طبية مستعجلة، أو مساعدة غذائية للأطفال..."
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                            <Button 
                                type="submit" 
                                disabled={submitting || !description.trim()}
                                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-12 py-6 rounded-2xl shadow-xl shadow-primary-200 flex items-center justify-center gap-3 font-black text-xl disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                إرسال الطلب الآن
                            </Button>
                            <p className="text-gray-400 text-sm font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5" />
                                طلبك سيعامل بسرية تامة من قبل إدارة الجمعية.
                            </p>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-primary-600" /></div>
                    ) : requests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {requests.map((r) => {
                                const status = getStatusInfo(r.status);
                                return (
                                    <div key={r.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 group hover:border-primary-100 transition-all flex flex-col justify-between h-full">
                                        <div>
                                            <div className="flex items-center justify-between mb-6">
                                                <div className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 ${status.color}`}>
                                                    <status.icon className="w-4 h-4" />
                                                    {status.label}
                                                </div>
                                                <span className="text-xs text-gray-400 font-bold">{new Date(r.created_at).toLocaleDateString('ar-DZ')}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 mb-2">
                                                {requestTypes.find(t => t.id === r.request_type)?.label || r.request_type}
                                            </h3>
                                            <p className="text-gray-600 font-medium leading-relaxed line-clamp-3 mb-6">{r.description}</p>
                                        </div>
                                        {r.internal_notes && (
                                            <div className="mt-4 p-4 bg-primary-100/30 rounded-2xl border border-primary-100 text-sm">
                                                <p className="font-black text-primary-700 mb-1 flex items-center gap-2">
                                                    <Info className="w-4 h-4" />
                                                    رد الجمعية:
                                                </p>
                                                <p className="text-primary-800 font-medium">{r.internal_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-sm border-dashed">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HelpCircle className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">لا توجد طلبات سابقة</h3>
                            <p className="text-gray-400 font-bold max-w-xs mx-auto text-sm mb-8">إذا كنت بحاجة لمساعدة، يمكنك إرسال طلب جديد بكل سهولة بالنقر على الزر أعلاه.</p>
                            <Button variant="secondary" onClick={() => setShowForm(true)} className="rounded-2xl px-8 font-black">
                                ابدأ أول طلب لك
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
