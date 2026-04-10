import { useEffect, useState } from 'react';
import { 
    Users,
    Search,
    Filter,
    CheckCircle2, 
    XCircle, 
    Clock, 
    AlertCircle,
    UserPlus,
import { Heart, HandHelping } from 'lucide-react';
import { getPortalRequestsPaginatedBasic, updatePortalRequestStatusBasic } from '../../../services/admin.portal.service';
import { LoadingSpinner } from '../../../components/ui';
import toast from 'react-hot-toast';

interface PortalRequest {
    request_id: string;
    request_type: string;
    urgency: string;
    request_status: string;
    description: string;
    requested_at: string;
    user_id: string;
    full_name: string;
    phone: string;
    portal_type: 'volunteer' | 'donor' | 'beneficiary';
    user_status: string;
    volunteer_profession?: string;
    volunteer_skills?: string[];
}

export default function PortalRequestsPage() {
    const [requests, setRequests] = useState<PortalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 10;

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async (isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const offset = isLoadMore ? (page + 1) * PAGE_SIZE : 0;

            // [PURE RPC TRANSITION] Using Service Layer instead of raw RPC directly in React
            const { data, error } = await getPortalRequestsPaginatedBasic(PAGE_SIZE, offset);

            if (error) throw error;

            const newRequests = (data as any[]) || [];
            const count = newRequests.length > 0 ? (newRequests[0].total_count as number) : 0;

            if (isLoadMore) {
                setRequests(prev => [...prev, ...newRequests]);
                setPage(prev => prev + 1);
            } else {
                setRequests(newRequests);
                setPage(0);
            }

            // Detect if more records exist for "Load More" logic
            const currentTotal = isLoadMore ? requests.length + newRequests.length : newRequests.length;
            setHasMore(currentTotal < count);

        } catch (error) {
            console.error('Failed to fetch requests via RPC:', error);
            toast.error('فشل في جلب الطلبات (خطأ RPC)');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleStatusUpdate = async (requestId: string, newStatus: string) => {
        try {
            // [PURE RPC] Status update must go through Service Layer
            const { error } = await updatePortalRequestStatusBasic(requestId, newStatus);

            if (error) throw error;
            
            toast.success('تم تحديث حالة الطلب');
            fetchRequests(false); 
        } catch (error) {
            console.error('Update failed via RPC:', error);
            toast.error('فشل تحديث الحالة (خطأ RPC)');
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesFilter = filter === 'all' || req.request_status === filter;
        const matchesSearch = !searchTerm || 
                             req.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             req.phone?.includes(searchTerm);
        return matchesFilter && matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        قيد الانتظار
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        تم القبول
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                        <XCircle className="w-3.5 h-3.5" />
                        مرفوض
                    </span>
                );
            default:
                return null;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'volunteer': return <HandHelping className="w-5 h-5 text-ghaith-navy" />;
            case 'donor': return <Heart className="w-5 h-5 text-rose-500" />;
            case 'beneficiary': return <UserPlus className="w-5 h-5 text-emerald-500" />;
            default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in font-['Cairo']" dir="rtl">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
                        <Users className="w-8 h-8 text-ghaith-navy" />
                        طلبات البوابة الخارجية
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">إدارة طلبات التطوع والمساعدة والتمويل من المنصة الخارجية.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => fetchRequests(false)}
                        className="p-2 text-gray-400 hover:text-ghaith-navy transition-colors bg-gray-50 dark:bg-slate-800 rounded-xl"
                    >
                        <Clock className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text"
                        placeholder="البحث بالاسم أو رقم الهاتف..."
                        className="w-full pr-12 pl-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-ghaith-navy/20 focus:border-ghaith-navy outline-none transition-all dark:text-slate-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-gray-200 dark:border-slate-800 shrink-0">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                                filter === f 
                                    ? 'bg-ghaith-navy text-white shadow-lg shadow-ghaith-navy/20' 
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            {f === 'all' ? 'الكل' : f === 'pending' ? 'قيد الانتظار' : f === 'approved' ? 'مقبول' : 'مرفوض'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-24 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 animate-pulse">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-500 font-bold">جاري تحميل الطلبات...</p>
                </div>
            ) : filteredRequests.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
                    {filteredRequests.map((request) => (
                        <div 
                            key={request.request_id}
                            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-ghaith-navy opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
                                        {getTypeIcon(request.portal_type)}
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 dark:text-slate-100 group-hover:text-ghaith-navy transition-colors">
                                            {request.full_name}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                            <span>{request.phone}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{request.portal_type === 'volunteer' ? 'متطوع' : request.portal_type === 'donor' ? 'متبرع' : 'مستفيد'}</span>
                                        </div>
                                    </div>
                                </div>
                                {getStatusBadge(request.request_status)}
                            </div>

                            <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800/50">
                                <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                                    {request.description || "لا يوجد وصف متوفر للطلب."}
                                </p>
                                {request.volunteer_profession && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex flex-wrap gap-2 text-xs">
                                        <span className="bg-ghaith-navy/10 text-ghaith-navy px-3 py-1 rounded-lg font-bold">
                                            المهنة: {request.volunteer_profession}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                    تاريخ الطلب: {new Date(request.requested_at).toLocaleDateString('ar-DZ')}
                                </span>
                                
                                {request.request_status === 'pending' && (
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleStatusUpdate(request.request_id, 'rejected')}
                                            className="px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                                        >
                                            رفض
                                        </button>
                                        <button 
                                            onClick={() => handleStatusUpdate(request.request_id, 'approved')}
                                            className="px-6 py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                        >
                                            قبول الطلب
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-24 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800">
                    <Filter className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold text-lg">لم يتم العثور على أي طلبات تطابق معايير البحث.</p>
                </div>
            )}

            {hasMore && filteredRequests.length > 0 && (
                <div className="flex justify-center mt-8 mb-12">
                    <button
                        onClick={() => fetchRequests(true)}
                        disabled={loadingMore}
                        className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-ghaith-navy font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
                    >
                        {loadingMore ? <LoadingSpinner size="sm" /> : <Clock className="w-4 h-4" />}
                        عرض المزيد من الطلبات
                    </button>
                </div>
            )}
        </div>
    );
}
