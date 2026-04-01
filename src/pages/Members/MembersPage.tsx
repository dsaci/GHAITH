import { useState, useEffect } from 'react';
import { Plus, Search, Phone, CreditCard, Loader2, User, MapPin } from 'lucide-react';
import { Badge, Button, EmptyState } from '../../components/ui';
import { MSILA_DAIRAS, MSILA_MUNICIPALITIES } from '../../data/msilaData';
import type { MemberStatus, Member, MembershipType } from '../../types';
import * as membersService from '../../services/members.service';

const STATUS_LABELS: Record<MemberStatus, string> = { active: 'فعّال', inactive: 'غير فعّال', suspended: 'موقوف', resigned: 'استقال' };
const STATUS_COLORS: Record<MemberStatus, 'green' | 'gray' | 'red' | 'orange'> = { active: 'green', inactive: 'gray', suspended: 'red', resigned: 'orange' };
const TYPE_LABELS: Record<string, string> = { founder: 'مؤسس', active: 'فعّال', supporter: 'داعم', honorary: 'شرفي' };

export default function MembersPage() {
    const [allMembers, setAllMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [municipalityFilter, setMunicipalityFilter] = useState('');

    useEffect(() => {
        fetchMembers();
    }, []);

    async function fetchMembers() {
        try {
            setLoading(true);
            const { data, error } = await membersService.getAll();
            
            if (error) throw error;

            const mapped: Member[] = (data || []).map((m: any) => ({
                id: m.id,
                fullName: m.full_name,
                phone: m.phone,
                email: m.email,
                address: m.address,
                municipalityName: m.municipality_name || 'غير محدد',
                occupation: m.occupation,
                membershipNumber: m.membership_number,
                membershipDate: m.membership_date,
                membershipType: m.membership_type as MembershipType,
                status: m.status as MemberStatus,
                annualFeePaid: m.annual_fee_paid,
                createdAt: m.created_at,
            }));

            setAllMembers(mapped);
        } catch (err) {
            console.error('Error fetching members:', err);
        } finally {
            setLoading(false);
        }
    }

    const members = allMembers.filter(m => {
        const matchSearch = !search || 
            (m.fullName || '').includes(search) || 
            (m.membershipNumber || '').includes(search) || 
            (m.occupation || '').includes(search);
        const matchStatus = !statusFilter || m.status === statusFilter;
        const matchMunicipality = !municipalityFilter || m.municipalityName === municipalityFilter;
        return matchSearch && matchStatus && matchMunicipality;
    });

    const activeCount = allMembers.filter(m => m.status === 'active').length;
    const unpaidCount = allMembers.filter(m => !m.annualFeePaid).length;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                <p className="text-gray-500 font-medium">جاري تحميل البيانات...</p>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-fade-in" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">سجل الأعضاء</h2>
                    <p className="text-sm text-gray-500 mt-1">{activeCount} عضو فعّال — {unpaidCount} لم يدفعوا الاشتراك</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />}>إضافة عضو</Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        value={search} 
                        onChange={e => setSearch(e.target.value)}
                        placeholder="بحث بالاسم أو رقم العضوية..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pr-10 pl-4 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all" 
                    />
                </div>
                <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)} 
                    className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary-100 font-bold text-gray-700"
                >
                    <option value="">جميع الحالات</option>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>

                <select 
                    value={municipalityFilter} 
                    onChange={e => setMunicipalityFilter(e.target.value)} 
                    className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary-100 font-bold text-gray-700"
                >
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

            {/* Grid */}
            {members.length === 0 ? <EmptyState title="لا توجد نتائج" /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map(m => (
                        <div key={m.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-primary-600/5 transition-all group">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 font-black text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                    {(m.fullName || m.id).charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-gray-900 truncate text-lg">{m.fullName}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">{m.membershipNumber}</span>
                                        <Badge variant={STATUS_COLORS[m.status]}>{STATUS_LABELS[m.status] || m.status}</Badge>
                                    </div>
                                    {m.occupation && <p className="text-xs text-primary-600 mt-2 font-bold flex items-center gap-1">
                                        <User className="w-3 h-3" /> {m.occupation}
                                    </p>}
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-gray-50 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{m.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">{m.municipalityName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                    <span>عضوية منذ {m.membershipDate || new Date(m.createdAt).getFullYear()}</span>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Badge variant="gray" className="flex-1 justify-center py-1">{TYPE_LABELS[m.membershipType] || m.membershipType}</Badge>
                                {!m.annualFeePaid && <Badge variant="red" className="flex-1 justify-center py-1 font-black">لم يسدد</Badge>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
