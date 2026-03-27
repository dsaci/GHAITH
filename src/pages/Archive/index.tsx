import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Download } from 'lucide-react';
import type { Occasion } from '../../types';
import { getActivitiesByYear, getAnnualSummary, printAnnualYearReport, uploadAnnualReportAndSave } from '../../services/activities.service';
import { TYPE_LABELS, TYPE_STYLE, AR_MONTHS, formatActivityDate } from '../Activities/activityUi';
import { useAuth } from '../../context/AuthContext';

const YEARS = [2026, 2025, 2024, 2023] as const;

export default function ArchivePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [year, setYear] = useState<number | 'all'>(2025);
    const [items, setItems] = useState<Occasion[]>([]);
    const [summary, setSummary] = useState({ totalActivities: 0, totalBeneficiaries: 0, totalBudgetSpent: 0, completedCount: 0 });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
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

    const handleUpload = async () => {
        if (!user || year === 'all') return;
        setUploading(true);
        setMsg(null);
        const url = await uploadAnnualReportAndSave(year, user.id);
        setUploading(false);
        setMsg(url ? 'تم رفع التقرير وتسجيل الرابط (إن توفر التخزين).' : 'تعذر الرفع — تحقق من دلو التخزين وsaved_reports.');
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
                        className={`px-4 py-2 rounded-xl font-black text-sm ${year === y ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        {y === 'all' ? 'كل السنوات' : y}
                    </button>
                ))}
            </div>

            <div className="card p-6 bg-gradient-to-br from-[#1e3a5f] to-[#2a4f7c] text-white">
                <h3 className="text-xl font-black mb-4">حصيلة {year === 'all' ? 'كل السنوات' : `سنة ${year}`}</h3>
                {loading ? (
                    <p>جاري التحميل…</p>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="opacity-80">أنشطة مسجلة</p>
                            <p className="text-2xl font-black">{summary.totalActivities}</p>
                        </div>
                        <div>
                            <p className="opacity-80">منجزة</p>
                            <p className="text-2xl font-black">{summary.completedCount}</p>
                        </div>
                        <div>
                            <p className="opacity-80">مجموع المستفيدين (المسجل)</p>
                            <p className="text-2xl font-black">{summary.totalBeneficiaries.toLocaleString('ar-DZ')}</p>
                        </div>
                        <div>
                            <p className="opacity-80">ميزانية مصروفة (مجموع budget_actual)</p>
                            <p className="text-2xl font-black">{summary.totalBudgetSpent.toLocaleString('ar-DZ')} دج</p>
                        </div>
                    </div>
                )}
                <div className="flex flex-wrap gap-3 mt-6">
                    <button type="button" onClick={() => void handlePdf()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#1e3a5f] font-black text-sm">
                        <Download className="w-4 h-4" />
                        تحميل تقرير السنة PDF
                    </button>
                    <button type="button" disabled={uploading || year === 'all'} onClick={() => void handleUpload()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3dd163] text-[#1e3a5f] font-black text-sm disabled:opacity-50">
                        رفع للتخزين وحفظ الرابط
                    </button>
                </div>
                {msg && <p className="mt-3 text-sm font-bold text-amber-200">{msg}</p>}
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
