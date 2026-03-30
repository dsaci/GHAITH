import { useState, useEffect } from 'react';
import { BarChart2, Target, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button, Modal, Input, Select, LoadingSpinner, EmptyState } from '../../components/ui';
import type { Occasion, OccasionType } from '../../types';



export default function PlanningPage() {
    const { user } = useAuth();
    const [plans, setPlans] = useState<Occasion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        occasionType: 'social' as OccasionType,
        description: '',
        startDate: '',
        targetBeneficiariesCount: 0,
        budgetPlanned: 0,
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    async function fetchPlans() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('occasions')
                .select('*')
                .eq('status', 'planned')
                .order('start_date', { ascending: true });
            if (error) throw error;
            setPlans(data || []);
        } catch (err) {
            console.error('Error fetching plans:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const { error } = await supabase.from('occasions').insert([{
                title: formData.title,
                occasion_type: formData.occasionType,
                description: formData.description || null,
                start_date: formData.startDate,
                target_beneficiaries_count: formData.targetBeneficiariesCount || 0,
                budget_planned: formData.budgetPlanned || 0,
                status: 'planned' as const,
                created_by: user?.id,
                branch_id: user?.branchId || null
            }]);
            if (error) throw error;
            setIsAddModalOpen(false);
            setFormData({ title: '', occasionType: 'social', description: '', startDate: '', targetBeneficiariesCount: 0, budgetPlanned: 0 });
            fetchPlans();
        } catch (err) {
            console.error('Error adding plan:', err);
            alert('حدث خطأ أثناء حفظ الخطة');
        } finally {
            setIsSubmitting(false);
        }
    }

    const fmt = (n: number) => (n || 0).toLocaleString('ar-DZ') + ' دج';

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">الخطط والمتابعة</h2>
                    <p className="text-sm text-gray-500 mt-1">إدارة الخطط السنوية والشهرية ومتابعة التنفيذ</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>خطة جديدة</Button>
            </div>

            {/* Add Plan Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="إضافة خطة نشاط جديدة">
                <form onSubmit={handleSubmit} className="p-6 space-y-4" dir="rtl">
                    <Input label="عنوان الخطة / النشاط" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="مثال: قفة رمضان 2026" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="نوع النشاط" value={formData.occasionType} onChange={e => setFormData({ ...formData, occasionType: e.target.value as OccasionType })}>
                            <option value="social">اجتماعي</option>
                            <option value="religious">ديني</option>
                            <option value="educational">تربوي</option>
                            <option value="humanitarian">إنساني</option>
                            <option value="national">وطني</option>
                        </Select>
                        <Input label="تاريخ التنفيذ المتوقع" type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="الميزانية التقديرية (دج)" type="number" value={formData.budgetPlanned} onChange={e => setFormData({ ...formData, budgetPlanned: Number(e.target.value) })} />
                        <Input label="العدد المستهدف للمستفيدين" type="number" value={formData.targetBeneficiariesCount} onChange={e => setFormData({ ...formData, targetBeneficiariesCount: Number(e.target.value) })} />
                    </div>
                    <textarea className="input-field w-full min-h-[100px]" placeholder="وصف الخطة وأهدافها..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>إلغاء</Button>
                        <Button type="submit" disabled={isSubmitting} icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}>
                            {isSubmitting ? 'جاري الحفظ...' : 'حفظ الخطة'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {loading ? (
                <LoadingSpinner />
            ) : plans.length === 0 ? (
                <EmptyState title="لا توجد خطط مستقبلية" description="ابدأ بجدولة الأنشطة القادمة للجمعية." />
            ) : (
                <div className="space-y-4">
                    {plans.map(plan => {
                        const progress = plan.status === 'completed' ? 100 : plan.status === 'in_progress' ? 50 : 0;
                        return (
                            <div key={plan.id} className="card hover:shadow-md transition-shadow group">
                                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                                            <BarChart2 className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-lg">{plan.title}</h4>
                                            <p className="text-sm text-gray-500 font-medium">{new Date(plan.startDate).toLocaleDateString('ar-DZ')}</p>
                                            <p className="text-sm font-black text-primary-700 mt-1">الميزانية: {fmt(plan.budgetPlanned || 0)}</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-700">مجدولة</span>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-gray-500 flex items-center gap-1"><Target className="w-4 h-4" />الهدف: {plan.targetBeneficiariesCount || 0} مستفيد</span>
                                        <span className="text-primary-600">قيد الإعداد</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-500 transition-all" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                                {plan.description && <p className="text-sm text-gray-600 line-clamp-2 italic">{plan.description}</p>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
