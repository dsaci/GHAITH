import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Download, FileText, DollarSign } from 'lucide-react';
import type { Occasion } from '../../types';
import { getActivitiesByYear, getAnnualSummary, printAnnualYearReport } from '../../services/activities.service';
import { TYPE_LABELS, TYPE_STYLE, AR_MONTHS, formatActivityDate } from '../Activities/activityUi';

const YEARS = [2026, 2025, 2024] as const;

export default function ArchivePage() {
    const navigate = useNavigate();
    const [year, setYear] = useState<number | 'all'>(2026);
    const [items, setItems] = useState<Occasion[]>([]);
    const [summary, setSummary] = useState({ totalActivities: 0, totalBeneficiaries: 0, totalBudgetSpent: 0, completedCount: 0 });
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const list = await getActivitiesByYear(year);
                const s = year === 'all' ? { totalActivities: list.length, totalBeneficiaries: 0, totalBudgetSpent: 0, completedCount: 0 } : await getAnnualSummary(year);
                if (!alive) return;
                setItems(list);
                if (year === 'all') {
                    const totalBeneficiaries = list.reduce((acc, o) => acc + (o.actualBeneficiariesCount ?? o.targetBeneficiariesCount ?? 0), 0);
                    const totalBudgetSpent = list.reduce((acc, o) => acc + (o.budgetActual ?? 0), 0);
                    const completedCount = list.filter((o) => o.status === 'completed').length;
                    setSummary({ totalActivities: list.length, totalBeneficiaries, totalBudgetSpent, completedCount });
                } else {
                    setSummary({
                        totalActivities: s.totalActivities,
                        totalBeneficiaries: s.totalBeneficiaries,
                        totalBudgetSpent: s.totalBudgetSpent,
                        completedCount: s.completedCount,
                    });
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [year]);

    const byMonth = useMemo(() => {
        const m = new Map<number, Occasion[]>();
        for (const o of items) {
            const month = new Date(o.startDate + 'T12:00:00').getMonth();
            if (!m.has(month)) m.set(month, []);
            m.get(month)!.push(o);
        }
        return m;
    }, [items]);

    const handlePdf = async () => {
        if (year === 'all') {
            setMsg('اختر سنة محددة لتوليد التقرير.');
            return;
        }
        const list = await getActivitiesByYear(year);
        const s = await getAnnualSummary(year);
        printAnnualYearReport(year, list, s);
    };

    return (
        <div className="space-y-8 font-['Cairo'] animate-fade-in pb-16" dir="rtl">
            <div>
                <h2 className="page-title">أرشيف الجمعية</h2>
                <p className="text-sm text-gray-500 mt-1">ذاكرة مؤسسية — خط زمني للأنشطة حسب السنة</p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
                {([...YEARS, 'all'] as const).map((y) => (
                    <button
                        key={String(y)}
                        type="button"
                        onClick={() => setYear(y)}
                        className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${year === y ? 'bg-[#1e3a5f] text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {y === 'all' ? 'كل السنوات' : y}
                    </button>
                ))}
            </div>

            <div className="card p-8 bg-gradient-to-br from-[#1e3a5f] to-[#2a4f7c] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
                
                <h3 className="text-2xl font-black mb-6 relative z-10">حصيلة {year === 'all' ? 'كل السنوات' : `سنة ${year}`}</h3>
                
                {loading ? (
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <p>جاري التحميل…</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm relative z-10">
                        <div className="space-y-1">
                            <p className="opacity-70 font-bold">أنشطة مسجلة</p>
                            <p className="text-3xl font-black">{summary.totalActivities}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="opacity-70 font-bold">منجزة</p>
                            <p className="text-3xl font-black text-green-400">{summary.completedCount}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="opacity-70 font-bold">مجموع المستفيدين</p>
                            <p className="text-3xl font-black">{summary.totalBeneficiaries.toLocaleString('ar-DZ')}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="opacity-70 font-bold">ميزانية مصروفة</p>
                            <p className="text-3xl font-black text-amber-400">{summary.totalBudgetSpent.toLocaleString('ar-DZ')} دج</p>
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                    <p className="text-xs font-black opacity-60 mb-4 uppercase tracking-wider">التقارير السنوية (الجانب الإداري والمالي)</p>
                    <div className="flex flex-wrap gap-3">
                        {year !== 'all' && (
                            <>
                                <button 
                                    onClick={() => navigate(`/reports/literary/new?year=${year}`)}
                                    className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-[#1e3a5f] font-black text-sm transition-all flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    تحضير التقرير الأدبي {year}
                                </button>
                                <button 
                                    onClick={() => navigate(`/reports/financial/new?year=${year}`)}
                                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-[#1e3a5f] font-black text-sm transition-all flex items-center gap-2"
                                >
                                    <DollarSign className="w-4 h-4" />
                                    تحضير التقرير المالي {year}
                                </button>
                            </>
                        )}
                        <button type="button" onClick={() => void handlePdf()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1e3a5f] font-black text-sm hover:bg-gray-100 transition-all">
                            <Download className="w-4 h-4" />
                            حفظ ملخص الأنشطة PDF
                        </button>
                    </div>
                </div>
                {msg && <p className="mt-4 text-sm font-bold text-amber-200 bg-white/10 px-4 py-2 rounded-lg">{msg}</p>}
            </div>

            {year === 'all' ? (
                <div className="space-y-4">
                    {items.map((o) => (
                        <ArchiveCard key={o.id} o={o} onOpen={() => navigate(`/activities/${o.id}`)} />
                    ))}
                    {items.length === 0 && !loading && <p className="text-center text-gray-500 font-bold">لا توجد بيانات</p>}
                </div>
            ) : (
                <div className="space-y-10">
                    {AR_MONTHS.map((name, mi) => {
                        const monthItems = byMonth.get(mi) ?? [];
                        if (monthItems.length === 0) return null;
                        return (
                            <div key={name}>
                                <div className="flex items-center gap-2 mb-4 text-[#1e3a5f] font-black text-lg border-r-4 border-[#3dd163] pr-3">
                                    <Calendar className="w-5 h-5" />
                                    {name}
                                </div>
                                <div className="space-y-3 border-r-2 border-gray-200 pr-4 mr-2">
                                    {monthItems.map((o) => (
                                        <ArchiveCard key={o.id} o={o} onOpen={() => navigate(`/activities/${o.id}`)} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    {!loading && items.length === 0 && <p className="text-center text-gray-500 font-bold">لا توجد أنشطة لهذه السنة</p>}
                </div>
            )}

            <div className="text-center">
                <Link to="/activities" className="text-primary-600 font-black">
                    العودة لقائمة الأنشطة
                </Link>
            </div>
        </div>
    );
}

function ArchiveCard({ o, onOpen }: { o: Occasion; onOpen: () => void }) {
    const st = TYPE_STYLE[o.occasionType];
    return (
        <button type="button" onClick={onOpen} className="w-full text-right card p-4 hover:shadow-md transition-shadow border-r-4" style={{ borderRightColor: st.border }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-black text-gray-900">{o.title}</h4>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: st.bg, color: '#1e3a5f' }}>
                    {TYPE_LABELS[o.occasionType]}
                </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{formatActivityDate(o.startDate)}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold text-gray-500">
                <span>مستفيدون: {(o.actualBeneficiariesCount ?? o.targetBeneficiariesCount ?? 0).toLocaleString('ar-DZ')}</span>
                <span>ميزانية: {(o.budgetActual ?? 0).toLocaleString('ar-DZ')} دج</span>
            </div>
        </button>
    );
}
