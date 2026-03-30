import { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Package, MessageSquare, 
    Clock, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Badge, StatCard } from '../../components/ui';
import type { BenefitReceipt, AidRequest } from '../../types';

export default function BeneficiaryDashboard() {
    const { user } = useAuth();
    const [receipts, setReceipts] = useState<BenefitReceipt[]>([]);
    const [requests, setRequests] = useState<AidRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchPortalData();
    }, [user]);

    async function fetchPortalData() {
        try {
            setLoading(true);
            // In a real scenario, we fetch based on the logged in external user's family_id
            // For now, we'll fetch requests and receipts associated with this auth user
            const [receiptsRes, requestsRes] = await Promise.all([
                supabase.from('benefit_receipts').select('*').order('receipt_date', { ascending: false }).limit(5),
                supabase.from('portal_requests').select('*').order('created_at', { ascending: false }).limit(5)
            ]);

            setReceipts(receiptsRes.data || []);
            setRequests((requestsRes.data || []).map((r: any) => ({
                id: r.id,
                requestType: r.request_type,
                description: r.description,
                status: r.status,
                urgencyLevel: r.urgency,
                createdAt: r.created_at
            } as AidRequest)));
        } catch (err) {
            console.error('Error fetching portal data:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <p className="text-gray-500 font-medium text-sm">جاري تحميل بياناتك...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in" dir="rtl">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">مرحباً بك، {user?.fullName}</h2>
                    <p className="text-sm text-gray-500 mt-1">تتبع مساعداتك وقم بتقديم طلبات جديدة عبر هذا الفضاء.</p>
                </div>
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                    <LayoutDashboard className="w-6 h-6" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    title="المساعدات المستلمة" 
                    value={receipts.length} 
                    icon={<Package className="w-5 h-5" />} 
                    color="green" 
                />
                <StatCard 
                    title="طلبات قيد المراجعة" 
                    value={requests.filter(r => r.status === 'pending').length} 
                    icon={<Clock className="w-5 h-5" />} 
                    color="yellow" 
                />
                <StatCard 
                    title="إجمالي الطلبات" 
                    value={requests.length} 
                    icon={<MessageSquare className="w-5 h-5" />} 
                    color="blue" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Receipts */}
                <div className="card">
                    <h3 className="section-title flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary-600" />
                        آخر المساعدات المستلمة
                    </h3>
                    <div className="space-y-3">
                        {receipts.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4 text-center">لا توجد سجلات مسجلة حالياً.</p>
                        ) : (
                            receipts.map(r => (
                                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{r.benefit_type}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{r.receipt_date}</p>
                                    </div>
                                    <Badge variant="green">مستلمة</Badge>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Requests */}
                <div className="card">
                    <h3 className="section-title flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary-600" />
                        حالة طلباتي الأخيرة
                    </h3>
                    <div className="space-y-3">
                        {requests.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4 text-center">لم تقم بتقديم أي طلبات بعد.</p>
                        ) : (
                            requests.map(r => (
                                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex-1 min-w-0 pr-3">
                                        <p className="text-sm font-bold text-gray-900 truncate">{r.requestType}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">{r.description}</p>
                                    </div>
                                    <Badge variant={
                                        r.status === 'approved' ? 'green' : 
                                        r.status === 'rejected' ? 'red' : 
                                        r.status === 'pending' ? 'yellow' : 'blue'
                                    }>
                                        {r.status === 'pending' ? 'قيد المراجعة' : 
                                         r.status === 'approved' ? 'مقبول' : 
                                         r.status === 'rejected' ? 'مرفوض' : r.status}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
