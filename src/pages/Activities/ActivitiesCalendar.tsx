import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBranchLayout } from '../../context/LayoutBranchContext';
import { ArrowRight } from 'lucide-react';
import { getCalendarMarkersForYear } from '../../services/activities.service';
import type { CalendarMarker } from '../../services/activities.service';
import { TYPE_LABELS, TYPE_STYLE } from './activityUi';

const WEEK_DAYS = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

function daysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function startWeekday(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

export default function ActivitiesCalendarPage() {
    const navigate = useNavigate();
    const branchMode = useBranchLayout();
    const p = branchMode ? '/branch' : '';
    const [year, setYear] = useState(() => new Date().getFullYear());
    const [markers, setMarkers] = useState<CalendarMarker[]>([]);
    const [loading, setLoading] = useState(true);
    const [popup, setPopup] = useState<{ date: string; items: CalendarMarker[] } | null>(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            const m = await getCalendarMarkersForYear(year);
            if (alive) {
                setMarkers(m);
                setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [year]);

    const byDate = useMemo(() => {
        const map = new Map<string, CalendarMarker[]>();
        for (const m of markers) {
            const k = m.date.slice(0, 10);
            if (!map.has(k)) map.set(k, []);
            map.get(k)!.push(m);
        }
        return map;
    }, [markers]);

    const openDay = (iso: string) => {
        const items = byDate.get(iso) ?? [];
        if (items.length) setPopup({ date: iso, items });
    };

    return (
        <div className="space-y-6 font-['Cairo'] animate-fade-in pb-12" dir="rtl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link to="/activities" className="p-2 rounded-xl hover:bg-gray-100">
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="page-title mb-0">التقويم السنوي للأنشطة</h2>
                        <p className="text-sm text-gray-500 mt-1">المناسبات الوطنية الثابتة + أنشطة قاعدة البيانات</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" className="px-3 py-2 rounded-xl border font-bold" onClick={() => setYear((y) => y - 1)}>
                        السنة السابقة
                    </button>
                    <span className="text-xl font-black text-[#1e3a5f] min-w-[4rem] text-center">{year}</span>
                    <button type="button" className="px-3 py-2 rounded-xl border font-bold" onClick={() => setYear((y) => y + 1)}>
                        السنة التالية
                    </button>
                </div>
            </div>

            {loading && <p className="text-center text-gray-500 font-bold">جاري التحميل…</p>}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {Array.from({ length: 12 }, (_, mi) => {
                    const dim = daysInMonth(year, mi);
                    const start = startWeekday(year, mi);
                    const cells: (number | null)[] = [];
                    for (let i = 0; i < start; i++) cells.push(null);
                    for (let d = 1; d <= dim; d++) cells.push(d);
                    const monthName = new Date(year, mi, 1).toLocaleDateString('ar-DZ', { month: 'long' });

                    return (
                        <div key={mi} className="card p-4">
                            <h3 className="text-lg font-black text-[#1e3a5f] mb-3 border-r-4 border-[#3dd163] pr-2">{monthName}</h3>
                            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500 mb-1">
                                {WEEK_DAYS.map((d) => (
                                    <span key={d}>{d}</span>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {cells.map((d, idx) => {
                                    if (d === null) return <div key={`e-${idx}`} className="h-9" />;
                                    const iso = `${year}-${String(mi + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                    const dayMarkers = byDate.get(iso) ?? [];
                                    const has = dayMarkers.length > 0;
                                    return (
                                        <button
                                            key={iso}
                                            type="button"
                                            onClick={() => has && openDay(iso)}
                                            className={`h-9 rounded-lg text-sm font-bold relative border transition-colors ${
                                                has ? 'bg-amber-50 border-amber-300 hover:bg-amber-100' : 'border-transparent hover:bg-gray-50'
                                            }`}
                                        >
                                            {d}
                                            {dayMarkers.slice(0, 3).map((m, i) => (
                                                <span
                                                    key={i}
                                                    className="absolute left-0 right-0 mx-auto block h-1 w-1 rounded-full"
                                                    style={{ backgroundColor: TYPE_STYLE[m.occasionType].dot, bottom: `${4 + i * 3}px` }}
                                                />
                                            ))}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {popup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setPopup(null)} role="presentation">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()} dir="rtl">
                        <h4 className="font-black text-lg text-[#1e3a5f]">يوم {popup.date}</h4>
                        <ul className="space-y-2">
                            {popup.items.map((m) => (
                                <li key={m.id}>
                                    <button
                                        type="button"
                                        className="w-full text-right p-3 rounded-xl border hover:bg-gray-50 font-bold text-sm"
                                        onClick={() => {
                                            if (m.source === 'database') navigate(`${p}/activities/${m.id}`);
                                            else setPopup(null);
                                        }}
                                    >
                                        <span className="block">{m.title}</span>
                                        <span className="text-xs text-gray-500">{TYPE_LABELS[m.occasionType]}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button type="button" className="w-full py-2 rounded-xl bg-gray-100 font-bold" onClick={() => setPopup(null)}>
                            إغلاق
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
