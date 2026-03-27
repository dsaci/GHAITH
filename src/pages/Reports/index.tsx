import { useNavigate } from 'react-router-dom';
import { FileText, DollarSign, Plus, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ReportReminders from './ReportReminders';

export default function ReportsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();

    // Check if user has permission
    const canCreateReport = ['president', 'vice_president', 'treasurer'].includes(user?.role || '');

    if (!canCreateReport) {
        return (
            <div className="p-8 text-center" dir="rtl">
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl inline-block max-w-md">
                    <h3 className="text-xl font-black mb-2 font-['Cairo']">وصول غير مصرح به</h3>
                    <p className="font-['Cairo']">هذا القسم مخصص للمكتب التنفيذي (الرئيس، نائب الرئيس، أمين المال) فقط لإصدار التقارير القانونية السنوية.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 font-['Cairo'] space-y-8" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[32px] font-black text-[#1e3a5f]">نظام التقارير الذكية</h1>
                    <p className="text-[#64748b] text-[15px] mt-1">إصدار التقارير الأدبية والمالية السنوية وفقاً للقانون 12-06</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-sm font-bold text-[#1e3a5f]">
                        السنة المالية: {currentYear}
                    </span>
                </div>
            </div>

            {/* Main Report Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Literary Report Card */}
                <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#3dd163]/5 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-[#3dd163]/10 rounded-2xl flex items-center justify-center mb-6">
                            <FileText className="w-8 h-8 text-[#3dd163]" />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[24px] font-black text-[#1e3a5f]">التقرير الأدبي السنوي</h2>
                            <span className="bg-[#3dd163]/15 text-[#3dd163] px-3 py-1 rounded-full text-[12px] font-black">جاهز للتحضير</span>
                        </div>
                        <p className="text-[#64748b] text-[15px] leading-relaxed mb-8">
                            حصيلة كامل النشاطات، المناسبات، والاجتماعات العامة للجمعية خلال السنة الحالية. يتضمن الأهداف والمحقق منها.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => navigate('/reports/literary/new')}
                                className="flex-1 bg-[#1e3a5f] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#2a4f7c] transition-all shadow-lg shadow-[#1e3a5f]/20"
                            >
                                <Plus className="w-5 h-5" />
                                إنشاء تقرير لعام {currentYear}
                            </button>
                            <button
                                onClick={() => navigate('/reports/literary/history')}
                                className="px-6 py-4 bg-gray-50 text-[#1e3a5f] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all border border-gray-100"
                            >
                                <History className="w-5 h-5" />
                                الأرشيف
                            </button>
                        </div>
                    </div>
                </div>

                {/* Financial Report Card */}
                <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                            <DollarSign className="w-8 h-8 text-amber-600" />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[24px] font-black text-[#1e3a5f]">التقرير المالي السنوي</h2>
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[12px] font-black">يتطلب مراجعة</span>
                        </div>
                        <p className="text-[#64748b] text-[15px] leading-relaxed mb-8">
                            جدول حركة البنك والصندوق، المصاريف، شهادة المطابقة، ومحضر تعيين محافظ الحسابات وفقاً للمراسيم التنفيذية.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => navigate('/reports/financial/new')}
                                className="flex-1 bg-[#1e3a5f] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#2a4f7c] transition-all shadow-lg shadow-[#1e3a5f]/20"
                            >
                                <Plus className="w-5 h-5" />
                                إعداد حسابات {currentYear}
                            </button>
                            <button
                                onClick={() => navigate('/reports/financial/history')}
                                className="px-6 py-4 bg-gray-50 text-[#1e3a5f] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all border border-gray-100"
                            >
                                <History className="w-5 h-5" />
                                الأرشيف
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reminders Panel */}
            <ReportReminders />
        </div>
    );
}
