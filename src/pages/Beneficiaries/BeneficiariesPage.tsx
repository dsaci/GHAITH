import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Eye, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Badge, Button, EmptyState } from '../../components/ui';
import { MSILA_DAIRAS, MSILA_MUNICIPALITIES } from '../../data/msilaData';
import type { BeneficiaryCategory, FamilyStatus, Family } from '../../types';
import BeneficiaryDetail from './BeneficiaryDetail';
import BeneficiaryForm from './BeneficiaryForm';

const CATEGORY_LABELS: Record<BeneficiaryCategory, string> = {
    widow: 'أرامل', disabled: 'ذوو إعاقة', chronic_illness: 'أمراض مزمنة',
    orphan: 'أيتام', poor_family: 'أسر معوزة', other: 'أخرى',
    divorced: 'مطلقات' as any,
};

const CATEGORY_COLORS: Record<string, 'purple' | 'blue' | 'red' | 'yellow' | 'green' | 'gray'> = {
    widow: 'purple', disabled: 'blue', chronic_illness: 'red',
    orphan: 'yellow', poor_family: 'green', other: 'gray',
    divorced: 'purple',
};

const STATUS_LABELS: Record<FamilyStatus, string> = { active: 'فعّال', inactive: 'غير فعّال', suspended: 'موقوف' };
const STATUS_COLORS: Record<FamilyStatus, 'green' | 'gray' | 'red'> = { active: 'green', inactive: 'gray', suspended: 'red' };

export default function BeneficiariesPage() {
    const [allFamilies, setAllFamilies] = useState<Family[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [municipalityFilter, setMunicipalityFilter] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchFamilies();
    }, []);

    async function fetchFamilies() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('families')
                .select('*, municipalities(name)')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped: Family[] = (data || []).map((f: any) => ({
                id: f.id,
                registrationNumber: f.registration_number,
                familyName: f.family_name,
                phone: f.phone,
                address: f.address,
                municipalityId: f.municipality_id,
                municipalityName: f.municipalities?.name || 'غير محدد',
                category: f.category as BeneficiaryCategory,
                membersCount: f.members_count,
                status: f.status as FamilyStatus,
                registrationDate: f.registration_date,
                is_deleted: f.is_deleted,
                createdAt: f.created_at,
                updatedAt: f.updated_at,
            }));

            setAllFamilies(mapped);
        } catch (err) {
            console.error('Error fetching families:', err);
        } finally {
            setLoading(false);
        }
    }

    const families = allFamilies.filter(f => {
        const matchSearch = !search || f.familyName.includes(search) || f.registrationNumber.includes(search) || f.phone.includes(search);
        const matchCat = !categoryFilter || f.category === categoryFilter;
        const matchStatus = !statusFilter || f.status === statusFilter;
        const matchMunicipality = !municipalityFilter || f.municipalityName === municipalityFilter;
        return matchSearch && matchCat && matchStatus && matchMunicipality;
    });

    const selectedFamily = selectedId ? allFamilies.find(f => f.id === selectedId) : null;

    if (selectedFamily) {
        return <BeneficiaryDetail family={selectedFamily} onBack={() => setSelectedId(null)} />;
    }

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
                    <h2 className="page-title">سجل العائلات والمستفيدين</h2>
                    <p className="text-sm text-gray-500 mt-1">إجمالي: {families.length} عائلة مسجلة</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={<Download className="w-4 h-4" />}>تصدير</Button>
                    <Button onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4" />}>إضافة عائلة</Button>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                    <input
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="بحث بالاسم أو رقم التسجيل أو الهاتف..."
                        className="input-field pr-10 w-full"
                    />
                </div>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="select-field w-auto">
                    <option value="">جميع الفئات</option>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select-field w-auto">
                    <option value="">جميع الحالات</option>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>

                <select value={municipalityFilter} onChange={e => setMunicipalityFilter(e.target.value)} className="select-field w-auto min-w-[140px]">
                    <option value="">جميع البلديات</option>
                    {MSILA_DAIRAS.map(dairaName => (
                        <optgroup key={dairaName} label={dairaName}>
                            {MSILA_MUNICIPALITIES.filter(m => m.daira === dairaName).map(m => (
                                <option key={m.id} value={m.name}>{m.name}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>

                <button onClick={() => { setSearch(''); setCategoryFilter(''); setStatusFilter(''); setMunicipalityFilter(''); }}
                    className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
                    <Filter className="w-4 h-4" /> مسح
                </button>
            </div>

            {/* Table */}
            {families.length === 0 ? (
                <EmptyState title="لا توجد نتائج" description="حاول تغيير معايير البحث" />
            ) : (
                <div className="table-container">
                    <table className="w-full bg-white">
                        <thead>
                            <tr>
                                {['رقم التسجيل', 'اسم العائلة', 'الفئة', 'عدد الأفراد', 'البلدية', 'الحالة', 'الإجراءات'].map(h => (
                                    <th key={h} className="table-header">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {families.map(f => (
                                <tr key={f.id} className="table-row">
                                    <td className="table-cell font-mono text-xs text-gray-500">{f.registrationNumber}</td>
                                    <td className="table-cell font-medium text-gray-900">{f.familyName}</td>
                                    <td className="table-cell"><Badge variant={CATEGORY_COLORS[f.category]}>{CATEGORY_LABELS[f.category]}</Badge></td>
                                    <td className="table-cell text-center">{f.membersCount} أفراد</td>
                                    <td className="table-cell">{f.municipalityName}</td>
                                    <td className="table-cell"><Badge variant={STATUS_COLORS[f.status]}>{STATUS_LABELS[f.status]}</Badge></td>
                                    <td className="table-cell">
                                        <button onClick={() => setSelectedId(f.id)}
                                            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-medium">
                                            <Eye className="w-4 h-4" /> تفاصيل
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && <BeneficiaryForm onClose={() => setShowForm(false)} />}
        </div>
    );
}
