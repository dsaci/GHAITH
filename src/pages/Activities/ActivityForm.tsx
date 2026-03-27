import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranchLayout } from '../../context/LayoutBranchContext';
import type { BenefitType, OccasionStatus, OccasionType } from '../../types';
import { MOCK_FAMILIES, MOCK_MEMBERS, MOCK_BRANCHES } from '../../data/mockData';
import { MSILA_MUNICIPALITIES } from '../../data/msilaData';
import { createActivity, getActivityById, updateActivity, addBeneficiariesToActivity } from '../../services/activities.service';
import { TYPE_LABELS, STATUS_LABELS } from './activityUi';

const MUNICIPALITIES_35 = MSILA_MUNICIPALITIES.slice(0, 35).map((m) => m.name);

const BENEFIT_OPTIONS: { value: BenefitType; label: string }[] = [
    { value: 'ramadan_basket', label: 'سلة رمضان' },
    { value: 'eid_gift', label: 'عيد' },
    { value: 'school_supplies', label: 'دخول مدرسي' },
    { value: 'medical', label: 'طبي' },
    { value: 'financial_aid', label: 'مساعدة مالية' },
    { value: 'food_basket', label: 'سلة غذائية' },
    { value: 'clothing', label: 'ملابس' },
    { value: 'other', label: 'أخرى' },
];

function canManageActivities(role: string | undefined) {
    return role === 'president' || role === 'vice_president' || role === 'board_member' || role === 'branch_president';
}

interface BenefitLine {
    familyId: string;
    benefitType: BenefitType;
    quantity: string;
    amount: string;
    notes: string;
}

export default function ActivityFormPage() {
    const { id: editId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEdit = Boolean(editId);

    const [title, setTitle] = useState('');
    const [occasionType, setOccasionType] = useState<OccasionType>('social');
    const [subType, setSubType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [municipalityName, setMunicipalityName] = useState(MUNICIPALITIES_35[0] ?? '');
    const [targetBeneficiaries, setTargetBeneficiaries] = useState('');
    const [budgetPlanned, setBudgetPlanned] = useState('');
    const [responsibleMemberId, setResponsibleMemberId] = useState('');
    const [branchId, setBranchId] = useState('');
    const [partners, setPartners] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<OccasionStatus>('planned');
    const [notes, setNotes] = useState('');

    const [familySearch, setFamilySearch] = useState('');
    const [benefitLines, setBenefitLines] = useState<BenefitLine[]>([]);
    const isBranch = useBranchLayout();
    const p = isBranch ? '/branch' : '';
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(isEdit);

    const members = useMemo(() => MOCK_MEMBERS.filter((m) => m.status === 'active'), []);
    const families = useMemo(() => MOCK_FAMILIES.filter((f) => f.status === 'active' && !f.is_deleted), []);

    useEffect(() => {
        if (!editId) return;
        let alive = true;
        (async () => {
            setLoading(true);
            const a = await getActivityById(editId);
            if (!alive || !a) return;
            setTitle(a.title);
            setOccasionType(a.occasionType);
            setSubType(a.subType ?? '');
            setStartDate(a.startDate);
            setEndDate(a.endDate ?? '');
            setLocation(a.location ?? '');
            setMunicipalityName(a.municipalityName ?? MUNICIPALITIES_35[0] ?? '');
            setTargetBeneficiaries(String(a.targetBeneficiariesCount ?? ''));
            setBudgetPlanned(String(a.budgetPlanned ?? ''));
            setResponsibleMemberId(a.responsibleMemberId ?? '');
            setBranchId(a.branchId ?? '');
            setPartners(a.partners ?? '');
            setDescription(a.description ?? '');
            setStatus(a.status);
            setNotes(a.notes ?? a.report ?? '');
            setLoading(false);
        })();
        return () => {
            alive = false;
        };
    }, [editId]);

    const filteredFamilies = useMemo(() => {
        const q = familySearch.trim().toLowerCase();
        if (!q) return families.slice(0, 30);
        return families.filter((f) => f.familyName.toLowerCase().includes(q) || f.municipalityName.toLowerCase().includes(q)).slice(0, 40);
    }, [families, familySearch]);

    const addBenefitLine = (familyId: string) => {
        if (benefitLines.some((l) => l.familyId === familyId)) return;
        setBenefitLines((l) => [...l, { familyId, benefitType: 'other', quantity: '', amount: '', notes: '' }]);
    };

    const updateLine = (familyId: string, patch: Partial<BenefitLine>) => {
        setBenefitLines((lines) => lines.map((l) => (l.familyId === familyId ? { ...l, ...patch } : l)));
    };

    const removeLine = (familyId: string) => {
        setBenefitLines((lines) => lines.filter((l) => l.familyId !== familyId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !canManageActivities(user.role)) return;
        if (!title.trim() || !startDate || !location.trim()) return;
        setSaving(true);
        try {
            const payload = {
                title: title.trim(),
                occasionType,
                subType: subType.trim() || undefined,
                startDate,
                endDate: endDate || undefined,
                location: location.trim(),
                municipalityName: municipalityName || undefined,
                targetBeneficiariesCount: targetBeneficiaries ? Number(targetBeneficiaries) : undefined,
                budgetPlanned: budgetPlanned ? Number(budgetPlanned) : undefined,
                responsibleMemberId: responsibleMemberId || undefined,
                responsibleMemberName: members.find((m) => m.id === responsibleMemberId)?.fullName,
                branchId: branchId || undefined,
                partners: partners.trim() || undefined,
                description: description.trim() || undefined,
                status,
                notes: notes.trim() || undefined,
            };

            let actId = editId;
            if (isEdit && editId) {
                await updateActivity(editId, payload);
            } else {
                const created = await createActivity(payload, user.id);
                actId = created.id;
            }

            if (status === 'completed' && actId && benefitLines.length) {
                await addBeneficiariesToActivity(
                    actId,
                    benefitLines.map((l) => ({
                        familyId: l.familyId,
                        benefitType: l.benefitType,
                        quantity: l.quantity ? Number(l.quantity) : undefined,
                        amount: l.amount ? Number(l.amount) : undefined,
                        notes: l.notes || undefined,
                        benefitDate: startDate,
                    })),
                    user.id
                );
            }

            navigate(`${p}/activities/${actId}`);
        } finally {
            setSaving(false);
        }
    };

    if (!canManageActivities(user?.role)) {
        return (
            <div className="p-8 text-center font-['Cairo'] font-bold text-red-600" dir="rtl">
                غير مصرح لك بإنشاء أو تعديل الأنشطة.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-12 text-center font-['Cairo']" dir="rtl">
                جاري التحميل…
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 font-['Cairo'] animate-fade-in pb-16" dir="rtl">
            <div className="flex items-center gap-3">
                <Link to={isEdit && editId ? `${p}/activities/${editId}` : `${p}/activities`} className="p-2 rounded-xl hover:bg-gray-100">
                    <ArrowRight className="w-5 h-5" />
                </Link>
                <h2 className="page-title mb-0">{isEdit ? 'تعديل النشاط' : 'نشاط جديد'}</h2>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="card p-6 space-y-5">
                <div>
                    <label className="block text-sm font-black text-gray-700 mb-1">عنوان النشاط *</label>
                    <input required className="w-full rounded-xl border border-gray-200 p-3 font-bold" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-1">نوع النشاط *</label>
                        <select required className="w-full rounded-xl border border-gray-200 p-3 font-bold" value={occasionType} onChange={(e) => setOccasionType(e.target.value as OccasionType)}>
                            {(Object.keys(TYPE_LABELS) as OccasionType[]).map((k) => (
                                <option key={k} value={k}>
                                    {TYPE_LABELS[k]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-1">النوع الفرعي</label>
                        <input className="w-full rounded-xl border border-gray-200 p-3" value={subType} onChange={(e) => setSubType(e.target.value)} />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-1">تاريخ البداية *</label>
                        <input required type="date" className="w-full rounded-xl border border-gray-200 p-3 font-bold" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-1">تاريخ النهاية</label>
                        <input type="date" className="w-full rounded-xl border border-gray-200 p-3" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-black text-gray-700 mb-1">مكان الإقامة *</label>
                    <input required className="w-full rounded-xl border border-gray-200 p-3 font-bold" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-black text-gray-700 mb-1">البلدية</label>
                    <select className="w-full rounded-xl border border-gray-200 p-3 font-bold" value={municipalityName} onChange={(e) => setMunicipalityName(e.target.value)}>
                        {MUNICIPALITIES_35.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-1">عدد المستفيدين المستهدف</label>
                        <input type="number" min={0} className="w-full rounded-xl border border-gray-200 p-3" value={targetBeneficiaries} onChange={(e) => setTargetBeneficiaries(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-1">الميزانية المخططة (دج)</label>
                        <input type="number" min={0} className="w-full rounded-xl border border-gray-200 p-3" dir="ltr" value={budgetPlanned} onChange={(e) => setBudgetPlanned(e.target.value)} />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-1">المسؤول عن التنفيذ</label>
                        <select className="w-full rounded-xl border border-gray-200 p-3 font-bold" value={responsibleMemberId} onChange={(e) => setResponsibleMemberId(e.target.value)}>
                            <option value="">—</option>
                            {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.fullName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-1">الفرع المنظم</label>
                        <select className="w-full rounded-xl border border-gray-200 p-3 font-bold" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                            <option value="">—</option>
                            {MOCK_BRANCHES.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.branchName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-black text-gray-700 mb-1">الجهات الشريكة</label>
                    <input className="w-full rounded-xl border border-gray-200 p-3" placeholder="مفصولة بفواصل" value={partners} onChange={(e) => setPartners(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-black text-gray-700 mb-1">وصف النشاط</label>
                    <textarea rows={4} className="w-full rounded-xl border border-gray-200 p-3" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-black text-gray-700 mb-1">الحالة</label>
                    <select className="w-full rounded-xl border border-gray-200 p-3 font-bold" value={status} onChange={(e) => setStatus(e.target.value as OccasionStatus)}>
                        {(Object.keys(STATUS_LABELS) as OccasionStatus[]).map((k) => (
                            <option key={k} value={k}>
                                {STATUS_LABELS[k]}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-black text-gray-700 mb-1">ملاحظات</label>
                    <textarea rows={3} className="w-full rounded-xl border border-gray-200 p-3" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                {status === 'completed' && (
                    <div className="border-t border-gray-200 pt-6 space-y-4">
                        <h3 className="font-black text-[#1e3a5f]">ربط العائلات المستفيدة (إدخال سريع)</h3>
                        <input className="w-full rounded-xl border border-gray-200 p-3" placeholder="بحث عن عائلة…" value={familySearch} onChange={(e) => setFamilySearch(e.target.value)} />
                        <div className="max-h-48 overflow-y-auto border rounded-xl divide-y">
                            {filteredFamilies.map((f) => (
                                <div key={f.id} className="flex items-center justify-between p-2 gap-2">
                                    <span className="text-sm font-bold">
                                        {f.familyName} — {f.municipalityName}
                                    </span>
                                    <button type="button" onClick={() => addBenefitLine(f.id)} className="text-sm font-black text-[#1e3a5f] flex items-center gap-1">
                                        <Plus className="w-4 h-4" /> إضافة
                                    </button>
                                </div>
                            ))}
                        </div>
                        {benefitLines.map((l) => {
                            const fam = families.find((x) => x.id === l.familyId);
                            return (
                                <div key={l.familyId} className="border rounded-xl p-4 space-y-2 bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <span className="font-black">{fam?.familyName ?? l.familyId}</span>
                                        <button type="button" onClick={() => removeLine(l.familyId)} className="p-2 text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="grid md:grid-cols-4 gap-2">
                                        <select className="rounded-lg border p-2 text-sm font-bold" value={l.benefitType} onChange={(e) => updateLine(l.familyId, { benefitType: e.target.value as BenefitType })}>
                                            {BENEFIT_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                        <input className="rounded-lg border p-2 text-sm" placeholder="الكمية" value={l.quantity} onChange={(e) => updateLine(l.familyId, { quantity: e.target.value })} />
                                        <input className="rounded-lg border p-2 text-sm" placeholder="المبلغ دج" value={l.amount} onChange={(e) => updateLine(l.familyId, { amount: e.target.value })} dir="ltr" />
                                        <input className="rounded-lg border p-2 text-sm" placeholder="ملاحظة" value={l.notes} onChange={(e) => updateLine(l.familyId, { notes: e.target.value })} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <button type="submit" disabled={saving} className="w-full py-4 rounded-2xl bg-[#1e3a5f] text-white font-black text-lg disabled:opacity-50">
                    {saving ? 'جاري الحفظ…' : 'حفظ النشاط'}
                </button>
            </form>
        </div>
    );
}
