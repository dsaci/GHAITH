import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { portalService, BeneficiaryProfile } from '../../services/portal.service';
import { User, MapPin, Phone, Users, ShieldCheck, Loader2, Info } from 'lucide-react';

export default function MyProfile() {
    const { beneficiarySession } = useAuthStore();
    const [profile, setProfile] = useState<BeneficiaryProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            if (!beneficiarySession) return;
            try {
                const { data } = await portalService.getProfile(
                    beneficiarySession.familyId,
                    beneficiarySession.registrationNumber
                );
                setProfile(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [beneficiarySession]);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary-600" /></div>;

    if (!profile) return (
        <div className="text-center p-12 bg-white rounded-3xl border border-gray-100">
            <Info className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">عذراً، لم نتمكن من جلب بيانات الملف الشخصي حالياً.</p>
        </div>
    );

    const categories: Record<string, string> = {
        'widow': 'أرملة',
        'disabled': 'ذوي الاحتياجات الخاصة',
        'chronic_illness': 'مرضى مزمنون',
        'orphan': 'يتيم',
        'poor_family': 'عائلة معوزة',
        'other': 'أخرى'
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-100">
                    <User className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black text-gray-900">ملفي الشخصي</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Identity Card */}
                <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-gray-100 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                    
                    <div className="relative z-10 space-y-8">
                        <div>
                            <p className="text-sm text-gray-400 font-bold mb-1">اسم العائلة المسجل</p>
                            <h2 className="text-4xl font-black text-gray-900 leading-tight">عائلة {profile.family_name}</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold mb-1">رقم التسجيل</p>
                                    <p className="font-mono font-bold text-lg text-gray-900">{profile.registration_number}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold mb-1">عدد أفراد العائلة</p>
                                    <p className="font-bold text-lg text-gray-900">{profile.members_count} أفراد</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold mb-1">رقم الهاتف</p>
                                    <p className="font-bold text-lg text-gray-900" dir="ltr">{profile.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold mb-1">البلدية</p>
                                    <p className="font-bold text-lg text-gray-900">{profile.municipality_name || 'غير محدد'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold mb-1">العنوان الكامل</p>
                                    <p className="font-bold text-lg text-gray-900 leading-relaxed">{profile.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Side Card */}
                <div className="flex flex-col gap-6">
                    <div className="bg-primary-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary-100 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center mb-6">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <p className="text-primary-100 font-bold mb-2 uppercase tracking-widest text-xs">الحالة الحالية</p>
                        <h3 className="text-3xl font-black mb-4">
                            {profile.status === 'active' ? 'نشط' : (profile.status === 'suspended' ? 'معلق' : 'غير نشط')}
                        </h3>
                        <div className="px-6 py-2 bg-white/10 rounded-full text-sm font-bold backdrop-blur-sm">
                           عائلة {categories[profile.category] || 'مسجلة'}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                        <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                             <Info className="w-5 h-5 text-primary-600" />
                            تنبيه هام
                        </h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium"> 
                            في حال وجود خطأ في البيانات أعلاه، يرجى مراجعة أقرب فرع للجمعية مصحوباً ببطاقة التعريف الوطنية ودفتر العائلة.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
