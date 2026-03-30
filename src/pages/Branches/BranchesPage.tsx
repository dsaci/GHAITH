import { useState, useEffect } from 'react';
import { Plus, Users, MapPin, Search, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Badge, Button, Modal, Input, Select } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import type { Municipality } from '../../types';

interface Branch {
    id: string;
    branch_name: string;
    is_active: boolean;
    established_date: string;
    municipality_name?: string;
    families_count?: number;
    supervisor_name?: string;
}

export default function BranchesPage() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [dairas, setDairas] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        branchName: '',
        municipalityId: '',
        establishedDate: new Date().toISOString().split('T')[0],
        isActive: true
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([
            fetchMunicipalities(),
            fetchBranches()
        ]);
        setLoading(false);
    };

    const fetchMunicipalities = async () => {
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
    };

    const fetchBranches = async () => {
        try {
            // Fetch branches with their municipality names using join
            const { data, error } = await supabase
                .from('branches')
                .select('*, municipalities(name)')
                .order('is_active', { ascending: false });

            if (error) throw error;

            // Fetch family counts per branch
            const { data: familyCounts } = await supabase
                .from('families')
                .select('branch_id')
                .eq('is_deleted', false);

            const counts = (familyCounts || []).reduce((acc: any, f: any) => {
                acc[f.branch_id] = (acc[f.branch_id] || 0) + 1;
                return acc;
            }, {});

            const formattedBranches = (data || []).map((b: any) => ({
                id: b.id,
                branch_name: b.branch_name,
                is_active: b.is_active,
                established_date: b.established_date,
                municipality_name: b.municipalities?.name || 'غير محدد',
                families_count: counts[b.id] || 0,
                // Supervisor names are still hardcoded as they aren't fully linked in schema yet
                supervisor_name: b.branch_name.includes('عين الحجل') ? 'أنس حلّاب' : 
                                b.branch_name.includes('بن سرور') ? 'هديل' : 
                                b.branch_name.includes('المسيلة') ? 'عبدالنور ساسي' : 'مدير الفرع'
            }));

            setBranches(formattedBranches);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const { error } = await supabase.from('branches').insert([{
                branch_name: formData.branchName,
                municipality_id: formData.municipalityId,
                established_date: formData.establishedDate,
                is_active: formData.isActive,
                created_by: user?.id
            }]);
            if (error) throw error;
            setIsAddModalOpen(false);
            setFormData({ branchName: '', municipalityId: '', establishedDate: new Date().toISOString().split('T')[0], isActive: true });
            fetchBranches();
        } catch (err) {
            console.error('Error adding branch:', err);
            alert('حدث خطأ أثناء إضافة الفرع');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredBranches = branches.filter(b =>
        !search || 
        b.branch_name.includes(search) || 
        (b.municipality_name && b.municipality_name.includes(search)) ||
        (b.supervisor_name && b.supervisor_name.includes(search))
    );

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">الفروع البلدية</h2>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>إضافة فرع جديد</Button>
            </div>

            {/* Add Branch Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="إضافة فرع بلدي جديد">
                <form onSubmit={handleSubmit} className="p-6 space-y-4" dir="rtl">
                    <Input label="اسم الفرع" required value={formData.branchName} onChange={e => setFormData({ ...formData, branchName: e.target.value })} placeholder="مثال: فرع عين الحجل" />
                    <Select label="البلدية المرتبطة" required value={formData.municipalityId} onChange={e => setFormData({ ...formData, municipalityId: e.target.value })}>
                        <option value="">اختر البلدية</option>
                        {dairas.map(dairaName => (
                            <optgroup key={dairaName} label={dairaName}>
                                {municipalities.filter(m => m.daira === dairaName).map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </Select>
                    <Input label="تاريخ التأسيس" type="date" value={formData.establishedDate} onChange={e => setFormData({ ...formData, establishedDate: e.target.value })} />
                    <div className="flex items-center gap-2 py-2">
                        <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
                        <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">تفعيل الفرع فوراً</label>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>إلغاء</Button>
                        <Button type="submit" disabled={isSubmitting} icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}>
                            {isSubmitting ? 'جاري الحفظ...' : 'حفظ الفرع'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <div className="card p-4">
                <div className="relative">
                    <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="بحث باسم البلدية أو اسم المشرف..." className="input-field pr-10 w-full" />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-12 gap-3">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                    <p className="text-gray-500 font-medium">جاري تحميل بيانات الفروع...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBranches.map(b => (
                        <div key={b.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-ghaith-navy/10 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-ghaith-navy" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 leading-tight">{b.branch_name}</h4>
                                        <p className="text-[10px] text-gray-400 mt-1 font-bold">بلدية {b.municipality_name}</p>
                                    </div>
                                </div>
                                <Badge variant={b.is_active ? 'green' : 'gray'}>{b.is_active ? 'نشط' : 'معطل'}</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 relative">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1 font-bold">المشرف/القائد</p>
                                    <p className="text-sm font-black text-gray-800">{b.supervisor_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1 font-bold">
                                        <Users className="w-3.5 h-3.5" /> الأسر المكفولة
                                    </p>
                                    <p className="text-sm font-black text-primary-700">{b.families_count} عائلة</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-50">
                                <span className="text-[10px] text-gray-400 font-bold">تاريخ التأسيس: {b.established_date || 'غير محدد'}</span>
                                <Button variant="secondary" className="px-4 py-1 text-[10px] font-black h-7">الإدارة</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
