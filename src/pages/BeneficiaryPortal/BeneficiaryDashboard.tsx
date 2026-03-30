import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { familiesService } from '../../services/families.service';
import { Package, Calendar, Bell, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui';
import { useNavigate } from 'react-router-dom';

export default function BeneficiaryDashboard() {
    const navigate = useNavigate();
    const { beneficiarySession } = useAuthStore();
    const [stats, setStats] = useState({ totalBenefits: 0, lastBenefit: '', pendingNotifications: 1 });
    const [recentBenefits, setRecentBenefits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!beneficiarySession) return;
            try {
                const { data } = await familiesService.getBenefits(
                    beneficiarySession.familyId, 
                    beneficiarySession.registrationNumber
                );
                const benefits = data || [];
                
                setRecentBenefits(benefits.slice(0, 3));
                setStats({
                    totalBenefits: benefits.length,
                    lastBenefit: benefits[0]?.benefit_date ? new Date(benefits[0].benefit_date).toLocaleDateString('ar-DZ') : 'لا يوجد',
                    pendingNotifications: 1
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [beneficiarySession]);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary-600" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 border-b-4 border-b-primary-600">
                <div className="w-24 h-24 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-600 shadow-inner">
                    <ShieldCheck className="w-12 h-12" />
                </div>
                <div className="text-center md:text-right flex-1">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">مرحباً عائلة {beneficiarySession?.familyName}</h1>
                    <p className="text-gray-500 font-medium">أهلاً بكم في فضاء غيث الرقمي. هنا تجدون سجل استفاداتكم وإشعارات الجمعية.</p>
                </div>
                <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 font-mono font-bold text-gray-400">
                    رقم التسجيل: <span className="text-gray-900">{beneficiarySession?.registrationNumber}</span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:border-primary-200 transition-colors">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Package className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-bold mb-1">إجمالي الاستفادات</p>
                        <p className="text-2xl font-black text-gray-900">{stats.totalBenefits}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:border-primary-200 transition-colors">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-bold mb-1">تاريخ آخر استفادة</p>
                        <p className="text-lg font-black text-gray-900">{stats.lastBenefit}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:border-primary-200 transition-colors">
                    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                        <Bell className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-bold mb-1">إشعارات جديدة</p>
                        <p className="text-2xl font-black text-gray-900">{stats.pendingNotifications}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Aids (Digital Record) */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 underline underline-offset-8 decoration-primary-600 decoration-4">
                           آخر الاستفادات
                        </h3>
                        <Button variant="secondary" size="sm" onClick={() => navigate('/beneficiary/benefits')} className="gap-2 rounded-xl text-primary-600 hover:bg-primary-50">
                            عرض الكل
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="p-4 space-y-3">
                        {recentBenefits.length > 0 ? (
                            recentBenefits.map((b) => (
                                <div key={b.id} className="p-4 bg-gray-50/50 rounded-2xl flex items-center justify-between hover:bg-primary-50/30 transition-colors border border-transparent hover:border-primary-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900">{b.benefit_type}</p>
                                            <p className="text-xs text-gray-400 font-bold">{new Date(b.benefit_date).toLocaleDateString('ar-DZ')}</p>
                                        </div>
                                    </div>
                                    <div className="text-left font-black text-primary-700">
                                        {b.amount ? `${b.amount.toLocaleString()} دج` : (b.quantity ? `${b.quantity} وحدات` : 'مستلم')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center">
                                <Package className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold">لا توجد عمليات مؤخراً</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications & Announcements */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50">
                         <h3 className="text-xl font-black text-gray-900 underline underline-offset-8 decoration-primary-600 decoration-4">
                            إشعارات وتنبيهات
                        </h3>
                    </div>
                    <div className="p-8 space-y-4">
                        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-600 flex-shrink-0">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-black text-amber-900 mb-1">بداية التسجيل في قفة رمضان</h4>
                                <p className="text-sm text-amber-800 leading-relaxed font-medium">نحيطكم علماً بأن باب التسجيل للاستفادة من قفة رمضان 2024 مفتوح حالياً. يرجى التواصل مع الفرع.</p>
                            </div>
                        </div>
                        
                        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 text-center opacity-70">
                            <p className="text-sm text-blue-900 font-bold italic">لا توجد إشعارات أخرى حالياً.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
