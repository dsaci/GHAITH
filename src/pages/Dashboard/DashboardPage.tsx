import {
    Users, DollarSign, Clock, UserCheck,
    Activity, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { StatCard } from '../../components/ui';
import {
    MOCK_DASHBOARD_STATS, CHART_BENEFICIARIES_12M,
    CHART_CATEGORIES, CHART_FINANCE_6M, MOCK_AUDIT_LOGS
} from '../../data/mockData';

const formatCurrency = (n: number) => n.toLocaleString('ar-DZ') + ' دج';

const URGENCY_ALERTS = [
    { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', text: '4 طلبات مساعدة تنتظر المراجعة', time: 'الآن' },
    { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', text: '3 وثائق تنتهي صلاحيتها خلال 30 يوم', time: 'تنبيه' },
    { icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50', text: 'الجمعية العامة مقررة في 5 أبريل 2026', time: 'قريباً' },
    { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', text: 'فرع بوسعادة رفع تقريره الشهري', time: 'اليوم' },
];

export default function DashboardPage() {
    const stats = MOCK_DASHBOARD_STATS;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome banner */}
            <div className="bg-gradient-to-l from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
                <h2 className="text-xl font-bold">أهلاً بك في منصة جمعية غيث الولائية</h2>
                <p className="text-primary-200 text-sm mt-1">المسيلة، الجزائر — آخر تحديث: {new Date().toLocaleDateString('ar-DZ')}</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard title="إجمالي العائلات" value={stats.totalFamilies} icon={<Users className="w-6 h-6" />} color="green" trend={{ value: 8, positive: true }} />
                <StatCard title="مستفيدو الشهر" value={stats.beneficiariesThisMonth} icon={<UserCheck className="w-6 h-6" />} color="blue" trend={{ value: 12, positive: true }} />
                <StatCard title="الرصيد الحالي" value={formatCurrency(stats.currentBalance)} icon={<DollarSign className="w-6 h-6" />} color="indigo" />
                <StatCard title="طلبات معلقة" value={stats.pendingRequests} icon={<Clock className="w-6 h-6" />} color="yellow" />
                <StatCard title="الأعضاء الفاعلون" value={stats.activeMembers} icon={<Users className="w-6 h-6" />} color="purple" />
                <StatCard title="أنشطة الشهر" value={stats.activitiesThisMonth} icon={<Activity className="w-6 h-6" />} color="green" />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line chart - beneficiaries trend */}
                <div className="card lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="section-title mb-0">تطور المستفيدين — 12 شهر</h3>
                        <TrendingUp className="w-5 h-5 text-primary-500" />
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={CHART_BENEFICIARIES_12M}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Cairo' }} />
                            <YAxis tick={{ fontSize: 12, fontFamily: 'Cairo' }} />
                            <Tooltip formatter={(v) => [v, 'عدد المستفيدين']} />
                            <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: '#16a34a', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie chart - categories */}
                <div className="card">
                    <h3 className="section-title">توزيع الفئات</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={CHART_CATEGORIES} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                                dataKey="value" nameKey="name">
                                {CHART_CATEGORIES.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v, n) => [v, n]} />
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

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar chart finance */}
                <div className="card lg:col-span-2">
                    <h3 className="section-title">المدخولات مقابل المخرجات (6 أشهر)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={CHART_FINANCE_6M} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Cairo' }} />
                            <YAxis tick={{ fontSize: 12, fontFamily: 'Cairo' }} tickFormatter={v => (v / 1000) + 'k'} />
                            <Tooltip formatter={(v: number) => [v.toLocaleString('ar-DZ') + ' دج']} />
                            <Legend formatter={v => v === 'income' ? 'المدخولات' : 'المخرجات'} />
                            <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="income" />
                            <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} name="expense" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Alerts panel */}
                <div className="card">
                    <h3 className="section-title">الإشعارات والتنبيهات</h3>
                    <div className="space-y-3">
                        {URGENCY_ALERTS.map((alert, i) => (
                            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${alert.bg}`}>
                                <alert.icon className={`w-5 h-5 ${alert.color} shrink-0 mt-0.5`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-800 leading-relaxed">{alert.text}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{alert.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent activity */}
            <div className="card">
                <h3 className="section-title">آخر النشاطات</h3>
                <div className="space-y-2">
                    {MOCK_AUDIT_LOGS.slice(0, 5).map(log => (
                        <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                                    {log.userName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{log.description}</p>
                                    <p className="text-xs text-gray-400">{log.userName}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap mr-4">
                                {new Date(log.createdAt).toLocaleDateString('ar-DZ')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
