import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, FileText, Image as ImageIcon, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranchLayout } from '../../context/LayoutBranchContext';
import type { Occasion } from '../../types';
import { getActivityById, getBenefitsForOccasion, updateActivity } from '../../services/activities.service';
import { TYPE_LABELS, STATUS_LABELS, CATEGORY_LABELS_AR, formatActivityDate } from './activityUi';
import { printReportFromElement } from '../../lib/reportExports';

function canManageActivities(role: string | undefined) {
    return role === 'president' || role === 'vice_president' || role === 'board_member' || role === 'branch_president';
}

export default function ActivityDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const canEdit = canManageActivities(user?.role);

    const isBranch = useBranchLayout();
    const p = isBranch ? '/branch' : '';

    const [tab, setTab] = useState<'info' | 'beneficiaries' | 'docs' | 'report'>('info');
    const [activity, setActivity] = useState<Occasion | null>(null);
    const [benefits, setBenefits] = useState<Awaited<ReturnType<typeof getBenefitsForOccasion>>>([]);
    const [loading, setLoading] = useState(true);
    const [postReport, setPostReport] = useState('');
    const [uploadNote, setUploadNote] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const [a, b] = await Promise.all([getActivityById(id), getBenefitsForOccasion(id)]);
                if (!alive) return;
                setActivity(a);
                setBenefits(b);
                setPostReport(a?.postReport ?? a?.report ?? '');
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [id]);

    const handleSaveReport = async () => {
        if (!id || !activity) return;
        const updated = await updateActivity(id, { postReport });
        if (updated) {
            setActivity(updated);
            setPostReport(updated.postReport ?? '');
        }
    };

    const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length || !activity || !id) return;
        const urls = Array.from(files).map((f) => URL.createObjectURL(f));
        const nextDocs = [...(activity.documentUrls ?? []), ...urls];
        const nextPhotos = [...(activity.photosUrls ?? []), ...urls];
        void (async () => {
            const u = await updateActivity(id, { documentUrls: nextDocs, photosUrls: nextPhotos });
            if (u) {
                setActivity(u);
                setUploadNote('تمت إضافة الملفات محلياً (ارفع لاحقاً إلى Supabase Storage).');
            }
        })();
    };

    const exportPdf = () => printReportFromElement('activity-final-report');

    if (loading) {
        return (
            <div className="p-12 text-center font-['Cairo'] font-bold text-gray-500" dir="rtl">
                جاري التحميل…
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="p-12 text-center font-['Cairo']" dir="rtl">
                <p className="font-bold text-gray-600 mb-4">النشاط غير موجود</p>
                <Link to={`${p}/activities`} className="text-primary-600 font-black">
                    العودة للقائمة
                </Link>
            </div>
        );
    }

    const tabs = [
        { id: 'info' as const, label: 'معلومات النشاط' },
        { id: 'beneficiaries' as const, label: 'المستفيدون' },
        { id: 'docs' as const, label: 'الوثائق والصور' },
        { id: 'report' as const, label: 'التقرير الختامي' },
    ];

    return (
        <div className="space-y-6 font-['Cairo'] animate-fade-in" dir="rtl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => navigate(`${p}/activities`)} className="p-2 rounded-xl hover:bg-gray-100">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="page-title mb-0">{activity.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {TYPE_LABELS[activity.occasionType]} — {STATUS_LABELS[activity.status]}
                        </p>
                    </div>
                </div>
                {canEdit && (
                    <Link to={`${p}/activities/${activity.id}/edit`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e3a5f] text-white font-black text-sm">
                        <Pencil className="w-4 h-4" />
                        تعديل
                    </Link>
                )}
            </div>

            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm ${tab === t.id ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'info' && (
                <div className="card p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 font-bold">العنوان</span>
                            <p className="font-black text-lg">{activity.title}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 font-bold">النوع / الفرعي</span>
                            <p className="font-bold">
                                {TYPE_LABELS[activity.occasionType]} {activity.subType ? `— ${activity.subType}` : ''}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 font-bold">التاريخ</span>
                            <p className="font-bold">{formatActivityDate(activity.startDate)}</p>
                            {activity.endDate && <p className="text-gray-600">حتى {formatActivityDate(activity.endDate)}</p>}
                        </div>
                        <div>
                            <span className="text-gray-500 font-bold">المكان</span>
                            <p className="font-bold">{activity.location ?? '—'}</p>
                            {activity.municipalityName && <p className="text-gray-600">البلدية: {activity.municipalityName}</p>}
                        </div>
                        <div>
                            <span className="text-gray-500 font-bold">المسؤول عن التنفيذ</span>
                            <p className="font-bold">{activity.responsibleMemberName ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 font-bold">الفرع</span>
                            <p className="font-bold">{activity.branchName ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 font-bold">المستفيدون (مستهدف / فعلي)</span>
                            <p className="font-bold">
                                {(activity.targetBeneficiariesCount ?? 0).toLocaleString('ar-DZ')} / {(activity.actualBeneficiariesCount ?? 0).toLocaleString('ar-DZ')}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 font-bold">الميزانية (مخططة / فعلية)</span>
                            <p className="font-bold">
                                {(activity.budgetPlanned ?? 0).toLocaleString('ar-DZ')} دج / {(activity.budgetActual ?? 0).toLocaleString('ar-DZ')} دج
                            </p>
                        </div>
                    </div>
                    {activity.description && (
                        <div>
                            <span className="text-gray-500 font-bold block mb-1">الوصف والأهداف</span>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{activity.description}</p>
                        </div>
                    )}
                    {activity.partners && (
                        <div>
                            <span className="text-gray-500 font-bold block mb-1">الجهات الشريكة</span>
                            <p className="font-bold">{activity.partners}</p>
                        </div>
                    )}
                </div>
            )}

            {tab === 'beneficiaries' && (
                <div className="card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="text-right p-3 font-black">اسم العائلة</th>
                                <th className="text-right p-3 font-black">الفئة</th>
                                <th className="text-right p-3 font-black">ما استفادت به</th>
                                <th className="text-right p-3 font-black">البلدية</th>
                            </tr>
                        </thead>
                        <tbody>
                            {benefits.map((b) => (
                                <tr key={b.id} className="border-b border-gray-100">
                                    <td className="p-3 font-bold">{b.family?.familyName ?? b.familyId}</td>
                                    <td className="p-3">{b.family?.category ? CATEGORY_LABELS_AR[b.family.category] : '—'}</td>
                                    <td className="p-3">{b.description ?? b.benefitType}</td>
                                    <td className="p-3">{b.family?.municipalityName ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {benefits.length === 0 && <p className="p-8 text-center text-gray-500 font-bold">لا توجد استفادات مرتبطة بهذا النشاط</p>}
                </div>
            )}

            {tab === 'docs' && (
                <div className="card p-6 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e3a5f] text-white font-bold text-sm cursor-pointer">
                            <FileText className="w-4 h-4" />
                            رفع ملفات
                            <input type="file" multiple className="hidden" onChange={handleFileAdd} accept="image/*,.pdf,.doc,.docx" />
                        </label>
                        {uploadNote && <span className="text-sm text-amber-700 font-bold">{uploadNote}</span>}
                    </div>
                    <div>
                        <h4 className="font-black mb-2 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" /> معرض الصور
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {(activity.photosUrls ?? []).map((url, i) => (
                                <img key={i} src={url} alt="" className="w-24 h-24 object-cover rounded-xl border" />
                            ))}
                            {(activity.photosUrls ?? []).length === 0 && <p className="text-gray-500 text-sm">لا توجد صور بعد</p>}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-black mb-2">وثائق</h4>
                        <ul className="text-sm space-y-1">
                            {(activity.documentUrls ?? []).map((url, i) => (
                                <li key={i}>
                                    <a href={url} className="text-primary-600 font-bold underline" target="_blank" rel="noreferrer">
                                        مرفق {i + 1}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {tab === 'report' && (
                <div className="card p-6 space-y-4">
                    <div id="activity-final-report" className="space-y-4 border rounded-2xl p-6 bg-white">
                        <h3 className="text-center font-black text-xl text-[#1e3a5f]">التقرير الختامي — {activity.title}</h3>
                        <div className="grid md:grid-cols-2 gap-3 text-sm font-bold">
                            <p>عدد المستفيدين الفعلي: {(activity.actualBeneficiariesCount ?? 0).toLocaleString('ar-DZ')}</p>
                            <p>التكلفة الإجمالية: {(activity.budgetActual ?? 0).toLocaleString('ar-DZ')} دج</p>
                        </div>
                        <div>
                            <label className="block text-sm font-black text-gray-600 mb-2">النتائج المحققة — الملاحظات والتوصيات</label>
                            <textarea rows={8} className="w-full rounded-2xl border border-gray-200 p-4" value={postReport} onChange={(e) => setPostReport(e.target.value)} disabled={!canEdit} />
                        </div>
                    </div>
                    {canEdit && (
                        <button type="button" onClick={() => void handleSaveReport()} className="px-6 py-3 rounded-xl bg-[#3dd163] text-[#1e3a5f] font-black">
                            حفظ التقرير
                        </button>
                    )}
                    <button type="button" onClick={exportPdf} className="px-6 py-3 rounded-xl border-2 border-[#1e3a5f] text-[#1e3a5f] font-black mr-2">
                        تصدير PDF
                    </button>
                </div>
            )}
        </div>
    );
}
