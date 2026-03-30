import { useState, useEffect } from 'react';
import { 
    Heart, Search, User, Calendar, 
    DollarSign, Clipboard, AlertCircle, 
    CheckCircle2, Loader2, X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { familiesService } from '../../services/families.service';
import { Modal, Button, Badge } from '../ui';

interface Family {
    id: string;
    familyName: string;
    registrationNumber: string;
    phone: string;
}

interface QuickBenefitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function QuickBenefitModal({ isOpen, onClose, onSuccess }: QuickBenefitModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [families, setFamilies] = useState<Family[]>([]);
    const [loadingFamilies, setLoadingFamilies] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
    
    const [benefitType, setBenefitType] = useState('financial_aid');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (searchTerm.length > 2) {
            const delayDebounceFn = setTimeout(() => {
                searchFamilies();
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else if (searchTerm.length === 0) {
            setFamilies([]);
        }
    }, [searchTerm]);

    async function searchFamilies() {
        try {
            setLoadingFamilies(true);
            const { data, error } = await supabase
                .from('families')
                .select('id, family_name, registration_number, phone')
                .or(`family_name.ilike.%${searchTerm}%,registration_number.ilike.%${searchTerm}%`)
                .eq('is_deleted', false)
                .limit(5);

            if (error) throw error;
            setFamilies((data || []).map((f: any) => ({
                id: f.id,
                familyName: f.family_name,
                registrationNumber: f.registration_number,
                phone: f.phone
            })));
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoadingFamilies(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFamily) return;

        try {
            setSubmitting(true);
            setError(null);
            
            await familiesService.addBenefitWithTransaction(selectedFamily.id, {
                family_id: selectedFamily.id,
                benefit_type: benefitType,
                amount: amount ? parseFloat(amount) : undefined,
                description: description || `استفادة: ${benefitType}`,
                benefit_date: date
            });

            setSuccess(true);
            if (onSuccess) onSuccess();
            setTimeout(() => {
                onClose();
                resetForm();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء حفظ البيانات');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setSearchTerm('');
        setSelectedFamily(null);
        setAmount('');
        setDescription('');
        setSuccess(false);
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="تسجيل استفادة عائلية سريعة" size="md">
            <div className="p-4 space-y-4" dir="rtl">
                {success ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">تم التسجيل بنجاح</h3>
                        <p className="text-gray-500 font-bold text-lg">مرحبا بعائلتنا الكريمة في فضاءكم غيث</p>
                        <p className="text-primary-600 font-bold mt-2 italic small">جاري الترحيل المالي وتحديث الأرشيف...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Family Search */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">ابحث عن العائلة</label>
                            {selectedFamily ? (
                                <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                            <User className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900">{selectedFamily.familyName}</p>
                                            <p className="text-xs text-gray-500 font-mono">{selectedFamily.registrationNumber}</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedFamily(null)}
                                        className="p-1 hover:bg-primary-100 rounded-full text-primary-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="بحث بالاسم أو رقم التسجيل..."
                                        className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 outline-none transition-all font-bold"
                                        autoFocus
                                    />
                                    {loadingFamilies && (
                                        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600 animate-spin" />
                                    )}
                                    
                                    {families.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-50">
                                            {families.map((f: Family) => (
                                                <button
                                                    key={f.id}
                                                    type="button"
                                                    onClick={() => setSelectedFamily(f)}
                                                    className="w-full p-3 text-right hover:bg-primary-50 transition-colors flex items-center justify-between group"
                                                >
                                                    <div>
                                                        <p className="font-bold text-gray-900 group-hover:text-primary-700">{f.familyName}</p>
                                                        <p className="text-xs text-gray-500 font-mono">{f.registrationNumber}</p>
                                                    </div>
                                                    <Badge variant="gray">اختر</Badge>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">نوع الاستفادة</label>
                                <select 
                                    value={benefitType}
                                    onChange={(e) => setBenefitType(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-100 font-bold"
                                >
                                    <option value="financial_aid">منحة مالية</option>
                                    <option value="food_basket">قفة غذائية</option>
                                    <option value="ramadan_basket">قفة رمضان</option>
                                    <option value="medical_aid">مساعدة طبية</option>
                                    <option value="clothing">ملابس / كسوة</option>
                                    <option value="eid_gift">أضحية / منحة عيد</option>
                                    <option value="school_supplies">أدوات مدرسية</option>
                                    <option value="other">أخرى</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">المبلغ (بـ دج)</label>
                                <div className="relative">
                                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pr-9 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 outline-none transition-all font-mono font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">التاريخ</label>
                                <div className="relative">
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full pr-9 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">وصف مختصر</label>
                                <div className="relative">
                                    <Clipboard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="مثال: منحة شهر أفريل"
                                        className="w-full pr-9 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm font-bold">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="pt-4 flex gap-3">
                            <Button 
                                type="submit" 
                                className="flex-1 py-4 text-lg" 
                                disabled={submitting || !selectedFamily}
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        جاري معالجة الطلب...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Heart className="w-6 h-6" />
                                        سجل الاستفادة والخصم
                                    </span>
                                )}
                            </Button>
                            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                                إلغاء
                            </Button>
                        </div>
                        
                        <p className="text-[10px] text-gray-400 text-center text-balance mt-2">
                            * سيتم إنشاء معاملة مالية تلقائية (Expense) وتحديث سجل التتبع الإداري فور التأكيد.
                        </p>
                    </form>
                )}
            </div>
        </Modal>
    );
}
