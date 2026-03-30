import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Heart,
    Users,
    Calendar,
    MapPin,
    Activity,
    BookOpen,
    Phone,
    Mail,
    Facebook,
    Instagram,
    Check,
    ChevronDown,
    Truck
} from 'lucide-react';
import { ASSOCIATION_INFO } from '../../data/associationInfo';
import ghaithVan from '../../../1.jpg';
import ghaith1 from '/assets/images/ghaith1.jpg';

export default function LandingPage() {
    const navigate = useNavigate();
    const [selectedAmount, setSelectedAmount] = useState<string>('1000 دج');
    const [showBankDetails, setShowBankDetails] = useState(false);

    return (
        <div className="min-h-screen bg-[#f5f7fa] font-['Cairo']" dir="rtl">
            {/* SECTION 1: NAVBAR */}
            <nav className="sticky top-0 z-[100] h-[70px] bg-white border-b border-[#e2e8f0] shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-center px-4 md:px-8">
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-[50px] h-[50px] bg-[#3dd163] rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-[0_4px_12px_rgba(61,209,99,0.25)] border-2 border-white">
                        <img
                            src="/assets/images/logo.png"
                            alt="جمعية غيث"
                            className="w-[38px] h-[38px] object-contain brightness-0 invert"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[17px] font-bold text-[#1e3a5f] leading-tight">{ASSOCIATION_INFO.name}</span>
                        <span className="text-[11px] text-[#64748b] font-medium">{ASSOCIATION_INFO.type} — {ASSOCIATION_INFO.location}</span>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
                    <a href="#" className="text-[14px] font-bold transition-colors text-[#1a2332] hover:text-[#3dd163]">الرئيسية</a>
                    <a href="#about" className="text-[14px] font-bold transition-colors text-[#1a2332] hover:text-[#3dd163]">من نحن</a>
                    <a href="#domains" className="text-[14px] font-bold transition-colors text-[#1a2332] hover:text-[#3dd163]">مجالات العمل</a>
                    <a href="#campaigns" className="text-[14px] font-bold transition-colors text-[#1a2332] hover:text-[#3dd163]">أنشطتنا</a>
                    <a href="#support" className="text-[14px] font-bold transition-colors text-[#1a2332] hover:text-[#3dd163]">دعم الجمعية</a>
                </div>

                <div className="flex-1 flex justify-end gap-3">
                    <button
                        onClick={() => navigate('/beneficiary/login')}
                        className="bg-[#3dd163] hover:bg-[#28a849] text-white px-5 py-[8px] rounded-xl text-[14px] font-bold transition-all shadow-md shadow-[#3dd163]/20 flex items-center gap-2"
                    >
                        <Users className="w-4 h-4" />
                        فضاء المستفيد
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-white hover:bg-gray-50 text-[#1e3a5f] border border-gray-200 px-5 py-[8px] rounded-xl text-[14px] font-bold transition-all"
                    >
                       لوحة القيادة
                    </button>
                </div>
            </nav>

            {/* SECTION 2: HERO */}
            <section className="relative min-h-[85vh] bg-gradient-to-br from-[#1e3a5f] via-[#2a4f7c] to-[#1a5276] overflow-hidden flex items-center">
                {/* Decorative elements */}
                <div className="absolute bottom-[-150px] left-[-150px] w-[300px] h-[300px] bg-[#3dd163]/[0.08] rounded-full"></div>
                <div className="absolute top-[-75px] right-[-75px] w-[150px] h-[150px] bg-[#3b9dd4]/[0.12] rounded-full"></div>

                <div className="container mx-auto px-4 md:px-8 py-12 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Right Column (Text) */}
                        <div className="text-right flex flex-col items-start gap-6 animate-fade-in">
                            <span className="bg-[#3dd163]/15 text-[#3dd163] px-4 py-1.5 rounded-full text-[13px] font-medium border border-[#3dd163]/20">
                                معتمدة بتاريخ {ASSOCIATION_INFO.registrationDate} — رقم {ASSOCIATION_INFO.registrationNumber}
                            </span>
                            <h1 className="text-[34px] md:text-[52px] font-extrabold text-white leading-[1.2]">
                                معاً نبني مجتمعاً <br />
                                <span className="text-[#3dd163]">أكثر تضامناً</span>
                            </h1>
                            <p className="text-[17px] text-white/75 leading-[1.8] max-w-[480px]">
                                {ASSOCIATION_INFO.description}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-2">
                                <button
                                    onClick={() => navigate('/request')}
                                    className="bg-[#3dd163] hover:bg-[#28a849] text-[#1e3a5f] px-7 py-3.5 rounded-xl text-[15px] font-bold shadow-lg shadow-[#3dd163]/20 transition-all transform hover:scale-[1.02]"
                                >
                                    تقديم طلب مساعدة
                                </button>
                                    <button
                                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="bg-transparent border-2 border-white/40 hover:border-white hover:bg-white/10 text-white px-7 py-3.5 rounded-xl text-[15px] transition-all flex items-center gap-2"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    تعرف علينا أكثر
                                </button>
                            </div>

                            {/* Stats row */}
                            <div className="flex items-center gap-8 md:gap-12 mt-8 pt-8 border-t border-white/10 w-full md:w-auto">
                                <div className="flex flex-col">
                                    <span className="text-[32px] font-extrabold text-[#3dd163]">500+</span>
                                    <span className="text-[13px] text-white/60">عائلة مستفيدة</span>
                                </div>
                                <div className="w-[1px] h-10 bg-white/10"></div>
                                <div className="flex flex-col">
                                    <span className="text-[18px] font-extrabold text-[#3dd163] leading-tight">منذ</span>
                                    <span className="text-[26px] font-extrabold text-[#3dd163] leading-tight">2024م</span>
                                    <span className="text-[11px] text-white/50 mt-0.5">رحلة عطاء متواصلة</span>
                                </div>
                                <div className="w-[1px] h-10 bg-white/10"></div>
                                <div className="flex flex-col">
                                    <span className="text-[32px] font-extrabold text-[#3dd163]">15</span>
                                    <span className="text-[13px] text-white/60">فرع بلدي</span>
                                </div>
                            </div>
                        </div>

                        {/* Left Column (Interactive Visual Card) */}
                        <div className="hidden md:flex justify-center animate-fade-in relative" style={{ animationDelay: '0.2s' }}>
                            {/* Rotating decorative rings */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-[440px] h-[440px] border border-[#3dd163]/10 rounded-full" style={{ animation: 'spin 25s linear infinite' }}></div>
                                <div className="absolute w-[360px] h-[360px] border border-[#3dd163]/08 rounded-full" style={{ animation: 'spin 18s linear infinite reverse' }}></div>
                            </div>

                            <div className="bg-white/[0.07] backdrop-blur-lg border border-white/10 rounded-[36px] p-8 w-full max-w-[420px] shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#3dd163]/10 via-transparent to-[#3b9dd4]/08"></div>

                                <div className="relative z-10 flex flex-col items-center gap-5">
                                    {/* Logo with live pulsing ring */}
                                    <div className="relative flex items-center justify-center mb-2">
                                        <div className="absolute w-[130px] h-[130px] bg-[#3dd163]/20 rounded-full" style={{ animation: 'ping 2.5s cubic-bezier(0,0,0.2,1) infinite' }}></div>
                                        <div className="absolute w-[110px] h-[110px] bg-[#3dd163]/25 rounded-full" style={{ animation: 'pulse 2s ease-in-out infinite' }}></div>
                                        <div className="w-[90px] h-[90px] bg-[#3dd163] rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 relative">
                                            <img src="/assets/images/logo.png" alt="Ghaith" className="w-[62px] h-[62px] object-contain brightness-0 invert" />
                                        </div>
                                    </div>

                                    <h3 className="text-[22px] font-bold text-white">جمعية غيث الولائية</h3>

                                    {/* Active fundraising project card */}
                                    <div className="w-full bg-white/10 rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2.5 h-2.5 bg-[#3dd163] rounded-full" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                            <span className="text-[#3dd163] text-[11px] font-bold uppercase tracking-wider">مشروع نشط • جمع تبرعات</span>
                                        </div>
                                        <p className="text-white text-[13px] font-bold mb-3">حملة شراء سيارة نفعية للجمعية</p>
                                        <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                                            <div className="bg-gradient-to-l from-[#28a849] to-[#3dd163] h-2 rounded-full" style={{ width: '9%', transition: 'width 1.5s ease' }}></div>
                                        </div>
                                        <div className="flex justify-between mt-1.5">
                                            <span className="text-white/50 text-[11px]">9% من الهدف</span>
                                            <span className="text-[#3dd163] text-[11px] font-bold">1000 – 2000 دج</span>
                                        </div>
                                    </div>

                                    {/* Service icons */}
                                    <div className="grid grid-cols-3 gap-2 w-full">
                                        <div className="bg-white/05 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-white/15 transition-colors">
                                            <Users className="w-5 h-5 text-[#3dd163]" />
                                            <span className="text-white text-[10px] font-medium text-center">دعم الأسر</span>
                                        </div>
                                        <div className="bg-white/05 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-white/15 transition-colors">
                                            <Heart className="w-5 h-5 text-[#3dd163]" />
                                            <span className="text-white text-[10px] font-medium text-center">ذوو الاحتياجات</span>
                                        </div>
                                        <div className="bg-white/05 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-white/15 transition-colors">
                                            <Activity className="w-5 h-5 text-[#3dd163]" />
                                            <span className="text-white text-[10px] font-medium text-center">المرضى</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: ABOUT US */}
            <section id="about" className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 relative">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#3dd163]/5 rounded-full blur-3xl"></div>
                            <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
                                <img
                                    src="/assets/images/ghaith2.jpg"
                                    alt="عن الجمعية"
                                    className="w-full aspect-[4/5] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/60 to-transparent"></div>
                                <div className="absolute bottom-10 right-10 left-10">
                                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl">
                                        <div className="flex items-center gap-4 mb-2">
                                            <MapPin className="w-6 h-6 text-[#3dd163]" />
                                            <span className="font-bold text-[#1e3a5f]">مقرنا الرئيسي</span>
                                        </div>
                                        <p className="text-[14px] text-[#64748b]">{ASSOCIATION_INFO.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 space-y-8">
                            <div>
                                <span className="text-[#3dd163] font-bold text-[14px] tracking-wider mb-3 block">تعرف على غيث</span>
                                <h2 className="text-[34px] md:text-[44px] font-black text-[#1e3a5f] leading-tight">غايتنا رسم البسمة <br />في كل بيت مسيلي</h2>
                            </div>
                            <p className="text-[#64748b] text-[18px] leading-relaxed italic border-r-4 border-[#3dd163] pr-6">
                                "{ASSOCIATION_INFO.description}"
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-[#f8fafc] rounded-3xl border border-[#e2e8f0]">
                                    <h4 className="font-bold text-[#1e3a5f] mb-2">رؤيتنا</h4>
                                    <p className="text-[13px] text-[#64748b]">أن نكون رواد العمل الخيري في الولاية، ونبني مجتمعاً متراحماً متكافلاً.</p>
                                </div>
                                <div className="p-6 bg-[#f8fafc] rounded-3xl border border-[#e2e8f0]">
                                    <h4 className="font-bold text-[#1e3a5f] mb-2">رسالتنا</h4>
                                    <p className="text-[13px] text-[#64748b]">تقديم المساعدات المادية والمعنوية لمستحقيها بكل شفافية وكرامة إنسانية.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: IMPACT NUMBERS BAR */}
            <section className="bg-[#1e3a5f] py-16 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#3dd163]/5 rounded-full blur-3xl"></div>
                <div className="container mx-auto px-4 md:px-8 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 items-center">
                        <div className="flex flex-col items-center text-center px-4 md:border-l border-white/10">
                            <Heart className="w-[28px] h-[28px] text-[#3dd163] mb-4" />
                            <span className="text-[36px] font-extrabold text-[#3dd163]">500+</span>
                            <span className="text-[13px] text-white/70 mt-1.5 leading-relaxed font-bold">عائلة مستفيدة</span>
                        </div>
                        <div className="flex flex-col items-center text-center px-4 md:border-l border-white/10">
                            <Users className="w-[28px] h-[28px] text-[#3dd163] mb-4" />
                            <span className="text-[36px] font-extrabold text-[#3dd163]">1,200+</span>
                            <span className="text-[13px] text-white/70 mt-1.5 leading-relaxed font-bold">فرد تلقى دعماً</span>
                        </div>
                        <div className="flex flex-col items-center text-center px-4 md:border-l border-white/10">
                            <Calendar className="w-[28px] h-[28px] text-[#3dd163] mb-4" />
                            <span className="text-[36px] font-extrabold text-[#3dd163]">120+</span>
                            <span className="text-[13px] text-white/70 mt-1.5 leading-relaxed font-bold">نشاط خيري منجز</span>
                        </div>
                        <div className="flex flex-col items-center text-center px-4">
                            <MapPin className="w-[28px] h-[28px] text-[#3dd163] mb-4" />
                            <span className="text-[36px] font-extrabold text-[#3dd163]">15</span>
                            <span className="text-[13px] text-white/70 mt-1.5 leading-relaxed font-bold">فرع بلدي</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: DOMAINS OF WORK */}
            <section id="domains" className="bg-[#f5f7fa] py-20">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="text-center mb-16">
                        <span className="bg-[#3dd163]/15 text-[#3dd163] px-4 py-1.5 rounded-full text-[13px] font-bold mb-4 inline-block tracking-wide">
                            مجالات عملنا
                        </span>
                        <h2 className="text-[36px] font-bold text-[#1e3a5f] mt-2">نعمل في أربعة محاور رئيسية</h2>
                        <p className="text-[#64748b] mt-4 max-w-[550px] mx-auto text-[15px] leading-relaxed">
                            نسعى إلى تحقيق التكافل الاجتماعي من خلال برامج متكاملة تخدم شرائح مختلفة من المجتمع
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1200px] mx-auto">
                        {/* Card 1 */}
                        <div className="group bg-white rounded-[24px] p-7 border border-[#e2e8f0] border-b-[4px] border-b-[#3dd163] hover:translate-y-[-6px] hover:shadow-[0_15px_35px_rgba(61,209,99,0.12)] transition-all duration-300">
                            <div className="w-[60px] h-[60px] rounded-[18px] bg-[#3dd163]/10 flex items-center justify-center text-[#3dd163] mb-6 group-hover:bg-[#3dd163] group-hover:text-white transition-all">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="text-[19px] font-bold text-[#1a2332]">دعم الأسر</h3>
                            <p className="text-[14px] text-[#64748b] mt-4 leading-[1.7]">
                                مساعدة الأسر المعوزة والأرامل بالسلال الغذائية والدعم المالي المستمر لتأمين حياة كريمة.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="group bg-white rounded-[24px] p-7 border border-[#e2e8f0] border-b-[4px] border-b-[#3dd163] hover:translate-y-[-6px] hover:shadow-[0_15px_35px_rgba(61,209,99,0.12)] transition-all duration-300">
                            <div className="w-[60px] h-[60px] rounded-[18px] bg-[#3dd163]/10 flex items-center justify-center text-[#3dd163] mb-6 group-hover:bg-[#3dd163] group-hover:text-white transition-all">
                                <Heart className="w-7 h-7" />
                            </div>
                            <h3 className="text-[19px] font-bold text-[#1a2332]">ذوو الاحتياجات</h3>
                            <p className="text-[14px] text-[#64748b] mt-4 leading-[1.7]">
                                برامج متخصصة لدعم ذوي الاحتياجات الخاصة وتوفير المعدات التي تيسر حياتهم اليومية.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="group bg-white rounded-[24px] p-7 border border-[#e2e8f0] border-b-[4px] border-b-[#3dd163] hover:translate-y-[-6px] hover:shadow-[0_15px_35px_rgba(61,209,99,0.12)] transition-all duration-300">
                            <div className="w-[60px] h-[60px] rounded-[18px] bg-[#3dd163]/10 flex items-center justify-center text-[#3dd163] mb-6 group-hover:bg-[#3dd163] group-hover:text-white transition-all">
                                <Activity className="w-7 h-7" />
                            </div>
                            <h3 className="text-[19px] font-bold text-[#1a2332]">المرضى المزمنون</h3>
                            <p className="text-[14px] text-[#64748b] mt-4 leading-[1.7]">
                                مرافقة أصحاب الأمراض المزمنة وتقديم الدعم الطبي والمادي لتوفير الأدوية الضرورية.
                            </p>
                        </div>

                        {/* Card 4 */}
                        <div className="group bg-white rounded-[24px] p-7 border border-[#e2e8f0] border-b-[4px] border-b-[#3dd163] hover:translate-y-[-6px] hover:shadow-[0_15px_35px_rgba(61,209,99,0.12)] transition-all duration-300">
                            <div className="w-[60px] h-[60px] rounded-[18px] bg-[#3dd163]/10 flex items-center justify-center text-[#3dd163] mb-6 group-hover:bg-[#3dd163] group-hover:text-white transition-all">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <h3 className="text-[19px] font-bold text-[#1a2332]">الدعم التربوي</h3>
                            <p className="text-[14px] text-[#64748b] mt-4 leading-[1.7]">
                                دعم الطلاب المحتاجين بالأدوات المدرسية والمنح لضمان مستقبل تعليمي أفضل.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5: CAMPAIGNS & ACTIVITIES (GHAITH3, GHAITH4) */}
            <section id="campaigns" className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                        <div className="text-right">
                            <span className="text-[#3dd163] font-bold text-[14px] mb-3 block">مبادراتنا الموسمية</span>
                            <h2 className="text-[36px] font-extrabold text-[#1e3a5f]">أحدث حملاتنا الميدانية</h2>
                            <div className="w-20 h-1.5 bg-[#3dd163] rounded-full mt-4"></div>
                        </div>
                        <p className="text-[#64748b] max-w-[450px] text-[15px] leading-relaxed">
                            نحرص في الجمعية على مرافقة مجتمعنا في كل المواعيد الكبرى، من رمضان إلى الأعياد وكل لحظات الحاجة.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Campaign 1: Ramadan */}
                        <div className="group relative rounded-[32px] overflow-hidden aspect-[4/3] shadow-2xl">
                            <img src="/assets/images/ghaith3.jfif" alt="حملة رمضان" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/90 via-[#1e3a5f]/30 to-transparent"></div>
                            <div className="absolute bottom-8 right-8 left-8 text-right">
                                <span className="bg-[#3dd163] text-white px-4 py-1 rounded-full text-[12px] font-bold mb-3 inline-block">رمضان 2026</span>
                                <h3 className="text-white text-[24px] font-bold mb-2">حملة إفطار الصائم والقفة الرمضانية</h3>
                                <p className="text-white/70 text-[14px]">توزيع أكثر من 1000 قفة غذائية على العائلات المعوزة عبر بلديات الولاية.</p>
                            </div>
                        </div>

                        {/* Campaign 2: Eid */}
                        <div className="group relative rounded-[32px] overflow-hidden aspect-[4/3] shadow-2xl">
                            <img src="/assets/images/ghaith4.jfif" alt="حملة الأضحى" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/90 via-[#1e3a5f]/30 to-transparent"></div>
                            <div className="absolute bottom-8 right-8 left-8 text-right">
                                <span className="bg-[#3dd163] text-white px-4 py-1 rounded-full text-[12px] font-bold mb-3 inline-block">الأضحى 2025</span>
                                <h3 className="text-white text-[24px] font-bold mb-2">مشروع أضاحي العيد وتوزيع اللحوم</h3>
                                <p className="text-white/70 text-[14px]">إدخال الفرحة على قلوب اليتامى والمحتاجين من خلال توزيع لحوم الأضاحي.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION: VAN CAMPAIGN — INTERACTIVE FUNDRAISING */}
            <section className="py-20 relative overflow-hidden bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#162b4a]">
                {/* Decorative blobs */}
                <div className="absolute top-10 right-20 w-96 h-96 bg-[#3dd163]/6 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#3b9dd4]/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="container mx-auto px-4 md:px-8 relative z-10">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 bg-red-500/15 border border-red-400/30 text-red-400 px-5 py-2 rounded-full text-[13px] font-bold mb-5">
                            <span className="w-2 h-2 bg-red-400 rounded-full inline-block" style={{ animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }}></span>
                            حملة جمع تبرعات مفتوحة الآن
                        </span>
                        <h2 className="text-[38px] md:text-[46px] font-black text-white leading-tight">
                            ساهم في اقتناء <span className="text-[#3dd163]">سيارة نفعية</span> <br className="hidden md:block" /> لصالح جمعية غيث
                        </h2>
                        <p className="text-white/50 text-[16px] mt-4 max-w-[580px] mx-auto leading-relaxed">
                            سيمكّن هذا المشروع جمعيتنا من نقل التبرعات والوصول إلى أهلنا في المناطق النائية بكفاءة وسرعة
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

                        {/* === LEFT: CAMPAIGN IMAGE === */}
                        <div className="relative group">
                            {/* Glow */}
                            <div className="absolute -inset-3 bg-[#3dd163]/10 rounded-[36px] blur-2xl group-hover:bg-[#3dd163]/20 transition-all duration-500 pointer-events-none"></div>

                            <div className="relative rounded-[28px] overflow-hidden shadow-2xl border-2 border-[#3dd163]/30">
                                <img
                                    src={ghaithVan}
                                    alt="حملة شراء سيارة نفعية لصالح جمعية غيث"
                                    className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f2744]/60 via-transparent to-transparent pointer-events-none"></div>

                                {/* Floating LIVE badge */}
                                <div className="absolute top-4 right-4">
                                    <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-[12px] font-black flex items-center gap-1.5 shadow-lg">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full" style={{ animation: 'ping 1s infinite' }}></span>
                                        حملة مفتوحة
                                    </div>
                                </div>

                                {/* Bottom purpose tag */}
                                <div className="absolute bottom-4 right-4 left-4">
                                    <div className="flex items-center gap-2 bg-[#3dd163]/90 backdrop-blur-sm text-[#0f2744] px-4 py-2 rounded-2xl">
                                        <Truck className="w-5 h-5 shrink-0" />
                                        <span className="font-black text-[14px]">حملة جمع التبرعات لشراء سيارة نفعية</span>
                                    </div>
                                </div>
                            </div>

                            {/* Goals chips below image */}
                            <div className="flex flex-wrap gap-2 mt-4 justify-center">
                                {['نقل التبرعات', 'المناطق النائية', 'نقل المرضى', 'الاستجابة السريعة'].map((tag) => (
                                    <span key={tag} className="bg-white/10 border border-white/15 text-white/70 px-3 py-1 rounded-full text-[12px] font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* === RIGHT: INTERACTIVE DONATION WIDGET === */}
                        <div className="flex flex-col gap-4">

                            {/* Progress Card */}
                            <div className="bg-white/[0.07] backdrop-blur-md border border-white/10 rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-white font-bold text-[15px]">تقدم الحملة</span>
                                    <span className="text-[#3dd163] font-black text-[24px]">9%</span>
                                </div>
                                <div className="bg-white/10 rounded-full h-4 overflow-hidden mb-2">
                                    <div
                                        className="h-4 rounded-full bg-gradient-to-l from-[#28a849] to-[#3dd163] relative overflow-hidden"
                                        style={{ width: '9%' }}
                                    >
                                        <div className="absolute inset-0 w-full h-full bg-white/20" style={{ animation: 'shimmer 2s infinite', backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)', backgroundSize: '200%' }}></div>
                                    </div>
                                </div>
                                <p className="text-white/40 text-[12px] text-center">9% من هدف التمويل الكلي — ساهم لنصل معاً للهدف</p>
                            </div>

                            {/* Goals list */}
                            <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-5">
                                <h4 className="text-[#3dd163] font-bold text-[14px] mb-3 flex items-center gap-2">
                                    <Check className="w-4 h-4" /> لماذا نحتاج السيارة النفعية؟
                                </h4>
                                <div className="space-y-2.5">
                                    {[
                                        'نقل التبرعات بكفاءة وسرعة عالية',
                                        'تيسير التنقلات للمناطق النائية',
                                        'نقل المرضى المحتاجين للعلاج',
                                        'تعزيز قدرة الجمعية الميدانية'
                                    ].map((goal, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 bg-[#3dd163]/20 rounded-full flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-[#3dd163]" />
                                            </div>
                                            <span className="text-white/75 text-[14px]">{goal}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Amount selector */}
                            <div className="bg-white/[0.07] border border-white/10 rounded-2xl p-5">
                                <h4 className="text-white font-bold text-[14px] mb-4">اختر مبلغ مساهمتك</h4>
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {['1000 دج', '2000 دج', 'مبلغ آخر'].map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => setSelectedAmount(amount)}
                                            className={`py-3 rounded-xl text-[14px] font-bold transition-all border ${
                                                selectedAmount === amount
                                                    ? 'bg-[#3dd163] text-[#0f2744] border-[#3dd163] shadow-lg shadow-[#3dd163]/20 scale-[1.03]'
                                                    : 'bg-white/5 text-[#3dd163] border-[#3dd163]/30 hover:bg-[#3dd163]/20'
                                            }`}
                                        >
                                            {amount}
                                        </button>
                                    ))}
                                </div>

                                {/* Bank details toggle */}
                                <button
                                    onClick={() => setShowBankDetails(!showBankDetails)}
                                    className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-all mb-2"
                                >
                                    <span className="text-white/70 text-[13px] font-medium">بيانات الحساب البنكي للتحويل</span>
                                    <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showBankDetails ? 'rotate-180' : ''}`} />
                                </button>

                                {showBankDetails && (
                                    <div className="bg-[#0f2744]/60 border border-white/10 rounded-xl p-4 space-y-2 text-[13px]">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <span className="text-white/50">CCP:</span>
                                            <span className="font-mono text-white font-bold" dir="ltr">21028495 Clé 29</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <span className="text-white/50">RIP:</span>
                                            <span className="font-mono text-white font-bold" dir="ltr">007 99999 0021028495 29</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/50">CPA:</span>
                                            <span className="font-mono text-white font-bold" dir="ltr">4100206469-27</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex gap-3">
                                <a
                                    href="tel:0697506846"
                                    className="flex-1 bg-[#3dd163] hover:bg-[#28a849] text-[#0f2744] py-3.5 rounded-xl text-[15px] font-black transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-[#3dd163]/20"
                                >
                                    <Phone className="w-4 h-4" />
                                    للمساهمة اتصل بنا
                                </a>
                                <a
                                    href="https://www.facebook.com/Ghaithola28"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-[#1877f2] hover:bg-[#1565d8] text-white px-5 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2"
                                >
                                    <Facebook className="w-4 h-4" />
                                </a>
                            </div>

                            <p className="text-white/30 text-[11px] text-center">بمجرد تحويل مساهمتك، أرسل إيصال التحويل عبر الهاتف أو الفيسبوك</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 6: SUPPORT & BANK DETAILS */}
            <section id="support" className="py-24 bg-[#f8fafc]">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-[#e2e8f0]">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* LEFT: Supporting Info with Image */}
                            <div className="p-10 md:p-16 flex flex-col justify-center gap-8 relative">
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#3dd163]/5 rounded-full blur-3xl"></div>
                                
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <span className="text-[#3dd163] font-bold text-[14px] mb-3 block">ساهم معنا في العطاء</span>
                                        <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1e3a5f] leading-tight mb-4">كيف يمكنك دعم <br />مشاريع الجمعية؟</h2>
                                        <p className="text-[#64748b] text-[16px] leading-relaxed mb-6">
                                            تبرعكم هو الغيث الذي يسقي الأمل في قلوب المحتاجين. يمكنكم المساهمة عبر الحسابات البنكية والبريدية الرسمية للجمعية.
                                        </p>
                                        
                                        <div className="relative group max-w-2xl">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-[#3dd163] to-[#28a849] rounded-[32px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                            <div className="relative rounded-[28px] overflow-hidden shadow-2xl h-[240px] md:h-[280px]">
                                                <img 
                                                    src={ghaith1} 
                                                    alt="مشاريع جمعية غيث" 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/60 to-transparent"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-[#f1f5f9] p-4 rounded-2xl border border-dashed border-[#cbd5e1] hover:bg-white hover:shadow-md transition-all">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                            <Phone className="w-6 h-6 text-[#3dd163]" />
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#64748b]">للاستفسار والمكالمات</p>
                                            <p className="text-[15px] font-bold text-[#1e3a5f]" dir="ltr">{ASSOCIATION_INFO.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 bg-[#f1f5f9] p-5 rounded-2xl border border-dashed border-[#cbd5e1] hover:bg-white hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3">
                                            <Activity className="w-5 h-5 text-[#3dd163]" />
                                            <p className="text-[14px] font-bold text-[#1e3a5f]">بيانات الحسابات البنكية والبريدية</p>
                                        </div>
                                        <div className="space-y-2 mt-2">
                                            <div className="flex justify-between items-center text-[13px] border-b border-gray-100 pb-1.5">
                                                <span className="text-[#64748b]">رقم الـ CCP:</span>
                                                <span className="font-bold font-mono text-[#1e3a5f]" dir="ltr">{ASSOCIATION_INFO.bankAccounts.ccp}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[13px] border-b border-gray-100 pb-1.5">
                                                <span className="text-[#64748b]">رقم الـ RIP:</span>
                                                <span className="font-bold font-mono text-[#1e3a5f]" dir="ltr">{ASSOCIATION_INFO.bankAccounts.rip}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[13px]">
                                                <span className="text-[#64748b]">رقم الـ CPA:</span>
                                                <span className="font-bold font-mono text-[#1e3a5f]" dir="ltr">{ASSOCIATION_INFO.bankAccounts.cpa}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Active Van Campaign Project Card */}
                            <div className="relative bg-gradient-to-br from-[#1a3354] to-[#1e3a5f] flex flex-col justify-between p-8 lg:p-10 gap-5">
                                <div className="absolute inset-0 bg-[#3dd163]/5"></div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    {/* Live badge */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 bg-red-400 rounded-full" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                        <span className="text-red-400 text-[12px] font-bold uppercase tracking-wider">مشروع نشط — جمع تبرعات مفتوح</span>
                                    </div>

                                    <h3 className="text-white text-[22px] font-black leading-snug">سيارة نفعية<br /><span className="text-[#3dd163]">لصالح جمعية غيث</span></h3>

                                    {/* Van Campaign Image */}
                                    <div className="relative overflow-hidden rounded-2xl shadow-2xl border-2 border-[#3dd163]/30">
                                        <img
                                            src={ghaithVan}
                                            alt="حملة السيارة النفعية — جمعية غيث"
                                            className="w-full h-auto object-contain hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/50 to-transparent pointer-events-none"></div>
                                    </div>

                                    {/* Bullet reasons */}
                                    <div className="space-y-2">
                                        {['نقل التبرعات بكفاءة وسرعة عالية', 'تيسير التنقلات للمناطق النائية', 'نقل المرضى المحتاجين'].map((item) => (
                                            <div key={item} className="flex items-center gap-2.5 text-white/80 text-[13px]">
                                                <div className="w-1.5 h-1.5 bg-[#3dd163] rounded-full shrink-0"></div>
                                                {item}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Progress fundraising bar */}
                                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                                        <div className="flex justify-between text-[12px] mb-2">
                                            <span className="text-white/60">مقدار المساهمة</span>
                                            <span className="text-[#3dd163] font-black">1000 – 2000 دج</span>
                                        </div>
                                        <div className="bg-white/10 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-gradient-to-l from-[#28a849] to-[#3dd163] h-2.5 rounded-full" style={{ width: '9%' }}></div>
                                        </div>
                                        <p className="text-white/40 text-[11px] mt-1.5 text-center">ساهم معنا في تحقيق هذا المشروع الإنساني</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 7: VOLUNTEER CTA (GHAITH2) */}
            <section className="relative py-24 bg-[#1e3a5f] overflow-hidden">
                <img
                    src="/assets/images/ghaith2.jpg"
                    alt="انضم إلينا"
                    className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f]/80"></div>

                <div className="container mx-auto px-4 md:px-8 relative z-10">
                    <div className="max-w-[800px] mx-auto text-center">
                        <span className="bg-[#3dd163] text-[#1e3a5f] px-6 py-2 rounded-full text-[14px] font-black mb-8 inline-block shadow-lg shadow-[#3dd163]/20">
                            فرصة للتطوع
                        </span>
                        <h2 className="text-[34px] md:text-[48px] font-black text-white mb-6 leading-tight">
                            كن غيثاً أينما حل نفع <br />
                            <span className="text-[#3dd163]">انضم إلى فريق المتطوعين الآن</span>
                        </h2>
                        <p className="text-white/70 text-[18px] mb-12 leading-relaxed">
                            تعلن جمعية غيث عن فتح باب الانضمام إليها لكافة شباب الولاية والطلبة الراغبين في المشاركة في الأعمال التطوعية والإنسانية.
                        </p>
                        <div className="flex flex-wrap gap-6 justify-center">
                            <button
                                onClick={() => navigate('/volunteer')}
                                className="bg-[#3dd163] hover:bg-[#28a849] text-[#1e3a5f] px-10 py-5 rounded-2xl text-[18px] font-black transition-all transform hover:scale-105 shadow-xl shadow-[#3dd163]/20"
                            >
                                تعبئة استمارة التطوع
                            </button>
                            <a
                                href="tel:0654645867"
                                className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 px-10 py-5 rounded-2xl text-[18px] font-bold transition-all flex items-center gap-3"
                            >
                                <Phone className="w-6 h-6" />
                                اتصل بنا للمزيد
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-[#1e3a5f] pt-[80px] pb-6 px-4 md:px-8 border-t-8 border-[#3dd163]">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="flex flex-col gap-4">
                            <div className="w-24 h-24 bg-[#3dd163] rounded-full flex items-center justify-center p-4 mb-6 shadow-2xl border-4 border-white overflow-hidden">
                                <img src="/assets/images/logo.png" alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
                            </div>
                            <span className="text-white text-[20px] font-black">جمعية غيث الولائية</span>
                            <p className="text-white/60 text-[14px] leading-[1.8] font-medium">
                                غيث الغد، يبدأ اليوم. نحن هنا لخدمة أهالينا في ولاية المسيلة بكل إخلاص وتفانٍ.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-[16px]">روابط سريعة</h4>
                            <ul className="flex flex-col gap-3">
                                <li className="text-white/50 text-[14px] hover:text-[#3dd163] cursor-pointer transition-colors">الرئيسية</li>
                                <li className="text-white/50 text-[14px] hover:text-[#3dd163] cursor-pointer transition-colors">من نحن</li>
                                <li className="text-white/50 text-[14px] hover:text-[#3dd163] cursor-pointer transition-colors">مجالات العمل</li>
                                <li className="text-white/50 text-[14px] hover:text-[#3dd163] cursor-pointer transition-colors">الأخبار</li>
                                <li className="text-white/50 text-[14px] hover:text-[#3dd163] cursor-pointer transition-colors">اتصل بنا</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-[16px]">فروعنا</h4>
                            <ul className="flex flex-col gap-3">
                                <li className="text-white/50 text-[14px] hover:text-[#3dd163] transition-colors">
                                    <a href="https://www.facebook.com/profile.php?id=61571337154776" target="_blank" rel="noreferrer">فرع عين الحجل</a>
                                </li>
                                <li className="text-white/50 text-[14px] hover:text-[#3dd163] cursor-pointer transition-colors">فرع بن سرور</li>
                                <li className="text-white/50 text-[14px] hover:text-[#3dd163] cursor-pointer transition-colors">فرع بلدية المسيلة</li>
                                <li className="text-white/50 text-[14px] hover:text-[#3dd163] cursor-pointer transition-colors">فرع أولاد الدراج</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-[16px]">تواصل معنا</h4>
                            <ul className="flex flex-col gap-5">
                                <li className="flex items-center gap-3 text-[#3dd163] text-[13px]">
                                    <MapPin className="w-5 h-5" />
                                    <span className="text-white/80">{ASSOCIATION_INFO.address.split('-')[0]}</span>
                                </li>
                                <li className="flex items-center gap-3 text-[#3dd163] text-[13px]">
                                    <Phone className="w-5 h-5" />
                                    <span dir="ltr" className="font-bold">{ASSOCIATION_INFO.phone}</span>
                                </li>
                                <li className="flex items-center gap-3 text-[#3dd163] text-[13px]">
                                    <Mail className="w-5 h-5" />
                                    <span className="text-white/80">{ASSOCIATION_INFO.email}</span>
                                </li>
                                <li className="flex items-center gap-3 text-[#3dd163] text-[13px] pt-4 mt-2 border-t border-white/10">
                                    <a href="https://www.facebook.com/Ghaithola28" target="_blank" rel="noreferrer" className="bg-white/5 hover:bg-[#3dd163] hover:text-[#1e3a5f] p-2 rounded-full transition-all">
                                        <Facebook className="w-5 h-5" />
                                    </a>
                                    <a href="https://www.instagram.com/ghaith_msila/" target="_blank" rel="noreferrer" className="bg-white/5 hover:bg-[#3dd163] hover:text-[#1e3a5f] p-2 rounded-full transition-all">
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 text-center">
                        <p className="text-white/30 text-[12px]">© 2026 جمعية غيث الولائية — جميع الحقوق محفوظة</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
