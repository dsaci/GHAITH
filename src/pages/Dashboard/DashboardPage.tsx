import { useState, useEffect } from 'react';
import { 
    Users, TrendingUp, 
    Clock, 
    Loader2, Sparkles,
    LayoutDashboard,
    DollarSign, UserCheck, Activity, Heart
} from 'lucide-react';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { Badge, StatCard } from '../../components/ui';
import ActivityForecastDashboard from './ActivityForecastDashboard';
import QuickBenefitModal from '../../components/modals/QuickBenefitModal';
import type { DashboardStats } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ActivityItem {
    id: string;
    description: string;
    action_type: string;
    resource_type: string;
    created_at: string;
}

const formatCurrency = (n: number) => n.toLocaleString('ar-DZ') + ' دج';


const CHART_CATEGORIES = [
    { name: 'أرامل', value: 45, color: '#8b5cf6' },
    { name: 'ذوو إعاقة', value: 25, color: '#3b82f6' },
    { name: 'أمراض مزمنة', value: 30, color: '#ef4444' },
    { name: 'أيتام', value: 20, color: '#f59e0b' },
    { name: 'أسر معوزة', value: 40, color: '#10b981' },
];

const CHART_BENEFICIARIES_12M = [
    { month: 'جانفي', count: 120 }, { month: 'فيفري', count: 135 },
    { month: 'مارس', count: 150 }, { month: 'أفريل', count: 180 },
    { month: 'ماي', count: 195 }, { month: 'جوان', count: 210 },
    { month: 'جويلية', count: 225 }, { month: 'أوت', count: 240 },
    { month: 'سبتمبر', count: 280 }, { month: 'أكتوبر', count: 310 },
    { month: 'نوفمبر', count: 325 }, { month: 'ديسمبر', count: 350 },
];

const CHART_FINANCE_6M = [
    { month: 'أكتوبر', income: 450000, expense: 380000 },
    { month: 'نوفمبر', income: 520000, expense: 410000 },
    { month: 'ديسمبر', income: 1200000, expense: 950000 },
    { month: 'جانفي', income: 380000, expense: 320000 },
    { month: 'فيفري', income: 420000, expense: 350000 },
    { month: 'مارس', income: 550000, expense: 480000 },
];

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [view, setView] = useState<'overview' | 'forecast'>('overview');
    const [loading, setLoading] = useState(true);
    const [showQuickBenefit, setShowQuickBenefit] = useState(false);
    const { canAccess } = useAuth();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            const [
                { count: totalFamilies },
                { count: activeMembers },
                { data: transactions },
                { count: pendingRequests },
                { count: beneficiariesThisMonth },
                { count: activitiesThisMonth },
                { data: recentActs }
            ] = await Promise.all([
                supabase.from('families').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
                supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('is_deleted', false),
                supabase.from('transactions').select('amount, transaction_type').eq('is_deleted', false),
                supabase.from('portal_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('family_benefits').select('*', { count: 'exact', head: true }).gte('benefit_date', firstOfMonth),
                supabase.from('occasions').select('*', { count: 'exact', head: true }).gte('start_date', firstOfMonth).eq('status', 'completed'),
                supabase.from('recent_activities').select('*').order('created_at', { ascending: false }).limit(6)
            ]);

            const income = transactions?.filter((t: any) => t.transaction_type === 'income').reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;
            const expense = transactions?.filter((t: any) => t.transaction_type === 'expense').reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;

            setStats({
                totalFamilies: totalFamilies || 0,
                activeMembers: activeMembers || 0,
                currentBalance: income - expense,
                pendingRequests: pendingRequests || 0,
                beneficiariesThisMonth: beneficiariesThisMonth || 0,
                activitiesThisMonth: activitiesThisMonth || 0,
                totalIncome: income,
                totalExpense: expense
            });

            if (recentActs) setActivities(recentActs);

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                <p className="text-gray-500 font-medium">جاري تحديث البيانات...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in" dir="rtl">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">لوحة التحكم</h1>
                    <p className="text-gray-500 text-sm mt-1">مرحباً بك مجدداً، ساسي عبد النور</p>
                </div>
                
                <div className="flex items-center gap-3 self-start md:self-auto">
                    {canAccess('administration', 'create') && (
                        <button 
                            onClick={() => setShowQuickBenefit(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-black shadow-md shadow-primary-200 transition-all border-b-4 border-primary-800 active:border-b-0 active:translate-y-1"
                        >
                            <Heart className="w-5 h-5" />
                            إستفادة سريعة
                        </button>
                    )}

                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl">
                        <button 
                            onClick={() => setView('overview')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                view === 'overview' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            نظرة عامة
                        </button>
                        <button 
                            onClick={() => setView('forecast')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                view === 'forecast' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            التنبؤ الذكي
                        </button>
                    </div>
                </div>
            </div>

            {view === 'forecast' ? (
                <ActivityForecastDashboard />
            ) : (
                <>
                    {/* Welcome banner */}
                    <div className="bg-gradient-to-l from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg">
                        <h2 className="text-xl font-black">أهلاً بك في منصة جمعية غيث الولائية</h2>
                        <p className="text-primary-100/90 text-sm mt-1">المسيلة، الجزائر — آخر تحديث: {new Date().toLocaleDateString('ar-DZ')}</p>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <StatCard title="إجمالي العائلات" value={stats?.totalFamilies || 0} icon={<Users className="w-6 h-6" />} color="green" />
                        <StatCard title="مستفيدو الشهر" value={stats?.beneficiariesThisMonth || 0} icon={<UserCheck className="w-6 h-6" />} color="blue" />
                        <StatCard title="الرصيد الحالي" value={formatCurrency(stats?.currentBalance || 0)} icon={<DollarSign className="w-6 h-6" />} color="indigo" />
                        <StatCard title="طلبات معلقة" value={stats?.pendingRequests || 0} icon={<Clock className="w-6 h-6" />} color="yellow" />
                        <StatCard title="الأعضاء الفاعلون" value={stats?.activeMembers || 0} icon={<Users className="w-6 h-6" />} color="purple" />
                        <StatCard title="أنشطة الشهر" value={stats?.activitiesThisMonth || 0} icon={<Activity className="w-6 h-6" />} color="green" />
                    </div>

                    {/* Charts row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="card lg:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="section-title mb-0 text-lg">تطور المستفيدين — 12 شهر</h3>
                                <TrendingUp className="w-5 h-5 text-primary-500" />
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={CHART_BENEFICIARIES_12M}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Cairo' }} />
                                    <YAxis tick={{ fontSize: 12, fontFamily: 'Cairo' }} />
                                    <Tooltip formatter={(v) => [v, 'عدد المستفيدين']} />
                                    <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={3} dot={{ fill: '#16a34a', r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="card">
                            <h3 className="section-title text-lg">توزيع الفئات</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={CHART_CATEGORIES} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" nameKey="name">
                                        {CHART_CATEGORIES.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="grid grid-cols-2 gap-1 mt-2">
                                {CHART_CATEGORIES.map(c => (
                                    <div key={c.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                                        {c.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="card lg:col-span-2">
                            <h3 className="section-title text-lg">المدخولات مقابل المخرجات (6 أشهر)</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={CHART_FINANCE_6M} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Cairo' }} />
                                    <YAxis tick={{ fontSize: 12, fontFamily: 'Cairo' }} tickFormatter={v => (v / 1000) + 'k'} />
                                    <Tooltip formatter={(v: number) => [v.toLocaleString('ar-DZ') + ' دج']} />
                                    <Legend />
                                    <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="المدخولات" />
                                    <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} name="المخرجات" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Recent activity */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="section-title mb-0 text-lg">آخر النشاطات</h3>
                                <Badge variant="blue" className="bg-primary-50 text-primary-600 border-primary-100">مباشر</Badge>
                            </div>
                            <div className="space-y-3">
                                {activities.length > 0 ? activities.map(log => (
                                    <div key={log.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 rounded-xl transition-all group">
                                        <div className="w-9 h-9 bg-primary-100/50 rounded-xl flex items-center justify-center text-primary-700 font-black text-sm shrink-0 border border-primary-100 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                            {log.resource_type === 'family' ? 'ع' : log.resource_type === 'member' ? 'ض' : 'م'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{log.description}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                                                    log.action_type === 'create' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {log.action_type === 'create' ? 'إضافة' : 'تحديث'}
                                                </span>
                                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {new Date(log.created_at).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8">
                                        <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400">لا توجد سجلات نشاط حالياً</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            <QuickBenefitModal 
                isOpen={showQuickBenefit} 
                onClose={() => setShowQuickBenefit(false)} 
                onSuccess={fetchDashboardData}
            />
        </div>
    );
}
