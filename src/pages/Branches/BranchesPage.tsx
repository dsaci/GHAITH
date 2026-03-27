import { useState } from 'react';
import { Plus, Users, MapPin, Search } from 'lucide-react';
import { MOCK_BRANCHES } from '../../data/mockData';
import { Badge, Button } from '../../components/ui';

export default function BranchesPage() {
    const [search, setSearch] = useState('');

    const branches = MOCK_BRANCHES.filter(b =>
        !search || b.municipality.includes(search) || (b.supervisorName && b.supervisorName.includes(search))
    );

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">الفروع البلدية</h2>
                    <p className="text-sm text-gray-500 mt-1">{MOCK_BRANCHES.length} فرع بلدي معتمد</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />}>إضافة فرع جديد</Button>
            </div>

            <div className="card p-4">
                <div className="relative">
                    <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="بحث باسم البلدية أو اسم المشرف..." className="input-field pr-10 w-full" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branches.map(b => (
                    <div key={b.id} className="card hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">فرع {b.municipality}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">تأسس في {b.establishmentDate}</p>
                                </div>
                            </div>
                            <Badge variant={b.isActive ? 'green' : 'gray'}>{b.isActive ? 'نشط' : 'غير نشط'}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 relative">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">المشرف</p>
                                <p className="text-sm font-medium text-gray-900">{b.supervisorName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> الأسر المكفولة</p>
                                <p className="text-sm font-bold text-primary-700">{b.familiesCount} عائلة</p>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button variant="secondary" className="flex-1 py-1.5 text-xs">عرض التفاصيل</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
