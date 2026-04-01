import { useState, useEffect } from 'react';
import { Plus, Search, Phone, CreditCard, Loader2, Hospital } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { graphqlRequest } from '../../lib/graphql';
import { GET_MEMBERS_QUERY } from '../../services/queries/member.queries';
import { Badge, Button, EmptyState } from '../../components/ui';
import { MSILA_DAIRAS, MSILA_MUNICIPALITIES } from '../../data/msilaData';
import type { MemberStatus, Member, MembershipType } from '../../types';

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
            let data: any[] = [];
            let rlsAnomaly = false;
            
            // 1. Try GraphQL (Senior Architect's requirement)
            try {
                const sessionRes = await supabase.auth.getSession();
                const accessToken = sessionRes.data.session?.access_token;
                
                if (!accessToken) throw new Error('No access token for GraphQL');

                const gqlResponse = await graphqlRequest<any>(GET_MEMBERS_QUERY, {}, accessToken);
                
                if (!gqlResponse?.membersCollection) {
                    throw new Error('Malformed GraphQL response: membersCollection missing');
                }

                data = gqlResponse.membersCollection.edges.map((edge: any) => edge.node);
                
                // [SECURITY HARDENING] Anomaly Detection: Compare with REST head count to detect silent RLS failures
                const { count: restCount, error: countError } = await supabase
                    .from('members')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_deleted', false);

                if (!countError && restCount !== null && data.length < restCount) {
                    rlsAnomaly = true;
                    console.error(`[SECURITY] Silent RLS Anomaly Detected! GraphQL returned ${data.length} records, but REST reports ${restCount}. Check RLS policies.`);
                }

                console.log(`Fetched ${data.length} members via GraphQL ${rlsAnomaly ? '(with RLS anomalies)' : ''}`);
            } catch (gqlError) {
                // 2. Fallback to REST (Senior Architect's fail-safe requirement)
                console.warn('GraphQL Fetch Resilience: Falling back to REST due to error:', gqlError);
                
                const { data: restData, error: restError } = await supabase
                    .from('members')
                    .select('*, municipalities(name)')
                    .eq('is_deleted', false)
                    .order('full_name', { ascending: true });

                if (restError) {
                    console.error('Critical Failure: Both GraphQL and REST fetch failed.', restError);
                    throw restError;
                }
                data = restData || [];
            }

            const mapped: Member[] = data.map((m: any) => ({
                id: m.id,
                fullName: m.full_name || m.fullName,
                phone: m.phone,
                email: m.email,
                address: m.address,
                municipalityName: m.municipalities?.name || 'غير محدد',
                occupation: m.occupation,
                membershipNumber: m.membership_number || m.membershipNumber,
                membershipDate: m.membership_date || m.membershipDate,
                membershipType: (m.membership_type || m.membershipType) as MembershipType,
                status: (m.status) as MemberStatus,
                annualFeePaid: m.annual_fee_paid ?? m.annualFeePaid,
                createdAt: m.created_at || m.createdAt,
            } as Member));

            setAllMembers(mapped);
        } catch (err) {
            console.error('Error fetching members:', err);
        } finally {
            setLoading(false);
        }
    }

    const members = allMembers.filter(m => {
        const matchSearch = !search || m.fullName.includes(search) || m.membershipNumber.includes(search) || m.occupation?.includes(search);
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
        <div className="space-y-5 animate-fade-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">سجل الأعضاء</h2>
                    <p className="text-sm text-gray-500 mt-1">{activeCount} عضو فعّال — {unpaidCount} لم يدفعوا الاشتراك</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />}>إضافة عضو</Button>
            </div>

            {/* Filters */}
            <div className="card p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="بحث بالاسم أو رقم العضوية..." className="input-field pr-10 w-full" />
                </div>
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
            </div>

            {/* Grid */}
            {members.length === 0 ? <EmptyState title="لا توجد نتائج" /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map(m => (
                        <div key={m.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold text-xl shrink-0">
                                    {m.occupation?.includes('طبيب') || m.occupation?.includes('دكتور') ? (
                                        <Hospital className="w-6 h-6" />
                                    ) : (
                                        m.fullName.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{m.fullName}</h4>
                                    <p className="text-xs text-gray-500 font-mono">{m.membershipNumber}</p>
                                    {m.occupation && <p className="text-xs text-primary-600 mt-0.5">{m.occupation}</p>}
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        <Badge variant={STATUS_COLORS[m.status]}>{STATUS_LABELS[m.status]}</Badge>
                                        <Badge variant="gray">{TYPE_LABELS[m.membershipType]}</Badge>
                                        {!m.annualFeePaid && <Badge variant="red">الاشتراك غير مدفوع</Badge>}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Phone className="w-3 h-3" />{m.phone}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <CreditCard className="w-3 h-3" />عضوية منذ {m.membershipDate}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
