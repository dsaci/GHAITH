import { useState } from 'react';
import { Plus, Mail, Calendar, Package2 } from 'lucide-react';
import { MOCK_MAILS, MOCK_MEETINGS, MOCK_INVENTORY } from '../../data/mockData';
import { Badge, Button } from '../../components/ui';

const MEETING_TYPE: Record<string, string> = { board: 'مكتب تنفيذي', general: 'جمعية عامة', emergency: 'طارئ', committee: 'لجنة', other: 'أخرى' };
const MEETING_STATUS: Record<string, 'green' | 'gray' | 'red' | 'yellow'> = { scheduled: 'yellow', completed: 'green', cancelled: 'red', postponed: 'gray' };

export default function AdministrationPage() {
    const [activeTab, setActiveTab] = useState<'mail' | 'meetings' | 'inventory'>('mail');
    const lowStock = MOCK_INVENTORY.filter(i => i.currentQuantity <= i.minimumThreshold);

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="page-header">
                <h2 className="page-title">السجلات الإدارية</h2>
                <Button icon={<Plus className="w-4 h-4" />}>
                    {activeTab === 'mail' ? 'بريد جديد' : activeTab === 'meetings' ? 'اجتماع جديد' : 'صنف جديد'}
                </Button>
            </div>

            {/* Tab selection */}
            <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-1">
                <button onClick={() => setActiveTab('mail')} className={`tab-button flex items-center gap-2 ${activeTab === 'mail' ? 'active' : ''}`}><Mail className="w-4 h-4" />الصادر والوارد</button>
                <button onClick={() => setActiveTab('meetings')} className={`tab-button flex items-center gap-2 ${activeTab === 'meetings' ? 'active' : ''}`}><Calendar className="w-4 h-4" />الاجتماعات</button>
                <button onClick={() => setActiveTab('inventory')} className={`tab-button flex items-center gap-2 ${activeTab === 'inventory' ? 'active' : ''}`}>
                    <Package2 className="w-4 h-4" />الجرد
                    {lowStock.length > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{lowStock.length}</span>}
                </button>
            </div>

            {/* Mail tab */}
            {activeTab === 'mail' && (
                <div className="table-container">
                    <table className="w-full bg-white">
                        <thead>
                            <tr>{['رقم البريد', 'الاتجاه', 'الموضوع', 'المرسل/المستقبل', 'التاريخ', 'الحالة'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {MOCK_MAILS.map(m => (
                                <tr key={m.id} className="table-row">
                                    <td className="table-cell font-mono text-xs text-gray-500">{m.mailNumber}</td>
                                    <td className="table-cell"><Badge variant={m.mailDirection === 'incoming' ? 'blue' : 'green'}>{m.mailDirection === 'incoming' ? 'وارد' : 'صادر'}</Badge></td>
                                    <td className="table-cell font-medium max-w-xs truncate">{m.subject}</td>
                                    <td className="table-cell text-sm text-gray-600">{m.senderOrRecipient}</td>
                                    <td className="table-cell text-xs text-gray-400">{m.mailDate}</td>
                                    <td className="table-cell"><Badge variant={m.actionStatus === 'completed' ? 'green' : m.actionStatus === 'pending' ? 'yellow' : m.actionStatus === 'in_progress' ? 'blue' : 'gray'}>{m.actionStatus === 'pending' ? 'معلق' : m.actionStatus === 'completed' ? 'منجز' : m.actionStatus === 'in_progress' ? 'جارٍ' : 'لا يلزم'}</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Meetings tab */}
            {activeTab === 'meetings' && (
                <div className="space-y-4">
                    {MOCK_MEETINGS.map(m => (
                        <div key={m.id} className="card">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{m.title}</h4>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="blue">{MEETING_TYPE[m.meetingType]}</Badge>
                                        <Badge variant={MEETING_STATUS[m.status]}>{m.status === 'scheduled' ? 'مجدول' : m.status === 'completed' ? 'منعقد' : m.status === 'cancelled' ? 'ملغى' : 'مؤجل'}</Badge>
                                    </div>
                                </div>
                                <div className="text-left text-sm text-gray-500">
                                    <p>{new Date(m.meetingDate).toLocaleDateString('ar-DZ')}</p>
                                    {m.location && <p className="text-xs">{m.location}</p>}
                                </div>
                            </div>
                            {m.agenda.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-50">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">جدول الأعمال:</p>
                                    <ul className="space-y-1">{m.agenda.map((a, i) => <li key={i} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-primary-500 font-bold shrink-0">{i + 1}.</span>{a}</li>)}</ul>
                                </div>
                            )}
                            {m.decisions.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-50">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">قرارات:</p>
                                    <ul className="space-y-1">{m.decisions.map((d, i) => <li key={i} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-green-500">✓</span>{d}</li>)}</ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Inventory tab */}
            {activeTab === 'inventory' && (
                <div>
                    {lowStock.length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                            <p className="text-sm font-semibold text-red-700 mb-2">⚠️ أصناف وصلت للحد الأدنى ({lowStock.length})</p>
                            <div className="flex flex-wrap gap-2">{lowStock.map(i => <Badge key={i.id} variant="red">{i.itemName}</Badge>)}</div>
                        </div>
                    )}
                    <div className="table-container">
                        <table className="w-full bg-white">
                            <thead>
                                <tr>{['الصنف', 'النوع', 'الوحدة', 'الكمية الحالية', 'الحد الأدنى', 'الموقع', 'الحالة'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {MOCK_INVENTORY.map(i => {
                                    const pct = i.minimumThreshold > 0 ? (i.currentQuantity / (i.initialQuantity || 1)) * 100 : 100;
                                    const isLow = i.currentQuantity <= i.minimumThreshold;
                                    return (
                                        <tr key={i.id} className="table-row">
                                            <td className="table-cell font-medium">{i.itemName}</td>
                                            <td className="table-cell text-xs">{i.itemType === 'food' ? 'غذاء' : i.itemType === 'clothing' ? 'ملابس' : i.itemType === 'medical' ? 'طبي' : i.itemType === 'equipment' ? 'معدات' : 'أخرى'}</td>
                                            <td className="table-cell text-xs text-gray-500">{i.unit}</td>
                                            <td className="table-cell font-bold">{i.currentQuantity}</td>
                                            <td className="table-cell text-xs text-gray-400">{i.minimumThreshold}</td>
                                            <td className="table-cell text-xs text-gray-500">{i.location || '—'}</td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                                                        <div className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                                                    </div>
                                                    <Badge variant={isLow ? 'red' : 'green'}>{isLow ? 'ناقص' : 'كافٍ'}</Badge>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
