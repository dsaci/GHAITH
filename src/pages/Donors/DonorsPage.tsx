import { useState, useEffect } from 'react';
import { Heart, Plus, Search, Phone, Mail, Building, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Badge, Button, Modal, Input, Select as UISelect } from '../../components/ui';
import { MSILA_DAIRAS, MSILA_MUNICIPALITIES } from '../../data/msilaData';
import { toast } from 'react-hot-toast';
import type { Donor, DonorType, Municipality } from '../../types';

const TYPE_LABELS: Record<string, string> = { individual: 'فرد', company: 'شركة', institution: 'مؤسسة', anonymous: 'مجهول' };
const TYPE_COLORS: Record<string, 'blue' | 'green' | 'purple' | 'gray'> = { individual: 'blue', company: 'green', institution: 'purple', anonymous: 'gray' };

export default function DonorsPage() {
    const [allDonors, setAllDonors] = useState<Donor[]>([]);
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [dairas, setDairas] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [municipalityFilter, setMunicipalityFilter] = useState('');
    
    // Add Donor Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        companyName: '',
        phone: '',
        email: '',
        donorType: 'individual' as DonorType,
        municipalityId: '',
        isAnonymous: false,
    });

    useEffect(() => {
        fetchDonors();
        fetchMunicipalities();
    }, []);

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

    async function fetchDonors() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('donors')
                .select('*, municipalities(name)')
                .eq('is_deleted', false)
                .order('total_donated', { ascending: false });

            if (error) throw error;

            const mapped: Donor[] = (data || []).map((d: any) => ({
                id: d.id,
                donorType: d.donor_type as DonorType,
                fullName: d.full_name,
                phone: d.phone,
                email: d.email,
                address: d.address,
                municipalityName: d.municipalities?.name || 'غير محدد',
                companyName: d.company_name,
                isAnonymous: d.is_anonymous,
                totalDonated: d.total_donated,
                lastDonationDate: d.last_donation_date,
                createdAt: d.created_at,
            } as Donor));

            setAllDonors(mapped);
        } catch (err) {
            console.error('Error fetching donors:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const { error } = await supabase.from('donors').insert([{
                full_name: formData.fullName,
                company_name: formData.companyName || null,
                phone: formData.phone || null,
                email: formData.email || null,
                donor_type: formData.donorType,
                municipality_id: formData.municipalityId || null,
                is_anonymous: formData.isAnonymous,
                total_donated: 0
            }]);

            if (error) throw error;

            toast.success('تم إضافة المحسن بنجاح');
            setIsAddModalOpen(false);
            setFormData({ fullName: '', companyName: '', phone: '', email: '', donorType: 'individual', municipalityId: '', isAnonymous: false });
            fetchDonors();
        } catch (err: any) {
            console.error('Error adding donor:', err);
            toast.error(err.message || 'حدث خطأ أثناء إضافة المحسن');
        } finally {
            setIsSubmitting(false);
        }
    }

    const donors = allDonors.filter(d => {
        const matchSearch = !search || d.fullName.includes(search) || (d.companyName?.includes(search));
        const matchMunicipality = !municipalityFilter || d.municipalityName === municipalityFilter;
        return matchSearch && matchMunicipality;
    });

    const totalDonated = allDonors.reduce((s, d) => s + (d.totalDonated || 0), 0);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                <p className="text-gray-500 font-medium">جاري تحميل البيانات...</p>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">سجل المحسنين</h2>
                    <p className="text-sm text-gray-500 mt-1">إجمالي التبرعات: {totalDonated.toLocaleString('ar-DZ')} دج</p>
                </div>
                <Button icon={<Heart className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>إضافة محسن</Button>
            </div>

            {/* Add Donor Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="إضافة محسن جديد">
                <form onSubmit={handleSubmit} className="p-6 space-y-4" dir="rtl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="الاسم الكامل" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                        <UISelect label="نوع المحسن" value={formData.donorType} onChange={e => setFormData({ ...formData, donorType: e.target.value as DonorType })}>
                            <option value="individual">فرد</option>
                            <option value="company">شركة</option>
                            <option value="institution">مؤسسة</option>
                            <option value="anonymous">مجهول</option>
                        </UISelect>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="اسم الشركة (إن وجد)" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                        <Input label="رقم الهاتف" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="البريد الإلكتروني" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        <UISelect label="البلدية" value={formData.municipalityId} onChange={e => setFormData({ ...formData, municipalityId: e.target.value })}>
                            <option value="">اختر البلدية</option>
                            {dairas.sort().map(dairaName => (
                                <optgroup key={dairaName} label={dairaName}>
                                    {municipalities.filter(m => m.daira === dairaName).map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </UISelect>
                    </div>

                    <div className="flex items-center gap-2 py-2">
                        <input type="checkbox" id="isAnon" checked={formData.isAnonymous} onChange={e => setFormData({ ...formData, isAnonymous: e.target.checked })} className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
                        <label htmlFor="isAnon" className="text-sm font-medium text-gray-700 underline decoration-dotted cursor-pointer">محسن مجهول الهوية (لن يظهر اسمه في السجلات العامة)</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>إلغاء</Button>
                        <Button type="submit" disabled={isSubmitting} icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}>
                            {isSubmitting ? 'جاري الحفظ...' : 'حفظ المحسن'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <div className="card p-4 space-y-4">
                <div className="relative">
                    <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="بحث باسم المحسن أو الشركة..." className="input-field pr-10 w-full" />
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">تصفية حسب البلدية:</span>
                    <select value={municipalityFilter} onChange={e => setMunicipalityFilter(e.target.value)} className="select-field w-auto min-w-[200px]">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donors.map(d => (
                    <div key={d.id} className="card hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${d.isAnonymous ? 'bg-gray-100 text-gray-500' : 'bg-primary-100 text-primary-700'}`}>
                                {d.isAnonymous ? '?' : d.fullName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900">{d.isAnonymous ? 'محسن مجهول الهوية' : d.fullName}</h4>
                                {d.companyName && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Building className="w-3 h-3" />{d.companyName}</p>}
                                {d.phone && !d.isAnonymous && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{d.phone}</p>}
                                {d.email && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" />{d.email}</p>}
                                <div className="mt-2">
                                    <Badge variant={TYPE_COLORS[d.donorType]}>{TYPE_LABELS[d.donorType]}</Badge>
                                </div>
                            </div>
                            <div className="text-left shrink-0">
                                <p className="text-xl font-black text-primary-700">{d.totalDonated.toLocaleString('ar-DZ')}</p>
                                <p className="text-xs text-gray-400">دج</p>
                                {d.lastDonationDate && <p className="text-xs text-gray-400 mt-1">آخر تبرع: {d.lastDonationDate}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
