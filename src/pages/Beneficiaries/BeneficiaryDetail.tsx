import { useState, useEffect } from 'react';
import { Badge } from '../../components/ui';
import { familiesService } from '../../services/families.service';
import { ArrowRight, Phone, MapPin, Users, Calendar, Tag, Edit, Loader2 } from 'lucide-react';
import type { Family, BeneficiaryCategory } from '../../types';
import { FamilyReceipts } from '../../components/receipts/FamilyReceipts';

const CATEGORY_LABELS: Record<BeneficiaryCategory, string> = {
    widow: 'أرامل', divorced: 'مطلقات', disabled: 'ذوو إعاقة', chronic_illness: 'أمراض مزمنة',
    orphan: 'أيتام', poor_family: 'أسر معوزة', other: 'أخرى',
};
const BENEFIT_LABELS: Record<string, string> = {
    ramadan_basket: 'قفة رمضان', eid_gift: 'هبة العيد', school_supplies: 'أدوات مدرسية',
    medical: 'مساعدة طبية', financial_aid: 'مساعدة مالية', food_basket: 'سلة غذائية',
    clothing: 'ملابس', other: 'أخرى',
};

const INFO_ROW = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
);

export default function BeneficiaryDetail({ family, onBack }: { family: Family; onBack: () => void }) {
    const [tab, setTab] = useState(0);
    const [benefits, setBenefits] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (tab === 2) {
            loadBenefits();
        }
    }, [tab, family.id]);

    const loadBenefits = async () => {
        setLoading(true);
        try {
            const { data } = await familiesService.getBenefits(family.id);
            setBenefits(data || []);
        } catch (error) {
            console.error('Error loading benefits:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = ['المعلومات الأساسية', 'الوضع المادي', 'سجل الاستفادات', 'الوثائق', 'وثائق الاستفادة'];

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Back + header */}
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium text-sm">
                    <ArrowRight className="w-4 h-4" />
                    العودة للقائمة
                </button>
                <button className="btn-secondary text-sm">
                    <Edit className="w-4 h-4" /> تعديل
                </button>
            </div>

            {/* Profile card */}
            <div className="card bg-gradient-to-l from-primary-50 to-white">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{family.familyName}</h2>
                        <p className="text-sm text-gray-500 mt-1 font-mono">{family.registrationNumber}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="green">{CATEGORY_LABELS[family.category]}</Badge>
                            <Badge variant={family.status === 'active' ? 'green' : 'gray'}>{family.status === 'active' ? 'فعّال' : 'غير فعّال'}</Badge>
                        </div>
                    </div>
                    <div className="text-left space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4" />{family.phone}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4" />{family.municipalityName}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600"><Users className="w-4 h-4" />{family.membersCount} أفراد</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="w-4 h-4" />{family.registrationDate}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                {tabs.map((t, i) => (
                    <button key={i} onClick={() => setTab(i)} className={`tab-button ${tab === i ? 'active' : ''}`}>{t}</button>
                ))}
            </div>

            {/* Tab content */}
            <div className="card">
                {tab === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                        <div>
                            <INFO_ROW label="رقم بطاقة التعريف" value={family.nationalId || 'غير مسجل'} />
                            <INFO_ROW label="الهاتف الثاني" value={family.secondaryPhone || 'لا يوجد'} />
                            <INFO_ROW label="العنوان الكامل" value={family.address} />
                            <INFO_ROW label="البلدية" value={family.municipalityName} />
                            <INFO_ROW label="الفرع" value={family.branchName || 'المكتب الولائي'} />
                        </div>
                        <div>
                            <INFO_ROW label="الفئة" value={CATEGORY_LABELS[family.category]} />
                            <INFO_ROW label="عدد أفراد الأسرة" value={family.membersCount} />
                            <INFO_ROW label="تاريخ التسجيل" value={family.registrationDate} />
                            <INFO_ROW label="التغطية الاجتماعية" value={family.hasSocialCoverage ? 'نعم' : 'لا'} />
                        </div>
                    </div>
                )}

                {tab === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                        <div>
                            <INFO_ROW label="مستوى الدخل" value={family.incomeLevel === 'none' ? 'لا يوجد' : family.incomeLevel === 'very_low' ? 'منخفض جداً' : family.incomeLevel === 'low' ? 'منخفض' : 'متوسط'} />
                            <INFO_ROW label="الدخل الشهري التقريبي" value={(family.monthlyIncome || 0).toLocaleString('ar-DZ') + ' دج'} />
                            <INFO_ROW label="وضع السكن" value={family.housingStatus === 'owned' ? 'مملوك' : family.housingStatus === 'rented' ? 'مستأجر' : family.housingStatus === 'family' ? 'عائلي' : 'آخر'} />
                        </div>
                        {family.notes && <div className="mt-4 p-4 bg-yellow-50 rounded-xl"><p className="text-sm text-gray-700 font-medium mb-1">ملاحظات</p><p className="text-sm text-gray-600">{family.notes}</p></div>}
                    </div>
                )}

                {tab === 2 && (
                    <div>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <p className="text-sm">جاري تحميل السجل...</p>
                            </div>
                        ) : benefits.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Tag className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-400">لا توجد استفادات مسجلة لهذه العائلة بعد</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {benefits.map(b => (
                                    <div key={b.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                                                <Tag className="w-5 h-5 text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{BENEFIT_LABELS[b.benefit_type] || b.benefit_type}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{b.description || 'بدون وصف'}</p>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            {b.amount > 0 && (
                                                <p className="text-sm font-bold text-primary-700">{(b.amount || 0).toLocaleString('ar-DZ')} دج</p>
                                            )}
                                            {b.quantity > 0 && <p className="text-sm text-gray-600 font-medium">{b.quantity} وحدة</p>}
                                            <p className="text-xs text-gray-400 mt-1">{new Date(b.benefit_date).toLocaleDateString('ar-DZ')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 3 && (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-4xl mb-3">📎</p>
                        <p className="text-sm">لا توجد وثائق مرفقة</p>
                    </div>
                )}
                {tab === 4 && (
                    <FamilyReceipts 
                        familyId={family.id} 
                        branchName={family.branchName || 'المكتب الولائي'} 
                        familyName={family.familyName} 
                        fileNumber={family.registrationNumber} 
                    />
                )}
            </div>
        </div>
    );
}

// Removed redundant imports
