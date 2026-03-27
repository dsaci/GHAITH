import { useState } from 'react';
import { Plus, AlertCircle, Clock } from 'lucide-react';
import { MOCK_AID_REQUESTS } from '../../data/mockData';
import { Badge, Button } from '../../components/ui';
import { MSILA_DAIRAS, MSILA_MUNICIPALITIES } from '../../data/msilaData';

const TYPE_LABELS: Record<string, string> = {
    financial_aid: 'مساعدة مالية', food_aid: 'مساعدة غذائية', medical_aid: 'مساعدة طبية',
    educational_aid: 'دعم تعليمي', space_request: 'طلب فضاء', other: 'طلب آخر',
};
const STATUS_LABELS: Record<string, string> = { pending: 'معلق', under_review: 'قيد الدراسة', approved: 'موافق عليه', rejected: 'مرفوض', fulfilled: 'تم التنفيذ' };
const STATUS_COLORS: Record<string, 'yellow' | 'blue' | 'green' | 'red' | 'gray'> = { pending: 'yellow', under_review: 'blue', approved: 'green', rejected: 'red', fulfilled: 'gray' };
const URGENCY_LABELS: Record<string, string> = { low: 'منخفض', medium: 'متوسط', high: 'عالٍ', urgent: 'عاجل جداً' };
const URGENCY_COLORS: Record<string, 'gray' | 'blue' | 'orange' | 'red'> = { low: 'gray', medium: 'blue', high: 'orange', urgent: 'red' };

export default function RequestsPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const [municipalityFilter, setMunicipalityFilter] = useState('');

    const requests = MOCK_AID_REQUESTS.filter(r => {
        const matchStatus = !statusFilter || r.status === statusFilter;
        const matchMunicipality = !municipalityFilter || r.municipalityName === municipalityFilter;
        return matchStatus && matchMunicipality;
    });
    const pending = MOCK_AID_REQUESTS.filter(r => r.status === 'pending').length;

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">طلبات المساعدة</h2>
                    {pending > 0 && (
                        <div className="flex items-center gap-2 text-sm text-amber-600 mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {pending} طلب يستدعي المراجعة العاجلة
                        </div>
                    )}
                </div>
                <Button icon={<Plus className="w-4 h-4" />}>طلب جديد</Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-1">
                    {[{ value: '', label: 'الكل' }, { value: 'pending', label: 'معلقة' }, { value: 'under_review', label: 'قيد الدراسة' }, { value: 'approved', label: 'موافق عليها' }, { value: 'fulfilled', label: 'منفذة' }].map(f => (
                        <button key={f.value} onClick={() => setStatusFilter(f.value)}
                            className={`tab-button ${statusFilter === f.value ? 'active' : ''}`}>{f.label}</button>
                    ))}
                </div>

                <select value={municipalityFilter} onChange={e => setMunicipalityFilter(e.target.value)} className="select-field w-auto min-w-[160px]">
                    <option value="">جميع البلديات</option>
                    {MSILA_DAIRAS.map(dairaName => (
                        <optgroup key={dairaName} label={dairaName}>
                            {MSILA_MUNICIPALITIES.filter(m => m.daira === dairaName).map(m => (
                                <option key={m.id} value={m.name}>{m.name}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>

            <div className="space-y-3">
                {requests.map(r => (
                    <div key={r.id} className="card hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${r.urgencyLevel === 'urgent' ? 'bg-red-100' : r.urgencyLevel === 'high' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                                    <Clock className={`w-6 h-6 ${r.urgencyLevel === 'urgent' ? 'text-red-500' : r.urgencyLevel === 'high' ? 'text-orange-500' : 'text-blue-500'}`} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{r.requesterName}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        <Badge variant={STATUS_COLORS[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                                        <Badge variant={URGENCY_COLORS[r.urgencyLevel]}>إلحاح: {URGENCY_LABELS[r.urgencyLevel]}</Badge>
                                        <Badge variant="gray">{TYPE_LABELS[r.requestType]}</Badge>
                                        {r.municipalityName && <Badge variant="blue">{r.municipalityName}</Badge>}
                                    </div>
                                    {r.reviewerNotes && <p className="text-xs text-gray-400 mt-2 italic">ملاحظة المراجع: {r.reviewerNotes}</p>}
                                </div>
                            </div>
                            <div className="text-left text-xs text-gray-400">
                                <p>تاريخ الطلب: {r.requestDate}</p>
                                {r.decisionDate && <p className="text-green-600 font-medium mt-1">تاريخ القرار: {r.decisionDate}</p>}
                                {r.status === 'pending' && (
                                    <div className="flex gap-2 mt-3">
                                        <button className="btn-primary text-xs py-1.5 px-3">موافقة</button>
                                        <button className="btn-secondary text-xs py-1.5 px-3">رفض</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
