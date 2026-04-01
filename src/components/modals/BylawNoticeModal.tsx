import { useState, useEffect } from 'react';
import { X, Shield, FileText, Info, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bylawService } from '../../services/bylaw.service';

/**
 * BylawNoticeModal - Non-Blocking Informational Popup
 * Displays the association bylaws to the user without restricting access.
 * Allows the user to acknowledge for audit purposes or just close the notice.
 */
export function BylawNoticeModal() {
    const { hasAcknowledgedBylaws, refreshBylawStatus } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Show only if not acknowledged and not already closed in this session
    useEffect(() => {
        const hasSeenThisSession = sessionStorage.getItem('ghaith_bylaw_notice_seen');
        if (!hasAcknowledgedBylaws && !hasSeenThisSession) {
            setIsOpen(true);
        }
    }, [hasAcknowledgedBylaws]);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('ghaith_bylaw_notice_seen', 'true');
    };

    const handleAcknowledge = async () => {
        try {
            setIsSubmitting(true);
            await bylawService.recordAgreement();
            setIsSuccess(true);
            setTimeout(() => {
                handleClose();
                refreshBylawStatus();
            }, 1500);
        } catch (error) {
            console.error('Failed to acknowledge bylaws:', error);
            // Even if it fails, we let them close it since it's non-blocking
            handleClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" dir="rtl">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden relative animate-scale-up">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white relative">
                    <button 
                        onClick={handleClose}
                        className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">ميثاق أخلاقيات العمل</h2>
                            <p className="text-primary-100 text-sm font-bold mt-1">جمعية غيث الولائية — نسخة 2024</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="space-y-6 text-right">
                        <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-primary-600">
                                <Info className="w-5 h-5 font-black" />
                                <h3 className="font-black text-lg">تنويه هام</h3>
                            </div>
                            <p className="text-gray-600 dark:text-slate-300 leading-relaxed font-medium">
                                تلتزم جمعية غيث بأعلى معايير الشفافية والأمان في التعامل مع بيانات المستفيدين. 
                                هذا الميثاق ينظم العلاقة القانونية والأخلاقية بين المتطوع والجمعية لضمان وصول الحقوق لأهلها.
                            </p>
                        </section>

                        <div className="space-y-4">
                            {[
                                { title: 'السرية التامة', desc: 'الالتزام بعدم إفشاء أي بيانات تتعلق بالعائلات أو المتبرعين خارج الإطار الرسمي.' },
                                { title: 'الأمانة الرقمية', desc: 'استخدام الدخول الموحد (Pure RPC) لضمان حماية سجلات البيانات من الاختراق أو التلاعب.' },
                                { title: 'المسؤولية الإدارية', desc: 'كل مستخدم مسؤول عن العمليات التي تتم عبر حسابه الشخصي بما يتوافق مع القانون الأساسي.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all">
                                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl flex items-center justify-center shrink-0 font-black">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 dark:text-white">{item.title}</h4>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                        <FileText className="w-4 h-4" />
                        <span>يمكنك متابعة العمل الآن، والاطلاع على الميثاق كاملاً لاحقاً.</span>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                            onClick={handleClose}
                            className="flex-1 md:flex-none px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                        >
                            تخطي الآن
                        </button>
                        
                        <button 
                            onClick={handleAcknowledge}
                            disabled={isSubmitting || isSuccess}
                            className={`flex-1 md:flex-none px-8 py-3 rounded-2xl font-black text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                                isSuccess ? 'bg-emerald-500' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-200'
                            }`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : isSuccess ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    تم التوثيق
                                </>
                            ) : (
                                'موافق، ابدأ العمل'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
