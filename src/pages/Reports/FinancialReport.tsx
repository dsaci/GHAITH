import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportWizard from '../../components/reports/ReportWizard';
import { useAuth } from '../../context/AuthContext';
import {
    ASSOCIATION_LEGAL_NAME,
    getFinancialSummary,
    getTransactionsForYear,
    saveReport,
    saveDocumentToPlatform,
    type FinancialSummary,
    type ChannelKey,
} from '../../services/reports.service';
import { downloadFinancialDocx, printReportFromElement } from '../../lib/reportExports';
import type { YearTransactionRow } from '../../services/reports.service';

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

const MSILA_REPORT_COMMUNES = [
    'المسيلة',
    'بوسعادة',
    'الهامل',
    'أولتام',
    'أولاد دراج',
    'أولاد عدي القبالة',
    'المطارفة',
    'المعاضيد',
    'صوامع',
    'الخبانة',
    'مسيف',
    'الحوامد',
    'الشلال',
    'أولاد ماضي',
    'خطوطي سد الجير',
    'المعاريف',
    'بن سرور',
    'أولاد سليمان',
    'الزرزور',
    'محمد بوضياف',
    'عين الملح',
    'بير فضة',
    'عين فارس',
    'تامور سيدي محمد',
    'عين الريش',
    'مجدل',
    'أولاد عطية',
    'جبل مسعد',
    'سليم',
    'مقرة',
    'برهوم',
    'عين خضرة',
    'بلعايبة',
    'الدهاهنة',
    'سيدي عيسى',
    'بوطي السايح',
    'بني يلمان',
    'عين الحجل',
    'سيدي هجرس',
    'حمام الضلعة',
    'تارمونت',
    'أولاد منصور',
    'ونوغة',
    'سيدي عامر',
    'تامسة',
    'أولاد سيدي إبراهيم',
    'بنزوه',
].sort((a, b) => a.localeCompare(b, 'ar'));

const CATEGORY_LABELS: Record<string, string> = {
    member_fees: 'اشتراكات الأعضاء',
    donations: 'تبرعات',
    grants: 'منح',
    government_support: 'دعم حكومي',
    activity_revenue: 'عائد أنشطة',
    other_income: 'دخل آخر',
    beneficiary_aid: 'مساعدات مستفيدين',
    activity_expense: 'مصاريف أنشطة',
    admin_expense: 'مصاريف إدارية',
    equipment: 'معدات',
    transport: 'نقل',
    other_expense: 'مصروف آخر',
};

const LEGAL_DECREE =
    'المرسوم التنفيذي رقم 01-351 المؤرخ في 24 شعبان عام 1422 الموافق لـ 10 نوفمبر سنة 2001 المتضمن القانون الأساسي للجمعيات.';
const LEGAL_LAW = 'القانون رقم 99-11 المؤرخ في 23 ديسمبر سنة 1999 المتعلق بالجمعيات.';

function fmt(n: number) {
    return n.toLocaleString('ar-DZ', { maximumFractionDigits: 0 }) + ' دج';
}

const CHANNEL_LABEL: Record<ChannelKey, string> = { bank: 'البنك', postal: 'الح.ج.ب', cash: 'الصندوق' };

const ROW_LABELS = ['رصيد بداية المدة', 'الإيرادات', 'النفقات', 'الرصيد النهائي'] as const;

export default function FinancialReportPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(0);

    const [reportYear, setReportYear] = useState(() => new Date().getFullYear());
    const periodText = `01/01/${reportYear} إلى 31/12/${reportYear}`;

    const [auditorName, setAuditorName] = useState('');
    const [auditorReg, setAuditorReg] = useState('');
    const [auditorOffice, setAuditorOffice] = useState('');
    const [auditorPhone, setAuditorPhone] = useState('');
    const [writePlace, setWritePlace] = useState(MSILA_REPORT_COMMUNES[0] || 'المسيلة');
    const [writeDate, setWriteDate] = useState(() => new Date().toISOString().slice(0, 10));

    const [balances, setBalances] = useState<FinancialSummary>(() => ({
        bank: { opening: 0, income: 0, expense: 0, closing: 0 },
        postal: { opening: 0, income: 0, expense: 0, closing: 0 },
        cash: { opening: 0, income: 0, expense: 0, closing: 0 },
    }));

    const [tx, setTx] = useState<YearTransactionRow[]>([]);
    const [tab, setTab] = useState<'in' | 'out'>('in');
    const [previewTab, setPreviewTab] = useState<'A' | 'B' | 'C' | 'D'>('A');

    const [assemblyDate, setAssemblyDate] = useState('');
    const [sessionPlace, setSessionPlace] = useState('');
    const [sessionTime, setSessionTime] = useState('');

    const [loading, setLoading] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    const steps = useMemo(
        () => [
            { title: 'البيانات الأساسية', description: 'بيانات السنة ومحافظ الحسابات ومكان التحرير', stepLabel: 'الخطوة 1' },
            { title: 'الأرصدة والحسابات', description: 'جدول المطابقة حسب البنك والحساب الجاري البريدي والصندوق', stepLabel: 'الخطوة 2' },
            { title: 'الإيرادات والمصاريف', description: 'تفاصيل المعاملات المستخرجة من قاعدة البيانات', stepLabel: 'الخطوة 3' },
            { title: 'محضر التعيين', description: 'محضر تعيين محافظ الحسابات', stepLabel: 'الخطوة 4' },
            { title: 'المعاينة والتصدير', description: 'جميع الوثائق والتصدير', stepLabel: 'الخطوة 5' },
        ],
        []
    );

    const loadBalances = useCallback(async () => {
        setLoading(true);
        try {
            const s = await getFinancialSummary(reportYear);
            setBalances(s);
        } finally {
            setLoading(false);
        }
    }, [reportYear]);

    useEffect(() => {
        if (step === 1) void loadBalances();
    }, [step, loadBalances]);

    useEffect(() => {
        void (async () => {
            const rows = await getTransactionsForYear(reportYear);
            setTx(rows);
        })();
    }, [reportYear]);

    const setCell = (ch: ChannelKey, field: keyof FinancialSummary['bank'], raw: string) => {
        const v = Number(raw.replace(/[^\d.-]/g, '')) || 0;
        setBalances((prev) => {
            const next = {
                bank: { ...prev.bank },
                postal: { ...prev.postal },
                cash: { ...prev.cash },
            };
            next[ch] = { ...next[ch], [field]: v };
            if (field !== 'closing') {
                next[ch].closing = next[ch].opening + next[ch].income - next[ch].expense;
            }
            return next;
        });
    };

    const mismatch = useMemo(() => {
        return (['bank', 'postal', 'cash'] as const).some((k) => {
            const c = balances[k];
            return Math.round(c.closing) !== Math.round(c.opening + c.income - c.expense);
        });
    }, [balances]);

    const incomeRows = tx.filter((t) => t.type === 'income');
    const expenseRows = tx.filter((t) => t.type === 'expense');

    const incomeTotal = incomeRows.reduce((s, r) => s + r.amount, 0);
    const expenseTotal = expenseRows.reduce((s, r) => s + r.amount, 0);

    const bankIncomeTx = incomeRows.filter((r) => r.channelLabel === 'البنك');
    const cashIncomeTx = incomeRows.filter((r) => r.channelLabel === 'الصندوق');

    const persist = async () => {
        if (!user) return;
        setSaveMsg(null);
        const data = {
            association_name: ASSOCIATION_LEGAL_NAME,
            report_year: reportYear,
            period: periodText,
            auditor: { name: auditorName, reg: auditorReg, office: auditorOffice, phone: auditorPhone },
            write_place: writePlace,
            write_date: writeDate,
            balances,
            transactions: tx,
            assembly_date: assemblyDate,
            session_place: sessionPlace,
            session_time: sessionTime,
            legal: { decree: LEGAL_DECREE, law: LEGAL_LAW },
        };
        try {
            await saveReport({
                report_type: 'financial',
                report_year: reportYear,
                title: `التقرير المالي ${reportYear}`,
                data,
                status: 'final',
                created_by: user.id,
            });
            await saveDocumentToPlatform({
                title: `التقرير المالي لسنة ${reportYear}`,
                document_type: 'financial_report',
                file_url: '#',
                file_type: 'platform',
                report_year: reportYear,
                status: 'approved',
                uploaded_by: user.id,
                uploader_name: user.fullName ?? '',
                is_confidential: true,
            });
            setSaveMsg('تم حفظ التقرير في المنصة.');
        } catch (e) {
            console.error(e);
            setSaveMsg('تعذر الحفظ — راجع جداول Supabase.');
        }
    };

    const handleDocx = () => {
        const balLines = (['bank', 'postal', 'cash'] as const).flatMap((k) => [
            `${CHANNEL_LABEL[k]}: بداية ${fmt(balances[k].opening)} | إيرادات ${fmt(balances[k].income)} | نفقات ${fmt(balances[k].expense)} | ختامي ${fmt(balances[k].closing)}`,
        ]);
        void downloadFinancialDocx({
            title: `الملف المالي ${reportYear}`,
            sections: [
                { heading: 'أ — شهادة المطابقة', lines: [ASSOCIATION_LEGAL_NAME, `محافظ الحسابات: ${auditorName}`, `السنة: ${reportYear}`, ...balLines] },
                { heading: 'ب — تقرير مراجعة الحسابات', lines: [LEGAL_DECREE, LEGAL_LAW, `الفترة: ${periodText}`, `رصيد الصندوق: ${fmt(balances.cash.closing)}`, `رصيد البنك: ${fmt(balances.bank.closing)}`, `رصيد الحساب الجاري البريدي: ${fmt(balances.postal.closing)}`] },
                { heading: 'ج — جداول الحركة', lines: [`إجمالي الإيرادات: ${fmt(incomeTotal)}`, `إجمالي المصاريف: ${fmt(expenseTotal)}`] },
                {
                    heading: 'د — محضر التعيين',
                    lines: [
                        `تاريخ الجمعية العامة: ${assemblyDate}`,
                        `محافظ الحسابات: ${auditorName}`,
                        `الفترة: ${periodText}`,
                        `مكان الجلسة: ${sessionPlace}`,
                        `الساعة: ${sessionTime}`,
                    ],
                },
            ],
        });
    };

    const balanceTable = (
        <table className="w-full text-sm border-collapse border border-gray-300">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">التعيين</th>
                    <th className="border border-gray-300 p-2">البنك</th>
                    <th className="border border-gray-300 p-2">الح.ج.ب</th>
                    <th className="border border-gray-300 p-2">الصندوق</th>
                </tr>
            </thead>
            <tbody>
                {ROW_LABELS.map((label, ri) => (
                    <tr key={label}>
                        <td className="border border-gray-300 p-2 font-bold">{label}</td>
                        {(['bank', 'postal', 'cash'] as const).map((ch) => {
                            const field = (['opening', 'income', 'expense', 'closing'] as const)[ri];
                            const val = balances[ch][field];
                            return (
                                <td key={ch} className="border border-gray-300 p-1">
                                    {step === 1 ? (
                                        <input
                                            className="w-full text-center font-mono p-1 rounded border border-gray-200"
                                            dir="ltr"
                                            value={Number.isFinite(val) ? val : 0}
                                            onChange={(e) => setCell(ch, field, e.target.value)}
                                        />
                                    ) : (
                                        <span className="block text-center font-mono">{fmt(val)}</span>
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const preview = (
        <div id="financial-report-print" className="space-y-8 text-[#1e3a5f]">
            {previewTab === 'A' && (
                <div className="border rounded-2xl p-6 space-y-4">
                    <h3 className="text-center font-black text-lg">شهادة مطابقة</h3>
                    <p className="text-center font-bold">{ASSOCIATION_LEGAL_NAME}</p>
                    <p className="text-center">محافظ الحسابات: {auditorName || '……'}</p>
                    <p className="text-center">لسنة {reportYear}</p>
                    {balanceTable}
                    <p className="text-center pt-6 font-bold">توقيع محافظ الحسابات: ____________________</p>
                </div>
            )}
            {previewTab === 'B' && (
                <div className="border rounded-2xl p-6 space-y-4">
                    <h3 className="text-center font-black text-lg">تقرير مراجعة الحسابات</h3>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl read-only" contentEditable={false}>
                        {LEGAL_DECREE}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">{LEGAL_LAW}</p>
                    <p className="font-bold">الفترة: {periodText}</p>
                    <ol className="list-decimal list-inside space-y-2 font-bold">
                        <li>رصيد الصندوق النهائي: {fmt(balances.cash.closing)}</li>
                        <li>رصيد البنك النهائي: {fmt(balances.bank.closing)}</li>
                        <li>رصيد الحساب الجاري البريدي النهائي: {fmt(balances.postal.closing)}</li>
                    </ol>
                    <p className="pt-4">توقيع محافظ الحسابات: _____________ — رئيس الجمعية: _____________</p>
                </div>
            )}
            {previewTab === 'C' && (
                <div className="border rounded-2xl p-6 space-y-6">
                    <h3 className="text-center font-black">جداول الحركة المالية والملخص</h3>
                    <div>
                        <p className="font-black mb-2">جدول حركة البنك (إيرادات)</p>
                        <ul className="text-sm space-y-1">
                            {bankIncomeTx.map((r) => (
                                <li key={r.id}>
                                    {r.date} — {r.description} — {fmt(r.amount)}
                                </li>
                            ))}
                            {!bankIncomeTx.length && <li className="text-gray-400">لا توجد حركات</li>}
                        </ul>
                    </div>
                    <div>
                        <p className="font-black mb-2">جدول حركة الصندوق (إيرادات)</p>
                        <ul className="text-sm space-y-1">
                            {cashIncomeTx.map((r) => (
                                <li key={r.id}>
                                    {r.date} — {r.description} — {fmt(r.amount)}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="font-black mb-2">جدول المصاريف</p>
                        <ul className="text-sm space-y-1">
                            {expenseRows.map((r) => (
                                <li key={r.id}>
                                    {r.date} — {CATEGORY_LABELS[r.category] || r.description} — {fmt(r.amount)}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="font-black mb-2">ملخص التقييم المالي</p>
                        <p>إجمالي الإيرادات: {fmt(incomeTotal)}</p>
                        <p>إجمالي المصاريف: {fmt(expenseTotal)}</p>
                        <p>صافي الحركة: {fmt(incomeTotal - expenseTotal)}</p>
                    </div>
                </div>
            )}
            {previewTab === 'D' && (
                <div className="border rounded-2xl p-6 space-y-3">
                    <h3 className="text-center font-black">محضر تعيين محافظ الحسابات</h3>
                    <p>تاريخ انعقاد الجمعية العامة: {assemblyDate || '……'}</p>
                    <p>اسم محافظ الحسابات المعين: {auditorName || '……'}</p>
                    <p>فترة التعيين: {periodText}</p>
                    <p>مكان انعقاد الجلسة: {sessionPlace || '……'}</p>
                    <p>ساعة رفع الجلسة: {sessionTime || '……'}</p>
                    <p className="pt-8">توقيع رئيس الجمعية: ____________________</p>
                </div>
            )}
        </div>
    );

    const canNext = useMemo(() => {
        if (step === 0) return auditorName.trim().length > 0;
        if (step === 3) return assemblyDate.length > 0;
        return true;
    }, [step, auditorName, assemblyDate]);

    return (
        <ReportWizard
            title="التقرير المالي"
            steps={steps}
            currentStep={step}
            onNext={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
            onBack={() => setStep((s) => Math.max(s - 1, 0))}
            isLastStep={step === steps.length - 1}
            canNext={canNext}
            lastStepActions={
                step === steps.length - 1 ? (
                    <div className="flex flex-wrap gap-3 justify-end font-['Cairo']">
                        <button type="button" onClick={() => printReportFromElement('financial-report-print')} className="bg-[#1e3a5f] text-white px-5 py-3 rounded-xl font-black text-sm">
                            تحميل الملف الكامل PDF
                        </button>
                        <button type="button" onClick={handleDocx} className="bg-[#1e3a5f] text-white px-5 py-3 rounded-xl font-black text-sm">
                            تحميل Word .docx
                        </button>
                        <button type="button" onClick={() => void persist()} className="bg-[#3dd163] text-[#1e3a5f] px-5 py-3 rounded-xl font-black text-sm">
                            حفظ في المنصة
                        </button>
                    </div>
                ) : undefined
            }
        >
            {step === 0 && (
                <div className="space-y-5 font-['Cairo']">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-black mb-1">سنة التقرير</label>
                            <select className="w-full rounded-2xl border p-3 font-bold" value={reportYear} onChange={(e) => setReportYear(Number(e.target.value))}>
                                {YEAR_OPTIONS.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-black mb-1">الفترة</label>
                            <input readOnly className="w-full rounded-2xl border bg-gray-50 p-3 font-bold" value={periodText} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-black mb-1">اسم محافظ الحسابات</label>
                        <input className="w-full rounded-2xl border p-3" value={auditorName} onChange={(e) => setAuditorName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-black mb-1">رقم تسجيله في جدول المنظمة</label>
                        <input className="w-full rounded-2xl border p-3" value={auditorReg} onChange={(e) => setAuditorReg(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-black mb-1">عنوان مكتبه</label>
                        <input className="w-full rounded-2xl border p-3" value={auditorOffice} onChange={(e) => setAuditorOffice(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-black mb-1">هاتف محافظ الحسابات</label>
                        <input className="w-full rounded-2xl border p-3" dir="ltr" value={auditorPhone} onChange={(e) => setAuditorPhone(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-black mb-1">مكان التحرير</label>
                        <select className="w-full rounded-2xl border p-3 font-bold" value={writePlace} onChange={(e) => setWritePlace(e.target.value)}>
                            {MSILA_REPORT_COMMUNES.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-black mb-1">تاريخ التحرير</label>
                        <input type="date" className="w-full rounded-2xl border p-3" value={writeDate} onChange={(e) => setWriteDate(e.target.value)} />
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="space-y-4 font-['Cairo']">
                    {loading && <p className="text-sm text-gray-500">جاري احتساب الأرصدة من المعاملات…</p>}
                    <p className="text-sm text-gray-600">القيم تُستخرج من جدول المعاملات للسنة المحددة؛ يمكنك تعديل أي خلية يدوياً.</p>
                    {mismatch && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm font-bold">
                            تحذير: الرصيد النهائي لا يساوي (البداية + الإيرادات − النفقات) في عمود واحد أو أكثر.
                        </div>
                    )}
                    {balanceTable}
                </div>
            )}

            {step === 2 && (
                <div className="font-['Cairo']">
                    <div className="flex gap-2 mb-4">
                        <button type="button" className={`px-4 py-2 rounded-xl font-bold ${tab === 'in' ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100'}`} onClick={() => setTab('in')}>
                            الإيرادات
                        </button>
                        <button type="button" className={`px-4 py-2 rounded-xl font-bold ${tab === 'out' ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100'}`} onClick={() => setTab('out')}>
                            المصاريف
                        </button>
                    </div>
                    <div className="overflow-x-auto border rounded-2xl">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 text-right">التاريخ</th>
                                    <th className="p-2 text-right">{tab === 'in' ? 'نوع وأصل المداخيل' : 'التعيين'}</th>
                                    <th className="p-2">المبلغ</th>
                                    <th className="p-2">البنك/الصندوق</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(tab === 'in' ? incomeRows : expenseRows).map((r) => (
                                    <tr key={r.id} className="border-t">
                                        <td className="p-2">{r.date}</td>
                                        <td className="p-2">{tab === 'in' ? r.description || CATEGORY_LABELS[r.category] : CATEGORY_LABELS[r.category] || r.description}</td>
                                        <td className="p-2 font-mono" dir="ltr">
                                            {fmt(r.amount)}
                                        </td>
                                        <td className="p-2">{r.channelLabel}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50 font-black">
                                    <td colSpan={2} className="p-2">
                                        المجموع
                                    </td>
                                    <td className="p-2 font-mono" dir="ltr">
                                        {fmt(tab === 'in' ? incomeTotal : expenseTotal)}
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4 font-['Cairo']">
                    <div>
                        <label className="block text-sm font-black mb-1">تاريخ انعقاد الجمعية العامة</label>
                        <input type="date" className="w-full rounded-2xl border p-3" value={assemblyDate} onChange={(e) => setAssemblyDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-black mb-1">اسم محافظ الحسابات</label>
                        <input readOnly className="w-full rounded-2xl border bg-gray-50 p-3" value={auditorName} />
                    </div>
                    <div>
                        <label className="block text-sm font-black mb-1">فترة التعيين</label>
                        <input readOnly className="w-full rounded-2xl border bg-gray-50 p-3" value={periodText} />
                    </div>
                    <div>
                        <label className="block text-sm font-black mb-1">مكان انعقاد الجلسة</label>
                        <input className="w-full rounded-2xl border p-3" value={sessionPlace} onChange={(e) => setSessionPlace(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-black mb-1">ساعة رفع الجلسة</label>
                        <input type="time" className="w-full rounded-2xl border p-3" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} />
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-4 font-['Cairo']">
                    <div className="flex flex-wrap gap-2">
                        {(['A', 'B', 'C', 'D'] as const).map((k) => (
                            <button
                                key={k}
                                type="button"
                                onClick={() => setPreviewTab(k)}
                                className={`px-4 py-2 rounded-xl font-bold text-sm ${previewTab === k ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100'}`}
                            >
                                {k === 'A' ? 'شهادة المطابقة' : k === 'B' ? 'تقرير المراجعة' : k === 'C' ? 'الجداول المالية' : 'محضر التعيين'}
                            </button>
                        ))}
                    </div>
                    {preview}
                    {saveMsg && <p className="text-center font-bold text-[#3dd163]">{saveMsg}</p>}
                    <button type="button" onClick={() => navigate('/reports')} className="w-full py-3 rounded-xl border font-bold text-[#1e3a5f]">
                        العودة لقائمة التقارير
                    </button>
                </div>
            )}
        </ReportWizard>
    );
}
