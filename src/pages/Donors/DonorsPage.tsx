import { useState } from 'react';
import { Plus, Search, Phone, Mail, Building } from 'lucide-react';
import { MOCK_DONORS } from '../../data/mockData';
import { Badge, Button } from '../../components/ui';
import { MSILA_DAIRAS, MSILA_MUNICIPALITIES } from '../../data/msilaData';

const TYPE_LABELS: Record<string, string> = { individual: 'فرد', company: 'شركة', institution: 'مؤسسة', anonymous: 'مجهول' };
const TYPE_COLORS: Record<string, 'blue' | 'green' | 'purple' | 'gray'> = { individual: 'blue', company: 'green', institution: 'purple', anonymous: 'gray' };

export default function DonorsPage() {
    const [search, setSearch] = useState('');
    const [municipalityFilter, setMunicipalityFilter] = useState('');

    const donors = MOCK_DONORS.filter(d => {
        const matchSearch = !search || d.fullName.includes(search) || (d.companyName?.includes(search));
        const matchMunicipality = !municipalityFilter || d.municipalityName === municipalityFilter;
        return matchSearch && matchMunicipality;
    });
    const totalDonated = MOCK_DONORS.reduce((s, d) => s + d.totalDonated, 0);

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">سجل المحسنين</h2>
                    <p className="text-sm text-gray-500 mt-1">إجمالي التبرعات: {totalDonated.toLocaleString('ar-DZ')} دج</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />}>إضافة محسن</Button>
            </div>

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
