import { useState } from 'react';
import { X } from 'lucide-react';
import { Modal, Input, Select, Button } from '../../components/ui';
import { MSILA_MUNICIPALITIES, MSILA_DAIRAS } from '../../data/msilaData';

export default function BeneficiaryForm({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({
        familyName: '', phone: '', address: '', municipality: '',
        category: '', membersCount: '1', incomeLevel: '', housingStatus: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('تم حفظ العائلة بنجاح! (محاكاة)');
        onClose();
    };

    return (
        <Modal isOpen title="إضافة عائلة جديدة" onClose={onClose} size="lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="اسم رب الأسرة / المستفيد" required value={form.familyName} onChange={e => setForm(f => ({ ...f, familyName: e.target.value }))} placeholder="مثال: زوجة المرحوم عمر بوزيد" />
                    <Input label="رقم الهاتف" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0551234567" />
                    <Input label="العنوان الكامل" required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="حي السلام، المسيلة" />
                    <Select label="البلدية" required value={form.municipality} onChange={e => setForm(f => ({ ...f, municipality: e.target.value }))}>
                        <option value="">اختر البلدية</option>
                        {MSILA_DAIRAS.map(daira => (
                            <optgroup key={daira} label={`دائرة ${daira}`}>
                                {MSILA_MUNICIPALITIES.filter(m => m.daira === daira).map(m => (
                                    <option key={m.id} value={m.name}>{m.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </Select>
                    <Select label="الفئة" required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                        <option value="">اختر الفئة</option>
                        <option value="widow">أرامل</option><option value="disabled">ذوو إعاقة</option>
                        <option value="chronic_illness">أمراض مزمنة</option><option value="orphan">أيتام</option>
                        <option value="poor_family">أسر معوزة</option><option value="other">أخرى</option>
                    </Select>
                    <Input label="عدد أفراد الأسرة" type="number" min="1" value={form.membersCount} onChange={e => setForm(f => ({ ...f, membersCount: e.target.value }))} />
                    <Select label="مستوى الدخل" value={form.incomeLevel} onChange={e => setForm(f => ({ ...f, incomeLevel: e.target.value }))}>
                        <option value="">اختر المستوى</option>
                        <option value="none">لا يوجد</option><option value="very_low">منخفض جداً</option>
                        <option value="low">منخفض</option><option value="medium">متوسط</option>
                    </Select>
                    <Select label="وضع السكن" value={form.housingStatus} onChange={e => setForm(f => ({ ...f, housingStatus: e.target.value }))}>
                        <option value="">اختر الوضع</option>
                        <option value="owned">مملوك</option><option value="rented">مستأجر</option>
                        <option value="family">عائلي</option><option value="other">آخر</option>
                    </Select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button variant="secondary" type="button" onClick={onClose}><X className="w-4 h-4" /> إلغاء</Button>
                    <Button type="submit">حفظ العائلة</Button>
                </div>
            </form>
        </Modal>
    );
}
