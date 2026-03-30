import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Modal, Input, Select, Button } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import type { Family, Municipality } from '../../types';

export default function BeneficiaryForm({ onClose, family, onSuccess }: { onClose: () => void; family?: Family; onSuccess?: () => void }) {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [dairas, setDairas] = useState<string[]>([]);
    const [form, setForm] = useState({
        familyName: '', phone: '', address: '', municipalityId: '',
        category: '', membersCount: '1', incomeLevel: '', housingStatus: '',
    });

    useEffect(() => {
        fetchMunicipalities();
        if (family) {
            setForm({
                familyName: family.familyName,
                phone: family.phone,
                address: family.address,
                municipalityId: family.municipalityId || '',
                category: family.category,
                membersCount: String(family.membersCount),
                incomeLevel: family.incomeLevel || '',
                housingStatus: family.housingStatus || '',
            });
        }
    }, [family]);

    async function fetchMunicipalities() {
        try {
            const { data, error } = await supabase
                .from('municipalities')
                .select('*')
                .order('name');
            if (error) throw error;
            if (data) {
                setMunicipalities(data);
                const uniqueDairas = Array.from(new Set(data.map((m: Municipality) => m.daira).filter(Boolean)));
                setDairas(uniqueDairas as string[]);
            }
        } catch (err) {
            console.error('Error fetching municipalities:', err);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const payload = {
                family_name: form.familyName,
                phone: form.phone,
                address: form.address,
                municipality_id: form.municipalityId || null,
                category: form.category,
                members_count: parseInt(form.membersCount) || 1,
                income_level: form.incomeLevel || null,
                housing_status: form.housingStatus || null,
                updated_at: new Date().toISOString()
            };

            if (family?.id) {
                const { error } = await supabase.from('families').update(payload).eq('id', family.id);
                if (error) throw error;
                toast.success('تم تحديث بيانات العائلة بنجاح');
            } else {
                const { error } = await supabase.from('families').insert([{
                    ...payload,
                    registration_number: `F-${Date.now().toString().slice(-6)}`,
                    created_at: new Date().toISOString(),
                    created_by: user?.id
                }]);
                if (error) throw error;
                toast.success('تم إضافة العائلة بنجاح');
            }
            
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error saving family:', error);
            toast.error(`حدث خطأ: ${error.message || 'فشل الحفظ'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen title="إضافة عائلة جديدة" onClose={onClose} size="lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="اسم رب الأسرة / المستفيد" required value={form.familyName} onChange={e => setForm(f => ({ ...f, familyName: e.target.value }))} placeholder="مثال: زوجة المرحوم عمر بوزيد" />
                    <Input label="رقم الهاتف" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0551234567" />
                    <Input label="العنوان الكامل" required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="حي السلام، المسيلة" />
                    <Select label="البلدية" required value={form.municipalityId} onChange={e => setForm(f => ({ ...f, municipalityId: e.target.value }))}>
                        <option value="">اختر البلدية</option>
                        {dairas.sort().map(daira => (
                            <optgroup key={daira} label={`دائرة ${daira}`}>
                                {municipalities.filter(m => m.daira === daira).map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
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
                    <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}><X className="w-4 h-4" /> إلغاء</Button>
                    <Button type="submit" disabled={isSubmitting} icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}>
                        {isSubmitting ? 'جاري الحفظ...' : family?.id ? 'تحديث البيانات' : 'حفظ العائلة'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
