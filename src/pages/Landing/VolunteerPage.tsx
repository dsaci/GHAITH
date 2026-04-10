import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    User,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    MessageSquare,
    CheckCircle2,
    ArrowRight,
    ChevronDown,
    BookOpen,
    FileDown,
    Hash
} from 'lucide-react';
import { useState } from 'react';
import { MSILA_MUNICIPALITIES, MSILA_DAIRAS } from '../../data/msilaData';
import { submitPublicVolunteerRequest } from '../../services/admin.portal.service';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { VolunteerFormPDF } from '../../components/Admin/Portal/VolunteerFormPDF';
import toast from 'react-hot-toast';

export default function VolunteerPage() {
    const navigate = useNavigate();
    const [submitted, setSubmitted]               = useState(false);
    const [loading, setLoading]                   = useState(false);

    // ── الرقم المُعاد من الـ RPC بعد التسجيل الناجح ──────────────
    const [volunteerNumber, setVolunteerNumber]   = useState<string | undefined>();

    // Form State
    const [fullName, setFullName]                 = useState('');
    const [phone, setPhone]                       = useState('');
    const [birthDate, setBirthDate]               = useState('');
    const [birthPlace, setBirthPlace]             = useState('');
    const [municipality, setMunicipality]         = useState('');
    const [profession, setProfession]             = useState('');
    const [specialization, setSpecialization]     = useState('');
    const [educationLevel, setEducationLevel]     = useState('');
    const [reason, setReason]                     = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await submitPublicVolunteerRequest({
                full_name:        fullName,
                phone,
                birth_date:       birthDate,
                birth_place:      birthPlace,
                municipality_name: municipality,
                profession,
                specialization,
                education_level:  educationLevel,
                reason,
            });

            if (result.error) {
                if (result.error.message?.includes('syntax') || result.error.message?.includes('date')) {
                    toast.error('يرجى التأكد من إدخال البيانات بشكل صحيح (تاريخ الميلاد مثلاً).');
                } else {
                    toast.error('حدث خطأ أثناء إرسال طلبك: ' + (result.error.message || 'حاول مجدداً.'));
                }
            } else {
                // ── حفظ رقم المتطوع قبل الانتقال لشاشة النجاح ─────
                setVolunteerNumber(result.volunteer_number);
                setSubmitted(true);
            }
        } catch {
            toast.error('تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div
                className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-['Cairo']"
                dir="rtl"
            >
                <div className="bg-white rounded-[40px] p-12 max-w-[600px] w-full text-center shadow-2xl border border-[#e2e8f0]">
                    <div className="w-24 h-24 bg-[#3dd163]/20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-12 h-12 text-[#3dd163]" />
                    </div>

                    <h2 className="text-[32px] font-black text-[#1e3a5f] mb-4">
                        تم إرسال طلبك بنجاح!
                    </h2>

                    <div className="bg-[#f8fafc] p-6 rounded-[30px] border border-[#e2e8f0] mb-8 space-y-4">
                        <p className="text-[#64748b] text-[18px] leading-relaxed">
                            غيث الغد، يبدأ اليوم. شكراً لرغبتك في التطوع معنا.
                        </p>

                        {/* ── رقم المتطوع — يظهر فقط إذا أعاده الـ RPC ── */}
                        {volunteerNumber && (
                            <div className="p-4 bg-[#1e3a5f]/5 rounded-2xl border border-[#1e3a5f]/15 flex items-center justify-center gap-3">
                                <Hash className="w-5 h-5 text-[#1e3a5f]" />
                                <div>
                                    <p className="text-[12px] text-[#64748b]">رقم المتطوع</p>
                                    <p className="text-[22px] font-black text-[#1e3a5f] tracking-widest">
                                        {volunteerNumber}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-[#3dd163]/10 rounded-2xl border border-[#3dd163]/20">
                            <p className="text-[#1e3a5f] font-bold">
                                يرجى متابعة ملف المتطوع هاتفياً أو الحضور للمقر لتأمين ملفك.
                            </p>
                        </div>

                        <p className="text-[14px] text-gray-400 font-bold">
                            ملاحظة: يلزم بدفع الاشتراك السنوي والمقدر بـ 1000 دج سنوياً عند القبول.
                        </p>
                    </div>

                    <PDFDownloadLink
                        document={
                            <VolunteerFormPDF
                                municipality={municipality}
                                data={{
                                    full_name:       fullName,
                                    phone,
                                    address:         municipality,
                                    birth_date:      birthDate,
                                    birth_place:     birthPlace,
                                    profession,
                                    specialization,
                                    education_level: educationLevel,
                                    interests:       [],
                                }}
                            />
                        }
                        fileName={`استمارة_${fullName}.pdf`}
                    >
                        {({ loading: pdfLoading }) => (
                            <button
                                disabled={pdfLoading}
                                className="w-full bg-[#1e3a5f] text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#2a4f7c] transition-all shadow-lg mb-4"
                            >
                                <FileDown className="w-6 h-6 text-[#3dd163]" />
                                {pdfLoading ? 'جاري التحميل...' : 'تحميل استمارة التطوع (PDF)'}
                            </button>
                        )}
                    </PDFDownloadLink>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-white text-[#1e3a5f] border-2 border-[#1e3a5f] px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#f8fafc] transition-all"
                    >
                        العودة للرئيسية
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fa] font-['Cairo'] pb-20" dir="rtl">
            {/* Header */}
            <header className="bg-white h-[80px] border-b border-[#e2e8f0] flex items-center px-4 md:px-8 sticky top-0 z-50">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-[#64748b] hover:text-[#1e3a5f] transition-colors font-bold"
                >
                    <ChevronRight className="w-5 h-5" />
                    <span>العودة للرئيسية</span>
                </button>
            </header>

            <div className="max-w-[1000px] mx-auto mt-12 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

                    {/* Sidebar Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <span className="bg-[#3dd163]/15 text-[#3dd163] px-4 py-1.5 rounded-full text-[13px] font-bold mb-4 inline-block">
                                انضم إلينا
                            </span>
                            <h1 className="text-[36px] font-black text-[#1e3a5f] leading-tight">
                                استمارة الانضمام لفريق المتطوعين
                            </h1>
                            <p className="text-[#64748b] mt-6 text-[16px] leading-relaxed">
                                تطوعك هو غيث من الخير يسقي القلوب المحتاجة. انضم إلينا لنصنع الفرق معاً في ولاية المسيلة.
                            </p>
                        </div>

                        <div className="bg-[#1e3a5f] rounded-[32px] p-8 text-white relative overflow-hidden">
                            <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white/5 rounded-full" />
                            <h3 className="text-[20px] font-bold mb-6 relative z-10">لماذا تتطوع معنا؟</h3>
                            <ul className="space-y-4 relative z-10">
                                {[
                                    'المساهمة في خدمة المجتمع المحلي',
                                    'اكتساب مهارات وتجارب ميدانية جديدة',
                                    'التعرف على شباب طموح ومحب للخير',
                                ].map((text) => (
                                    <li key={text} className="flex gap-3 text-[14px] text-white/80">
                                        <div className="w-5 h-5 bg-[#3dd163] rounded-full flex-shrink-0 flex items-center justify-center text-[10px]">
                                            ✓
                                        </div>
                                        <span>{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-3">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white rounded-[32px] p-8 md:p-10 shadow-xl border border-[#e2e8f0] space-y-6"
                        >
                            {/* الاسم + الهاتف */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-[#1e3a5f] mr-1 block">
                                        الاسم واللقب *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="أدخل اسمك الكامل"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-[#3dd163]/50 focus:border-[#3dd163] transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-[#1e3a5f] mr-1 block">
                                        رقم الهاتف *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                                        <input
                                            required
                                            type="tel"
                                            placeholder="06XXXXXXXX"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-[#3dd163]/50 focus:border-[#3dd163] transition-all text-left"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* تاريخ الميلاد + مكان الميلاد */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-[#1e3a5f] mr-1 block">
                                        تاريخ الميلاد *
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                                        <input
                                            required
                                            type="date"
                                            value={birthDate}
                                            onChange={(e) => setBirthDate(e.target.value)}
                                            className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-[#3dd163]/50 focus:border-[#3dd163] transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-[#1e3a5f] mr-1 block">
                                        مكان الميلاد *
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="أدخل مكان الميلاد"
                                            value={birthPlace}
                                            onChange={(e) => setBirthPlace(e.target.value)}
                                            className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-[#3dd163]/50 focus:border-[#3dd163] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* البلدية */}
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-[#1e3a5f] mr-1 block">
                                    البلدية (السكن) *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                                    <select
                                        required
                                        value={municipality}
                                        onChange={(e) => setMunicipality(e.target.value)}
                                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pr-12 pl-10 focus:outline-none focus:ring-2 focus:ring-[#3dd163]/50 focus:border-[#3dd163] transition-all appearance-none cursor-pointer font-bold"
                                    >
                                        <option value="">اختر البلدية</option>
                                        {MSILA_DAIRAS.map((daira) => (
                                            <optgroup key={daira} label={`دائرة ${daira}`}>
                                                {MSILA_MUNICIPALITIES.filter((m) => m.daira === daira).map((m) => (
                                                    <option key={m.id} value={m.name}>{m.name}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] pointer-events-none" />
                                </div>
                            </div>

                            {/* المهنة + التخصص */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-[#1e3a5f] mr-1 block">
                                        المهنة الحالية *
                                    </label>
                                    <div className="relative">
                                        <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="مثال: طالب، موظف..."
                                            value={profession}
                                            onChange={(e) => setProfession(e.target.value)}
                                            className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-[#3dd163]/50 focus:border-[#3dd163] transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-[#1e3a5f] mr-1 block">
                                        التخصص *
                                    </label>
                                    <div className="relative">
                                        <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="أدخل تخصصك"
                                            value={specialization}
                                            onChange={(e) => setSpecialization(e.target.value)}
                                            className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-[#3dd163]/50 focus:border-[#3dd163] transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* المستوى التعليمي */}
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-[#1e3a5f] mr-1 block">
                                    المستوى التعليمي *
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={educationLevel}
                                        onChange={(e) => setEducationLevel(e.target.value)}
                                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#3dd163]/50 focus:border-[#3dd163] transition-all appearance-none cursor-pointer font-bold"
                                    >
                                        <option value="">اختر المستوى التعليمي</option>
                                        <option value="ثانوي">ثانوي</option>
                                        <option value="جامعي">جامعي</option>
                                        <option value="ماستر">ماستر</option>
                                        <option value="دكتوراه">دكتوراه</option>
                                        <option value="آخر">آخر</option>
                                    </select>
                                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] pointer-events-none" />
                                </div>
                            </div>

                            {/* سبب الانضمام */}
                            <div className="space-y-2">
                                <label className="text-[14px] font-bold text-[#1e3a5f] mr-1 block">
                                    لماذا تريد الانضمام إلينا؟
                                </label>
                                <div className="relative">
                                    <MessageSquare className="absolute right-4 top-6 w-5 h-5 text-[#94a3b8]" />
                                    <textarea
                                        rows={4}
                                        placeholder="أخبرنا باختصار عن دافعك للتطوع..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-[#3dd163]/50 focus:border-[#3dd163] transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* زر الإرسال */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#3dd163] hover:bg-[#28a849] text-[#1e3a5f] font-black p-5 rounded-2xl text-[18px] transition-all shadow-xl shadow-[#3dd163]/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? 'جاري الإرسال...' : 'إرسال الطلب الآن'}
                                    <ChevronRight className="w-6 h-6 rotate-180" />
                                </button>
                                <p className="text-center text-[12px] text-[#94a3b8] mt-4">
                                    * سيتم التعامل مع جميع بياناتكم بسرية تامة من قبل إدارة الجمعية.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
