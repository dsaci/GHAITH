import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, LayoutGrid, List, MapPin, Plus, Search, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranchLayout } from '../../context/LayoutBranchContext';
import type { Occasion, OccasionStatus, OccasionType } from '../../types';
import { MOCK_BRANCHES } from '../../data/mockData';
import { getActivities, getActivityStats } from '../../services/activities.service';
import { TYPE_LABELS, STATUS_LABELS, TYPE_STYLE, AR_MONTHS, formatActivityDate } from './activityUi';

type ViewMode = 'list' | 'calendar' | 'cards';

const YEAR_OPTS: (number | 'all')[] = ['all', 2026, 2025, 2024];

function canManageActivities(role: string | undefined) {
    return role === 'president' || role === 'vice_president' || role === 'board_member' || role === 'branch_president';
}

export default function ActivitiesIndexPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const branchMode = useBranchLayout();
    const p = branchMode ? '/branch' : '';
    const canEdit = canManageActivities(user?.role);

    const [view, setView] = useState<ViewMode>('cards');
    const [year, setYear] = useState<number | 'all'>(2026);
    const [type, setType] = useState<OccasionType | 'all'>('all');
    const [status, setStatus] = useState<OccasionStatus | 'all'>('all');
    const [branchId, setBranchId] = useState<string | 'all'>('all');
    const [search, setSearch] = useState('');

    const [items, setItems] = useState<Occasion[]>([]);
    const [stats, setStats] = useState({ totalActivities: 0, completedCount: 0, plannedCount: 0, totalBeneficiaries: 0 });
    const [loading, setLoading] = useState(true);

    const filters = useMemo(
        () => ({ year, type, status, branchId, search }),
        [year, type, status, branchId, search]
    );

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const [list, s] = await Promise.all([getActivities(filters), getActivityStats(filters)]);
                if (!alive) return;
                setItems(list);
                setStats({
                    totalActivities: s.totalActivities,
                    completedCount: s.completedCount,
                    plannedCount: s.plannedCount,
                    totalBeneficiaries: s.totalBeneficiaries,
                });
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [filters]);

    const byMonth = useMemo(() => {
        const m = new Map<number, Occasion[]>();
        for (const o of items) {
            const month = new Date(o.startDate + 'T12:00:00').getMonth();
            if (!m.has(month)) m.set(month, []);
            m.get(month)!.push(o);
        }
        return m;
    }, [items]);

    const renderCard = (o: Occasion) => {
        const st = TYPE_STYLE[o.occasionType];
        return (
            <div
                key={o.id}
                className="rounded-2xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow font-['Cairo']"
                style={{ backgroundColor: st.bg, borderColor: st.border }}
                dir="rtl"
            >
                <div className="h-1.5 w-full" style={{ backgroundColor: st.border }} />
                <div className="p-5 space-y-3">
                    <h3 className="text-lg font-black text-gray-900 leading-snug">{o.title}</h3>
                    <p className="text-sm font-bold text-gray-700">{formatActivityDate(o.startDate)}</p>
                    {o.location && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                            <MapPin className="w-4 h-4 shrink-0" />
                            {o.location}
                        </p>
                    )}
                    <p className="text-sm flex items-center gap-2 text-gray-700">
                        <Users className="w-4 h-4 shrink-0" />
                        {(o.actualBeneficiariesCount ?? o.targetBeneficiariesCount ?? 0).toLocaleString('ar-DZ')} مستفيد
                    </p>
                    <p className="text-sm font-bold" style={{ color: st.border }}>
                        ● {STATUS_LABELS[o.status]}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate(`${p}/activities/${o.id}`)}
                        className="w-full py-2.5 rounded-xl bg-white/80 border border-gray-200 font-black text-[#1e3a5f] text-sm hover:bg-white"
                    >
                        عرض التفاصيل
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in font-['Cairo']" dir="rtl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="page-title">الأنشطة والمناسبات</h2>
                    <p className="text-sm text-gray-500 mt-1">إدارة وتتبع أنشطة الجمعية وفق التصنيفات التشغيلية</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        to={`${p}/activities/calendar`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-sm text-[#1e3a5f] hover:bg-gray-50"
                    >
                        <CalendarDays className="w-4 h-4" />
                        التقويم السنوي
                    </Link>
                    {canEdit && (
                        <Link
                            to={`${p}/activities/new`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e3a5f] text-white font-black text-sm shadow-lg"
                        >
                            <Plus className="w-4 h-4" />
                            نشاط جديد
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'إجمالي الأنشطة هذه السنة', value: stats.totalActivities },
                    { label: 'أنشطة مكتملة', value: stats.completedCount },
                    { label: 'أنشطة مقررة', value: stats.plannedCount },
                    { label: 'مجموع المستفيدين (المسجل)', value: stats.totalBeneficiaries.toLocaleString('ar-DZ') },
                ].map((s) => (
                    <div key={s.label} className="card bg-gradient-to-br from-white to-gray-50 border border-gray-100 p-4">
                        <p className="text-xs text-gray-500 font-bold leading-snug mb-1">{s.label}</p>
                        <p className="text-2xl font-black text-[#1e3a5f]">{loading ? '…' : s.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-2">
                {(
                    [
                        { id: 'list' as const, label: 'قائمة', icon: List },
                        { id: 'calendar' as const, label: 'تقويم', icon: CalendarDays },
                        { id: 'cards' as const, label: 'بطاقات', icon: LayoutGrid },
                    ] as const
                ).map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setView(id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                            view === id ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            <div className="card p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">السنة</label>
                        <select className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold" value={year === 'all' ? 'all' : String(year)} onChange={(e) => setYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                            {YEAR_OPTS.map((y) => (
                                <option key={String(y)} value={String(y)}>
                                    {y === 'all' ? 'الكل' : y}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">النوع</label>
                        <select className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                            <option value="all">الكل</option>
                            {(Object.keys(TYPE_LABELS) as OccasionType[]).map((k) => (
                                <option key={k} value={k}>
                                    {TYPE_LABELS[k]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">الحالة</label>
                        <select className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                            <option value="all">الكل</option>
                            {(Object.keys(STATUS_LABELS) as OccasionStatus[]).map((k) => (
                                <option key={k} value={k}>
                                    {STATUS_LABELS[k]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">الفرع</label>
                        <select className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold" value={branchId} onChange={(e) => setBranchId(e.target.value as typeof branchId)}>
                            <option value="all">الكل</option>
                            {MOCK_BRANCHES.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.branchName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-2">
                        <label className="text-xs font-bold text-gray-500 block mb-1">بحث</label>
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input className="w-full rounded-xl border border-gray-200 py-2.5 pr-10 pl-3 text-sm font-bold" placeholder="عنوان أو مكان…" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-500 font-bold">جاري التحميل…</div>
            ) : view === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{items.map(renderCard)}</div>
            ) : view === 'list' ? (
                <div className="card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="text-right p-3 font-black">العنوان</th>
                                <th className="text-right p-3 font-black">التاريخ</th>
                                <th className="text-right p-3 font-black">النوع</th>
                                <th className="text-right p-3 font-black">الحالة</th>
                                <th className="text-right p-3 font-black">المستفيدون</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((o) => (
                                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                                    <td className="p-3 font-bold">{o.title}</td>
                                    <td className="p-3">{formatActivityDate(o.startDate)}</td>
                                    <td className="p-3">{TYPE_LABELS[o.occasionType]}</td>
                                    <td className="p-3">{STATUS_LABELS[o.status]}</td>
                                    <td className="p-3">{(o.actualBeneficiariesCount ?? o.targetBeneficiariesCount ?? 0).toLocaleString('ar-DZ')}</td>
                                    <td className="p-3">
                                        <button type="button" className="text-primary-600 font-bold" onClick={() => navigate(`${p}/activities/${o.id}`)}>
                                            تفاصيل
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {items.length === 0 && <p className="p-8 text-center text-gray-500 font-bold">لا توجد أنشطة مطابقة</p>}
                </div>
            ) : (
                <div className="space-y-8">
                    {AR_MONTHS.map((name, mi) => {
                        const monthItems = byMonth.get(mi) ?? [];
                        if (monthItems.length === 0) return null;
                        return (
                            <div key={name}>
                                <h3 className="text-lg font-black text-[#1e3a5f] mb-3 border-r-4 border-[#3dd163] pr-3">
                                    {name} — {monthItems.length} نشاط
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{monthItems.map(renderCard)}</div>
                            </div>
                        );
                    })}
                    {items.length === 0 && <p className="text-center text-gray-500 font-bold py-12">لا توجد أنشطة مطابقة</p>}
                </div>
            )}
        </div>
    );
}
