import { useNavigate } from 'react-router-dom';
import { ArrowRight, Send, User, Phone, MapPin, FileText, ChevronDown } from 'lucide-react';
import { MSILA_MUNICIPALITIES, MSILA_DAIRAS } from '../../data/msilaData';

export default function PublicRequestPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f8fafc] font-['Cairo'] pb-20" dir="rtl">
            {/* Header */}
            <header className="bg-white h-[80px] border-b border-[#e2e8f0] flex items-center px-4 md:px-8 sticky top-0 z-50 shadow-sm">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-[#64748b] hover:text-[#1e3a5f] transition-colors font-bold group"
                >
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>العودة للرئيسية</span>
                </button>
            </header>

            <div className="max-w-[800px] mx-auto mt-12 px-4">
                <div className="text-center mb-12">
                    <span className="bg-[#3dd163]/15 text-[#3dd163] px-5 py-2 rounded-full text-[13px] font-black mb-4 inline-block shadow-sm">خدمة المساعدات</span>
                    <h1 className="text-[36px] md:text-[44px] font-black text-[#1e3a5f] leading-tight mb-4">تقديم طلب مساعدة</h1>
                    <p className="text-[#64748b] text-[16px] max-w-[500px] mx-auto leading-relaxed">
                        نحن هنا لنقف بجانبكم. يرجى ملء النموذج أدناه بكل دقة لتمكين فريقنا من دراسة حالتكم والتواصل معكم.
                    </p>
                </div>

                <div className="bg-white rounded-[40px] shadow-2xl border border-[#e2e8f0] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#3dd163]/5 rounded-bl-[100px]"></div>

                    <form className="p-8 md:p-12 space-y-8 relative z-10" onSubmit={(e) => { e.preventDefault(); alert('تم استلام طلبك بنجاح، فريقنا سيتواصل معك قريباً'); navigate('/'); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[14px] font-black text-[#1e3a5f] mr-1 block">الاسم واللقب *</label>
                                <div className="relative">
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                                    <input
                                        type="text"
                                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pr-12 pl-4 focus:ring-4 focus:ring-[#3dd163]/10 focus:border-[#3dd163] outline-none transition-all font-bold"
                                        placeholder="أدخل اسمك الكامل"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[14px] font-black text-[#1e3a5f] mr-1 block">رقم الهاتف *</label>
                                <div className="relative">
                                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                                    <input
                                        type="tel"
                                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pr-12 pl-4 focus:ring-4 focus:ring-[#3dd163]/10 focus:border-[#3dd163] outline-none transition-all font-bold text-left"
                                        placeholder="06XXXXXXXX"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[14px] font-black text-[#1e3a5f] mr-1 block">العنوان السكني (البلدية) *</label>
                            <div className="relative">
                                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                                <select className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pr-12 pl-10 focus:ring-4 focus:ring-[#3dd163]/10 focus:border-[#3dd163] outline-none transition-all appearance-none font-bold cursor-pointer" required>
                                    <option value="">اختر البلدية</option>
                                    {MSILA_DAIRAS.map(daira => (
                                        <optgroup key={daira} label={`دائرة ${daira}`}>
                                            {MSILA_MUNICIPALITIES.filter(m => m.daira === daira).map(m => (
                                                <option key={m.id} value={m.name}>{m.name}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[14px] font-black text-[#1e3a5f] mr-1 block">نوع المساعدة المطلوبة *</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['مساعدة غذائية', 'دعم طبي', 'معدات خاصة / كراسي', 'أخرى'].map((type) => (
                                    <label key={type} className="flex items-center gap-4 bg-[#f8fafc] border border-[#e2e8f0] p-5 rounded-2xl cursor-pointer hover:border-[#3dd163] hover:bg-[#3dd163]/5 transition-all group">
                                        <input type="radio" name="aid_type" className="w-5 h-5 accent-[#3dd163]" required />
                                        <span className="text-[15px] font-bold text-[#1e3a5f] group-hover:text-[#3dd163] transition-colors">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[14px] font-black text-[#1e3a5f] mr-1 block">شرح تفصيلي للحالة *</label>
                            <div className="relative">
                                <FileText className="absolute top-4 right-4 w-5 h-5 text-[#94a3b8]" />
                                <textarea
                                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-4 pr-12 pl-4 focus:ring-4 focus:ring-[#3dd163]/10 focus:border-[#3dd163] outline-none transition-all h-32 resize-none font-bold placeholder:font-normal"
                                    placeholder="اشرح لنا حالتك باختصار لمساعدتنا في دراسة الطلب..."
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-[#3dd163] hover:bg-[#28a849] text-[#1e3a5f] font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] shadow-xl shadow-[#3dd163]/20 text-[18px]"
                            >
                                <Send className="w-6 h-6" />
                                إرسال طلب المساعدة الآن
                            </button>
                            <p className="text-center text-[12px] text-[#94a3b8] mt-6 leading-relaxed">
                                * سيتم التواصل معكم هاتفياً من قبل لجنة دراسة الملفات التابعة للجمعية لتحديد موعد الزيارة الميدانية.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
