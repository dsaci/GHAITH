import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import ReportWizard from '../../components/reports/ReportWizard';
import { useAuth } from '../../context/AuthContext';
import {
    ASSOCIATION_LEGAL_NAME,
    getActivitiesByYear,
    getLastGeneralMeeting,
    getBoardAttendeesCount,
    saveReport,
    saveDocumentToPlatform,
    getPresidentName,
} from '../../services/reports.service';
import { downloadLiteraryDocx, printReportFromElement } from '../../lib/reportExports';
import type { Occasion } from '../../types';

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

const DEFAULT_OBJECTIVES = [
    'دعم الأسر المحتاجة والأرامل',
    'مساعدة ذوي الاحتياجات الخاصة',
    'دعم أصحاب الأمراض المزمنة',
    'الدعم التربوي للطلاب المحتاجين',
];

const INACTIVITY_DEFAULT = 'لم تقم الجمعية بأي نشاط خلال هاته السنة لعدم توفر الاعتمادات المالية';

export default function LiteraryReportPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);

    const [reportYear, setReportYear] = useState(() => new Date().getFullYear());
    const [assemblyDate, setAssemblyDate] = useState('');
    const [boardAttendees, setBoardAttendees] = useState(0);
    const [secretaryName, setSecretaryName] = useState('');
    const [presidentName, setPresidentName] = useState('رئيس الجمعية');

    useEffect(() => {
        const loadPresident = async () => {
            const name = await getPresidentName();
            setPresidentName(name);
        };
        loadPresident();
    }, []);

    const [intro, setIntro] = useState('');
    const [objectives, setObjectives] = useState<string[]>([...DEFAULT_OBJECTIVES]);
    const [objDraft, setObjDraft] = useState('');

    const [hadActivities, setHadActivities] = useState(true);
    const [occasions, setOccasions] = useState<Occasion[]>([]);
    const [selectedActivityIds, setSelectedActivityIds] = useState<Set<string>>(new Set());
    const [activityNotes, setActivityNotes] = useState('');
    const [inactivityText, setInactivityText] = useState(INACTIVITY_DEFAULT);

    const [loading, setLoading] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    const steps = useMemo(
        () => [
            { title: 'البيانات الأساسية', description: 'تسمية الجمعية، السنة، الجمعية العامة، التوقيعات', stepLabel: 'الخطوة 1' },
            { title: 'المهمة والأهداف', description: 'التمهيد والأهداف التي ستظهر في التقرير', stepLabel: 'الخطوة 2' },
            { title: 'حصيلة النشاطات', description: 'نشاطات السنة أو بيان عدم النشاط', stepLabel: 'الخطوة 3' },
            { title: 'المعاينة والتصدير', description: 'مراجعة التقرير النهائي وتصديره', stepLabel: 'المعاينة' },
        ],
        []
    );

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const [meet, count, acts] = await Promise.all([
                    getLastGeneralMeeting(),
                    getBoardAttendeesCount(),
                    getActivitiesByYear(reportYear),
                ]);
                if (cancelled) return;
                if (meet?.meetingDate) {
                    const d = meet.meetingDate.includes('T') ? meet.meetingDate.split('T')[0] : meet.meetingDate.slice(0, 10);
                    setAssemblyDate(d);
                }
                setBoardAttendees(count);
                setOccasions(acts);
                setSelectedActivityIds(new Set(acts.map((a) => a.id)));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [reportYear]);

    const toggleActivity = (id: string) => {
        setSelectedActivityIds((prev) => {
            const n = new Set(prev);
            if (n.has(id)) n.delete(id);
            else n.add(id);
            return n;
        });
    };

    const addObjective = () => {
        const t = objDraft.trim();
        if (!t) return;
        setObjectives((o) => [...o, t]);
        setObjDraft('');
    };

    const removeObjective = (i: number) => {
        setObjectives((o) => o.filter((_, idx) => idx !== i));
    };

    const activitiesForReport = occasions.filter((o) => selectedActivityIds.has(o.id));

    const reportBodyText = useMemo(() => {
        const ad = assemblyDate || '……';
        const citizensNote = 'بحضور أعضاء مكتب الجمعية ومواطنين.';
        if (!hadActivities) {
            return `بتاريخ ${ad} تم انعقاد الجمعية العامة ${citizensNote}\n\nوتجدر الإشارة إلى أن ${inactivityText.trim() || INACTIVITY_DEFAULT}`;
        }
        const lines = activitiesForReport.map(
            (a) => `• ${a.title} — ${a.startDate}${a.location ? ` — ${a.location}` : ''}`
        );
        const extra = activityNotes.trim() ? `\n\nملاحظات إضافية: ${activityNotes.trim()}` : '';
        return `بتاريخ ${ad} تم انعقاد الجمعية العامة ${citizensNote}\n\nوتضمنت نشاطات الجمعية خلال السنة ما يلي:\n${lines.join('\n')}${extra}`;
    }, [assemblyDate, hadActivities, inactivityText, activitiesForReport, activityNotes]);

    const canAdvance = useCallback(() => {
        if (currentStep === 1) {
            return intro.trim().length > 0 && objectives.filter((o) => o.trim()).length >= 1;
        }
        if (currentStep === 2) {
            if (hadActivities && activitiesForReport.length === 0) return false;
            return true;
        }
        return true;
    }, [currentStep, intro, objectives, hadActivities, activitiesForReport.length]);

    const persistReport = async () => {
        if (!user) return;
        setSaveMsg(null);
        const data = {
            association_name: ASSOCIATION_LEGAL_NAME,
            report_year: reportYear,
            assembly_date: assemblyDate,
            board_attendees: boardAttendees,
            secretary_name: secretaryName,
            president_name: presidentName,
            intro,
            objectives,
            had_activities: hadActivities,
            activities: activitiesForReport,
            activity_notes: activityNotes,
            inactivity_text: inactivityText,
            body: reportBodyText,
        };
        try {
            await saveReport({
                report_type: 'literary',
                report_year: reportYear,
                title: `التقرير الأدبي ${reportYear}`,
                data,
                status: 'final',
                created_by: user.id,
            });
            await saveDocumentToPlatform({
                title: `التقرير الأدبي لسنة ${reportYear}`,
                document_type: 'literary_report',
                file_url: '#',
                file_type: 'platform',
                report_year: reportYear,
                status: 'approved',
                uploaded_by: user.id,
                uploader_name: user.fullName,
                is_confidential: false,
                description: 'تقرير أدبي مُنشأ من المنصة',
            });
            setSaveMsg('تم حفظ التقرير في المنصة.');
        } catch (e) {
            console.error(e);
            setSaveMsg('تعذر الحفظ — تحقق من جداول saved_reports و documents في Supabase.');
        }
    };

    const handlePdf = () => printReportFromElement('literary-report-print');

    const handleDocx = () =>
        downloadLiteraryDocx({
            title: ASSOCIATION_LEGAL_NAME,
            year: reportYear,
            intro: intro.trim() || '……',
            objectives: objectives.filter((o) => o.trim()),
            bodySection: reportBodyText,
            secretaryName: secretaryName || '…………',
            presidentName,
        });

    const previewBlock = (
        <div
            id="literary-report-print"
            className="border-2 border-[#1e3a5f]/20 rounded-2xl p-6 md:p-10 bg-white text-[#1e3a5f] leading-relaxed space-y-6"
        >
            <div className="text-center space-y-2 border-b border-gray-200 pb-6">
                <p className="text-sm font-bold text-gray-500">تسمية الجمعية</p>
                <p className="text-lg font-black">{ASSOCIATION_LEGAL_NAME}</p>
                <p className="text-xl font-black pt-4">التقرير الأدبي</p>
                <p className="text-lg font-bold">لسنة {reportYear}</p>
            </div>
            <div>
                <p className="font-black mb-2">تمهيد:</p>
                <p className="text-gray-800 whitespace-pre-wrap">{intro || '……'}</p>
            </div>
            <div>
                <p className="font-black mb-2">الأهداف:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-800">
                    {objectives.filter((o) => o.trim()).map((o, i) => (
                        <li key={i}>{o}</li>
                    ))}
                </ul>
            </div>
            <div>
                <p className="font-black mb-2">التقرير الأدبي:</p>
                <p className="text-gray-800 whitespace-pre-wrap">{reportBodyText}</p>
            </div>
            <div className="flex justify-between gap-8 pt-10 border-t border-gray-200 mt-8">
                <div className="flex-1 text-center">
                    <p className="font-black">الكاتب العام</p>
                    <p className="mt-8 border-t border-gray-400 pt-2 min-h-[2rem]">{secretaryName || '…………'}</p>
                </div>
                <div className="flex-1 text-center">
                    <p className="font-black">رئيس الجمعية</p>
                    <p className="mt-8 border-t border-gray-400 pt-2 min-h-[2rem]">{presidentName}</p>
                </div>
            </div>
        </div>
    );

    return (
        <ReportWizard
            title="التقرير الأدبي"
            steps={steps}
            currentStep={currentStep}
            onNext={() => setCurrentStep((s) => Math.min(s + 1, steps.length - 1))}
            onBack={() => setCurrentStep((s) => Math.max(s - 1, 0))}
            isLastStep={currentStep === steps.length - 1}
            canNext={canAdvance()}
            lastStepActions={
                currentStep === steps.length - 1 ? (
                    <div className="flex flex-wrap gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handlePdf}
                            className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-black text-sm"
                        >
                            تحميل PDF
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleDocx()}
                            className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-black text-sm"
                        >
                            تحميل Word .docx
                        </button>
                        <button
                            type="button"
                            onClick={() => void persistReport()}
                            className="bg-[#3dd163] text-[#1e3a5f] px-6 py-3 rounded-xl font-black text-sm"
                        >
                            حفظ في المنصة
                        </button>
                    </div>
                ) : undefined
            }
        >
            {currentStep === 0 && (
                <div className="space-y-6 font-['Cairo']">
                    {loading && <p className="text-sm text-gray-500">جاري تحميل البيانات من الخادم…</p>}
                    <div>
                        <label className="block text-sm font-black text-[#1e3a5f] mb-2">تسمية الجمعية</label>
                        <input readOnly className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 font-bold text-gray-700" value={ASSOCIATION_LEGAL_NAME} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-black text-[#1e3a5f] mb-2">سنة التقرير</label>
                            <select
                                className="w-full rounded-2xl border border-gray-200 p-4 font-bold"
                                value={reportYear}
                                onChange={(e) => setReportYear(Number(e.target.value))}
                            >
                                {YEAR_OPTIONS.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-black text-[#1e3a5f] mb-2">تاريخ انعقاد الجمعية العامة</label>
                            <input
                                type="date"
                                className="w-full rounded-2xl border border-gray-200 p-4 font-bold"
                                value={assemblyDate}
                                onChange={(e) => setAssemblyDate(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">تاريخ الاجتماع الذي تم فيه إقرار التقرير</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-black text-[#1e3a5f] mb-2">عدد الحاضرين من أعضاء المكتب</label>
                        <input
                            type="number"
                            min={0}
                            className="w-full rounded-2xl border border-gray-200 p-4 font-bold"
                            value={boardAttendees}
                            onChange={(e) => setBoardAttendees(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-[#1e3a5f] mb-2">الكاتب العام</label>
                        <input
                            className="w-full rounded-2xl border border-gray-200 p-4 font-bold"
                            value={secretaryName}
                            onChange={(e) => setSecretaryName(e.target.value)}
                            placeholder="الاسم واللقب"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-[#1e3a5f] mb-2">رئيس الجمعية</label>
                        <input readOnly className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 font-bold" value={presidentName} />
                    </div>
                </div>
            )}

            {currentStep === 1 && (
                <div className="space-y-6 font-['Cairo']">
                    <div>
                        <label className="block text-sm font-black text-[#1e3a5f] mb-2">تمهيد — تعريف الجمعية</label>
                        <textarea
                            rows={4}
                            className="w-full rounded-2xl border border-gray-200 p-4"
                            placeholder="جمعية تعنى بـ..."
                            value={intro}
                            onChange={(e) => setIntro(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">وصف مختصر لمهمة الجمعية ومجال عملها</p>
                    </div>
                    <div>
                        <label className="block text-sm font-black text-[#1e3a5f] mb-2">الأهداف</label>
                        <div className="space-y-2">
                            {objectives.map((o, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        className="flex-1 rounded-xl border border-gray-200 p-3 font-bold"
                                        value={o}
                                        onChange={(e) =>
                                            setObjectives((list) => list.map((x, i) => (i === idx ? e.target.value : x)))
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeObjective(idx)}
                                        className="p-3 rounded-xl bg-red-50 text-red-600"
                                        aria-label="حذف"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                            <input
                                className="flex-1 rounded-xl border border-gray-200 p-3"
                                placeholder="هدف إضافي"
                                value={objDraft}
                                onChange={(e) => setObjDraft(e.target.value)}
                            />
                            <button type="button" onClick={addObjective} className="px-4 rounded-xl bg-[#1e3a5f] text-white font-black flex items-center gap-1">
                                <Plus className="w-5 h-5" /> إضافة
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-6 font-['Cairo']">
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 font-bold cursor-pointer">
                            <input type="radio" checked={hadActivities} onChange={() => setHadActivities(true)} />
                            تمت نشاطات خلال هذه السنة
                        </label>
                        <label className="flex items-center gap-3 font-bold cursor-pointer">
                            <input type="radio" checked={!hadActivities} onChange={() => setHadActivities(false)} />
                            لم تُنجز أي نشاطات (نص تلقائي: لعدم توفر الاعتمادات المالية)
                        </label>
                    </div>

                    {hadActivities ? (
                        <>
                            <p className="text-sm text-gray-600">اختر النشاطات المستخرجة من جدول المناسبات لهذه السنة:</p>
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {occasions.map((o) => (
                                    <label key={o.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer">
                                        <input type="checkbox" checked={selectedActivityIds.has(o.id)} onChange={() => toggleActivity(o.id)} className="mt-1" />
                                        <span className="font-bold text-[#1e3a5f]">
                                            {o.title} — {o.startDate}
                                            {o.location ? ` — ${o.location}` : ''}
                                        </span>
                                    </label>
                                ))}
                                {occasions.length === 0 && <p className="text-gray-500">لا توجد مناسبات مسجلة لهذه السنة.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-black mb-2">ملاحظات إضافية</label>
                                <textarea rows={3} className="w-full rounded-2xl border border-gray-200 p-4" value={activityNotes} onChange={(e) => setActivityNotes(e.target.value)} />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-black mb-2">نص عدم النشاط (قابل للتعديل)</label>
                            <textarea rows={4} className="w-full rounded-2xl border border-gray-200 p-4" value={inactivityText} onChange={(e) => setInactivityText(e.target.value)} />
                        </div>
                    )}
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-6 font-['Cairo']">
                    {previewBlock}
                    {saveMsg && <p className="text-center text-sm font-bold text-[#3dd163]">{saveMsg}</p>}
                    <button type="button" onClick={() => navigate('/reports')} className="w-full py-3 rounded-xl border border-gray-200 font-bold text-[#1e3a5f]">
                        العودة لقائمة التقارير
                    </button>
                </div>
            )}
        </ReportWizard>
    );
}
