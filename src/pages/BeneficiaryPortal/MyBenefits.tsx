import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { familiesService } from '../../services/families.service';
import { Package, Calendar, Info, Loader2, Search, Download } from 'lucide-react';
import { Button, Badge } from '../../components/ui';

export default function MyBenefits() {
    const { beneficiarySession } = useAuthStore();
    const [benefits, setBenefits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadBenefits = async () => {
            if (!beneficiarySession) return;
            try {
                const { data } = await familiesService.getBenefits(beneficiarySession.familyId);
                setBenefits(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadBenefits();
    }, [beneficiarySession]);

    const filteredBenefits = benefits.filter(b => 
        b.benefit_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary-600" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 underline underline-offset-8 decoration-primary-600 decoration-4">سجل الاستفادة الرقمي</h1>
                    <p className="text-gray-500 font-medium">قائمة تفصيلية بجميع المساعدات والخدمات المقدمة للعائلة</p>
                </div>
                
                <div className="relative group w-full md:w-80">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="بحث في السجل..." 
                        className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3 pr-12 pl-4 outline-none focus:border-primary-500 transition-all font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Benefits Table/List */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                {filteredBenefits.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="text-right p-6 text-sm font-bold text-gray-400 uppercase tracking-widest leading-loose">التاريخ</th>
                                    <th className="text-right p-6 text-sm font-bold text-gray-400 uppercase tracking-widest leading-loose">نوع الاستفادة</th>
                                    <th className="text-right p-6 text-sm font-bold text-gray-400 uppercase tracking-widest leading-loose">تفاصيل / كمية</th>
                                    <th className="text-right p-6 text-sm font-bold text-gray-400 uppercase tracking-widest leading-loose">المقدار</th>
                                    <th className="text-center p-6 text-sm font-bold text-gray-400 uppercase tracking-widest leading-loose">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredBenefits.map((benefit) => (
                                    <tr key={benefit.id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-primary-600 transition-all">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-gray-900">{new Date(benefit.benefit_date).toLocaleDateString('ar-DZ')}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <Badge variant="blue" className="px-4 py-2 rounded-xl font-bold bg-primary-50 text-primary-700">
                                                {benefit.benefit_type || 'مساعدة عامة'}
                                            </Badge>
                                        </td>
                                        <td className="p-6 font-medium text-gray-600">
                                            {benefit.description || '-'}
                                        </td>
                                        <td className="p-6">
                                            {benefit.amount ? (
                                                <span className="text-lg font-black text-green-600">{benefit.amount.toLocaleString()} دج</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-center">
                                            <Button variant="secondary" size="sm" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity gap-2 bg-gray-100 hover:bg-white border-none shadow-none">
                                                <Download className="w-4 h-4 text-primary-600" />
                                                <span className="text-primary-800">تفاصيل</span>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <Package className="w-20 h-20 text-gray-100 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-gray-300 mb-2">السجل فارغ حالياً</h3>
                        <p className="text-gray-400 font-medium">لم يتم تسجيل أي استفادات للعائلة بعد.</p>
                    </div>
                )}
            </div>

            {/* Guidelines Card */}
            <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex items-start gap-6">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Info className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-lg font-black text-blue-900 mb-2 leading-relaxed">تنبيه بخصوص استخراج القسائم</h4>
                    <p className="text-blue-800 leading-relaxed font-medium">
                        هذا السجل هو مرجع رقمي لمتابعة مساعداتكم. في حال حاجتكم لنسخة ورقية رسمية مختومة، يرجى مراجعة المكتب الولائي للجمعية.
                    </p>
                </div>
            </div>
        </div>
    );
}
