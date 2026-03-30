import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { portalService, PortalNotification } from '../../services/portal.service';
import { Bell, Calendar, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Notifications() {
    const { beneficiarySession } = useAuthStore();
    const [notifications, setNotifications] = useState<PortalNotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNotifications = async () => {
            if (!beneficiarySession) return;
            try {
                const { data } = await portalService.getNotifications(
                    beneficiarySession.familyId,
                    beneficiarySession.registrationNumber
                );
                setNotifications(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadNotifications();
    }, [beneficiarySession]);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary-600" /></div>;

    const getIcon = (type: string) => {
        switch (type) {
            case 'approval': return <CheckCircle2 className="w-6 h-6 text-green-600" />;
            case 'rejection': return <AlertCircle className="w-6 h-6 text-red-600" />;
            case 'reminder': return <Calendar className="w-6 h-6 text-blue-600" />;
            default: return <Bell className="w-6 h-6 text-primary-600" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'approval': return 'bg-green-50 border-green-100';
            case 'rejection': return 'bg-red-50 border-red-100';
            case 'reminder': return 'bg-blue-50 border-blue-100';
            default: return 'bg-primary-50 border-primary-100';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-100">
                    <Bell className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black text-gray-900">الإشعارات</h1>
            </div>

            <div className="space-y-4 max-w-3xl">
                {notifications.length > 0 ? (
                    notifications.map((n) => (
                        <div key={n.id} className={`p-6 rounded-[2rem] border ${getBgColor(n.type)} flex gap-5 hover:shadow-sm transition-all`}>
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                                {getIcon(n.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <h3 className="font-black text-gray-900 text-lg leading-tight">{n.title}</h3>
                                    <span className="text-xs text-gray-400 font-bold whitespace-nowrap">{new Date(n.created_at).toLocaleDateString('ar-DZ')}</span>
                                </div>
                                <p className="text-gray-600 font-medium leading-relaxed">{n.message}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">لا توجد إشعارات جديدة</h3>
                        <p className="text-gray-400 font-bold max-w-xs mx-auto text-sm">أنت على اطلاع بكل جديد. سنقوم بإبلاغك فور صدور أي إعلانات من الجمعية.</p>
                    </div>
                )}
            </div>

            {/* Static Important Notification (Example for UI richness) */}
            {notifications.length > 0 && (
                <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex items-start gap-4 max-w-3xl">
                    <Info className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                    <div>
                        <h4 className="font-black text-amber-900 text-lg mb-1">تنبيه مستمر</h4>
                        <p className="text-amber-800 font-medium leading-relaxed text-sm">
                            يرجى التأكد من أن هاتفك المسجل قيد التشغيل، حيث نتواصل معكم عبر الرسائل النصية القصيرة عند توزيع الطرود الكبيرة.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
