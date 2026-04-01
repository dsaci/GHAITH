import { useState, useEffect } from 'react';
import { 
    Heart, TrendingUp, 
    Gift, Award, Loader2, Landmark
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/ui';
import { BylawNoticeModal } from '../../components/modals/BylawNoticeModal';
import type { Donor } from '../../types';

export default function DonorDashboard() {
    const { user } = useAuth();
    const [donorProfile, setDonorProfile] = useState<Donor | null>(null);
    const [recentDonations, setRecentDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchDonorData();
    }, [user]);

    async function fetchDonorData() {
        try {
            setLoading(true);
            // In a real scenario, we link auth user to a donor entry
            const { data: profile } = await supabase
                .from('donors')
                .select('*')
                .eq('email', user?.email)
                .single();

            if (profile) {
                setDonorProfile({
                    id: profile.id,
                    fullName: profile.full_name,
                    totalDonated: profile.total_donated || 0,
                    lastDonationDate: profile.last_donation_date,
                    donorType: profile.donor_type as any,
                } as any);

                // Fetch recent transactions for this donor
                const { data: donations } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('donor_id', profile.id)
                    .eq('transaction_type', 'income')
                    .order('transaction_date', { ascending: false })
                    .limit(5);

                setRecentDonations((donations || []).map((d: any) => ({
                    id: d.id,
                    amount: d.amount,
                    transactionDate: d.transaction_date,
                    category: d.category,
                    paymentMethod: d.payment_method
                })));
            }
        } catch (err) {
            console.error('Error fetching donor data:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <p className="text-gray-500 font-medium text-sm">جاري تحميل بيانات العطاء...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in" dir="rtl">
            <div className="bg-gradient-to-l from-primary-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-xl font-bold">تقبل الله منك يا {user?.fullName}</h2>
                    <p className="text-primary-100 text-sm mt-1">عطاؤك المستمر هو سر استقرار الكثير من العائلات في المسيلة.</p>
                </div>
                <Heart className="absolute -left-4 -bottom-4 w-32 h-32 text-white/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    title="إجمالي المساهمات" 
                    value={(donorProfile?.totalDonated || 0).toLocaleString('ar-DZ') + ' دج'} 
                    icon={<TrendingUp className="w-5 h-5" />} 
                    color="indigo" 
                />
                <StatCard 
                    title="عدد التبرعات" 
                    value={recentDonations.length} 
                    icon={<Gift className="w-5 h-5" />} 
                    color="green" 
                />
                <StatCard 
                    title="المستوى الحالي" 
                    value="مُحسن متميز" 
                    icon={<Award className="w-5 h-5" />} 
                    color="purple" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Impact Summary */}
                <div className="card border-primary-100 bg-primary-50/30">
                    <h3 className="section-title text-primary-800">أثر عطائك</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-primary-100">
                            <p className="text-2xl font-black text-primary-700">12</p>
                            <p className="text-xs text-gray-500 mt-1">عائلة استفادت من دعمك هذا العام</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-primary-100">
                            <p className="text-2xl font-black text-primary-700">4</p>
                            <p className="text-xs text-gray-500 mt-1">أيتام تمت كفالتهم بفضلك</p>
                        </div>
                    </div>
                    <button className="mt-4 w-full py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors">
                        عرض تقرير الأثر الكامل
                    </button>
                </div>

                {/* Recent Donations List */}
                <div className="card">
                    <h3 className="section-title">آخر مساهماتك</h3>
                    <div className="space-y-3">
                        {recentDonations.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4 text-center">لا توجد تبرعات مسجلة في هذا الحساب.</p>
                        ) : (
                            recentDonations.map(d => (
                                <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                            <Landmark className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{Number(d.amount).toLocaleString('ar-DZ')} دج</p>
                                            <p className="text-xs text-gray-400">{d.transactionDate}</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-gray-500">{d.category}</p>
                                        <p className="text-[10px] text-gray-400">{d.paymentMethod === 'cash' ? 'نقدي' : 'تحويل'}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <button className="w-full text-center text-xs text-primary-600 font-bold mt-2">
                            عرض جميع التبرعات
                        </button>
                    </div>
                </div>
            </div>
            <BylawNoticeModal />
        </div>
    );
}
