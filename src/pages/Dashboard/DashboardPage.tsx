import { useState, useEffect } from 'react';
import { 
    Users, TrendingUp, 
    Clock, 
    Loader2, Sparkles,
    LayoutDashboard,
    DollarSign, UserCheck, Activity, Heart,
    HelpCircle, ArrowLeft, MapPin, CheckCircle
} from 'lucide-react';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { Button, StatCard, Badge } from '../../components/ui';
import ActivityForecastDashboard from './ActivityForecastDashboard';
import QuickBenefitModal from '../../components/modals/QuickBenefitModal';
import { BylawNoticeModal } from '../../components/modals/BylawNoticeModal';
import type { DashboardStats } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { PortalRequestView } from '../../services/admin.portal.service';
import { useNavigate } from 'react-router-dom';
import { 
    FileArchive, 
    FileText, 
    Settings, 
    Calendar, 
    Globe, 
    Heart as HeartIcon
} from 'lucide-react';

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
    const [recentRequests, setRecentRequests] = useState<PortalRequestView[]>([]);
    const { canAccess, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);


    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // HARDENED: Unified Pure RPC call (Internal Production Mandate)
            // Replaces multiple direct REST queries to families, members, transactions, etc.
            const { data, error } = await supabase.rpc('get_dashboard_stats_v3');
            
            if (error) {
                console.error('Dashboard Hardening Error:', error);
                // Fallback to empty stats to prevent crash
                return;
            }

            if (data) {
                setStats({
                    totalFamilies: data.totalFamilies || 0,
                    activeMembers: data.activeMembers || 0,
                    currentBalance: data.currentBalance || 0,
                    pendingRequests: data.pendingRequests || 0,
                    beneficiariesThisMonth: data.beneficiariesThisMonth || 0,
                    activitiesThisMonth: data.activitiesThisMonth || 0,
                    totalIncome: data.totalIncome || 0,
                    totalExpense: data.totalExpense || 0
                });

                if (data.recentActivities) setActivities(data.recentActivities);
                if (data.recentRequests) setRecentRequests(data.recentRequests);
            }

        } catch (error) {
            console.error('Fatal Dashboard Error:', error);
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
                    <p className="text-gray-500 text-sm mt-1">مرحباً بك مجدداً، {user?.fullName || 'سيدي الرئيس'}</p>
                </div>
                
                <div className="flex items-center gap-3 self-start md:self-auto">
                    {canAccess('administration', 'create') && (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowQuickBenefit(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-black shadow-md shadow-primary-200 transition-all border-b-4 border-primary-800 active:border-b-0 active:translate-y-1"
                            >
                                <Heart className="w-5 h-5" />
                                إستفادة سريعة
                            </button>
                        </div>
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
                    <div className="bg-gradient-to-l from-primary-600 to-primary-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black mb-2">أهلاً بك في منصة جمعية غيث الولائية</h2>
                            <p className="text-primary-100/90 text-sm font-bold flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                المسيلة، الجزائر — {new Date().toLocaleDateString('ar-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-400/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                    </div>

                    {/* Quick Access Grid - NEW */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {[
                            { label: 'الأرشيف', icon: FileArchive, path: '/archive', color: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
                            { label: 'المالية', icon: DollarSign, path: '/finance', color: 'bg-amber-500', hover: 'hover:bg-amber-600' },
                            { label: 'الإدارية', icon: Settings, path: '/administration', color: 'bg-slate-600', hover: 'hover:bg-slate-700' },
                            { label: 'الخطط', icon: Calendar, path: '/planning', color: 'bg-indigo-500', hover: 'hover:bg-indigo-600' },
                            { label: 'البوابة', icon: Globe, path: '/admin/portal/pending', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
                            { label: 'التقارير', icon: FileText, path: '/documents', color: 'bg-rose-500', hover: 'hover:bg-rose-600' },
                            { label: 'المحسنون', icon: HeartIcon, path: '/donors', color: 'bg-pink-500', hover: 'hover:bg-pink-600' },
                        ].map((item, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(item.path)}
                                className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className={`${item.color} p-3 rounded-2xl text-white mb-3 shadow-lg shadow-inherit/20 group-hover:scale-110 transition-transform`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-black text-gray-700 dark:text-gray-200">{item.label}</span>
                            </button>
                        ))}
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

                    {/* New Row: Portal Requests Widget */}
                    <div className="card bg-amber-50/30 border-amber-100 mt-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">طلبات المساعدة العاجلة (الفضاء الرقمي)</h3>
                                    <p className="text-sm text-amber-700/70 font-bold">لديك {stats?.pendingRequests || 0} طلبات مستفيدين بانتظار المراجعة</p>
                                </div>
                            </div>
                            <Button 
                                variant="secondary" 
                                onClick={() => navigate('/requests')}
                                className="bg-white hover:bg-amber-100 border-amber-200 text-amber-800 font-black rounded-xl"
                            >
                                مراجعة الكل
                                <ArrowLeft className="mr-2 w-4 h-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recentRequests.length > 0 ? recentRequests.map(req => (
                                <div key={req.id} className="bg-white p-5 rounded-3xl border border-amber-100/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <Badge variant={req.urgency_level === 'urgent' ? 'red' : 'orange'} className="font-black">
                                                {req.urgency_level === 'urgent' ? 'عاجل جداً' : 'طارئ'}
                                            </Badge>
                                            <span className="text-[10px] text-gray-400 font-bold">
                                                {new Date(req.request_date).toLocaleDateString('ar-DZ')}
                                            </span>
                                        </div>
                                        <h4 className="font-black text-gray-900 text-lg mb-1 group-hover:text-primary-700 transition-colors">عائلة {req.requester_name}</h4>
                                        <p className="text-xs text-gray-500 font-bold flex items-center gap-1 mb-3">
                                            <MapPin className="w-3 h-3" />
                                            بلدية {req.municipality_name}
                                        </p>
                                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed font-medium bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                                            {req.description}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => navigate('/requests')}
                                        className="mt-4 w-full py-2 bg-gray-50 text-gray-500 rounded-xl text-xs font-black hover:bg-primary-600 hover:text-white transition-all"
                                    >
                                        اتخاذ قرار
                                    </button>
                                </div>
                            )) : (
                                <div className="col-span-full py-10 text-center text-gray-400 font-bold">
                                    <CheckCircle className="w-12 h-12 text-primary-100 mx-auto mb-4" />
                                    لا توجد طلبات معلقة حالياً.
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <QuickBenefitModal 
                isOpen={showQuickBenefit} 
                onClose={() => setShowQuickBenefit(false)} 
                onSuccess={fetchDashboardData}
            />

            <BylawNoticeModal />
        </div>
    );
}
