import { useState, useEffect } from 'react';
import { Plus, Mail, Calendar, Package2 } from 'lucide-react';
import { administrationService } from '../../services/administration.service';
import { Badge, Button, LoadingSpinner, EmptyState } from '../../components/ui';
import type { Mail as MailType, Meeting, InventoryItem } from '../../types';
import AdminEntryModal from '../../components/modals/AdminEntryModal';

const MEETING_TYPE: Record<string, string> = { board: 'مكتب تنفيذي', general: 'جمعية عامة', emergency: 'طارئ', committee: 'لجنة', other: 'أخرى' };
const MEETING_STATUS: Record<string, 'green' | 'gray' | 'red' | 'yellow'> = { scheduled: 'yellow', completed: 'green', cancelled: 'red', postponed: 'gray' };

export default function AdministrationPage() {
    const [activeTab, setActiveTab] = useState<'mail' | 'meetings' | 'inventory'>('mail');
    const [mails, setMails] = useState<MailType[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    async function loadData() {
        try {
            setLoading(true);
            if (activeTab === 'mail') {
                const data = await administrationService.getMails();
                setMails(data);
            } else if (activeTab === 'meetings') {
                const data = await administrationService.getMeetings();
                setMeetings(data);
            } else if (activeTab === 'inventory') {
                const data = await administrationService.getInventory();
                setInventory(data);
            }
        } catch (err) {
            console.error('Error loading admin data:', err);
        } finally {
            setLoading(false);
        }
    }

    const lowStock = inventory.filter((i: InventoryItem) => i.currentQuantity <= i.minimumThreshold);

    return (
        <div className="space-y-5 animate-fade-in" dir="rtl">
            <div className="page-header">
                <h2 className="page-title">السجلات الإدارية</h2>
                <Button 
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowModal(true)}
                >
                    {activeTab === 'mail' ? 'بريد جديد' : activeTab === 'meetings' ? 'اجتماع جديد' : 'صنف جديد'}
                </Button>
            </div>

            {/* Tab selection */}
            <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-1">
                <button onClick={() => setActiveTab('mail')} className={`tab-button flex items-center gap-2 ${activeTab === 'mail' ? 'active' : ''}`}><Mail className="w-4 h-4" />الصادر والوارد</button>
                <button onClick={() => setActiveTab('meetings')} className={`tab-button flex items-center gap-2 ${activeTab === 'meetings' ? 'active' : ''}`}><Calendar className="w-4 h-4" />الاجتماعات</button>
                <button onClick={() => setActiveTab('inventory')} className={`tab-button flex items-center gap-2 ${activeTab === 'inventory' ? 'active' : ''}`}>
                    <Package2 className="w-4 h-4" />الجرد
                    {lowStock.length > 0 && <span className="bg-red-500 text-white text-xs rounded-full min-w-[1rem] h-4 flex items-center justify-center px-1">{lowStock.length}</span>}
                </button>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    {/* Mail tab */}
                    {activeTab === 'mail' && (
                        mails.length === 0 ? <EmptyState title="لا يوجد بريد مسجل" description="ابدأ بإضافة أول مراسلة صادر أو وارد." /> : (
                            <div className="table-container shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                                <table className="w-full bg-white">
                                    <thead>
                                        <tr>{['رقم البريد', 'الاتجاه', 'الموضوع', 'المرسل/المستقبل', 'التاريخ', 'الحالة'].map(h => <th key={h} className="table-header bg-gray-50/50">{h}</th>)}</tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {mails.map((m: MailType) => (
                                            <tr key={m.id} className="table-row hover:bg-gray-50/50 transition-colors">
                                                <td className="table-cell font-mono text-xs text-gray-500">{m.mailNumber}</td>
                                                <td className="table-cell"><Badge variant={m.mailDirection === 'incoming' ? 'blue' : 'green'}>{m.mailDirection === 'incoming' ? 'وارد' : 'صادر'}</Badge></td>
                                                <td className="table-cell font-bold text-gray-900 max-w-xs truncate">{m.subject}</td>
                                                <td className="table-cell text-sm text-gray-600">{m.senderOrRecipient}</td>
                                                <td className="table-cell text-xs text-gray-400">{new Date(m.mailDate).toLocaleDateString('ar-DZ')}</td>
                                                <td className="table-cell">
                                                    <Badge variant={m.actionStatus === 'completed' ? 'green' : m.actionStatus === 'pending' ? 'yellow' : m.actionStatus === 'in_progress' ? 'blue' : 'gray'}>
                                                        {m.actionStatus === 'pending' ? 'معلق' : m.actionStatus === 'completed' ? 'منجز' : m.actionStatus === 'in_progress' ? 'جارٍ' : 'لا يلزم'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}

                    {/* Meetings tab */}
                    {activeTab === 'meetings' && (
                        meetings.length === 0 ? <EmptyState title="لا توجد اجتماعات" description="قم بجدولة أول اجتماع للمكتب أو الجمعية العامة." /> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {meetings.map((m: Meeting) => (
                                    <div key={m.id} className="card hover:shadow-md transition-all border-r-4 border-r-primary-500">
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <div>
                                                <h4 className="font-black text-gray-900 text-lg leading-tight">{m.title}</h4>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge variant="blue">{MEETING_TYPE[m.meetingType] || 'اجتماع'}</Badge>
                                                    <Badge variant={MEETING_STATUS[m.status] || 'gray'}>
                                                        {m.status === 'scheduled' ? 'مجدول' : m.status === 'completed' ? 'منعقد' : m.status === 'cancelled' ? 'ملغى' : 'مؤجل'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-left text-xs font-bold text-gray-400 bg-gray-50 p-2 rounded-lg">
                                                <p>{new Date(m.meetingDate).toLocaleDateString('ar-DZ')}</p>
                                                {m.location && <p className="mt-1 text-primary-600">{m.location}</p>}
                                            </div>
                                        </div>
                                        {m.agenda && m.agenda.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-xs font-black text-gray-400 mb-3 uppercase tracking-wider">جدول الأعمال:</p>
                                                <ul className="space-y-2">
                                                    {m.agenda.map((a: string, i: number) => (
                                                        <li key={i} className="text-sm text-gray-700 flex items-start gap-3">
                                                            <span className="w-5 h-5 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
                                                            {a}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {m.decisions && m.decisions.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 bg-green-50/30 -mx-6 -mb-6 p-6 rounded-b-2xl">
                                                <p className="text-xs font-black text-green-600 mb-3 uppercase tracking-wider">القرارات المتخذة:</p>
                                                <ul className="space-y-2">
                                                    {m.decisions.map((d: string, i: number) => (
                                                        <li key={i} className="text-sm text-gray-800 flex items-start gap-2">
                                                            <span className="text-green-500 font-bold">●</span>
                                                            {d}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Inventory tab */}
                    {activeTab === 'inventory' && (
                        inventory.length === 0 ? <EmptyState title="المخزن فارغ" description="ابدأ بإضافة أصناف الجرد والكميات المتاحة." /> : (
                            <div>
                                {lowStock.length > 0 && (
                                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 animate-pulse">
                                        <div className="flex items-center gap-2 text-red-700 mb-3">
                                            <span className="text-lg">⚠️</span>
                                            <p className="text-sm font-black">أصناف وصلت للحد الأدنى ({lowStock.length})</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">{lowStock.map((i: InventoryItem) => <Badge key={i.id} variant="red" className="font-bold">{i.itemName}</Badge>)}</div>
                                    </div>
                                )}
                                <div className="table-container shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                                    <table className="w-full bg-white">
                                        <thead>
                                            <tr>{['الصنف', 'النوع', 'الوحدة', 'الكمية', 'الحد الأدنى', 'الموقع', 'الحالة'].map(h => <th key={h} className="table-header bg-gray-50/50">{h}</th>)}</tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {inventory.map((i: InventoryItem) => {
                                                const pct = i.minimumThreshold > 0 ? (i.currentQuantity / (i.initialQuantity || 1)) * 100 : 100;
                                                const isLow = i.currentQuantity <= i.minimumThreshold;
                                                return (
                                                    <tr key={i.id} className="table-row hover:bg-gray-50/50 transition-colors">
                                                        <td className="table-cell font-black text-gray-900">{i.itemName}</td>
                                                        <td className="table-cell text-xs font-bold text-gray-500">
                                                            {i.itemType === 'food' ? 'غذاء' : i.itemType === 'clothing' ? 'ملابس' : i.itemType === 'medical' ? 'طبي' : i.itemType === 'equipment' ? 'معدات' : 'أخرى'}
                                                        </td>
                                                        <td className="table-cell text-xs text-gray-400">{i.unit}</td>
                                                        <td className={`table-cell font-black text-lg ${isLow ? 'text-red-600' : 'text-primary-700'}`}>{i.currentQuantity}</td>
                                                        <td className="table-cell text-xs text-gray-400 font-mono">{i.minimumThreshold}</td>
                                                        <td className="table-cell text-xs text-gray-500 font-medium">{i.location || '—'}</td>
                                                        <td className="table-cell">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                    <div className={`h-full transition-all duration-1000 ${isLow ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                                                                </div>
                                                                <Badge variant={isLow ? 'red' : 'green'} className="font-black text-[10px]">{isLow ? 'ناقص' : 'كافٍ'}</Badge>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}
                </>
            )}

            <AdminEntryModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                type={activeTab === 'mail' ? 'mail' : activeTab === 'meetings' ? 'meeting' : 'inventory'}
                onSuccess={loadData}
            />
        </div>
    );
}
