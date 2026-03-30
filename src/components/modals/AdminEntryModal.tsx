import React, { useState } from 'react';
import { X, Mail, Calendar, Package2, Loader2, Save } from 'lucide-react';
import { Modal, Button, Badge } from '../ui';
import { administrationService } from '../../services/administration.service';
import { toast } from 'react-hot-toast';

const titles = { mail: 'تسجيل بريد جديد', meeting: 'جدولة اجتماع جديد', inventory: 'إضافة صنف جرد' };

interface AdminEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'mail' | 'meeting' | 'inventory';
    onSuccess: () => void;
}

export default function AdminEntryModal({ isOpen, onClose, type, onSuccess }: AdminEntryModalProps) {
    const [loading, setLoading] = useState(false);
    
    // Mail Form State
    const [mailData, setMailData] = useState({
        mailNumber: '',
        mailDirection: 'incoming' as 'incoming' | 'outgoing',
        subject: '',
        senderOrRecipient: '',
        mailDate: new Date().toISOString().split('T')[0],
        actionStatus: 'pending' as 'pending' | 'completed' | 'in_progress' | 'no_action',
        actionRequired: '',
        actionDeadline: ''
    });

    // Meeting Form State
    const [meetingData, setMeetingData] = useState({
        title: '',
        meetingType: 'board' as 'board' | 'general' | 'emergency',
        meetingDate: new Date().toISOString().split('T')[0],
        location: 'مقر الجمعية',
        agenda: [] as string[],
        attendees: [] as string[],
        decisions: [] as string[],
        status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'postponed'
    });

    // Inventory Form State
    const [inventoryData, setInventoryData] = useState({
        itemName: '',
        itemType: 'other' as 'food' | 'clothing' | 'medical' | 'equipment' | 'other',
        unit: 'وحدة',
        initialQuantity: 0,
        currentQuantity: 0,
        minimumThreshold: 5,
        location: 'المخزن الرئيسي',
        notes: ''
    });

    const [agendaInput, setAgendaInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (type === 'mail') {
                // Mapping camelCase to snake_case for Supabase
                await (administrationService as any).createMail({
                    mail_number: mailData.mailNumber,
                    mail_direction: mailData.mailDirection,
                    subject: mailData.subject,
                    sender_or_recipient: mailData.senderOrRecipient,
                    mail_date: mailData.mailDate,
                    action_status: mailData.actionStatus,
                    action_required: mailData.actionRequired,
                    action_deadline: mailData.actionDeadline || null
                });
                toast.success('تم تسجيل البريد بنجاح');
            } else if (type === 'meeting') {
                await (administrationService as any).createMeeting({
                    title: meetingData.title,
                    meeting_type: meetingData.meetingType,
                    meeting_date: meetingData.meetingDate,
                    location: meetingData.location,
                    agenda: meetingData.agenda,
                    attendees: meetingData.attendees,
                    decisions: meetingData.decisions,
                    status: meetingData.status
                });
                toast.success('تمت جدولة الاجتماع بنجاح');
            } else if (type === 'inventory') {
                await (administrationService as any).createInventoryItem({
                    item_name: inventoryData.itemName,
                    item_type: inventoryData.itemType,
                    unit: inventoryData.unit,
                    initial_quantity: inventoryData.initialQuantity,
                    current_quantity: inventoryData.currentQuantity,
                    minimum_threshold: inventoryData.minimumThreshold,
                    location: inventoryData.location,
                    notes: inventoryData.notes
                });
                toast.success('تم إضافة صنف الجرد بنجاح');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error('حدث خطأ أثناء الإضافة: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const addAgendaItem = () => {
        if (!agendaInput.trim()) return;
        setMeetingData({ ...meetingData, agenda: [...meetingData.agenda, agendaInput.trim()] });
        setAgendaInput('');
    };

    const renderHeader = () => {
        const icons = { mail: Mail, meeting: Calendar, inventory: Package2 };
        const Icon = icons[type];
        
        return (
            <div className="flex items-center gap-3 mb-6 p-4 bg-primary-50 rounded-2xl border border-primary-100">
                <div className="p-2 bg-primary-600 text-white rounded-xl shadow-lg">
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-primary-900">{(titles as any)[type]}</h3>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" title={(titles as any)[type]}>
            <div dir="rtl" className="font-cairo">
                {renderHeader()}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {type === 'mail' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">رقم البريد</label>
                                <input 
                                    required 
                                    className="w-full rounded-xl border-gray-200 focus:ring-primary-500 pr-4" 
                                    placeholder="مثلاً: IN-2024-001"
                                    value={mailData.mailNumber}
                                    onChange={e => setMailData({...mailData, mailNumber: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">الاتجاه</label>
                                <select 
                                    className="w-full rounded-xl border-gray-200"
                                    value={mailData.mailDirection}
                                    onChange={e => setMailData({...mailData, mailDirection: e.target.value as any})}
                                >
                                    <option value="incoming">وارد (قادم)</option>
                                    <option value="outgoing">صادر (مرسل)</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-sm font-bold text-gray-700">موضوع البريد</label>
                                <input 
                                    required 
                                    className="w-full rounded-xl border-gray-200"
                                    value={mailData.subject}
                                    onChange={e => setMailData({...mailData, subject: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">المرسل/المستقبل</label>
                                <input 
                                    required 
                                    className="w-full rounded-xl border-gray-200"
                                    value={mailData.senderOrRecipient}
                                    onChange={e => setMailData({...mailData, senderOrRecipient: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">تاريخ البريد</label>
                                <input 
                                    type="date"
                                    required 
                                    className="w-full rounded-xl border-gray-200"
                                    value={mailData.mailDate}
                                    onChange={e => setMailData({...mailData, mailDate: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    {type === 'meeting' && (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">عنوان الاجتماع</label>
                                <input 
                                    required 
                                    className="w-full rounded-xl border-gray-200"
                                    value={meetingData.title}
                                    onChange={e => setMeetingData({...meetingData, title: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">نوع الاجتماع</label>
                                    <select 
                                        className="w-full rounded-xl border-gray-200"
                                        value={meetingData.meetingType}
                                        onChange={e => setMeetingData({...meetingData, meetingType: e.target.value as any})}
                                    >
                                        <option value="board">مكتب تنفيذي</option>
                                        <option value="general">جمعية عامة</option>
                                        <option value="emergency">طارئ</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">التاريخ</label>
                                    <input 
                                        type="date"
                                        required 
                                        className="w-full rounded-xl border-gray-200"
                                        value={meetingData.meetingDate}
                                        onChange={e => setMeetingData({...meetingData, meetingDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">جدول الأعمال (أضف نقطة)</label>
                                <div className="flex gap-2">
                                    <input 
                                        className="flex-1 rounded-xl border-gray-200"
                                        value={agendaInput}
                                        onChange={e => setAgendaInput(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addAgendaItem())}
                                    />
                                    <Button type="button" onClick={addAgendaItem}>أضف</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {meetingData.agenda.map((a, i) => (
                                        <Badge key={i} variant="blue" className="py-1 px-3">
                                            {a}
                                            <X className="w-3 h-3 mr-2 cursor-pointer" onClick={() => setMeetingData({...meetingData, agenda: meetingData.agenda.filter((_, idx) => idx !== i)})} />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {type === 'inventory' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-sm font-bold text-gray-700">اسم الصنف</label>
                                <input 
                                    required 
                                    className="w-full rounded-xl border-gray-200"
                                    value={inventoryData.itemName}
                                    onChange={e => setInventoryData({...inventoryData, itemName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">الكمية الحالية</label>
                                <input 
                                    type="number"
                                    required 
                                    className="w-full rounded-xl border-gray-200"
                                    value={inventoryData.currentQuantity}
                                    onChange={e => setInventoryData({...inventoryData, currentQuantity: Number(e.target.value), initialQuantity: Number(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">حد التنبيه (الأدنى)</label>
                                <input 
                                    type="number"
                                    required 
                                    className="w-full rounded-xl border-gray-200"
                                    value={inventoryData.minimumThreshold}
                                    onChange={e => setInventoryData({...inventoryData, minimumThreshold: Number(e.target.value)})}
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
                        <Button variant="secondary" onClick={onClose} type="button">إلغاء</Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        >
                            {loading ? 'جاري الحفظ...' : 'حفظ البيانات'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
